import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import { User, Mail, Shield, Clock, FlaskConical, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuthStore()
  const { lang } = useLanguage()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [securityAnswer, setSecurityAnswer] = useState(profile?.security_answer || '')

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setSecurityAnswer(profile.security_answer || '')
    }
  }, [profile])

  useEffect(() => {
    if (profile?.id) {
      supabase.from('usage_logs').select('*, chemicals(name, formula)').eq('user_id', profile?.id).order('timestamp', { ascending: false }).limit(10)
        .then(({ data }) => { setLogs(data || []); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [profile?.id])

  const saveProfile = async () => {
    const cleanAns = securityAnswer.trim().toLowerCase()
    if (cleanAns && (cleanAns.includes(' ') || cleanAns.includes('\t') || cleanAns.includes('\n'))) {
      toast.error(lang === 'ar' ? 'سؤال الأمان: يرجى كتابة اسم واحد فقط (بدون مسافات)' : 'Security Question: Please enter a single word only (no spaces)')
      return
    }

    const { error } = await supabase.from('profiles').update({
      name,
      security_answer: cleanAns || profile?.security_answer || null
    }).eq('id', profile.id)

    if (!error) {
      toast.success(lang === 'ar' ? 'تم تحديث الملف الشخصي!' : 'Profile updated!')
      refreshProfile()
      setEditing(false)
    } else {
      toast.error(lang === 'ar' ? 'فشل التحديث' : 'Failed to update')
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <motion.h1 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="font-heading font-extrabold text-2xl lg:text-3xl mb-6" 
        style={{ color: 'var(--text-primary)' }}
      >
        {lang === 'ar' ? 'الملف الشخصي' : 'My Profile'}
      </motion.h1>

      {/* Profile main card */}
      <motion.div className="card p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-6 flex-wrap sm:flex-nowrap">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #4A90E2, #1B3A6B)' }}>
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="input-field py-2 text-base font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700" 
                  placeholder={lang === 'ar' ? 'الاسم' : 'Name'} 
                />
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                  <label className="text-xs font-bold block mb-1 text-amber-800 dark:text-amber-300">
                    {lang === 'ar' ? 'سؤال الأمان: ما هو اسم مدرسك المفضل؟' : 'Security Question: Who is your favorite teacher?'}
                  </label>
                  <input
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل اسم واحد فقط (مثال: أحمد)' : 'Enter a single word only (e.g. Ahmed)'}
                    className="input-field py-1.5 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                  <p className="text-[11px] font-bold mt-1 text-rose-600 dark:text-rose-400">
                    {lang === 'ar' ? '⚠️ تنبيه: يجب إدخال اسم واحد فقط بدون مسافات.' : '⚠️ Warning: Please enter a single word only with no spaces.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-heading font-extrabold text-xl truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile?.name || (lang === 'ar' ? 'مستخدم' : 'User')}
                </h2>
                <span className="badge mt-1.5 font-bold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200">
                  <Shield size={12} className="text-blue-500" /> {profile?.role?.toUpperCase() || 'USER'}
                </span>
              </>
            )}
          </div>
          <div className={`${lang === 'ar' ? 'mr-auto' : 'ml-auto'} flex gap-2 flex-shrink-0`}>
            {editing ? (
              <>
                <button className="btn-primary py-2 px-4 font-bold" onClick={saveProfile}>{lang === 'ar' ? 'حفظ' : 'Save'}</button>
                <button className="btn-secondary py-2 px-4 font-bold" onClick={() => setEditing(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
              </>
            ) : (
              <button className="btn-secondary py-2 px-4 font-bold" onClick={() => setEditing(true)}>{lang === 'ar' ? 'تعديل' : 'Edit'}</button>
            )}
          </div>
        </div>

        {/* 4 Info Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Mail, label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', value: profile?.email || 'N/A' },
            { icon: Shield, label: lang === 'ar' ? 'الصلاحية' : 'Role', value: profile?.role ? (profile.role.charAt(0).toUpperCase() + profile.role.slice(1)) : 'N/A' },
            { icon: KeyRound, label: lang === 'ar' ? 'سؤال الأمان (مدرسك المفضل)' : 'Security Question (Favorite Teacher)', value: profile?.security_answer ? (lang === 'ar' ? 'مُفعل ✓' : 'Configured ✓') : (lang === 'ar' ? 'غير مُفعل ❌' : 'Not Configured ❌') },
            { icon: Clock, label: lang === 'ar' ? 'تاريخ الانضمام' : 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A' },
          ].map(({ icon: Icon, label, value }) => (
            <div 
              key={label} 
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/90"
            >
              <Icon size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-sm font-extrabold mt-0.5 break-words" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Usage history card */}
      <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-heading font-extrabold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          {lang === 'ar' ? 'سجل الاستهلاك الحديث' : 'Recent Usage History'}
        </h3>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-center py-8 font-semibold text-slate-500 dark:text-slate-400">
            {lang === 'ar' ? 'لا يوجد سجل استهلاك حتى الآن' : 'No usage logged yet'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log, i) => (
              <motion.div 
                key={log.id} 
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex-shrink-0">
                    {log.chemicals?.formula?.slice(0, 4) || 'CHEM'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                      {log.chemicals?.name || (lang === 'ar' ? 'مادة كيميائية' : 'Chemical')}
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      {log.purpose || (lang === 'ar' ? 'لم يتم تحديد الغرض' : 'No purpose specified')}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400">-{log.amount_used} {log.unit}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

