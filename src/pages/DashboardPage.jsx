import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, AlertTriangle, TrendingUp, Activity, ArrowUpRight, Clock, MapPin, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useChemicalStore } from '../store'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Animated counter hook
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

// Stat Card component
function StatCard({ icon: Icon, label, value, color, bg, trend, onClick }) {
  const count = useCounter(value)
  return (
    <motion.div
      className="stat-card cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm mb-3" style={{ color: '#64748B' }}>{label}</p>
          <motion.p
            className="font-heading font-bold text-3xl"
            style={{ color: '#2C3E50' }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {count}
          </motion.p>
          {trend && <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#5DB9A0' }}><ArrowUpRight size={12} />{trend}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </motion.div>
  )
}

// 3D Molecule CSS component
function Molecule3D() {
  return (
    <div className="relative w-40 h-40">
      <motion.div
        className="absolute inset-0"
        animate={{ rotateY: 360, rotateX: 15 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 160 160" className="w-full h-full">
          {/* Bonds */}
          <line x1="80" y1="80" x2="80" y2="20" stroke="#4A90E2" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="80" x2="130" y2="50" stroke="#4A90E2" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="80" x2="130" y2="110" stroke="#4A90E2" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="80" x2="80" y2="140" stroke="#4A90E2" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="80" x2="30" y2="110" stroke="#4A90E2" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="80" x2="30" y2="50" stroke="#4A90E2" strokeWidth="2" opacity="0.6" />
          {/* Ring */}
          <ellipse cx="80" cy="80" rx="50" ry="20" stroke="#7AB8F5" strokeWidth="1.5" fill="none" opacity="0.5" />
          {/* Atoms */}
          <circle cx="80" cy="80" r="10" fill="#4A90E2" />
          <circle cx="80" cy="20" r="7" fill="#5DB9A0" />
          <circle cx="130" cy="50" r="7" fill="#F5A623" />
          <circle cx="130" cy="110" r="7" fill="#E85D5D" />
          <circle cx="80" cy="140" r="7" fill="#5DB9A0" />
          <circle cx="30" cy="110" r="7" fill="#7C3AED" />
          <circle cx="30" cy="50" r="7" fill="#F5A623" />
        </svg>
      </motion.div>
    </div>
  )
}

// Lab Storage Seat Map (المقاعد التخزينية للمختبر)
function LabStorageSeatMap({ chemicals, lang, navigate }) {
  const [activeLab, setActiveLab] = useState('Lab A')
  const [selectedSeat, setSelectedSeat] = useState(null) // { shelf, cabinet }

  const labs = [
    { id: 'Lab A', name: lang === 'ar' ? 'مختبر أ' : 'Lab A' },
    { id: 'Lab B', name: lang === 'ar' ? 'مختبر ب' : 'Lab B' },
    { id: 'Lab C', name: lang === 'ar' ? 'مختبر ج' : 'Lab C' },
    { id: 'Lab D', name: lang === 'ar' ? 'مختبر د' : 'Lab D' },
    { id: 'Storage', name: lang === 'ar' ? 'المستودع' : 'Storage' },
  ]

  const shelves = [1, 2, 3]
  const cabinets = ['C1', 'C2', 'C3', 'C4', 'C5']

  const findChemicalAt = (shelf, cabinet) => {
    return (chemicals || []).find(c => {
      if (!c.is_active) return false
      const loc = (c.location || '').toLowerCase()
      const cab = (c.cabinet || '').toLowerCase()
      
      const matchesLab = loc.startsWith(activeLab.toLowerCase()) || loc.includes(activeLab.toLowerCase())
      const matchesShelf = loc.includes(`shelf ${shelf}`)
      const matchesCab = cab === cabinet.toLowerCase()
      
      return matchesLab && matchesShelf && matchesCab
    })
  }

  // Count availability
  let occupiedCount = 0
  let availableCount = 0

  shelves.forEach(shelf => {
    cabinets.forEach(cab => {
      if (findChemicalAt(shelf, cab)) {
        occupiedCount++
      } else {
        availableCount++
      }
    })
  })

  const selectedChem = selectedSeat ? findChemicalAt(selectedSeat.shelf, selectedSeat.cabinet) : null

  return (
    <div className="space-y-4">
      {/* Lab Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b scrollbar-none" style={{ borderColor: '#F0F2F5' }}>
        {labs.map(l => (
          <button
            key={l.id}
            type="button"
            onClick={() => {
              setActiveLab(l.id)
              setSelectedSeat(null)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap`}
            style={{
              background: activeLab === l.id ? '#4A90E2' : 'transparent',
              color: activeLab === l.id ? 'white' : '#64748B',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Bus Layout Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* The Bus Body */}
        <div className="md:col-span-2 relative p-4 rounded-3xl border-4 border-slate-300 bg-white shadow-inner flex flex-col items-center">
          
          {/* Driver Seat & Windshield */}
          <div className="w-full flex items-center justify-between border-b pb-3 mb-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🚪</span>
              <span className="text-[10px] font-bold text-slate-400">ENTRANCE</span>
            </div>
            <div className="w-20 h-1 bg-slate-200 rounded" />
            <div className="flex flex-col items-center">
              <span className="text-xl">🖥️</span>
              <span className="text-[8px] font-bold text-slate-400">{lang === 'ar' ? 'المشرف' : 'SUPERVISOR'}</span>
            </div>
          </div>

          {/* Seat Grid Layout */}
          <div className="flex flex-col gap-3.5 w-full">
            {shelves.map((shelf) => (
              <div key={shelf} className="flex items-center justify-between gap-1 w-full">
                
                {/* Left Side (C1, C2) */}
                <div className="flex gap-2">
                  {['C1', 'C2'].map(cab => {
                    const chem = findChemicalAt(shelf, cab)
                    const isSelected = selectedSeat?.shelf === shelf && selectedSeat?.cabinet === cab
                    
                    let bg = '#F0F2F5'
                    let border = '1px solid #E2E8F0'
                    let color = '#64748B'
                    
                    if (isSelected) {
                      bg = '#10B981'
                      border = '1px solid #059669'
                      color = 'white'
                    } else if (chem) {
                      bg = '#E85D5D'
                      border = '1px solid #C94A4A'
                      color = 'white'
                    } else {
                      bg = '#FFF3E0'
                      border = '1px solid #FFE0B2'
                      color = '#EF6C00'
                    }

                    return (
                      <motion.button
                        key={cab}
                        type="button"
                        onClick={() => setSelectedSeat({ shelf, cabinet: cab })}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-lg flex flex-col items-center justify-center relative font-bold text-xs shadow-sm transition-colors cursor-pointer"
                        style={{ background: bg, border: border, color: color }}
                      >
                        <span className="text-[8px] opacity-75">{lang === 'ar' ? 'رف' : 'S'}{shelf}</span>
                        <span>{cab}</span>
                        {chem && <span className="absolute -top-1 -right-1 text-[8px]">🧪</span>}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Aisle (الممر) */}
                <div className="flex-1 flex items-center justify-center text-[9px] text-slate-300 font-bold border-dashed border-l border-r h-10 border-slate-200">
                  {lang === 'ar' ? 'مـمـر' : 'AISLE'}
                </div>

                {/* Right Side (C3, C4, C5) */}
                <div className="flex gap-2">
                  {['C3', 'C4', 'C5'].map(cab => {
                    const chem = findChemicalAt(shelf, cab)
                    const isSelected = selectedSeat?.shelf === shelf && selectedSeat?.cabinet === cab
                    
                    let bg = '#F0F2F5'
                    let border = '1px solid #E2E8F0'
                    let color = '#64748B'
                    
                    if (isSelected) {
                      bg = '#10B981'
                      border = '1px solid #059669'
                      color = 'white'
                    } else if (chem) {
                      bg = '#E85D5D'
                      border = '1px solid #C94A4A'
                      color = 'white'
                    } else {
                      bg = '#FFF3E0'
                      border = '1px solid #FFE0B2'
                      color = '#EF6C00'
                    }

                    return (
                      <motion.button
                        key={cab}
                        type="button"
                        onClick={() => setSelectedSeat({ shelf, cabinet: cab })}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-lg flex flex-col items-center justify-center relative font-bold text-xs shadow-sm transition-colors cursor-pointer"
                        style={{ background: bg, border: border, color: color }}
                      >
                        <span className="text-[8px] opacity-75">{lang === 'ar' ? 'رف' : 'S'}{shelf}</span>
                        <span>{cab}</span>
                        {chem && <span className="absolute -top-1 -right-1 text-[8px]">🧪</span>}
                      </motion.button>
                    )
                  })}
                </div>

              </div>
            ))}
          </div>

          <div className="w-full h-1 bg-slate-200 rounded mt-4" />
        </div>

        {/* Right Side Info & Legend */}
        <div className="card p-4 space-y-4 border border-slate-100 bg-[#FAFBFD]">
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider text-left">
            {lang === 'ar' ? 'حالة المقاعد التخزينية' : 'Seat Occupancy Legend'}
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs p-2 rounded bg-white shadow-sm border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#E85D5D] border border-[#C94A4A]" />
                <span>{lang === 'ar' ? 'مقعد غير متوفر (منتج)' : 'Occupied Spot'}</span>
              </div>
              <span className="font-bold text-slate-700">{occupiedCount}</span>
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded bg-white shadow-sm border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#FFF3E0] border border-[#FFE0B2]" />
                <span>{lang === 'ar' ? 'مقعد متوفر (فارغ)' : 'Available Spot'}</span>
              </div>
              <span className="font-bold text-slate-700">{availableCount}</span>
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded bg-white shadow-sm border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#10B981] border border-[#059669]" />
                <span>{lang === 'ar' ? 'المقعد المحدد' : 'Selected Spot'}</span>
              </div>
            </div>
          </div>

          {/* Action details based on selected Seat */}
          <div className="border-t pt-3 mt-1 text-left">
            {selectedSeat ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">
                  📍 {lang === 'ar' ? 'الموقع المحدد:' : 'Selected Location:'} <span className="font-mono text-blue-600">{activeLab} - Shelf {selectedSeat.shelf} ({selectedSeat.cabinet})</span>
                </p>
                {selectedChem ? (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 space-y-1.5">
                    <p className="text-xs font-bold text-red-800">{selectedChem.name}</p>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>{lang === 'ar' ? 'الصيغة:' : 'Formula:'} {selectedChem.formula}</span>
                      <span>{lang === 'ar' ? 'الكمية:' : 'Qty:'} {selectedChem.quantity} {selectedChem.quantity_unit}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/chemicals`)}
                      className="w-full mt-2 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors text-center block cursor-pointer border-0"
                    >
                      {lang === 'ar' ? 'عرض تفاصيل المركب 🧪' : 'View Chemical Details'}
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-green-50 border border-green-100 space-y-2 text-center">
                    <p className="text-[10px] text-green-700 font-bold leading-normal">
                      {lang === 'ar' ? 'هذا الموقع فارغ! يمكنك إضافة مركب جديد هنا مباشرة.' : 'This storage spot is empty! You can add a chemical here.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin?prefillLocation=${encodeURIComponent(`${activeLab} - Shelf ${selectedSeat.shelf}`)}&prefillCabinet=${selectedSeat.cabinet}`)}
                      className="w-full py-1.5 text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors cursor-pointer border-0"
                    >
                      {lang === 'ar' ? '➕ إضافة مركب في هذا الموقع' : '➕ Add Chemical Here'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">
                {lang === 'ar' ? 'انقر على أي مقعد تخزيني لعرض التفاصيل أو إضافة مركب' : 'Click any storage seat to view contents or add chemical'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Fallback mock usage data if chart data fetch fails
const fallbackUsageData = [
  { dayIndex: 1, usage: 12 }, { dayIndex: 2, usage: 19 },
  { dayIndex: 3, usage: 8 }, { dayIndex: 4, usage: 24 },
  { dayIndex: 5, usage: 16 }, { dayIndex: 6, usage: 5 },
  { dayIndex: 0, usage: 3 },
]

export default function DashboardPage() {
  const { profile } = useAuthStore()
  const { chemicals, fetchChemicals } = useChemicalStore()
  const { lang, t } = useLanguage()
  const navigate = useNavigate()
  const [recentLogs, setRecentLogs] = useState([])
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(true)

  const fetchChartData = async () => {
    try {
      setChartLoading(true)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      // Fetch the logs from the database
      const { data: logs, error } = await supabase
        .from('usage_logs')
        .select('timestamp, amount_used')
        .gte('timestamp', sevenDaysAgo.toISOString())

      if (error) throw error

      // Symmetrically map the calendar days ending in today
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayIndex = d.getDay()
        const dateString = d.toISOString().split('T')[0]
        
        last7Days.push({
          dateString,
          dayIndex,
          usage: 0
        })
      }

      if (logs) {
        logs.forEach(log => {
          const logDate = log.timestamp.split('T')[0]
          const matchDay = last7Days.find(d => d.dateString === logDate)
          if (matchDay) {
            matchDay.usage += parseFloat(log.amount_used || 0)
          }
        })
      }

      setChartData(last7Days)
    } catch (err) {
      console.warn('Failed to load usage chart data, using fallback:', err)
      setChartData(fallbackUsageData)
    } finally {
      setChartLoading(false)
    }
  }

  useEffect(() => {
    fetchChemicals()
    fetchChartData()
    supabase.from('usage_logs')
      .select('*, chemicals(name, formula), profiles(name)')
      .order('timestamp', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentLogs(data || []))
  }, [])

  const expiringCount = (chemicals || []).filter(c => {
    if (!c.expiry_date) return false
    const days = (new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
    return days <= 30
  }).length

  const hazardCount = (chemicals || []).filter(c => c.hazard_level === 'critical' || c.hazard_level === 'high').length

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const getGreeting = () => {
    const hours = new Date().getHours()
    if (lang === 'ar') {
      return hours < 12 ? 'صباح الخير،' : hours < 18 ? 'طاب يومك،' : 'مساء الخير،'
    }
    return hours < 12 ? 'Good morning,' : hours < 18 ? 'Good afternoon,' : 'Good evening,'
  }

  // Days list translation
  const daysOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const daysOfWeekAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  const processedChartData = chartData.map(item => ({
    ...item,
    day: lang === 'ar' ? daysOfWeekAr[item.dayIndex] : daysOfWeekEn[item.dayIndex]
  }))

  return (
    <div className={`p-4 lg:p-6 space-y-6 ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading font-bold text-2xl" style={{ color: '#2C3E50' }}>
          {getGreeting()}{' '}
          <span className="gradient-text">{profile?.name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p style={{ color: '#64748B' }} className="text-sm mt-1">
          {lang === 'ar' ? 'إليك آخر مستجدات مختبرك اليوم' : "Here's what's happening in your lab today"}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            icon={FlaskConical} 
            label={t('total_chemicals')} 
            value={(chemicals || []).length} 
            color="#4A90E2" 
            bg="#EBF4FF" 
            trend={lang === 'ar' ? '+2 هذا الأسبوع' : '+2 this week'} 
            onClick={() => navigate('/chemicals')} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            icon={Clock} 
            label={lang === 'ar' ? 'تنتهي صلاحيتها قريباً' : 'Expiring Soon'} 
            value={expiringCount} 
            color="#F5A623" 
            bg="#FEF3DC" 
            onClick={() => navigate('/chemicals?filter=expiring')} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            icon={AlertTriangle} 
            label={t('hazard_alerts')} 
            value={hazardCount} 
            color="#E85D5D" 
            bg="#FDEAEA" 
            onClick={() => navigate('/chemicals?filter=hazardous')} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            icon={Activity} 
            label={lang === 'ar' ? 'الاستخدام اليوم' : 'Usage Today'} 
            value={recentLogs.length} 
            color="#5DB9A0" 
            bg="#E8FBF6" 
            trend={lang === 'ar' ? 'مختبرات نشطة' : 'Active labs'} 
            onClick={() => {
              const usedIds = [...new Set(recentLogs.map(log => log.chemical_id))].filter(Boolean).join(',')
              navigate(`/chemicals?filter=used&ids=${usedIds}`)
            }} 
          />
        </motion.div>
      </motion.div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <motion.div
          className="card p-5 lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <h3 className="font-heading font-semibold text-base" style={{ color: '#2C3E50' }}>
                {lang === 'ar' ? 'معدل الاستخدام الأسبوعي' : 'Weekly Chemical Usage'}
              </h3>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {lang === 'ar' ? 'سجل الاستخدام الكيميائي لآخر 7 أيام' : 'Usage log over past 7 days'}
              </p>
            </div>
            <TrendingUp size={18} style={{ color: '#4A90E2' }} />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={processedChartData}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="usage" stroke="#4A90E2" strokeWidth={2} fill="url(#usageGrad)" dot={{ r: 4, fill: '#4A90E2' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 3D Molecule + Quick actions */}
        <motion.div
          className="card p-5 flex flex-col items-center justify-between"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <h3 className="font-heading font-semibold text-base mb-1" style={{ color: '#2C3E50' }}>
              {lang === 'ar' ? 'مستعرض الجزيئات ثلاثي الأبعاد' : 'Molecule Viewer'}
            </h3>
            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
              {lang === 'ar' ? 'محاكاة تفاعلية ثلاثية الأبعاد' : 'Interactive 3D visualization'}
            </p>
          </div>
          <Molecule3D />
          <motion.button
            className="btn-primary w-full justify-center mt-4"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/chemicals')}
          >
            <Zap size={16} /> {lang === 'ar' ? 'تصفح المواد الكيميائية' : 'Explore Chemicals'}
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab Storage Seat Map */}
        <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <h3 className="font-heading font-semibold text-base" style={{ color: '#2C3E50' }}>
                {lang === 'ar' ? 'مخطط المقاعد التخزينية للمختبرات 🗺️' : 'Lab Storage Seat Map 🗺️'}
              </h3>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {lang === 'ar' ? 'حالة إشغال الرفوف والكبائن بأسلوب المقاعد تفاعلياً' : 'Interactive shelf and cabinet seat occupancy layout'}
              </p>
            </div>
            <MapPin size={18} style={{ color: '#4A90E2' }} />
          </div>
          <LabStorageSeatMap chemicals={chemicals} lang={lang} navigate={navigate} />
        </motion.div>

        {/* Hazard Distribution */}
        <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <h3 className="font-heading font-semibold text-base" style={{ color: '#2C3E50' }}>{t('chemical_stability')}</h3>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {lang === 'ar' ? 'تصنيف المواد حسب درجة الأمان الكيميائي' : 'Chemicals by hazard level'}
              </p>
            </div>
            <AlertTriangle size={18} style={{ color: '#F5A623' }} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[
              { level: lang === 'ar' ? 'منخفض' : 'Low', count: (chemicals || []).filter(c => c.hazard_level === 'low').length, color: '#5DB9A0' },
              { level: lang === 'ar' ? 'متوسط' : 'Medium', count: (chemicals || []).filter(c => c.hazard_level === 'medium').length, color: '#F5A623' },
              { level: lang === 'ar' ? 'مرتفع' : 'High', count: (chemicals || []).filter(c => c.hazard_level === 'high').length, color: '#E85D5D' },
              { level: lang === 'ar' ? 'خطير' : 'Critical', count: (chemicals || []).filter(c => c.hazard_level === 'critical').length, color: '#A02A2A' },
            ]}>
              <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {[{ color: '#5DB9A0' }, { color: '#F5A623' }, { color: '#E85D5D' }, { color: '#A02A2A' }].map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity Log Row (PROPOSAL 1) */}
      <motion.div 
        className="card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: '#F0F2F5' }}>
          <Clock size={18} style={{ color: '#7C3AED' }} />
          <h3 className="font-heading font-semibold text-base" style={{ color: '#2C3E50' }}>
            {lang === 'ar' ? 'سجل العمليات والنشاطات الأخيرة في المختبر' : 'Recent Lab Activity & Logs'}
          </h3>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-center py-6 text-slate-400 font-semibold">
            {lang === 'ar' ? 'لا توجد عمليات استهلاك مسجلة مؤخراً.' : 'No recent chemical usage logged.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b text-slate-400" style={{ borderColor: '#F0F2F5' }}>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-start">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-start">{lang === 'ar' ? 'المادة الكيميائية' : 'Chemical'}</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-start">{lang === 'ar' ? 'الكمية المستهلكة' : 'Amount'}</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-start">{lang === 'ar' ? 'الغرض' : 'Purpose'}</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-start">{lang === 'ar' ? 'الوقت والتاريخ' : 'Date & Time'}</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors" style={{ borderColor: '#F8F9FA' }}>
                    <td className="py-3 font-semibold text-slate-700 text-start">{log.profiles?.name || (lang === 'ar' ? 'مستخدم' : 'User')}</td>
                    <td className="py-3 font-semibold text-blue-600 cursor-pointer text-start" onClick={() => navigate(`/chemicals/${log.chemical_id}`)}>
                      {log.chemicals?.name} <span className="text-[10px] font-mono text-slate-400 font-bold">({log.chemicals?.formula})</span>
                    </td>
                    <td className="py-3 font-bold text-rose-600 text-start">-{log.amount_used} {log.unit}</td>
                    <td className="py-3 text-slate-500 font-medium text-start">{log.purpose || (lang === 'ar' ? 'غير محدد' : 'Not specified')}</td>
                    <td className="py-3 text-slate-400 font-semibold text-start">{new Date(log.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
