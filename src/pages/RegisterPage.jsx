import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, FlaskConical, Mail, Lock, User, ArrowRight, Loader2, Shield, CheckCircle, AlertCircle, Microscope, Settings, Home } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { useLanguage } from '../hooks/useLanguage'
import ParticlesBackground, { FloatingMolecule } from '../components/animations/ParticlesBackground'
import toast from 'react-hot-toast'

const REGISTER_FORMULAS = ['NaOH', 'KCl', 'Ca(OH)₂', 'MgSO₄', 'Na₂CO₃', 'K₂SO₄', 'CaCl₂', 'NH₄Cl']

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'user', securityQuestion: 'what is your lab badge number or id?', securityAnswer: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [shake, setShake] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { register, loading } = useAuthStore()
  const { lang } = useLanguage()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.securityAnswer) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error('Please fill all fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    const cleanAns = form.securityAnswer.trim()
    if (cleanAns.includes(' ') || cleanAns.includes('\t') || cleanAns.includes('\n')) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error('Security Question: Please enter a single word only (no spaces)')
      return
    }

    const result = await register(form.email, form.password, form.name, form.role, form.securityAnswer)

    if (result.success) {
      if (result.autoLogin) {
        // Email confirm is off → logged in directly
        toast.success(`Welcome to ChemVision, ${form.name}!`)
        navigate('/dashboard')
      } else if (result.needsConfirm) {
        // Email confirm is on → show confirmation screen
        setEmailSent(true)
        toast.success('Account created! Check your email to confirm.')
      } else {
        navigate('/login')
      }
    } else {
      setShake(true); setTimeout(() => setShake(false), 600)
      const errMsg = result.error?.includes('already registered')
        ? 'This email is already registered. Try logging in.'
        : result.error
      toast.error(errMsg)
    }
  }


  // ============ EMAIL SENT SCREEN ============
  if (emailSent) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: 'linear-gradient(135deg, #EBF4FF, #F0F2F5)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="card p-10 text-center max-w-md w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: '#E8FBF6' }}
          >
            <CheckCircle size={40} style={{ color: '#5DB9A0' }} />
          </motion.div>
          <h2 className="font-heading font-bold text-2xl mb-2" style={{ color: '#2C3E50' }}>Check your email!</h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#64748B' }}>
            We sent a confirmation link to <strong>{form.email}</strong>.<br />
            Click the link in your email to activate your account.
          </p>
          <div className="p-4 rounded-xl mb-6" style={{ background: '#EBF4FF', border: '1px solid #7AB8F5' }}>
            <p className="text-xs" style={{ color: '#2D6A9F' }}>
              Didn't receive the email? Check your spam folder or wait a few minutes.
            </p>
          </div>
          <button className="btn-primary w-full justify-center" onClick={() => navigate('/login')}>
            Go to Login <ArrowRight size={16} />
          </button>
          <p className="text-xs mt-4" style={{ color: '#94A3B8' }}>ChemVision Lab Hub v2.0</p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }} className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col justify-between p-12" style={{ background: 'linear-gradient(145deg, #0F2D52 0%, #1B3A6B 50%, #2D6A9F 100%)' }}>
        <ParticlesBackground formulas={REGISTER_FORMULAS} />
        <FloatingMolecule molecule="triangular" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <FlaskConical size={28} color="white" />
          </div>
          <div>
            <h1 className="font-heading text-white font-bold text-xl">ChemVision</h1>
            <p className="text-blue-200 text-sm">Lab Hub</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative z-10">
          <h2 className="font-heading text-white font-bold text-4xl leading-tight mb-4">Join the Lab.<br /><span style={{ color: '#5DB9A0' }}>Stay Safe.</span></h2>
          <p className="text-blue-200 leading-relaxed">Create your account and start managing chemicals with confidence and precision.</p>
          <div className="mt-8 space-y-3">
            {[
              { icon: '✓', text: 'Access 15+ chemical entries' },
              { icon: '✓', text: 'Real-time mixing safety checks' },
              { icon: '✓', text: 'QR code scanner & generator' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1 }} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-blue-100 text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="relative z-10">
          <p className="text-blue-300 text-xs">ChemVision Lab Hub v2.0 • © 2026</p>
        </motion.div>
      </div>

      {/* RIGHT PANEL – Register Form */}
      <div className="w-full lg:w-3/5 flex flex-col relative" style={{ background: '#FFFFFF' }}>
        {/* Top Header Bar with Back to Landing button for Mobile & Desktop */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs" style={{ background: 'linear-gradient(135deg, #1B3A6B, #2D6A9F)' }}>
              <FlaskConical size={18} color="white" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-slate-800 leading-tight">ChemVision</p>
              <p className="text-[11px] text-slate-400 font-medium">Lab Hub</p>
            </div>
          </div>

          {/* Back to Landing Page Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/landing')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 shadow-xs transition-all cursor-pointer"
            title={lang === 'ar' ? 'الرجوع للصفحة الرئيسية' : 'Back to Home Landing Page'}
          >
            <Home size={15} className="text-blue-600" />
            <span>{lang === 'ar' ? 'الصفحة الرئيسية' : 'Back to Home'}</span>
          </motion.button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
        <motion.div className="w-full max-w-lg" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={fieldVariants} className="mb-8">
            <h2 className="font-heading font-bold text-3xl mb-2" style={{ color: '#2C3E50' }}>Create your account</h2>
            <p style={{ color: '#64748B' }} className="text-sm">Join ChemVision Lab Hub today</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }} className="space-y-4">
            {/* Name */}
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Full name</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: '#94A3B8' }} />
                <input id="reg-name" name="name" type="text" value={form.name} onChange={handleChange} className="input-field pl-11" />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: '#94A3B8' }} />
                <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} className="input-field pl-11" />
              </div>
            </motion.div>

            {/* Role — Custom Card Picker */}
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#2C3E50' }}>Select Your Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* User card */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setForm({ ...form, role: 'user' })}
                  className="relative flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all duration-200"
                  style={{
                    borderColor: form.role === 'user' ? '#4A90E2' : '#E2E8F0',
                    background: form.role === 'user'
                      ? 'linear-gradient(135deg, #EBF4FF, #DBEAFE)'
                      : '#FAFBFD',
                    boxShadow: form.role === 'user' ? '0 4px 20px rgba(74,144,226,0.18)' : 'none',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: form.role === 'user' ? '#4A90E2' : '#E2E8F0' }}
                  >
                    <Microscope size={19} color={form.role === 'user' ? 'white' : '#64748B'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: form.role === 'user' ? '#1E3A5F' : '#374151' }}>
                      Lab Technician
                    </p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: form.role === 'user' ? '#2D6A9F' : '#94A3B8' }}>
                      Student / Researcher
                    </p>
                  </div>
                  {form.role === 'user' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle size={18} style={{ color: '#4A90E2' }} />
                    </motion.div>
                  )}
                </motion.button>

                {/* Admin card */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setForm({ ...form, role: 'admin' })}
                  className="relative flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all duration-200"
                  style={{
                    borderColor: form.role === 'admin' ? '#7C3AED' : '#E2E8F0',
                    background: form.role === 'admin'
                      ? 'linear-gradient(135deg, #F5F3FF, #EDE9FE)'
                      : '#FAFBFD',
                    boxShadow: form.role === 'admin' ? '0 4px 20px rgba(124,58,237,0.15)' : 'none',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: form.role === 'admin' ? '#7C3AED' : '#E2E8F0' }}
                  >
                    <Settings size={19} color={form.role === 'admin' ? 'white' : '#64748B'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: form.role === 'admin' ? '#4C1D95' : '#374151' }}>
                      Lab Administrator
                    </p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: form.role === 'admin' ? '#6D28D9' : '#94A3B8' }}>
                      Full access & management
                    </p>
                  </div>
                  {form.role === 'admin' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle size={18} style={{ color: '#7C3AED' }} />
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: '#94A3B8' }} />
                <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 z-10 rounded-md hover:bg-slate-100 transition-colors" style={{ color: '#94A3B8' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Confirm password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: '#94A3B8' }} />
                <input id="reg-confirm" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input-field pl-11" />
              </div>
            </motion.div>

            {/* Security Question */}
            <motion.div variants={fieldVariants}>
              {/* Info notice — premium styled */}
              <div
                className="flex gap-3 p-4 rounded-2xl mb-3"
                style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', border: '1px solid #FED7AA' }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#F97316' }}
                >
                  <Shield size={15} color="white" />
                </div>
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: '#C2410C' }}>Account Recovery</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#9A3412' }}>
                    This answer helps recover your account without email. Enter your favorite teacher's name as a <strong>single word</strong> (e.g. Ahmed).
                  </p>
                </div>
              </div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#2C3E50' }}>
                Who is your favorite teacher?
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: '#94A3B8' }} />
                <input
                  id="reg-security-answer"
                  name="securityAnswer"
                  type="text"
                  value={form.securityAnswer}
                  onChange={handleChange}
                  placeholder="Enter a single word only (e.g. Ahmed)"
                  className="input-field pl-11"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={12} style={{ color: '#E11D48' }} />
                <p className="text-xs font-medium" style={{ color: '#E11D48' }}>Single word only — no spaces allowed.</p>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fieldVariants} className="pt-2">
              <motion.button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 ripple" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} style={{ fontSize: '0.95rem' }}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={18} /></>}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.p variants={fieldVariants} className="text-center mt-6 text-sm" style={{ color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#4A90E2' }}>Sign in</Link>
          </motion.p>
        </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
