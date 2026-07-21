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

// --- Animated counter ---
function useCounter(target, duration = 2000, start = false) {
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

// --- Stat card with animated counter ---
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
      className="text-center"
    >
      <p className="font-heading font-black text-4xl sm:text-5xl" style={{ color }}>
        {count}{suffix}
      </p>
      <p className="text-blue-200 text-sm mt-1 font-medium">{label}</p>
    </motion.div>
  )
}

// --- Feature card ---
function FeatureCard({ icon: Icon, title, description, color, bg, delay }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: bg }}>
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [chemCount, setChemCount] = useState(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    supabase.from('chemicals').select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setChemCount(count) })
  }, [])

  const features = [
    {
      icon: FlaskConical,
      title: 'إدارة المخزون الذكية',
      description: 'تتبع جميع المواد الكيميائية في مختبرك بدقة — الكميات، المواقع، وتواريخ الانتهاء في مكان واحد.',
      color: '#4A90E2',
      bg: '#EBF4FF',
    },
    {
      icon: AlertTriangle,
      title: 'كشف المخاطر الفوري',
      description: 'تنبيهات فورية للمواد الخطرة مع تصنيفات GHS ومستويات الخطورة لضمان سلامة المختبر.',
      color: '#E85D5D',
      bg: '#FDEAEA',
    },
    {
      icon: Beaker,
      title: 'محاكي الخلط بالذكاء الاصطناعي',
      description: 'اكتشف تفاعلات المواد قبل خلطها — تحليل فوري للمخاطر والنتائج المتوقعة بالذكاء الاصطناعي.',
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      icon: QrCode,
      title: 'ماسح رمز QR',
      description: 'امسح رمز QR لأي مادة كيميائية للوصول الفوري لبياناتها الكاملة من أي جهاز.',
      color: '#2D6A9F',
      bg: '#EBF4FF',
    },
    {
      icon: Map,
      title: 'خريطة المختبر التفاعلية',
      description: 'تصور مواقع تخزين المواد على خريطة مختبرك ثلاثية الأبعاد مع نظام المقاعد الذكي.',
      color: '#5DB9A0',
      bg: '#E8FBF6',
    },
    {
      icon: MessageSquare,
      title: 'مساعد ذكاء اصطناعي',
      description: 'اسأل مساعدك الكيميائي الذكي عن أي مادة أو تفاعل وستحصل على إجابة علمية فورية.',
      color: '#F5A623',
      bg: '#FEF3DC',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B1629 0%, #0F2D52 45%, #1a4a8a 100%)' }}
      >
        <ParticlesBackground formulas={FORMULAS} />
        <FloatingMolecule molecule="hexagonal" />

        {/* Top nav */}
        <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Atom size={20} color="white" />
            </div>
            <div>
              <span className="font-heading font-black text-white text-base">ChemVision</span>
              <span className="text-blue-300 text-xs ml-1.5 font-semibold hidden sm:inline">Lab Hub</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              // Logged-in: show Dashboard button
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-black text-slate-900 rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #7AB8F5, #4A90E2)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <LayoutDashboard size={15} />
                الداشبورد
              </motion.button>
            ) : (
              // Guest: show login/register buttons
              <>
                <motion.button
                  onClick={() => navigate('/login')}
                  className="px-3 sm:px-5 py-2 text-sm font-bold text-white rounded-xl border border-white/20 hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  تسجيل الدخول
                </motion.button>
                <motion.button
                  onClick={() => navigate('/register')}
                  className="px-3 sm:px-5 py-2 text-sm font-black text-slate-900 rounded-xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #7AB8F5, #4A90E2)' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  ابدأ مجاناً
                </motion.button>
              </>
            )}
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 py-12 sm:py-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 sm:mb-8"
            style={{ background: 'rgba(74,144,226,0.25)', border: '1px solid rgba(74,144,226,0.5)', color: '#7AB8F5' }}
          >
            <Star size={12} />
            نظام إدارة المختبر الأذكى في المنطقة
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="font-heading font-black text-white leading-tight mb-4 sm:mb-6"
            style={{ fontSize: 'clamp(2rem, 7vw, 4.5rem)' }}
          >
            مختبرك الكيميائي
            <br />
            <span style={{ background: 'linear-gradient(135deg, #7AB8F5, #5DB9A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              أذكى وأكثر أماناً
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-blue-200 text-sm sm:text-lg leading-relaxed max-w-xs sm:max-w-xl mx-auto mb-8 sm:mb-10"
          >
            إدارة ذكية للمواد الكيميائية مع كشف المخاطر الفوري، ومحاكي الخلط بالذكاء الاصطناعي، وخريطة المختبر التفاعلية.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto"
          >
            <motion.button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-base text-slate-900 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #7AB8F5, #4A90E2)', boxShadow: '0 8px 32px rgba(74,144,226,0.4)' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              ابدأ مجاناً الآن
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              onClick={() => { featuresRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base text-white border border-white/20 hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              اكتشف المميزات
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="flex items-center gap-4 sm:gap-6 mt-8 sm:mt-12 flex-wrap justify-center"
          >
            {[
              { icon: CheckCircle, text: 'مجاني 100%' },
              { icon: Shield, text: 'آمن ومشفر' },
              { icon: Zap, text: 'فوري وسريع' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-blue-300 text-xs sm:text-sm font-semibold">
                <Icon size={14} />
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="relative z-10 flex justify-center pb-6 sm:pb-8"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-white/50" />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          STATS SECTION
         ══════════════════════════════════════════ */}
      <section
        className="py-12 sm:py-16 px-4 sm:px-8"
        style={{ background: 'linear-gradient(135deg, #0F2D52, #1B3A6B)' }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          <StatItem value={chemCount ?? 0} label="مادة كيميائية" suffix="+" color="#7AB8F5" />
          <StatItem value={8} label="قاعدة خلط ذكية" suffix="+" color="#5DB9A0" />
          <StatItem value={100} label="نسبة السلامة" suffix="%" color="#F5A623" />
          <StatItem value={5} label="مختبرات مدارة" suffix="+" color="#E85D5D" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES SECTION
         ══════════════════════════════════════════ */}
      <section ref={featuresRef} className="py-16 sm:py-24 px-4 sm:px-8 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 mb-4">
              ✦ مميزات النظام
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-slate-900 dark:text-slate-100 mb-3">
              كل ما يحتاجه مختبرك
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              منصة متكاملة تجمع إدارة المخزون والسلامة والتحليل الذكي في واجهة واحدة سلسة
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
         ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 mb-4">
              ✦ كيف يعمل
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-slate-900 dark:text-slate-100 mb-3">
              ابدأ في 3 خطوات بسيطة
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden sm:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 dark:from-blue-900 dark:via-emerald-900 dark:to-purple-900" />

            {[
              { step: '01', title: 'أنشئ حسابك', desc: 'سجل مجاناً في ثوانٍ باستخدام بريدك الإلكتروني', color: '#4A90E2', bg: '#EBF4FF' },
              { step: '02', title: 'أضف موادك الكيميائية', desc: 'أدخل بيانات مواد مختبرك أو اسحبها تلقائياً من PubChem', color: '#5DB9A0', bg: '#E8FBF6' },
              { step: '03', title: 'أدر وراقب بذكاء', desc: 'تابع المخزون والتحليلات والتنبيهات من لوحة تحكم واحدة', color: '#7C3AED', bg: '#EDE9FE' },
            ].map(({ step, title, desc, color, bg }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 font-black text-2xl shadow-lg z-10 relative" style={{ background: bg, color }}>
                  {step}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA SECTION
         ══════════════════════════════════════════ */}
      <section
        className="relative py-16 sm:py-24 px-4 sm:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B1629 0%, #0F2D52 50%, #1B3A6B 100%)' }}
      >
        <ParticlesBackground formulas={FORMULAS} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <BarChart3 size={32} color="white" />
            </div>
            <h2 className="font-heading font-black text-white text-2xl sm:text-4xl mb-4 leading-tight">
              جاهز تبدأ الآن؟
            </h2>
            <p className="text-blue-200 text-sm sm:text-base mb-8 leading-relaxed">
              انضم للمختبرات التي تستخدم ChemVision وارتقِ بمستوى سلامة وكفاءة مختبرك
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-base text-slate-900 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #7AB8F5, #4A90E2)', boxShadow: '0 8px 32px rgba(74,144,226,0.4)' }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                إنشاء حساب مجاني
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white border border-white/20 hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                تسجيل الدخول
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 text-center bg-slate-950 border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Atom size={16} className="text-blue-400" />
          <span className="font-heading font-bold text-white text-sm">ChemVision Lab Hub</span>
        </div>
        <p className="text-slate-500 text-xs">© {new Date().getFullYear()} ChemVision. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}
