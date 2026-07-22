import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FlaskConical, Shield, Zap, QrCode, Map, Beaker,
  MessageSquare, ChevronRight, ArrowRight, Star,
  CheckCircle, Atom, BarChart3, AlertTriangle, LayoutDashboard
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store'
import ParticlesBackground, { FloatingMolecule } from '../components/animations/ParticlesBackground'

const FORMULAS = ['H₂SO₄', 'NaOH', 'C₆H₁₂O₆', 'HCl', 'NH₃', 'H₂O₂', 'CH₄', 'CO₂', 'NaCl', 'KMnO₄']

// ── Animated counter hook ──────────────────────────────────────────
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start || target === 0) return
    let current = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, start])
  return count
}

// ── Stat item ──────────────────────────────────────────────────────
function StatItem({ value, label, suffix = '', color }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const numVal = typeof value === 'number' ? value : parseInt(value) || 0
  const count = useCounter(numVal, 1800, isInView)
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-1"
    >
      <p className="font-black leading-none" style={{ color, fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
        {count}{suffix}
      </p>
      <p className="text-blue-200 text-xs sm:text-sm font-medium text-center">{label}</p>
    </motion.div>
  )
}

// ── Feature card ───────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, color, bg, delay }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay }}
      className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80
                 bg-white dark:bg-slate-800/60 hover:shadow-2xl
                 transition-all duration-300 hover:-translate-y-1.5"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ background: bg }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [chemCount, setChemCount] = useState(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    supabase
      .from('chemicals')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setChemCount(count) })
  }, [])

  const features = [
    {
      icon: FlaskConical,
      title: 'Smart Inventory Management',
      description: 'Track all lab chemicals precisely — quantities, locations, and expiry dates in one unified place.',
      color: '#4A90E2',
      bg: '#EBF4FF',
    },
    {
      icon: AlertTriangle,
      title: 'Instant Hazard Detection',
      description: 'Real-time alerts for dangerous substances with GHS classifications and risk levels.',
      color: '#E85D5D',
      bg: '#FDEAEA',
    },
    {
      icon: Beaker,
      title: 'AI Mixing Simulator',
      description: 'Discover chemical reactions before mixing — instant AI-powered hazard analysis and predictions.',
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      icon: QrCode,
      title: 'QR Code Scanner',
      description: 'Scan any chemical QR code for instant access to its complete data sheet from any device.',
      color: '#2D6A9F',
      bg: '#DBEAFE',
    },
    {
      icon: Map,
      title: 'Interactive Lab Map',
      description: 'Visualize chemical storage locations on your interactive lab map with a smart slot system.',
      color: '#5DB9A0',
      bg: '#D1FAF0',
    },
    {
      icon: MessageSquare,
      title: 'AI Chemistry Assistant',
      description: 'Ask your smart chemical assistant about any substance or reaction and get an instant scientific answer.',
      color: '#F5A623',
      bg: '#FEF3DC',
    },
  ]

  const steps = [
    {
      step: '01',
      title: 'Create Your Account',
      desc: 'Sign up for free in seconds using your email address.',
      color: '#4A90E2',
      bg: '#EBF4FF',
    },
    {
      step: '02',
      title: 'Add Your Chemicals',
      desc: 'Enter your lab chemical data or auto-fetch it from PubChem.',
      color: '#5DB9A0',
      bg: '#D1FAF0',
    },
    {
      step: '03',
      title: 'Manage & Monitor',
      desc: 'Track inventory, analytics, and alerts from a single smart dashboard.',
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[100svh] flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B1629 0%, #0F2D52 50%, #1a4a8a 100%)' }}
      >
        <ParticlesBackground formulas={FORMULAS} />
        <FloatingMolecule molecule="hexagonal" />

        {/* ── Navbar ────────────────────────────────────── */}
        <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 lg:px-16 py-4 sm:py-5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Atom size={18} color="white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-black text-white text-sm sm:text-base">ChemVision</span>
              <span className="text-blue-300 text-[10px] sm:text-xs font-semibold hidden xs:inline">Lab Hub</span>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3 sm:px-5 py-2 text-xs sm:text-sm font-black text-slate-900 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #7AB8F5, #4A90E2)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={() => navigate('/login')}
                  className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl
                             border border-white/20 hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => navigate('/register')}
                  className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-black text-slate-900 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #7AB8F5, #4A90E2)' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>
        </nav>

        {/* ── Hero Content ───────────────────────────────── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center
                        px-4 sm:px-8 lg:px-16 py-10 sm:py-16">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full
                       text-[11px] sm:text-xs font-bold mb-5 sm:mb-7"
            style={{
              background: 'rgba(74,144,226,0.2)',
              border: '1px solid rgba(74,144,226,0.45)',
              color: '#7AB8F5',
            }}
          >
            <Star size={11} />
            The Smartest Lab Management System
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.65 }}
            className="font-heading font-black text-white leading-tight mb-4 sm:mb-5 max-w-3xl"
            style={{ fontSize: 'clamp(1.75rem, 6vw, 4.25rem)' }}
          >
            Your Chemical Lab,
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #7AB8F5, #5DB9A0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Smarter & Safer
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-blue-200 leading-relaxed max-w-[280px] sm:max-w-lg lg:max-w-xl mx-auto mb-7 sm:mb-9"
            style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1.05rem)' }}
          >
            Intelligent chemical inventory management with instant hazard detection,
            AI-powered mixing simulator, and an interactive lab map.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col xs:flex-row gap-3 w-full max-w-[280px] xs:max-w-none xs:w-auto justify-center"
          >
            <motion.button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5
                         rounded-2xl font-black text-sm sm:text-base text-slate-900"
              style={{
                background: 'linear-gradient(135deg, #7AB8F5, #4A90E2)',
                boxShadow: '0 8px 28px rgba(74,144,226,0.4)',
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Get Started — It's Free
              <ArrowRight size={17} />
            </motion.button>
            <motion.button
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5
                         rounded-2xl font-bold text-sm sm:text-base text-white
                         border border-white/20 hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Features
              <ChevronRight size={17} />
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="flex items-center gap-4 sm:gap-6 mt-7 sm:mt-10 flex-wrap justify-center"
          >
            {[
              { icon: CheckCircle, text: '100% Free' },
              { icon: Shield, text: 'Secure & Encrypted' },
              { icon: Zap, text: 'Instant & Fast' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-blue-300 text-xs font-semibold">
                <Icon size={13} />
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="relative z-10 flex justify-center pb-5 sm:pb-7"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div className="w-5 h-9 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2.5 rounded-full bg-white/50" />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS SECTION
         ══════════════════════════════════════════════════════════ */}
      <section
        className="py-10 sm:py-14 px-4 sm:px-8"
        style={{ background: 'linear-gradient(135deg, #0F2D52, #1B3A6B)' }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
          <StatItem value={chemCount ?? 0} label="Chemicals Tracked" suffix="+" color="#7AB8F5" />
          <StatItem value={8}              label="Smart Mixing Rules"  suffix="+" color="#5DB9A0" />
          <StatItem value={100}            label="Safety Coverage"     suffix="%" color="#F5A623" />
          <StatItem value={5}              label="Labs Managed"        suffix="+" color="#E85D5D" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES SECTION
         ══════════════════════════════════════════════════════════ */}
      <section ref={featuresRef} className="py-14 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black
                             text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50
                             border border-blue-200 dark:border-blue-900 mb-4">
              ✦ Platform Features
            </span>
            <h2
              className="font-heading font-black text-slate-900 dark:text-slate-100 mb-3"
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2.5rem)' }}
            >
              Everything Your Lab Needs
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              A complete platform combining inventory management, safety, and AI analysis in one seamless interface.
            </p>
          </motion.div>

          {/* Features grid — 1 col mobile / 2 col tablet / 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
         ══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black
                             text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50
                             border border-emerald-200 dark:border-emerald-900 mb-4">
              ✦ How It Works
            </span>
            <h2
              className="font-heading font-black text-slate-900 dark:text-slate-100"
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2.5rem)' }}
            >
              Up and Running in 3 Steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 relative">
            {/* Connecting line — visible only on sm+ */}
            <div className="hidden sm:block absolute top-8 inset-x-[16%] h-0.5
                            bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200
                            dark:from-blue-900 dark:via-emerald-900 dark:to-purple-900" />

            {steps.map(({ step, title, desc, color, bg }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.14, duration: 0.48 }}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                              font-black text-2xl shadow-lg"
                  style={{ background: bg, color }}
                >
                  {step}
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px] sm:max-w-none">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA SECTION
         ══════════════════════════════════════════════════════════ */}
      <section
        className="relative py-14 sm:py-20 lg:py-24 px-4 sm:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B1629 0%, #0F2D52 55%, #1B3A6B 100%)' }}
      >
        <ParticlesBackground formulas={FORMULAS} />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <BarChart3 size={28} color="white" />
            </div>
            <h2
              className="font-heading font-black text-white mb-4 leading-tight"
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2.5rem)' }}
            >
              Ready to Get Started?
            </h2>
            <p className="text-blue-200 text-sm sm:text-base mb-7 sm:mb-8 leading-relaxed">
              Join labs already using ChemVision and elevate your lab's safety and efficiency today.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center">
              <motion.button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4
                           rounded-2xl font-black text-sm sm:text-base text-slate-900"
                style={{
                  background: 'linear-gradient(135deg, #7AB8F5, #4A90E2)',
                  boxShadow: '0 8px 28px rgba(74,144,226,0.4)',
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Create Free Account
                <ArrowRight size={17} />
              </motion.button>
              <motion.button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4
                           rounded-2xl font-bold text-sm sm:text-base text-white
                           border border-white/20 hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-5 sm:py-7 px-4 text-center bg-slate-950 border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Atom size={15} className="text-blue-400" />
          <span className="font-heading font-bold text-white text-sm">ChemVision Lab Hub</span>
        </div>
        <p className="text-slate-500 text-xs">© {new Date().getFullYear()} ChemVision. All rights reserved.</p>
      </footer>
    </div>
  )
}
