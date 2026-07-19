import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, FlaskConical, Mail, Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ParticlesBackground, { FloatingMolecule } from '../components/animations/ParticlesBackground'
import toast from 'react-hot-toast'

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1: Email, 2: Security Question, 3: Reset Password
  const [email, setEmail] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const navigate = useNavigate()

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('simulate-mixing', {
        body: { action: 'get-security-question', email }
      })

      if (error || (data && data.error)) {
        throw new Error(data?.error || error?.message || 'Email not found')
      }

      if (data && !data.has_question) {
        toast.error('This account does not have security recovery configured. Please contact the Lab Admin.')
        return
      }

      setStep(2)
      toast.success('Email verified. Please answer your security question.')
    } catch (err) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = (e) => {
    e.preventDefault()
    const cleanAnswer = securityAnswer.trim()
    if (!cleanAnswer) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error('Please enter the answer')
      return
    }

    if (cleanAnswer.includes(' ') || cleanAnswer.includes('\t') || cleanAnswer.includes('\n')) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error('سؤال الأمان: يجب إدخال اسم واحد فقط بدون مسافات')
      return
    }

    setStep(3)
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error('Please fill in all fields')
      return
    }
    if (newPassword !== confirmPassword) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('simulate-mixing', {
        body: {
          action: 'reset-password-via-security-question',
          email,
          security_answer: securityAnswer,
          new_password: newPassword
        }
      })

      if (error || (data && data.error)) {
        throw new Error(data?.error || error?.message || 'Reset failed')
      }

      toast.success('Password changed successfully!')
      navigate('/login')
    } catch (err) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error(err.message || 'Failed to reset password')
      // If security answer was incorrect, let them try step 2 again
      if (err.message?.toLowerCase().includes('incorrect answer')) {
        setStep(2)
      }
    } finally {
      setLoading(false)
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
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(145deg, #0F2D52 0%, #1B3A6B 40%, #2D6A9F 100%)' }}
      >
        <ParticlesBackground />
        <FloatingMolecule />

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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10"
        >
          <h2 className="font-heading text-white font-bold text-4xl leading-tight mb-4">
            Easy Recovery.<br />
            <span style={{ color: '#E28743' }}>Instant Access.</span>
          </h2>
          <p className="text-blue-200 leading-relaxed max-w-sm">
            Recover your account securely using your predefined security answers without waiting for email links.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative z-10"
        >
          <p className="text-blue-300 text-xs">ChemVision Lab Hub v2.0 • © 2026</p>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8" style={{ background: '#FFFFFF' }}>
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back button */}
          <motion.div variants={fieldVariants} className="mb-6">
            <Link to="/login" className="text-sm font-semibold flex items-center gap-1" style={{ color: '#4A90E2' }}>
              &larr; Back to Sign In
            </Link>
          </motion.div>

          <motion.div variants={fieldVariants} className="mb-8">
            <h2 className="font-heading font-bold text-3xl mb-2" style={{ color: '#2C3E50' }}>Reset Password</h2>
            <p style={{ color: '#64748B' }} className="text-sm">Recover your account using security questions</p>
          </motion.div>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <motion.form
              onSubmit={handleEmailSubmit}
              animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                  <input
                    id="recover-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    autoComplete="email"
                  />
                </div>
              </motion.div>

              <motion.div variants={fieldVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 ripple"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                  ) : (
                    <>Verify Email <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          )}

          {/* STEP 2: Answer Security Question */}
          {step === 2 && (
            <motion.form
              onSubmit={handleAnswerSubmit}
              animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              <motion.div variants={fieldVariants}>
                <div className="p-3.5 rounded-xl text-xs font-semibold mb-3 leading-relaxed" style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' }}>
                  💡 أدخل إجابة سؤال الأمان التي اخترتها أثناء التسجيل لاستعادة الحساب (اسم واحد فقط).
                </div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#E28743' }}>
                  Security Question: Who is your favorite teacher? (ما هو اسم مدرسك المفضل؟)
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                  <input
                    id="recover-answer"
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Enter the single word answer"
                    className="input-field pl-10"
                  />
                </div>
                <div className="text-xs mt-1" style={{ color: '#E11D48', fontWeight: 500 }}>
                  ⚠️ تنبيه: يجب إدخال اسم واحد فقط بدون مسافات.
                </div>
              </motion.div>

              <motion.div variants={fieldVariants}>
                <motion.button
                  type="submit"
                  className="btn-primary w-full justify-center py-3 ripple"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Verify Answer <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            </motion.form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <motion.form
              onSubmit={handleResetSubmit}
              animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                  <input
                    id="recover-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="input-field pl-10 pr-10"
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

              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                  <input
                    id="recover-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                </div>
              </motion.div>

              <motion.div variants={fieldVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 ripple"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Resetting password...</>
                  ) : (
                    <>Reset Password <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          )}

          {/* Footer Version */}
          <motion.p variants={fieldVariants} className="text-center mt-8 text-xs" style={{ color: '#CBD5E1' }}>
            ChemVision Lab Hub v2.0 • © 2026
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  )
}
