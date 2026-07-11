import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChemicalsPage from './pages/ChemicalsPage'
import ChemicalDetailPage from './pages/ChemicalDetailPage'
import MixingSimulatorPage from './pages/MixingSimulatorPage'
import QRScannerPage from './pages/QRScannerPage'
import LabMapPage from './pages/LabMapPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'

// Layout
import AppLayout from './components/layout/AppLayout'

// Auth Guard
const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user, profile } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const { setUser, setProfile } = useAuthStore()

  useEffect(() => {
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile)
      } else {
        setUser(null)
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [setUser, setProfile])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#5DB9A0', secondary: 'white' } },
          error: { iconTheme: { primary: '#E85D5D', secondary: 'white' } },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="chemicals" element={<ChemicalsPage />} />
            <Route path="chemicals/:id" element={<ChemicalDetailPage />} />
            <Route path="mixing-simulator" element={<MixingSimulatorPage />} />
            <Route path="qr-scanner" element={<QRScannerPage />} />
            <Route path="lab-map" element={<LabMapPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
            <Route index element={<AdminPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
