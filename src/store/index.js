import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      error: null,
      needsEmailConfirm: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) {
            // Email not confirmed
            if (error.message.includes('Email not confirmed')) {
              set({ loading: false })
              return { success: false, error: 'Please confirm your email first. Check your inbox.', needsConfirm: true }
            }
            throw error
          }
          // Fetch or create profile
          let { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
          if (!profile) {
            // Profile might not exist yet, create it manually
            const { data: newProfile } = await supabase.from('profiles').insert({
              id: data.user.id,
              name: data.user.user_metadata?.name || email.split('@')[0],
              email: data.user.email,
              role: data.user.user_metadata?.role || 'user',
            }).select().single()
            profile = newProfile
          }
          set({ user: data.user, profile, loading: false })
          return { success: true, profile }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      register: async (email, password, name, role = 'user') => {
        set({ loading: true, error: null, needsEmailConfirm: false })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, role },
              // No emailRedirectTo so confirmation link works
            }
          })
          if (error) throw error

          // Case 1: Session returned immediately = email confirm is OFF → auto login
          if (data.session) {
            // Create profile manually (trigger might not have fired yet)
            await supabase.from('profiles').upsert({
              id: data.user.id,
              name,
              email,
              role,
            }, { onConflict: 'id' })

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
            set({ user: data.user, profile, loading: false })
            return { success: true, autoLogin: true }
          }

          // Case 2: No session = email confirmation is required
          if (data.user && !data.session) {
            set({ loading: false, needsEmailConfirm: true })
            return { success: true, autoLogin: false, needsConfirm: true }
          }

          set({ loading: false })
          return { success: true, autoLogin: false }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { success: false, error: error.message }
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, needsEmailConfirm: false })
      },

      refreshProfile: async () => {
        const { user } = get()
        if (!user) return
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        set({ profile: data })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)


export const useChemicalStore = create((set, get) => ({
  chemicals: [],
  filteredChemicals: [],
  selectedChemical: null,
  searchQuery: '',
  filters: { hazardLevel: 'all', location: 'all', expiryStatus: 'all' },
  loading: false,
  error: null,
  realtimeChannel: null,

  // Subscribe to realtime changes on the chemicals table
  subscribeRealtime: () => {
    // Avoid duplicate subscriptions
    if (get().realtimeChannel) return

    const channel = supabase
      .channel('chemicals-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chemicals' }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload

        if (eventType === 'INSERT' && newRecord.is_active) {
          const { chemicals } = get()
          const exists = chemicals.find(c => c.id === newRecord.id)
          if (!exists) {
            set({ chemicals: [...chemicals, newRecord].sort((a, b) => a.name.localeCompare(b.name)) })
            get().applyFilters(get().searchQuery, get().filters)
          }
        } else if (eventType === 'UPDATE') {
          const { chemicals } = get()
          if (newRecord.is_active === false) {
            set({ chemicals: chemicals.filter(c => c.id !== newRecord.id) })
          } else {
            set({ chemicals: chemicals.map(c => c.id === newRecord.id ? newRecord : c) })
          }
          get().applyFilters(get().searchQuery, get().filters)
        } else if (eventType === 'DELETE') {
          const { chemicals } = get()
          set({ chemicals: chemicals.filter(c => c.id !== oldRecord.id) })
          get().applyFilters(get().searchQuery, get().filters)
        }
      })
      .subscribe()

    set({ realtimeChannel: channel })
  },

  unsubscribeRealtime: () => {
    const { realtimeChannel } = get()
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      set({ realtimeChannel: null })
    }
  },

  fetchChemicals: async (force = false) => {
    const { chemicals } = get()
    if (chemicals.length > 0 && !force) {
      // Quietly fetch in background to sync latest changes
      supabase
        .from('chemicals')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .then(({ data, error }) => {
          if (!error && data) {
            set({ chemicals: data })
            get().applyFilters(get().searchQuery, get().filters)
          }
        })
      return
    }

    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('chemicals')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) { set({ error: error.message, loading: false }); return }
    set({ chemicals: data || [], filteredChemicals: data || [], loading: false })

    // Trigger background expiry notifications check
    supabase.rpc('notify_expiry_check').then(({ error }) => {
      if (error) console.error('Failed to trigger notify_expiry_check:', error)
    })

    // Start realtime after initial fetch
    get().subscribeRealtime()
  },

  setSearch: (query) => {
    const { chemicals, filters } = get()
    set({ searchQuery: query })
    get().applyFilters(query, filters)
  },

  setFilter: (key, value) => {
    const { searchQuery, filters } = get()
    const newFilters = { ...filters, [key]: value }
    set({ filters: newFilters })
    get().applyFilters(searchQuery, newFilters)
  },

  applyFilters: (query, filters) => {
    const { chemicals } = get()
    let result = chemicals
    if (query) result = result.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.formula.toLowerCase().includes(query.toLowerCase()) ||
      (c.cas_number && c.cas_number.includes(query))
    )
    if (filters.hazardLevel !== 'all') result = result.filter(c => c.hazard_level === filters.hazardLevel)
    if (filters.location !== 'all') result = result.filter(c => c.location.includes(filters.location))
    if (filters.expiryStatus === 'expiring') {
      const soon = new Date(); soon.setDate(soon.getDate() + 30)
      result = result.filter(c => c.expiry_date && new Date(c.expiry_date) <= soon)
    } else if (filters.expiryStatus === 'expired') {
      result = result.filter(c => c.expiry_date && new Date(c.expiry_date) < new Date())
    }
    set({ filteredChemicals: result })
  },

  selectChemical: (chemical) => set({ selectedChemical: chemical }),

  addChemical: async (chemicalData) => {
    const { data, error } = await supabase.from('chemicals').insert(chemicalData).select().single()
    if (error) return { success: false, error: error.message }
    const { chemicals } = get()
    set({ chemicals: [...chemicals, data] })
    get().applyFilters(get().searchQuery, get().filters)
    return { success: true, data }
  },

  updateChemical: async (id, updates) => {
    const { data, error } = await supabase.from('chemicals').update(updates).eq('id', id).select().single()
    if (error) return { success: false, error: error.message }
    const { chemicals } = get()
    set({ chemicals: chemicals.map(c => c.id === id ? data : c) })
    get().applyFilters(get().searchQuery, get().filters)
    return { success: true, data }
  },

  deleteChemical: async (id) => {
    const { error } = await supabase.from('chemicals').update({ is_active: false }).eq('id', id)
    if (error) return { success: false, error: error.message }
    const { chemicals } = get()
    set({ chemicals: chemicals.filter(c => c.id !== id) })
    get().applyFilters(get().searchQuery, get().filters)
    return { success: true }
  },

  reportUsage: async (chemicalId, amount, unit, purpose, userId) => {
    // First check current quantity from DB to avoid stale data
    const { data: freshChemical, error: fetchError } = await supabase
      .from('chemicals').select('quantity').eq('id', chemicalId).single()
    
    if (fetchError) return { success: false, error: fetchError.message }
    
    const currentQty = freshChemical.quantity
    if (amount > currentQty) {
      return { success: false, error: `Insufficient stock. Available: ${currentQty} ${unit}` }
    }

    const { error: logError } = await supabase.from('usage_logs').insert({
      chemical_id: chemicalId, user_id: userId, amount_used: amount, unit, purpose
    })
    if (logError) return { success: false, error: logError.message }

    const newQty = Math.max(0, currentQty - amount)
    const updateResult = await get().updateChemical(chemicalId, { quantity: newQty })
    if (!updateResult.success) return { success: false, error: updateResult.error }

    return { success: true, newQuantity: newQty }
  },
}))
