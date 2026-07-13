import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, X, Check, CheckCheck, Trash2, ChevronRight,
  FlaskConical, TrendingDown, TrendingUp, AlertTriangle,
  Trash, Clock, XCircle, Activity, Package
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useLanguage } from '../../hooks/useLanguage'

// Icon & color config per notification type
const typeConfig = {
  chemical_added:    { icon: FlaskConical,   bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8', emoji: '🧪' },
  chemical_deleted:  { icon: Trash,          bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', emoji: '🗑️' },
  quantity_decreased:{ icon: TrendingDown,   bg: '#FFF7ED', border: '#FED7AA', color: '#EA580C', emoji: '📉' },
  quantity_increased:{ icon: TrendingUp,     bg: '#F0FDF4', border: '#BBF7D0', color: '#16A34A', emoji: '📈' },
  low_stock:         { icon: AlertTriangle,  bg: '#FEF9C3', border: '#FDE047', color: '#CA8A04', emoji: '⚠️' },
  expiry_soon:       { icon: Clock,          bg: '#FFF7ED', border: '#FED7AA', color: '#EA580C', emoji: '⏰' },
  expiry_expired:    { icon: XCircle,        bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', emoji: '❌' },
  usage_reported:    { icon: Activity,       bg: '#F5F3FF', border: '#DDD6FE', color: '#7C3AED', emoji: '📋' },
}

function timeAgo(dateStr, lang) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (lang === 'ar') {
    if (mins < 1) return 'الآن'
    if (mins < 60) return `منذ ${mins} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    return `منذ ${days} يوم`
  }
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const panelRef = useRef(null)
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const { lang } = useLanguage()

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      // If not admin, only show notifications for 'all' role
      if (profile?.role !== 'admin') {
        query = query.in('target_role', ['all', 'user'])
      }

      const { data, error } = await query
      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to realtime notifications
  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotif = payload.new
        // Filter for role
        const isRelevant =
          newNotif.target_role === 'all' ||
          newNotif.target_role === 'user' ||
          (newNotif.target_role === 'admin' && profile?.role === 'admin')

        if (isRelevant) {
          setNotifications(prev => [newNotif, ...prev])
          // Show toast for critical notifications
          const cfg = typeConfig[newNotif.type]
          const msg = lang === 'ar' ? newNotif.title_ar : newNotif.title
          if (['expiry_expired', 'low_stock', 'chemical_deleted'].includes(newNotif.type)) {
            toast.error(msg, { duration: 5000, icon: cfg?.emoji })
          } else {
            toast.success(msg, { duration: 3000, icon: cfg?.emoji })
          }
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile?.role])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    toast.success(lang === 'ar' ? 'تم قراءة جميع الإشعارات' : 'All notifications marked as read')
  }

  const deleteNotification = async (id) => {
    // We'll just mark as read and hide it from UI
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleNotifClick = (notif) => {
    markAsRead(notif.id)
    if (notif.chemical_id) {
      navigate(`/chemicals/${notif.chemical_id}`)
      setOpen(false)
    }
  }

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ background: open ? '#EBF4FF' : '#F0F2F5' }}
        id="notifications-bell"
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
        >
          <Bell size={18} style={{ color: open ? '#4A90E2' : '#64748B' }} />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: '#E85D5D', fontSize: '0.6rem', padding: '0 4px' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-12 z-[100] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            style={{
              right: lang === 'ar' ? 'auto' : 0,
              left: lang === 'ar' ? 0 : 'auto',
              width: '380px',
              maxWidth: 'calc(100vw - 24px)',
              background: 'white',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#F0F2F5' }}>
              <div className="flex items-center gap-2">
                <Bell size={16} style={{ color: '#4A90E2' }} />
                <h3 className="font-bold text-sm" style={{ color: '#2C3E50' }}>
                  {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-white font-bold" style={{ background: '#E85D5D', fontSize: '0.6rem' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={markAllAsRead}
                    title={lang === 'ar' ? 'قراءة الكل' : 'Mark all read'}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium transition-colors"
                    style={{ background: '#EBF4FF', color: '#4A90E2' }}
                  >
                    <CheckCheck size={12} />
                    {lang === 'ar' ? 'قراءة الكل' : 'All read'}
                  </motion.button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X size={14} style={{ color: '#94A3B8' }} />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-2">
              {['all', 'unread'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filter === f ? '#4A90E2' : '#F0F2F5',
                    color: filter === f ? 'white' : '#64748B',
                  }}
                >
                  {f === 'all'
                    ? (lang === 'ar' ? 'الكل' : 'All')
                    : (lang === 'ar' ? 'غير مقروء' : 'Unread')}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 px-1 rounded-full text-white" style={{ background: '#E85D5D', fontSize: '0.55rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications list */}
            <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#F0F2F5' }}>
                    <Bell size={24} style={{ color: '#CBD5E1' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                    {lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {displayed.map((notif, i) => {
                    const cfg = typeConfig[notif.type] || typeConfig.chemical_added
                    const IconComp = cfg.icon
                    const title = lang === 'ar' ? notif.title_ar : notif.title
                    const message = lang === 'ar' ? notif.message_ar : notif.message
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.03 }}
                        className="group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b"
                        style={{
                          background: notif.is_read ? 'white' : '#FAFCFF',
                          borderColor: '#F8FAFC',
                        }}
                        onClick={() => handleNotifClick(notif)}
                      >
                        {/* Icon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                        >
                          <IconComp size={15} style={{ color: cfg.color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="text-xs font-bold truncate" style={{ color: notif.is_read ? '#64748B' : '#1E293B' }}>
                              {title}
                            </p>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4A90E2' }} />
                            )}
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: '#64748B', fontSize: '0.7rem' }}>
                            {message}
                          </p>
                          {notif.chemical_name && (
                            <div className="flex items-center gap-1 mt-1">
                              <FlaskConical size={10} style={{ color: '#94A3B8' }} />
                              <span className="text-xs font-mono" style={{ color: '#94A3B8', fontSize: '0.65rem' }}>
                                {notif.chemical_name}
                              </span>
                              {notif.chemical_id && (
                                <ChevronRight size={10} style={{ color: '#CBD5E1' }} />
                              )}
                            </div>
                          )}
                          <p className="text-xs mt-1" style={{ color: '#CBD5E1', fontSize: '0.62rem' }}>
                            {timeAgo(notif.created_at, lang)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {!notif.is_read && (
                            <button
                              onClick={e => { e.stopPropagation(); markAsRead(notif.id) }}
                              className="p-1 rounded-lg hover:bg-blue-50"
                              title={lang === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
                            >
                              <Check size={12} style={{ color: '#4A90E2' }} />
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); deleteNotification(notif.id) }}
                            className="p-1 rounded-lg hover:bg-red-50"
                            title={lang === 'ar' ? 'حذف' : 'Dismiss'}
                          >
                            <X size={12} style={{ color: '#E85D5D' }} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {displayed.length > 0 && (
              <div className="px-4 py-2.5 border-t flex items-center justify-between" style={{ borderColor: '#F0F2F5' }}>
                <p className="text-xs" style={{ color: '#CBD5E1' }}>
                  {lang === 'ar'
                    ? `${displayed.length} إشعار`
                    : `${displayed.length} notification${displayed.length !== 1 ? 's' : ''}`}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={fetchNotifications}
                  className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ color: '#4A90E2', background: '#EBF4FF' }}
                >
                  {lang === 'ar' ? 'تحديث' : 'Refresh'}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
