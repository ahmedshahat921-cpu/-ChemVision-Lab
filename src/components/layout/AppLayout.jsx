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
import NotificationsPanel from './NotificationsPanel'
import Chatbot from './Chatbot'

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
    <div className="flex h-screen overflow-hidden" style={{ background: '#F0F2F5' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
          fixed lg:relative
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
        style={{ background: 'white', borderRight: '1px solid #E2E8F0', boxShadow: '2px 0 12px rgba(74,144,226,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: '#E2E8F0', minHeight: '64px' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4A90E2, #1B3A6B)' }}>
            <Atom size={20} color="white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
                <h1 className="font-heading font-bold text-sm leading-tight" style={{ color: '#1B3A6B' }}>ChemVision</h1>
                <p className="text-xs" style={{ color: '#64748B' }}>{t('lab_hub')}</p>
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
            <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? t('admin_panel') : ''}>
              <Shield size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{t('admin_panel')}</motion.span>}
              </AnimatePresence>
            </NavLink>
          )}
        </nav>

        {/* User section */}
        <div className="border-t p-3 space-y-1" style={{ borderColor: '#E2E8F0' }}>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? t('profile') : ''}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: '#4A90E2' }}>
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#2C3E50' }}>{profile?.name || 'User'}</p>
                  <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{profile?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full text-left" title={collapsed ? t('logout') : ''}>
            <LogOut size={18} className="flex-shrink-0" style={{ color: '#E85D5D' }} />
            <AnimatePresence>
              {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: '#E85D5D' }}>{t('logout')}</motion.span>}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute ${lang === 'ar' ? '-left-3' : '-right-3'} top-20 w-6 h-6 rounded-full flex items-center justify-center lg:flex hidden`}
          style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          whileHover={{ scale: 1.1 }}
        >
          {collapsed ? (
            lang === 'ar' ? <ChevronLeft size={12} color="#64748B" /> : <ChevronRight size={12} color="#64748B" />
          ) : (
            lang === 'ar' ? <ChevronRight size={12} color="#64748B" /> : <ChevronLeft size={12} color="#64748B" />
          )}
        </motion.button>
      </motion.aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0" style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={20} style={{ color: '#64748B' }} />
            </button>
            {/* Search bar */}
            <div className="relative hidden sm:block">
              <Search size={15} className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} style={{ color: '#94A3B8' }} />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                className={`input-field ${lang === 'ar' ? 'pr-9' : 'pl-9'} py-2 text-sm`}
                style={{ width: '280px', fontSize: '0.85rem' }}
                onFocus={() => navigate('/chemicals')}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition uppercase"
              style={{ background: '#F0F2F5', color: '#1B3A6B' }}
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
    </div>
  )
}
