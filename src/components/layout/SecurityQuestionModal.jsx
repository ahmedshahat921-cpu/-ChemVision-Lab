import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, ShieldAlert, Loader2, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store'
import { useLanguage } from '../../hooks/useLanguage'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function SecurityQuestionModal() {
  const { user, profile, setProfile } = useAuthStore()
  const { lang } = useLanguage()
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  // Only open modal if user is logged in, has a profile, but lacks security_answer
  const isMissingSecurityQuestion = Boolean(
    user && profile && (!profile.security_answer || profile.security_answer.trim() === '')
  )

  if (!isMissingSecurityQuestion) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanAnswer = answer.trim()

    if (!cleanAnswer) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error(lang === 'ar' ? 'يرجى إدخال إجابة سؤال الأمان' : 'Please enter a security answer')
      return
    }

    if (cleanAnswer.includes(' ') || cleanAnswer.includes('\t') || cleanAnswer.includes('\n')) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error(lang === 'ar' ? 'سؤال الأمان: يرجى كتابة اسم واحد فقط (بدون مسافات)' : 'Security Question: Please enter a single word only (no spaces)')
      return
    }

    setLoading(true)
    try {
      const finalAnswer = cleanAnswer.toLowerCase()
      const { error } = await supabase
        .from('profiles')
        .update({ security_answer: finalAnswer })
        .eq('id', profile.id)

      if (error) throw error

      // Update Zustand local profile store
      setProfile({ ...profile, security_answer: finalAnswer })
      toast.success(lang === 'ar' ? 'تم حفظ سؤال الأمان بنجاح!' : 'Security question saved successfully!')
    } catch (err) {
      setShake(true); setTimeout(() => setShake(false), 600)
      toast.error(err.message || (lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Failed to save security answer'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden"
          style={{ border: '1px solid #E2E8F0', direction: lang === 'ar' ? 'rtl' : 'ltr' }}
        >
          {/* Top Decorative Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-2" style={{ background: 'linear-gradient(90deg, #4A90E2, #5DB9A0)' }} />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFF7ED', border: '1px solid #FFEDD5' }}>
              <ShieldAlert size={24} style={{ color: '#EA580C' }} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl" style={{ color: '#2C3E50' }}>
                {lang === 'ar' ? 'تحديث أمان الحساب' : 'Account Security Update'}
              </h2>
              <p className="text-xs" style={{ color: '#64748B' }}>
                {lang === 'ar' ? 'خطوة واحدة بسيطة لحماية حسابك' : 'One quick step to protect your account'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Helper Info Box */}
            <div className="p-3.5 rounded-xl text-xs font-medium leading-relaxed" style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FFEDD5' }}>
              {lang === 'ar'
                ? '💡 سؤال الأمان يُستخدم لاسترجاع حسابك إذا نسيت كلمة المرور دون الحاجة للبريد الإلكتروني. يرجى كتابة اسم معلمك المفضل ككلمة واحدة فقط (مثال: أحمد).'
                : '💡 Security Question is used to recover your account if you forget your password without needing email. Please enter your favorite teacher\'s name as a single word (e.g. Ahmed).'}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#2C3E50' }}>
                {lang === 'ar' ? 'سؤال الأمان: ما هو اسم مدرسك المفضل؟' : 'Security Question: Who is your favorite teacher?'}
              </label>
              <div className="relative">
                <KeyRound size={18} className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 pointer-events-none z-10`} style={{ color: '#94A3B8' }} />
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={lang === 'ar' ? 'أدخل اسم واحد فقط (مثال: أحمد)' : 'Enter a single word only (e.g. Ahmed)'}
                  className={`input-field ${lang === 'ar' ? 'pr-11' : 'pl-11'}`}
                  autoFocus
                />
              </div>
              <div className="text-xs mt-1.5 font-medium" style={{ color: '#E11D48' }}>
                {lang === 'ar' ? '⚠️ تنبيه: يجب إدخال اسم واحد فقط بدون مسافات.' : '⚠️ Warning: Please enter a single word only with no spaces.'}
              </div>
            </div>

            <motion.div
              animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="pt-2"
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 ripple"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</>
                ) : (
                  <>{lang === 'ar' ? 'حفظ سؤال الأمان' : 'Save Security Question'} <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} /></>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
