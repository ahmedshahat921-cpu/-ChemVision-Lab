import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'
import { supabase } from '../lib/supabase'
import { User, Mail, Shield, Clock, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuthStore()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')

  useEffect(() => {
    supabase.from('usage_logs').select('*, chemicals(name, formula)').eq('user_id', profile?.id).order('timestamp', { ascending: false }).limit(10)
      .then(({ data }) => { setLogs(data || []); setLoading(false) })
  }, [profile?.id])

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update({ name }).eq('id', profile.id)
    if (!error) { toast.success('Profile updated!'); refreshProfile(); setEditing(false) }
    else toast.error('Failed to update')
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-heading font-bold text-2xl mb-6" style={{ color: '#2C3E50' }}>
        My Profile
      </motion.h1>

      {/* Profile card */}
      <motion.div className="card p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #4A90E2, #1B3A6B)' }}>
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            {editing ? (
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2 text-lg font-bold" style={{ marginBottom: '0.25rem' }} />
            ) : (
              <h2 className="font-heading font-bold text-xl" style={{ color: '#2C3E50' }}>{profile?.name}</h2>
            )}
            <span className="badge" style={{ background: profile?.role === 'admin' ? '#EBF4FF' : '#E8FBF6', color: profile?.role === 'admin' ? '#1B3A6B' : '#2A7060' }}>
              <Shield size={10} /> {profile?.role}
            </span>
          </div>
          <div className="ml-auto flex gap-2">
            {editing ? (
              <>
                <button className="btn-primary py-2 px-4" onClick={saveProfile}>Save</button>
                <button className="btn-secondary py-2 px-4" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn-secondary py-2 px-4" onClick={() => setEditing(true)}>Edit</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Mail, label: 'Email', value: profile?.email },
            { icon: Shield, label: 'Role', value: profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) },
            { icon: Clock, label: 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A' },
            { icon: FlaskConical, label: 'Usage logs', value: `${logs.length} entries` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F8F9FA' }}>
              <Icon size={16} style={{ color: '#4A90E2', marginTop: '2px' }} />
              <div>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{label}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#2C3E50' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Usage history */}
      <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-heading font-semibold text-base mb-4" style={{ color: '#2C3E50' }}>Recent Usage History</h3>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>No usage logged yet</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <motion.div key={log.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F8F9FA' }}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#EBF4FF', color: '#4A90E2' }}>
                    {log.chemicals?.formula?.slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>{log.chemicals?.name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{log.purpose || 'No purpose specified'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: '#E85D5D' }}>-{log.amount_used} {log.unit}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{new Date(log.timestamp).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
