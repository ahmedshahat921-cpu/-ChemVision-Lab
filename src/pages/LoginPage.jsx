import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, FlaskConical, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import ParticlesBackground, { FloatingMolecule } from '../components/animations/ParticlesBackground'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const LOGIN_FORMULAS = ['H₂O', 'NaCl', 'O₂', 'CO₂', 'NaHCO₃', 'HCl', 'CH₄', 'CaCO₃']

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

// Form field stagger
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [shake, setShake] = useState(false)
  const [chemCount, setChemCount] = useState(null)

  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('chemicals').select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setChemCount(count) })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toast.error('Please fill in all fields')
      return
    }

    const result = await login(email, password)
    if (result.success) {
      toast.success(`Welcome back!`)
      navigate('/dashboard')
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toast.error(result.error || 'Invalid credentials')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
    } catch (err) {
      toast.error(err.message || 'Failed to initiate Google sign-in')
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="min-h-screen flex"
    >
      {/* LEFT PANEL – Brand + Animation */}
      <div
        className="hidden lg:flex lg:w-3/5 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(145deg, #0F2D52 0%, #1B3A6B 40%, #2D6A9F 100%)' }}
      >
        <ParticlesBackground formulas={LOGIN_FORMULAS} />
        <FloatingMolecule molecule="hexagonal" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <FlaskConical size={28} color="white" />
          </div>
          <div>
            <h1 className="font-heading text-white font-bold text-xl leading-tight">ChemVision</h1>
            <p className="text-blue-200 text-sm">Lab Hub</p>
          </div>
        </motion.div>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10"
        >
          <h2 className="font-heading text-white font-bold text-5xl leading-tight mb-6">
            Your Lab.<br />
            <span style={{ color: '#7AB8F5' }}>Smarter.</span>
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed max-w-md">
            Advanced chemical inventory management with real-time hazard detection, 3D molecular visualization, and AI-powered mixing safety analysis.
          </p>

          {/* Stats – chemical count is live from Supabase */}
          <div className="flex gap-8 mt-10">
            {[
              { value: chemCount !== null ? `${chemCount}+` : '…', label: 'Chemicals', live: true },
              { value: '8+', label: 'Mixing Rules' },
              { value: '100%', label: 'Safety First' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div className="text-white font-bold text-3xl font-heading flex items-end gap-1">
                  {s.value}
                  {s.live && chemCount !== null && (
                    <span className="text-xs font-normal mb-1 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(122,184,245,0.2)', color: '#7AB8F5' }}>live</span>
                  )}
                </div>
                <div className="text-blue-300 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-3 relative z-10"
        >
          {['GHS Compliant', 'WCAG 2.1 AA', 'PubChem API'].map((b) => (
            <span
              key={b}
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#7AB8F5', border: '1px solid rgba(122,184,245,0.3)' }}
            >
              {b}
            </span>
          ))}
        </motion.div>
      </div>

      {/* RIGHT PANEL – Login Form */}
      <div className="w-full lg:w-2/5 flex flex-col" style={{ background: '#FFFFFF' }}>
        {/* Mobile-only branded header */}
        <div className="flex lg:hidden items-center gap-3 px-6 pt-6 pb-4 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B3A6B, #2D6A9F)' }}>
            <FlaskConical size={18} color="white" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm" style={{ color: '#2C3E50' }}>ChemVision Lab Hub</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>Sign in to your account</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile logo */}
          <motion.div variants={fieldVariants} className="flex items-center gap-2 mb-8 lg:hidden">
            <FlaskConical size={28} color="#4A90E2" />
            <span className="font-heading font-bold text-xl" style={{ color: '#1B3A6B' }}>ChemVision Lab Hub</span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fieldVariants} className="mb-8">
            <h2 className="font-heading font-bold text-3xl mb-2" style={{ color: '#2C3E50' }}>Welcome back</h2>
            <p style={{ color: '#64748B' }} className="text-sm">Sign in to your Lab Hub account</p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {/* Email */}
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={fieldVariants}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium" style={{ color: '#2C3E50' }}>Password</label>
                <Link to="/forgot-password" className="text-xs" style={{ color: '#4A90E2' }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#94A3B8' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            {/* Remember me */}
            <motion.div variants={fieldVariants} className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#4A90E2' }}
              />
              <label htmlFor="remember-me" className="text-sm" style={{ color: '#64748B' }}>Remember me</label>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fieldVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 ripple"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontSize: '0.95rem' }}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div variants={fieldVariants} className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
          </motion.div>

          {/* Google Sign-in */}
          <motion.div variants={fieldVariants}>
            <motion.button
              type="button"
              className="btn-secondary w-full justify-center py-3"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>
          </motion.div>

          {/* Register link */}
          <motion.p variants={fieldVariants} className="text-center mt-6 text-sm" style={{ color: '#64748B' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#4A90E2' }}>
              Create account
            </Link>
          </motion.p>

          {/* Version */}
          <motion.p variants={fieldVariants} className="text-center mt-8 text-xs" style={{ color: '#CBD5E1' }}>
            ChemVision Lab Hub v2.0 • © 2026
          </motion.p>
        </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
