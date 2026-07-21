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
    supabase.from('usage_logs').select('*, chemicals(name, formula)').eq('user_id', profile?.id).order('timestamp', { ascending: false }).limit(10)
      .then(({ data }) => { setLogs(data || []); setLoading(false) })
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
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-heading font-bold text-2xl mb-6" style={{ color: '#2C3E50' }}>
        {lang === 'ar' ? 'الملف الشخصي' : 'My Profile'}
      </motion.h1>

      {/* Profile card */}
      <motion.div className="card p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4A90E2, #1B3A6B)' }}>
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-1.5 text-base font-bold" placeholder={lang === 'ar' ? 'الاسم' : 'Name'} />
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: '#E28743' }}>
                    {lang === 'ar' ? 'سؤال الأمان: ما هو اسم مدرسك المفضل؟' : 'Security Question: Who is your favorite teacher?'}
                  </label>
                  <input
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل اسم واحد فقط (مثال: أحمد)' : 'Enter a single word only (e.g. Ahmed)'}
                    className="input-field py-1.5 text-xs"
                  />
                  <p className="text-[11px] mt-0.5" style={{ color: '#E11D48' }}>
                    {lang === 'ar' ? '⚠️ تنبيه: يجب إدخال اسم واحد فقط بدون مسافات.' : '⚠️ Warning: Please enter a single word only with no spaces.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-heading font-bold text-xl truncate" style={{ color: '#2C3E50' }}>{profile?.name}</h2>
                <span className="badge mt-1" style={{ background: profile?.role === 'admin' ? '#EBF4FF' : '#E8FBF6', color: profile?.role === 'admin' ? '#1B3A6B' : '#2A7060' }}>
                  <Shield size={10} /> {profile?.role}
                </span>
              </>
            )}
          </div>
          <div className={`${lang === 'ar' ? 'mr-auto' : 'ml-auto'} flex gap-2 flex-shrink-0`}>
            {editing ? (
              <>
                <button className="btn-primary py-2 px-4" onClick={saveProfile}>{lang === 'ar' ? 'حفظ' : 'Save'}</button>
                <button className="btn-secondary py-2 px-4" onClick={() => setEditing(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
              </>
            ) : (
              <button className="btn-secondary py-2 px-4" onClick={() => setEditing(true)}>{lang === 'ar' ? 'تعديل' : 'Edit'}</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Mail, label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', value: profile?.email },
            { icon: Shield, label: lang === 'ar' ? 'الصلاحية' : 'Role', value: profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) },
            { icon: KeyRound, label: lang === 'ar' ? 'سؤال الأمان (مدرسك المفضل)' : 'Security Question (Favorite Teacher)', value: profile?.security_answer ? (lang === 'ar' ? 'مُفعل ✓' : 'Configured ✓') : (lang === 'ar' ? 'غير مُفعل ❌' : 'Not Configured ❌') },
            { icon: Clock, label: lang === 'ar' ? 'تاريخ الانضمام' : 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F8F9FA' }}>
              <Icon size={16} style={{ color: '#4A90E2', marginTop: '2px' }} />
              <div>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{label}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#2C3E50' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Usage history */}
      <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-heading font-semibold text-base mb-4" style={{ color: '#2C3E50' }}>Recent Usage History</h3>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>No usage logged yet</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <motion.div key={log.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F8F9FA' }}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#EBF4FF', color: '#4A90E2' }}>
                    {log.chemicals?.formula?.slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>{log.chemicals?.name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{log.purpose || 'No purpose specified'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: '#E85D5D' }}>-{log.amount_used} {log.unit}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{new Date(log.timestamp).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
