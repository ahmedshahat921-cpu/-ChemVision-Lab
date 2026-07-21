import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FlaskConical, Beaker, QrCode, Map,
  Settings, LogOut, Search, ChevronLeft, ChevronRight,
  User, Shield, Menu, X, Atom
} from 'lucide-react'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

import { useLanguage } from '../../hooks/useLanguage'
import { useTheme } from '../../hooks/useTheme'
import NotificationsPanel from './NotificationsPanel'
import Chatbot from './Chatbot'
import SecurityQuestionModal from './SecurityQuestionModal'
import { Sun, Moon } from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
  { path: '/chemicals', icon: FlaskConical, label: 'chemicals' },
  { path: '/mixing-simulator', icon: Beaker, label: 'mixing_simulator' },
  { path: '/qr-scanner', icon: QrCode, label: 'qr_scanner' },
  { path: '/lab-map', icon: Map, label: 'lab_map' },
]

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, logout } = useAuthStore()
  const { lang, t, toggleLanguage } = useLanguage()
  const { theme, isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    toast.success(t('logout_success'))
    navigate('/login')
  }

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300" style={{ background: isDark ? '#0B0F19' : '#F0F2F5' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          flex flex-col h-screen z-50 flex-shrink-0
          fixed lg:relative top-0 bottom-0
          ${lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'}
          ${mobileOpen 
            ? 'translate-x-0' 
            : (lang === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
          }
          transition-transform duration-300 lg:transition-none
          bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800" style={{ minHeight: '64px' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4A90E2, #1B3A6B)' }}>
            <Atom size={20} color="white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
                <h1 className="font-heading font-bold text-sm leading-tight text-blue-900 dark:text-blue-400">ChemVision</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('lab_hub')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? t(label) : ''}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {t(label)}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}

          {/* Admin link */}
          {profile?.role === 'admin' && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
              title={collapsed ? t('admin_panel') : ''}
              onClick={() => setMobileOpen(false)}
            >
              <Shield size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{t('admin_panel')}</motion.span>}
              </AnimatePresence>
            </NavLink>
          )}
        </nav>

        {/* User section */}
        <div className="border-t p-3 space-y-1 border-slate-200 dark:border-slate-800">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
            title={collapsed ? t('profile') : ''}
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: '#4A90E2' }}>
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{profile?.name || 'User'}</p>
                  <p className="text-xs truncate text-slate-500 dark:text-slate-400">{profile?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full text-left" title={collapsed ? t('logout') : ''}>
            <LogOut size={18} className="flex-shrink-0 text-rose-500" />
            <AnimatePresence>
              {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-rose-500">{t('logout')}</motion.span>}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute ${lang === 'ar' ? '-left-3' : '-right-3'} top-20 w-6 h-6 rounded-full flex items-center justify-center lg:flex hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md`}
          whileHover={{ scale: 1.1 }}
        >
          {collapsed ? (
            lang === 'ar' ? <ChevronLeft size={12} className="text-slate-600 dark:text-slate-300" /> : <ChevronRight size={12} className="text-slate-600 dark:text-slate-300" />
          ) : (
            lang === 'ar' ? <ChevronRight size={12} className="text-slate-600 dark:text-slate-300" /> : <ChevronLeft size={12} className="text-slate-600 dark:text-slate-300" />
          )}
        </motion.button>
      </motion.aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setMobileOpen(true)}>
              <Menu size={22} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.08, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl border transition-all flex items-center justify-center shadow-sm"
              style={{
                background: isDark ? '#334155' : '#F0F2F5',
                borderColor: isDark ? '#475569' : '#E2E8F0',
                color: isDark ? '#F59E0B' : '#4A90E2'
              }}
              title={isDark ? (lang === 'ar' ? 'الوضع النهاري' : 'Switch to Light Mode') : (lang === 'ar' ? 'الوضع الليلي' : 'Switch to Dark Mode')}
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-blue-600" />}
            </motion.button>

            {/* Language Switcher Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition uppercase"
              style={{ background: isDark ? '#334155' : '#F0F2F5', color: isDark ? '#60A5FA' : '#1B3A6B' }}
            >
              {lang === 'ar' ? 'EN' : 'العربية'}
            </motion.button>

            {/* Notification bell - live */}
            <NotificationsPanel />

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4A90E2, #1B3A6B)' }}
            >
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </motion.div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Chatbot Assistant */}
      <Chatbot />
      {/* Global Security Question Setup Modal */}
      <SecurityQuestionModal />
    </div>
  )
}
