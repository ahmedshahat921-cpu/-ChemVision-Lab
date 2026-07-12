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

// Lab Heatmap
const labZones = [
  { id: 1, label: 'Lab A', x: 15, y: 20, level: 'high', chemicals: 4 },
  { id: 2, label: 'Lab B', x: 45, y: 20, level: 'medium', chemicals: 3 },
  { id: 3, label: 'Lab C', x: 65, y: 50, level: 'high', chemicals: 4 },
  { id: 4, label: 'Lab D', x: 20, y: 60, level: 'low', chemicals: 3 },
  { id: 5, label: 'Storage', x: 75, y: 80, level: 'medium', chemicals: 2 },
]

function LabHeatmap() {
  const levelColors = { low: '#5DB9A0', medium: '#F5A623', high: '#E85D5D' }
  return (
    <div className="relative w-full h-52 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #EBF4FF 0%, #F0F2F5 100%)', border: '1px solid #E2E8F0' }}>
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
        {[20, 40, 60, 80].map(x => <line key={x} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#4A90E2" strokeWidth="0.5" />)}
        {[25, 50, 75].map(y => <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#4A90E2" strokeWidth="0.5" />)}
      </svg>
      {/* Zones */}
      {labZones.map((zone, i) => (
        <motion.div
          key={zone.id}
          className="absolute"
          style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.15, type: 'spring' }}
        >
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute w-8 h-8 rounded-full opacity-30"
              style={{ background: levelColors[zone.level] }}
              animate={{ scale: [1, 2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
            />
            <div className="relative w-4 h-4 rounded-full z-10" style={{ background: levelColors[zone.level] }} />
          </div>
          <p className="text-xs text-center mt-1 font-medium" style={{ color: '#2C3E50', fontSize: '0.65rem' }}>{zone.label}</p>
        </motion.div>
      ))}
      <p className="absolute bottom-2 right-3 text-xs" style={{ color: '#94A3B8' }}>Lab Heatmap</p>
    </div>
  )
}

// Mock usage data for chart
const usageData = [
  { day: 'Mon', usage: 12 }, { day: 'Tue', usage: 19 },
  { day: 'Wed', usage: 8 }, { day: 'Thu', usage: 24 },
  { day: 'Fri', usage: 16 }, { day: 'Sat', usage: 5 },
  { day: 'Sun', usage: 3 },
]

export default function DashboardPage() {
  const { profile } = useAuthStore()
  const { chemicals, fetchChemicals } = useChemicalStore()
  const { lang, t } = useLanguage()
  const navigate = useNavigate()
  const [recentLogs, setRecentLogs] = useState([])

  useEffect(() => {
    fetchChemicals()
    supabase.from('usage_logs').select('*, chemicals(name, formula), profiles(name)').order('timestamp', { ascending: false }).limit(5).then(({ data }) => setRecentLogs(data || []))
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
            onClick={() => navigate('/chemicals')} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            icon={AlertTriangle} 
            label={t('hazard_alerts')} 
            value={hazardCount} 
            color="#E85D5D" 
            bg="#FDEAEA" 
            onClick={() => navigate('/chemicals')} 
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
            onClick={() => navigate('/chemicals')} 
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
            <AreaChart data={usageData}>
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
        {/* Lab Heatmap */}
        <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <h3 className="font-heading font-semibold text-base" style={{ color: '#2C3E50' }}>{t('lab_occupancy')}</h3>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {lang === 'ar' ? 'مستويات تركيز المواد حسب مناطق المختبر' : 'Chemical concentration by zone'}
              </p>
            </div>
            <MapPin size={18} style={{ color: '#4A90E2' }} />
          </div>
          <LabHeatmap />
          <div className="flex gap-4 mt-3">
            {[{ color: '#5DB9A0', label: lang === 'ar' ? 'منخفض' : 'Low' }, { color: '#F5A623', label: lang === 'ar' ? 'متوسط' : 'Medium' }, { color: '#E85D5D', label: lang === 'ar' ? 'مرتفع' : 'High' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-xs" style={{ color: '#64748B' }}>{l.label}</span>
              </div>
            ))}
          </div>
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
    </div>
  )
}
