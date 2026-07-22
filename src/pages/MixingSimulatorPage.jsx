import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Beaker, AlertTriangle, CheckCircle, Zap, ChevronDown, ArrowRightLeft, Flame, Wind } from 'lucide-react'
import { useChemicalStore } from '../store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useLanguage } from '../hooks/useLanguage'
import html2pdf from 'html2pdf.js'

const reactionStyles = {
  safe: { bg: '#E8FBF6', color: '#2A7060', border: '#5DB9A0', icon: CheckCircle, label: 'Safe Reaction', emoji: '' },
  hazardous: { bg: '#FDEAEA', color: '#A02A2A', border: '#E85D5D', icon: AlertTriangle, label: 'Hazardous!', emoji: '' },
  explosive: { bg: '#FDEAEA', color: '#7F1D1D', border: '#A02A2A', icon: Flame, label: 'EXPLOSIVE!', emoji: '' },
  toxic: { bg: '#FDEAEA', color: '#A02A2A', border: '#E85D5D', icon: AlertTriangle, label: 'Toxic!', emoji: '' },
  produces_gas: { bg: '#FEF3DC', color: '#A66410', border: '#F5A623', icon: Wind, label: 'Produces Gas!', emoji: '' },
  new_product: { bg: '#EDE9FE', color: '#6326CA', border: '#7C3AED', icon: Zap, label: 'New Product Formed', emoji: '' },
}

// Chemical Selector
function ChemicalSelector({ label, selected, onSelect, chemicals, exclude }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { lang } = useLanguage()
  const filtered = chemicals.filter(c => c.id !== exclude && (c.name.toLowerCase().includes(search.toLowerCase()) || c.formula.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="relative flex-1 text-left min-w-0 w-full">
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary, #2C3E50)' }}>{label}</label>
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-full p-3.5 rounded-xl text-left flex items-center justify-between transition-colors bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700"
        style={{
          background: selected ? (lang === 'ar' ? 'rgba(74, 144, 226, 0.1)' : '#EBF4FF') : undefined,
          borderColor: selected ? '#4A90E2' : undefined
        }}
        whileHover={{ borderColor: '#4A90E2' }}
      >
        {selected ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0" style={{ background: '#4A90E2', color: 'white' }}>
              {selected.formula.slice(0, 3)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-left truncate" style={{ color: 'var(--text-primary, #2C3E50)' }}>{selected.name}</p>
              <p className="text-xs text-left truncate" style={{ color: '#64748B' }}>{selected.formula}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-left truncate" style={{ color: '#94A3B8' }}>
            {lang === 'ar' ? 'اختر مادة كيميائية...' : 'Select a chemical...'}
          </span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="ml-2 flex-shrink-0"><ChevronDown size={16} style={{ color: '#64748B' }} /></motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="absolute z-50 w-full min-w-full sm:min-w-[300px] left-0 mt-2 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث باسم المادة أو الصيغة...' : 'Search...'}
                className="input-field py-2 text-sm w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => { onSelect(c); setOpen(false); setSearch('') }}
                  className="w-full flex items-center gap-2.5 p-3 text-left transition-colors hover:bg-blue-50/70 dark:hover:bg-blue-950/40"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
                    {c.formula.slice(0, 3)}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-slate-100">{c.name}</p>
                    <p className="text-[11px] truncate text-slate-500 dark:text-slate-400 font-mono">{c.formula}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-auto flex-shrink-0">
                    <span className={`badge badge-${c.hazard_level} text-[10px] px-2 py-0.5 whitespace-nowrap`}>
                      {lang === 'ar' 
                        ? (c.hazard_level === 'safe' || c.hazard_level === 'low' ? 'آمن' : c.hazard_level === 'warning' || c.hazard_level === 'medium' ? 'تحذير' : 'خطر') 
                        : c.hazard_level
                      }
                    </span>
                    {c.expiry_date && new Date(c.expiry_date) < new Date() && (
                      <span className="text-[9px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded shadow-sm border border-red-200 dark:border-red-800 whitespace-nowrap">
                        {lang === 'ar' ? 'منتهي' : 'Expired'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  {lang === 'ar' ? 'لا توجد نتائج' : 'No chemicals found'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Reaction animation for result
function ReactionAnimation({ type }) {
  if (type === 'safe') return (
    <motion.div className="flex justify-center gap-2 my-4">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full"
          style={{ background: i % 2 === 0 ? '#5DB9A0' : '#7AB8F5' }}
          animate={{ y: [0, -20, 0], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  )

  if (type === 'explosive' || type === 'hazardous') return (
    <motion.div
      className="flex justify-center my-4 text-5xl"
      animate={{ scale: [1, 1.3, 1], rotate: [0, -5, 5, 0] }}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      {type === 'explosive' ? '💥' : '🔥'}
    </motion.div>
  )

  if (type === 'toxic') return (
    <motion.div className="flex justify-center my-4 text-4xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
      ☠️
    </motion.div>
  )

  if (type === 'produces_gas') return (
    <motion.div className="flex justify-center gap-3 my-4">
      {[...Array(4)].map((_, i) => (
        <motion.div key={i} className="text-3xl" animate={{ y: [0, -40], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}>
          💨
        </motion.div>
      ))}
    </motion.div>
  )

  if (type === 'new_product') return (
    <motion.div className="flex justify-center my-4 text-5xl" initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5, type: 'spring' }}>
      ⚗️
    </motion.div>
  )

  return null
}

// Local smart chemical prediction engine ( C.P.E. )
const predictReactionLocally = (chemA, chemB, varsA, varsB) => {
  const nameA = chemA.name.toLowerCase()
  const nameB = chemB.name.toLowerCase()
  const formulaA = chemA.formula
  const formulaB = chemB.formula
  
  const isAcid = (n, f) => n.includes('acid') || f.startsWith('H') || n.includes('hydrogen')
  const isBase = (n) => n.includes('hydroxide') || n.includes('carbonate') || n.includes('oxide') || n.includes('ammonia')
  
  const acidA = isAcid(nameA, formulaA)
  const acidB = isAcid(nameB, formulaB)
  const baseA = isBase(nameA)
  const baseB = isBase(nameB)

  const isConcA = varsA?.state === 'aq' && (varsA?.concentration || 1) > 6.0
  const isConcB = varsB?.state === 'aq' && (varsB?.concentration || 1) > 6.0
  const isConcentrated = isConcA || isConcB
  const maxTempInput = Math.max(varsA?.temperature || 25, varsB?.temperature || 25)
  const isHotInput = maxTempInput > 50

  // -- CHEMICAL REACTIONS --

  // 1. Acid + Carbonate (e.g. HCl + CaCO3) -> produces CO2 gas
  if ((acidA && nameB.includes('carbonate')) || (acidB && nameA.includes('carbonate'))) {
    const acid = acidA ? chemA : chemB
    const carbonate = acidA ? chemB : chemA
    const acidVars = acidA ? varsA : varsB
    const carbVars = acidA ? varsB : varsA
    const isHighAcidConc = acidVars?.state === 'aq' && acidVars?.concentration > 6.0
    const effervescenceSpeed = isHighAcidConc ? 'extremely rapid' : 'moderate'
    const gasVolume = Math.round((acidVars?.quantity || 50) * (acidVars?.concentration || 1) * 0.22)

    return {
      is_safe: !isHighAcidConc && !isHotInput,
      reaction_type: 'produces_gas',
      severity_score: isHighAcidConc ? 6 : isHotInput ? 5 : 3,
      result_description_en: `Reaction between ${acid.name} (${acidVars?.concentration || 1.0}M, ${acidVars?.quantity || 50}${acidVars?.state === 's' ? 'g' : 'ml'} as ${acidVars?.state}) and ${carbonate.name} (${carbVars?.quantity || 50}g as ${carbVars?.state}) at ${maxTempInput}°C generates Carbon Dioxide (CO2) gas. Bubbling speed is ${effervescenceSpeed}.`,
      result_description_ar: `التفاعل بين ${acid.name} (بتركيز ${acidVars?.concentration || 1.0}M، وكمية ${acidVars?.quantity || 50}مل بحالة ${acidVars?.state}) مع ${carbonate.name} (بكمية ${carbVars?.quantity || 50}جرام بحالة ${carbVars?.state}) في درجة حرارة ${maxTempInput} درجة مئوية ينتج غاز ثاني أكسيد الكربون (CO2) بفوران ${isHighAcidConc ? 'سريع وعنيف للغاية' : 'معتدل'}.`,
      product_name: 'Carbon Dioxide & Salt Solution',
      product_formula: 'CO2 (g) + H2O (l) + Salt (aq)',
      physical_properties_en: `Exothermic neutralization (ΔH < 0). Active gas evolution (~${gasVolume}L of CO2). Mixture temperature rises to approximately ${Math.round(maxTempInput + (isHighAcidConc ? 25 : 8))}°C.`,
      physical_properties_ar: `تفاعل طارد للحرارة مع انطلاق حوالي ${gasVolume} لتر من الغاز. ترتفع درجة حرارة المحلول لتصل إلى حوالي ${Math.round(maxTempInput + (isHighAcidConc ? 25 : 8))} درجة مئوية.`,
      safety_measures_en: `Wear splash goggles, lab coat, and nitrile gloves. Ensure closed vessels are vented to avoid pressure explosion. Perform in a fume hood due to gas release.`,
      safety_measures_ar: `ارتدِ نظارات الحماية، معطف المختبر، وقفازات النيتريل. تجنب إغلاق الأوعية بإحكام منعاً للانفجار بسبب ضغط الغاز المتصاعد.`,
      chemical_properties_en: `pH shifts towards weakly acidic/neutral (pH 5-6). High acid concentrations can lead to incomplete reaction due to carbonate saturation.`,
      chemical_properties_ar: `يتغير الرقم الهيدروجيني pH نحو حموضة خفيفة أو تعادل (5-6). قد تؤدي التراكيز المرتفعة من الحمض لعدم اكتمال التفاعل بسبب تشبع الكربونات.`
    }
  }

  // 2. Acid + Base (Hydroxide/Ammonia) -> Exothermic Neutralization
  if ((acidA && baseB) || (acidB && baseA)) {
    const acid = acidA ? chemA : chemB
    const base = acidA ? chemB : chemA
    const acidVars = acidA ? varsA : varsB
    const baseVars = acidA ? varsB : varsA
    const isDangerouslyHot = isHotInput || (acidVars?.concentration > 8.0 && baseVars?.concentration > 8.0)
    const finalTempEstimate = Math.round(maxTempInput + ((acidVars?.concentration || 1) * (baseVars?.concentration || 1) * 3))

    return {
      is_safe: !isDangerouslyHot && (acidVars?.concentration || 1) < 10 && (baseVars?.concentration || 1) < 10,
      reaction_type: isDangerouslyHot ? 'hazardous' : 'safe',
      severity_score: isDangerouslyHot ? 6 : 2,
      result_description_en: `Acid-base neutralization between ${acid.name} (${acidVars?.concentration || 1.0}M, ${acidVars?.quantity || 50}ml) and ${base.name} (${baseVars?.concentration || 1.0}M, ${baseVars?.quantity || 50}ml). Exothermic reaction yields water and stable salt.`,
      result_description_ar: `تفاعل تعادل حمضي-قاعدي بين ${acid.name} (بتركيز ${acidVars?.concentration || 1.0}M، وكمية ${acidVars?.quantity || 50}مل) مع ${base.name} (بتركيز ${baseVars?.concentration || 1.0}M، وكمية ${baseVars?.quantity || 50}مل). التفاعل طارد للحرارة وينتج ماء وملح مستقر.`,
      product_name: 'Water & Salt Solution',
      product_formula: 'H2O (l) + Salt (aq)',
      physical_properties_en: `Exothermic heat release. Mixture temperature rises to approximately ${Math.min(100, finalTempEstimate)}°C. High concentration increases volatility and splash hazard.`,
      physical_properties_ar: `انطلاق حرارة تعادل. ترتفع درجة حرارة الخليط لتصل إلى حوالي ${Math.min(100, finalTempEstimate)} درجة مئوية. التركيز العالي يزيد من خطر تناثر السوائل.`,
      safety_measures_en: `Wear chemical splash goggles and heavy nitrile gloves. Always add acid to base slowly with stirring. Cool container if needed to prevent boiling splash.`,
      safety_measures_ar: `ارتدِ نظارات واقية للمواد الكيميائية، وقفازات نيتريل سميكة. أضف الحمض دائماً إلى القاعدة ببطء مع التحريك المستمر لتفادي الغليان المفاجئ.`,
      chemical_properties_en: `Neutralization shifts pH towards ~7. Spectator ions remain completely dissociated in aqueous solution.`,
      chemical_properties_ar: `يؤدي تفاعل التعادل لتغير الرقم الهيدروجيني pH إلى حوالي 7. تتفكك الأيونات المرافقة بالكامل في المحلول المائي.`
    }
  }

  // 3. Oxidizer + Flammable organic solvent -> Danger of fire/explosion
  const isOxidizer = (n) => n.includes('nitrate') || n.includes('peroxide') || n.includes('permanganate') || n.includes('oxygen') || n.includes('sulfuric') || n.includes('nitric')
  const isFlammable = (n) => n.includes('alcohol') || n.includes('ethanol') || n.includes('acetone') || n.includes('benzene') || n.includes('methanol') || n.includes('hydrogen')
  
  if ((isOxidizer(nameA) && isFlammable(nameB)) || (isOxidizer(nameB) && isFlammable(nameA))) {
    const ox = isOxidizer(nameA) ? chemA : chemB
    const flam = isOxidizer(nameA) ? chemB : chemA
    const oxVars = isOxidizer(nameA) ? varsA : varsB
    const flamVars = isOxidizer(nameA) ? varsB : varsA
    const isCritical = (oxVars?.quantity || 50) > 100 || (flamVars?.quantity || 50) > 100 || isHotInput || isConcentrated

    return {
      is_safe: false,
      reaction_type: 'explosive',
      severity_score: isCritical ? 10 : 8,
      result_description_en: `CRITICAL DANGER: Mixing oxidizer ${ox.name} (${oxVars?.quantity || 50}${oxVars?.state === 's' ? 'g' : 'ml'}) with flammable organic solvent ${flam.name} (${flamVars?.quantity || 50}${flamVars?.state === 's' ? 'g' : 'ml'}) causes immediate redox oxidation, high heat release, and explosion hazard.`,
      result_description_ar: `خطر حرج للغاية: خلط المؤكسد القوي (${ox.name}) (بكمية ${oxVars?.quantity || 50}${oxVars?.state === 's' ? 'جرام' : 'مل'}) مع المادة القابلة للاشتعال (${flam.name}) (بكمية ${flamVars?.quantity || 50}${flamVars?.state === 's' ? 'جرام' : 'مل'}) يسبب أكسدة واختزالاً فورية عنيفة وانفجاراً.`,
      product_name: 'Combustion Gases & Carbon Residues',
      product_formula: 'CO2 (g) + H2O (g) + Carbonaceous residues',
      physical_properties_en: `Extremely high exothermic heat release. Localized boiling and immediate vaporization of organic solvents. Combustion pressure expands rapidly.`,
      physical_properties_ar: `انطلاق حرارة هائل طارد للحرارة بشدة. غليان وتبخر فوري للمذيبات العضوية مع تمدد سريع لغازات الاحتراق.`,
      safety_measures_en: `DO NOT MIX. Requires blast shield, self-contained breathing apparatus (SCBA), chemical suit, and Class B fire extinguisher ready.`,
      safety_measures_ar: `يمنع الخلط نهائياً. يتطلب درع واقي من الانفجار، جهاز تنفس مستقل، بدلة حماية كيميائية، ووجود طفاية حريق من الفئة B جاهزة للاستخدام.`,
      chemical_properties_en: `Rapid destructive redox reaction. Carbon-carbon bonds break down, yielding gaseous carbon dioxide, toxic nitrogen/sulfur oxides, and steam.`,
      chemical_properties_ar: `تفاعل أكسدة واختزال تدميري سريع. تفكك الروابط الكيميائية بالكامل لينتج غاز ثاني أكسيد الكربون، وأكاسيد النيتروجين/الكبريت وبخار الماء.`
    }
  }

  // 4. Concentrated Acid + Water -> Exothermic hazard
  if ((acidA && nameB === 'water') || (acidB && nameA === 'water')) {
    const acid = acidA ? chemA : chemB
    const acidVars = acidA ? varsA : varsB
    const waterVars = acidA ? varsB : varsA
    const isAcidHighConc = acidVars?.state === 'aq' && (acidVars?.concentration || 1) > 6.0
    const riskFactor = isAcidHighConc ? 'extremely high' : 'moderate'
    const finalTemp = Math.round(maxTempInput + ((acidVars?.concentration || 1) * 3.5))

    return {
      is_safe: !isAcidHighConc && !isHotInput,
      reaction_type: 'hazardous',
      severity_score: isAcidHighConc ? 6 : 4,
      result_description_en: `Exothermic acid dilution. Mixing water with concentrated ${acid.name} (${acidVars?.concentration || 1.0}M, ${acidVars?.quantity || 50}ml) releases high hydration energy. Risk of localized boiling and acid splash is ${riskFactor}.`,
      result_description_ar: `تخفيف الحمض طارد للحرارة. خلط الماء مع الحمض المركز (${acid.name}) (بتركيز ${acidVars?.concentration || 1.0}M، وكمية ${acidVars?.quantity || 50}مل) يطلق طاقة هيدرة عالية. خطر الغليان وتناثر الحمض ${isAcidHighConc ? 'مرتفع للغاية وجسيم' : 'معتدل'}.`,
      product_name: 'Hydronium Ions Solution',
      product_formula: 'H3O+ (aq)',
      physical_properties_en: `Exothermic hydration energy release. Solution temperature rises to ~${Math.min(100, finalTemp)}°C. Localized steam bubbles form at the interface.`,
      physical_properties_ar: `انطلاق طاقة هيدرة طاردة للحرارة. ترتفع درجة حرارة المحلول لتصل إلى حوالي ${Math.min(100, finalTemp)} درجة مئوية مع تشكل فقاعات بخار موضعية.`,
      safety_measures_en: `Follow strict rule: Always add Acid to Water (A&W - never add water to acid!). Wear full face shield and acid-resistant gloves. Work inside a fume hood.`,
      safety_measures_ar: `اتبع القاعدة المخبرية الصارمة: أضف الحمض دائماً إلى الماء (A&W - لا تضف الماء للحمض مطلقاً!). ارتدِ واقي الوجه بالكامل وقفازات مقاومة للأحماض.`,
      chemical_properties_en: `Strong ionization. Acid dissociates completely, shifting mixture pH to < 1.`,
      chemical_properties_ar: `تأين قوي. يتفكك الحمض كلياً مما يرفع تركيز أيونات الهيدرونيوم ويهبط بالرقم الهيدروجيني pH لأقل من 1.`
    }
  }

  // -- PHYSICAL MIXTURES & SOLUBILITY --

  // 5. Ethanol + Water -> Fully Miscible
  if ((nameA.includes('ethanol') && nameB.includes('water')) || (nameB.includes('ethanol') && nameA.includes('water'))) {
    const etVars = nameA.includes('ethanol') ? varsA : varsB
    const wtVars = nameA.includes('ethanol') ? varsB : varsA
    const totalVolume = (etVars?.quantity || 50) + (wtVars?.quantity || 50)
    const contractedVol = Math.round(totalVolume * 0.96)

    return {
      is_safe: true,
      reaction_type: 'safe',
      severity_score: 1,
      result_description_en: `Ethanol and Water mix fully. Total initial volume of ${totalVolume}ml contracts to ~${contractedVol}ml due to strong hydrogen bonding.`,
      result_description_ar: `الإيثانول والماء ممتزجان تماماً. الحجم الكلي البالغ ${totalVolume}مل ينكمش إلى حوالي ${contractedVol}مل نتيجة الروابط الهيدروجينية القوية.`,
      product_name: 'Aqueous Ethanol Solution',
      product_formula: 'C2H5OH (aq)',
      physical_properties_en: `Slight exothermic heat of mixing. Density decreases, and volume contracts. Homegeneous phase stable at ${maxTempInput}°C.`,
      physical_properties_ar: `انطلاق حرارة خلط طفيفة. تنخفض الكثافة وينكمش الحجم الكلي. طور متجانس مستقر عند درجة حرارة ${maxTempInput} درجة مئوية.`,
      safety_measures_en: `Keep away from heat, open sparks, and hot surfaces. Wear standard eye protection and lab gloves.`,
      safety_measures_ar: `يُحفظ بعيداً عن الحرارة والشرر والأسطح الساخنة. ارتدِ واقي العينين المعياري وقفازات المختبر.`,
      chemical_properties_en: `Highly stable, non-reactive mixture. The solution is flammable depending on ethanol concentration.`,
      chemical_properties_ar: `مزيج فيزيائي مستقر وغير تفاعلي تماماً. المحلول قابل للاشتعال حسب تركيز الإيثانول.`
    }
  }

  // 6. Acetone + Water -> Fully Miscible
  if ((nameA.includes('acetone') && nameB.includes('water')) || (nameB.includes('acetone') && nameA.includes('water'))) {
    return {
      is_safe: true,
      reaction_type: 'safe',
      severity_score: 1,
      result_description_en: `Acetone and Water are completely miscible. They form a single-phase polar organic solution. Commonly used as a laboratory cleaning solvent.`,
      result_description_ar: `الأسيتون والماء ممتزجان تماماً، ويشكلان محلولاً متجانساً قطبياً أحادي الطور. يُسخدم عادة كمذيب للتنظيف والتجفيف في المختبر.`,
      product_name: 'Aqueous Acetone Solution',
      product_formula: 'C3H6O (aq)',
      physical_properties_en: `Negligible heat of mixing. Highly volatile; vapors are heavier than air. Clear, homogeneous solution.`,
      physical_properties_ar: `حرارة خلط مهملة. متطاير للغاية وتعتبر أبخرته أثقل من الهواء. ينتج محلول رائق متجانس بالكامل.`,
      safety_measures_en: `Ensure proper ventilation to prevent inhalation of volatile acetone vapors. Wear solvent-resistant gloves. Avoid spark sources.`,
      safety_measures_ar: `تأكد من التهوية الجيدة للغرفة لتفادي استنشاق أبخرة الأسيتون المتطايرة. ارتدِ قفازات النيتريل وتجنب مصادر الشرر.`,
      chemical_properties_en: `Stable mixture. Polar organic solvent remains flammable. No chemical reaction occurs under standard laboratory conditions.`,
      chemical_properties_ar: `مزيج مستقر. يظل المذيب العضوي القطبي قابلاً للاشتعال. لا يحدث تفاعل كيميائي في الظروف المعيارية.`
    }
  }

  // 7. Benzene + Water -> Immiscible (Two-phase)
  if ((nameA.includes('benzene') && nameB.includes('water')) || (nameB.includes('benzene') && nameA.includes('water'))) {
    return {
      is_safe: false,
      reaction_type: 'hazardous',
      severity_score: 4,
      result_description_en: `IMMISCIBLE MIXTURE: Benzene is non-polar and hydrophobic, so it does not dissolve in polar water. It forms a distinct two-phase liquid system where Benzene floats on top of the water layer.`,
      result_description_ar: `مزيج غير قابل للامتزاج: البنزين غير قطبي كاره للماء فلا يذوب في الماء القطبي. يشكل طبقتين سائلتين منفصلتين حيث يطفو البنزين في الأعلى.`,
      product_name: 'Two-Phase Immiscible System',
      product_formula: 'C6H6 (l) + H2O (l)',
      physical_properties_en: `Zero miscibility. Forms two distinct liquid phases. Benzene (density 0.87 g/cm³) floats on top of water (density 1.0 g/cm³).`,
      physical_properties_ar: `انعدام تام للامتزاج. ينفصل السائل لطورين منفصلين تماماً، يطفو البنزين فوق الماء نظراً لاختلاف الكثافة.`,
      safety_measures_en: `Benzene is a known human carcinogen. Wear viton gloves, safety goggles, and handle exclusively in a certified fume hood.`,
      safety_measures_ar: `البنزين مادة مسرطنة معروفة للبشر. ارتدِ قفازات فيتون ونظارات حماية، وتعامل معه حصرياً داخل شفاط الغاز المعتمد.`,
      chemical_properties_en: `No chemical interaction. High chemical stability of both phases. Hydrophobic non-polar phase remains highly flammable.`,
      chemical_properties_ar: `لا يوجد أي تآثر كيميائي بين الطورين. استقرار كيميائي عالٍ لكلا الطورين، وتظل الطبقة العضوية الكارهة للماء قابلة للاشتعال.`
    }
  }

  // 8. Acetone + Benzene -> Fully Miscible organic solution
  if ((nameA.includes('acetone') && nameB.includes('benzene')) || (nameB.includes('acetone') && nameA.includes('benzene'))) {
    return {
      is_safe: true,
      reaction_type: 'safe',
      severity_score: 2,
      result_description_en: `Acetone and Benzene are fully miscible organic solvents. They mix to form a homogeneous organic solvent mixture.`,
      result_description_ar: `الأسيتون والبنزين مذيبات عضوية ممتزجة تماماً. يختلطان لتكوين محلول عضوي متجانس.`,
      product_name: 'Acetone-Benzene Organic Solution',
      product_formula: 'C3H6O (l) + C6H6 (l)',
      physical_properties_en: `Homogeneous organic phase. Very low boiling point and high vapor pressure. Volatile organic smell.`,
      physical_properties_ar: `مزيج عضوي متجانس. درجة غليان منخفضة جداً وضغط بخاري مرتفع، مع انبعاث رائحة المذيبات العضوية المتطايرة.`,
      safety_measures_en: `Highly flammable organic mixture. Wear solvent-resistant nitrile or viton gloves. Use static-free equipment and handle inside a fume hood.`,
      safety_measures_ar: `مزيج عضوي شديد الاشتعال. ارتدِ قفازات نيتريل أو فيتون المقاومة للمذيبات. استخدم أدوات مضادة للشرر الساكن وتحت الشفاط.`,
      chemical_properties_en: `Stable mixture. Polar/non-polar aprotic organic blend. No chemical reaction occurs.`,
      chemical_properties_ar: `مزيج مستقر فيزيائياً. خليط عضوي قطبي وغير قطبي لا بروتوني. لا يحدث تفاعل كيميائي.`
    }
  }

  // 9. Default response based on Hazard levels and Concentration
  const baseDanger = Math.max(
    chemA.hazard_level === 'danger' ? 7 : chemA.hazard_level === 'warning' ? 4 : 1,
    chemB.hazard_level === 'danger' ? 7 : chemB.hazard_level === 'warning' ? 4 : 1
  )
  const dangerLevel = isConcentrated ? Math.min(10, baseDanger + 2) : baseDanger

  if (dangerLevel >= 7) {
    return {
      is_safe: false,
      reaction_type: 'hazardous',
      severity_score: dangerLevel,
      result_description_en: `Potential hazard detected under these variables. Mixing ${chemA.name} (${varsA?.quantity || 50}${varsA?.state === 's' ? 'g' : 'ml'}) with ${chemB.name} (${varsB?.quantity || 50}${varsB?.state === 's' ? 'g' : 'ml'}) at ${maxTempInput}°C has a high severity score due to concentrations or temperatures.`,
      result_description_ar: `خطر محتمل تحت هذه المتغيرات. خلط ${chemA.name} (بكمية ${varsA?.quantity || 50}${varsA?.state === 's' ? 'جرام' : 'مل'}) مع ${chemB.name} (بكمية ${varsB?.quantity || 50}${varsB?.state === 's' ? 'جرام' : 'مل'}) في درجة حرارة ${maxTempInput} درجة مئوية يخضع للقيود نظراً للتركيز أو الحرارة.`,
      product_name: 'Unstable Mixture Complex',
      product_formula: 'Complex',
      physical_properties_en: `Reaction enthalpy and temperature rise vary based on concentration. Volatile vapors or pressure may build up.`,
      physical_properties_ar: `تتفاوت درجة الحرارة والحرارة المنطلقة بناءً على التركيز الفعلي والكميات. قد يرتفع الضغط البخاري.`,
      safety_measures_en: `Handle with extreme care. Wear standard personal protective equipment (PPE) including safety goggles, lab coat, and chemical-resistant gloves under hood.`,
      safety_measures_ar: `تعامل مع المزيج بحذر شديد. ارتدِ معدات الوقاية الشخصية (PPE) الكاملة ونظارات الأمان وتحت شفاط الغاز حصراً.`,
      chemical_properties_en: `Avoid contact with heat, incompatibles, and open atmosphere. Mixture properties are unknown; assume reactive.`,
      chemical_properties_ar: `تجنب ملامسة مصادر الحرارة والمواد غير المتوافقة والجو المفتوح. خصائص المزيج مجهولة ويجب فرض تفاعليته.`
    }
  }

  return {
    is_safe: true,
    reaction_type: 'safe',
    severity_score: 1,
    result_description_en: `No active reaction expected. ${chemA.name} and ${chemB.name} are compatible for mixing under standard lab conditions.`,
    result_description_ar: `لا يتوقع حدوث تفاعل نشط. المواد ${chemA.name} و ${chemB.name} متوافقة للخلط تحت الظروف المخبرية القياسية.`,
    product_name: 'Stable Mixture',
    product_formula: `${formulaA} + ${formulaB}`,
    physical_properties_en: `No significant temperature changes. Solution remains stable at room temperature.`,
    physical_properties_ar: `لا توجد تغيرات حرارية ملحوظة. يظل المحلول مستقراً في درجة حرارة الغرفة.`,
    safety_measures_en: `Wear standard lab protection (goggles, coat, nitrile gloves). Work in a clean laboratory environment.`,
    safety_measures_ar: `ارتدِ ملابس الوقاية المعيارية (نظارات واقية، معطف المختبر، قفازات). اعمل في بيئة مخبرية نظيفة.`,
    chemical_properties_en: `Compatible mixture. Highly stable chemical properties under normal atmosphere.`,
    chemical_properties_ar: `مزيج متوافق. خصائص كيميائية مستقرة للغاية تحت الضغط الجوي العادي.`
  }
}

// Beautiful liquid color mapper
const getLiquidColor = (chem) => {
  if (!chem) return 'rgba(255,255,255,0.1)'
  const name = chem.name.toLowerCase()
  const formula = chem.formula
  if (name.includes('acid') || formula.startsWith('H')) return '#F87171' // Red/pink acid
  if (name.includes('hydroxide') || name.includes('ammonia')) return '#60A5FA' // Blue base
  if (name.includes('carbonate')) return '#E2E8F0' // White carbonate suspension
  if (name.includes('water')) return '#38BDF8' // Cyan water
  if (name.includes('ethanol') || name.includes('acetone') || name.includes('benzene')) return '#FBBF24' // Yellow organic
  return '#34D399' // Green general
}

const getFinalColor = (reactType, colorA, colorB) => {
  if (reactType === 'new_product') return '#C084FC' // Purple product
  if (reactType === 'produces_gas') return '#94A3B8' // Cloudy gray
  if (reactType === 'explosive') return '#EF4444' // Intense red
  if (reactType === 'toxic' || reactType === 'hazardous') return '#A3E635' // Toxic lime green
  // Acid-Base neutralization yields neutral green
  if (reactType === 'safe' && ((colorA === '#F87171' && colorB === '#60A5FA') || (colorA === '#60A5FA' && colorB === '#F87171'))) {
    return '#34D399' // Emerald Green pH neutral indicator
  }
  return colorB // Blend/stays B
}

function ReactionChamber({ chemA, chemB, phase, reactType }) {
  const colorA = getLiquidColor(chemA)
  const colorB = getLiquidColor(chemB)
  const finalColor = getFinalColor(reactType, colorA, colorB)

  // Bubble list for produces_gas phase
  const bubbleCount = 18
  const bubbles = Array.from({ length: bubbleCount }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 1 + Math.random() * 1.5,
    x: 25 + Math.random() * 40,
    size: 2 + Math.random() * 4
  }))

  // Sparks for explosive phase
  const sparkCount = 12
  const sparks = Array.from({ length: sparkCount }, (_, i) => ({
    id: i,
    angle: (i / sparkCount) * 2 * Math.PI,
    distance: 35 + Math.random() * 40,
    delay: Math.random() * 0.4
  }))

  return (
    <div className="relative w-full h-72 rounded-2xl overflow-hidden flex items-center justify-center border animate-fade-in" style={{ background: '#0F172A', borderColor: '#1E293B' }}>
      {/* Background Grid Lines for Technical Lab feel */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      {/* Screen Shake during explosion / hazardous reaction */}
      <motion.div 
        className="w-full h-full flex items-center justify-center gap-16 relative"
        animate={
          phase === 'reacting' && reactType === 'explosive' 
            ? { x: [-6, 6, -6, 6, -4, 4, 0], y: [-6, 6, -6, 6, -4, 4, 0] } 
            : phase === 'reacting' && (reactType === 'hazardous' || reactType === 'toxic')
            ? { x: [-2, 2, -2, 2, 0] }
            : {}
        }
        transition={{ duration: reactType === 'explosive' ? 0.6 : 0.4, repeat: reactType === 'explosive' ? Infinity : 0 }}
      >
        {/* Flash Overlay for Explosive reaction */}
        {phase === 'reacting' && reactType === 'explosive' && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-30" 
            animate={{ backgroundColor: ['rgba(245, 158, 11, 0)', 'rgba(245, 158, 11, 0.4)', 'rgba(239, 68, 68, 0.2)', 'rgba(245, 158, 11, 0)'] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}

        {/* --- BEAKER A (LEFT) --- */}
        <motion.div
          className="relative flex flex-col items-center"
          animate={
            phase === 'pouring'
              ? { x: [0, 95, 95, 0], y: [0, -25, -25, 0], rotate: [0, 65, 65, 0] }
              : { x: 0, y: 0, rotate: 0 }
          }
          transition={{ duration: 3.5, times: [0, 0.2, 0.8, 1] }}
          style={{ transformOrigin: 'top right' }}
        >
          {/* Glass Beaker SVG */}
          <div className="relative">
            <svg width="70" height="90" viewBox="0 0 70 90" className="overflow-visible">
              {/* Liquid level inside A */}
              <motion.path
                d="M 8 82 L 62 82 L 62 30 L 8 30 Z"
                fill={colorA}
                opacity={0.85}
                animate={
                  phase === 'pouring'
                    ? { scaleY: [1, 1, 0.1, 0.1], originY: 1 }
                    : { scaleY: 1 }
                }
                transition={{ duration: 3.5, times: [0, 0.25, 0.75, 1] }}
                style={{ transformOrigin: 'bottom' }}
              />
              {/* Beaker Body */}
              <path
                d="M 6 15 L 6 82 A 4 4 0 0 0 10 86 L 60 86 A 4 4 0 0 0 64 82 L 64 15 M 3 15 L 67 15"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Graduation markings */}
              <line x1="15" y1="35" x2="25" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <line x1="15" y1="52" x2="30" y2="52" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <line x1="15" y1="70" x2="25" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-xxs font-mono mt-1 font-bold tracking-wider uppercase text-slate-400 opacity-60">{chemA?.formula}</span>
        </motion.div>

        {/* --- POURING STREAM --- */}
        {phase === 'pouring' && (
          <motion.div 
            className="absolute z-10"
            style={{ left: 'calc(50% - 15px)', top: '100px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.5, times: [0, 0.22, 0.78, 1] }}
          >
            <svg width="40" height="90" viewBox="0 0 40 90">
              <motion.path
                d="M 5 0 Q 20 40 22 90"
                fill="none"
                stroke={colorA}
                strokeWidth="4"
                strokeLinecap="round"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}
                style={{ strokeDasharray: '6, 6' }}
              />
            </svg>
          </motion.div>
        )}

        {/* --- FLASK B (RIGHT - RECEIVING) --- */}
        <motion.div className="relative flex flex-col items-center">
          {/* Reaction Stage Vapor Clouds (Gas / Toxic / Explosive) */}
          {phase === 'reacting' && (reactType === 'produces_gas' || reactType === 'toxic' || reactType === 'hazardous' || reactType === 'explosive') && (
            <div className="absolute -top-12 z-20 pointer-events-none flex flex-col items-center">
              <motion.div
                className="text-4xl"
                animate={{ 
                  y: [-10, -35], 
                  x: [-10, 15, -15, 10],
                  scale: [0.6, 1.4], 
                  opacity: [0, 0.7, 0] 
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              >
                💨
              </motion.div>
              <motion.div
                className="text-3xl absolute"
                animate={{ 
                  y: [-15, -45], 
                  x: [15, -10, 10, -15],
                  scale: [0.5, 1.2], 
                  opacity: [0, 0.8, 0] 
                }}
                transition={{ duration: 2.1, repeat: Infinity, delay: 0.4, ease: 'easeOut' }}
                style={{ color: reactType === 'toxic' ? '#A3E635' : '#CBD5E1' }}
              >
                💨
              </motion.div>
            </div>
          )}

          {/* Sparks/Embers on Explosion */}
          {phase === 'reacting' && reactType === 'explosive' && (
            <div className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {sparks.map((spark) => (
                <motion.div
                  key={spark.id}
                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-400"
                  animate={{ 
                    x: [0, Math.cos(spark.angle) * spark.distance], 
                    y: [0, Math.sin(spark.angle) * spark.distance],
                    scale: [1, 0],
                    opacity: [1, 0]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: spark.delay }}
                />
              ))}
            </div>
          )}

          {/* Glass Flask SVG */}
          <div className="relative">
            {/* Pulsing reaction aura */}
            {phase === 'reacting' && (
              <motion.div 
                className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{ background: finalColor }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}

            <svg width="80" height="95" viewBox="0 0 80 95" className="overflow-visible">
              {/* Flask Base Liquid */}
              <motion.path
                d="M 12 78 A 28 28 0 0 0 68 78 Z"
                fill={phase === 'reacting' || phase === 'finished' ? finalColor : colorB}
                opacity={0.85}
                animate={
                  phase === 'pouring'
                    ? { scaleY: [1, 1, 1.35], originY: 1 }
                    : phase === 'reacting'
                    ? { scaleY: [1.35, 1.39, 1.35], originY: 1 }
                    : { scaleY: 1.35 }
                }
                transition={{ 
                  scaleY: { duration: 3.5, times: [0, 0.22, 1] },
                  default: { duration: 0.5, repeat: phase === 'reacting' ? Infinity : 0 }
                }}
                style={{ transformOrigin: 'bottom' }}
              />

              {/* Reaction bubbles (gas, boiling, reaction) */}
              {phase === 'reacting' && (
                <g>
                  {bubbles.map((b) => (
                    <motion.circle
                      key={b.id}
                      cx={b.x}
                      cy={78}
                      r={b.size}
                      fill="rgba(255,255,255,0.7)"
                      animate={{ 
                        y: [0, -35, -55], 
                        opacity: [0, 1, 0],
                        x: [b.x, b.x + (Math.random() * 10 - 5)]
                      }}
                      transition={{ 
                        duration: b.duration, 
                        repeat: Infinity, 
                        delay: b.delay,
                        ease: 'easeOut'
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Flask Body */}
              <path
                d="M 32 15 L 32 38 L 10 78 A 4 4 0 0 0 14 84 L 66 84 A 4 4 0 0 0 70 78 L 48 38 L 48 15 M 27 15 L 53 15"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xxs font-mono mt-1 font-bold tracking-wider uppercase text-slate-400 opacity-60">{chemB?.formula}</span>
        </motion.div>
      </motion.div>

      {/* Lab Banner info in corner */}
      <div className="absolute bottom-3 left-4 text-xxs font-mono tracking-wide text-slate-500 uppercase flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        CHAMBER PHASE: {phase.toUpperCase()}
      </div>
    </div>
  )
}

// Interactive sound effects generator using browser Web Audio API (procedural audio)
const playLabSound = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    if (type === 'pour') {
      // White noise sweep representing pouring liquid
      const bufferSize = ctx.sampleRate * 1.5
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(300, ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.5)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      noise.start()
    } else if (type === 'bubble') {
      // Procedural bubble popping sound effects for gas reactions
      let time = ctx.currentTime
      const interval = 0.08
      for (let i = 0; i < 28; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(500 + Math.random() * 800, time)
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.09)
        gain.gain.setValueAtTime(0.06, time)
        gain.gain.exponentialRampToValueAtTime(0.005, time + 0.09)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(time)
        osc.stop(time + 0.1)
        time += interval + Math.random() * 0.06
      }
    } else if (type === 'explosion') {
      // Low rumble explosion sound for combustion/explosive reactions
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.9)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.9)
    } else if (type === 'success') {
      // Pentatonic success chime on result generation
      const now = ctx.currentTime
      const freqs = [523.25, 659.25, 783.99, 1046.50]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.07)
        gain.gain.setValueAtTime(0.08, now + idx * 0.07)
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.07 + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.07)
        osc.stop(now + idx * 0.07 + 0.45)
      })
    }
  } catch (err) {
    console.warn("AudioContext failed to load or play:", err)
  }
}

const DEFAULT_VARS = { quantity: 50, concentration: 1.0, temperature: 25, state: 'liquid' }
const PHYSICAL_STATES = ['solid', 'liquid', 'gas', 'aqueous']

export default function MixingSimulatorPage() {
  const { chemicals, fetchChemicals } = useChemicalStore()
  const [chemA, setChemA] = useState(null)
  const [chemB, setChemB] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const { lang, t } = useLanguage()

  // Reaction Variable States for each chemical
  const [varsA, setVarsA] = useState({ ...DEFAULT_VARS })
  const [varsB, setVarsB] = useState({ ...DEFAULT_VARS })

  // Animation Stage States
  const [animPhase, setAnimPhase] = useState('idle') // 'idle', 'pouring', 'reacting', 'finished'
  const [animType, setAnimType] = useState('safe')

  useEffect(() => { fetchChemicals() }, [])

  const swap = () => { setChemA(chemB); setChemB(chemA); setResult(null) }

  // Quick Experiment Templates
  const runTemplate = (formulaA, formulaB) => {
    const a = chemicals.find(c => c.formula.toUpperCase() === formulaA.toUpperCase())
    const b = chemicals.find(c => c.formula.toUpperCase() === formulaB.toUpperCase())
    if (a && b) {
      setChemA(a)
      setChemB(b)
      setResult(null)
      toast.success(`Selected: ${a.name} + ${b.name}`)
    } else {
      toast.error(`Chemicals not found in local inventory. Please add them in the Chemicals tab first.`)
    }
  }

  // PDF Report Exporter
  const exportReportPDF = () => {
    if (!chemA || !chemB || !result) return
    
    const resultDesc = lang === 'ar' ? (result.result_description_ar || result.result_description) : (result.result_description_en || result.result_description)
    const physProps = lang === 'ar' ? (result.physical_properties_ar || result.physical_properties) : (result.physical_properties_en || result.physical_properties)
    const chemProps = lang === 'ar' ? (result.chemical_properties_ar || result.chemical_properties) : (result.chemical_properties_en || result.chemical_properties)
    const safetyMeasures = lang === 'ar' ? (result.safety_measures_ar || result.safety_measures) : (result.safety_measures_en || result.safety_measures)
    const optimalConditions = lang === 'ar' 
      ? (result.optimal_conditions_ar || `لضمان التفاعل الصحيح والآمن: يُوصى بضبط درجة الحرارة بين 15°C إلى 25°C، واستخدام حمّام ثلجي لتفاعل التبريد الخارجي، وتخفيف التركيز المولي أقل من 2.0M مع الإضافة التدريجية للحمض إلى الماء وليس العكس.`) 
      : (result.optimal_conditions_en || `To ensure correct & safe reaction: Keep temperature between 15°C and 25°C using an ice bath for exotherms, keep molarity ≤ 2.0M, and add concentrated reagents slowly while stirring.`)

    const element = document.createElement('div')
    element.style.padding = '30px'
    element.style.fontFamily = 'Segoe UI, Arial, sans-serif'
    element.style.color = '#1E293B'
    element.style.lineHeight = '1.6'
    element.style.direction = lang === 'ar' ? 'rtl' : 'ltr'
    element.style.textAlign = lang === 'ar' ? 'right' : 'left'
    
    element.innerHTML = `
      <div style="border-bottom: 3px solid #3B82F6; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #1E3A8A;">${lang === 'ar' ? 'تقارير مختبر ChemVision' : 'ChemVision Lab Reports'}</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px;">${lang === 'ar' ? 'صحيفة سلامة التوافق الكيميائي والمخبري الرسمية (SDS)' : 'Official Compatibility & Laboratory Safety Datasheet (SDS)'}</div>
        </div>
        <div style="font-size: 10px; color: #64748B; text-align: ${lang === 'ar' ? 'left' : 'right'};">
          ${lang === 'ar' ? 'رقم التقرير:' : 'Report ID:'} CV-${Math.floor(100000 + Math.random() * 900000)}<br>
          ${lang === 'ar' ? 'التاريخ:' : 'Date:'} ${new Date().toLocaleString()}
        </div>
      </div>

      <div style="display: flex; gap: 15px; margin-bottom: 20px; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        <div style="flex: 1; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC;">
          <strong style="color: #1E3A8A; display: block; font-size: 14px; margin-bottom: 6px;">${lang === 'ar' ? 'المادة الكيميائية أ' : 'Chemical A'}</strong>
          ${lang === 'ar' ? 'الاسم' : 'Name'}: ${chemA.name || 'N/A'}<br>
          ${lang === 'ar' ? 'الصيغة' : 'Formula'}: ${chemA.formula || 'N/A'}<br>
          ${lang === 'ar' ? 'مستوى الخطورة' : 'Hazard Level'}: ${(chemA.hazard_level || 'N/A').toUpperCase()}<br>
          <span style="display:inline-block;margin-top:6px;padding:4px 8px;border-radius:4px;background:#EEF2FF;font-size:10px;color:#4338CA;">
            ${varsA.quantity} mL &nbsp;·&nbsp; ${varsA.concentration.toFixed(1)} mol/L &nbsp;·&nbsp; ${varsA.temperature}°C &nbsp;·&nbsp; ${varsA.state}
          </span>
        </div>
        <div style="flex: 1; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC;">
          <strong style="color: #1E3A8A; display: block; font-size: 14px; margin-bottom: 6px;">${lang === 'ar' ? 'المادة الكيميائية ب' : 'Chemical B'}</strong>
          ${lang === 'ar' ? 'الاسم' : 'Name'}: ${chemB.name || 'N/A'}<br>
          ${lang === 'ar' ? 'الصيغة' : 'Formula'}: ${chemB.formula || 'N/A'}<br>
          ${lang === 'ar' ? 'مستوى الخطورة' : 'Hazard Level'}: ${(chemB.hazard_level || 'N/A').toUpperCase()}<br>
          <span style="display:inline-block;margin-top:6px;padding:4px 8px;border-radius:4px;background:#F5F3FF;font-size:10px;color:#7C3AED;">
            ${varsB.quantity} mL &nbsp;·&nbsp; ${varsB.concentration.toFixed(1)} mol/L &nbsp;·&nbsp; ${varsB.temperature}°C &nbsp;·&nbsp; ${varsB.state}
          </span>
        </div>
      </div>


      <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFF; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #3B82F6; margin-bottom: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px;">
          ${lang === 'ar' ? 'ملخص التفاعل وتقييم السلامة' : 'Reaction Summary & Safety Rating'}
        </div>
        <div style="font-size: 12px; color: #334155;">
          <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; margin-bottom: 8px; background-color: ${result.is_safe ? '#D1FAE5' : '#FEE2E2'}; color: ${result.is_safe ? '#065F46' : '#991B1B'}; border: 1px solid ${result.is_safe ? '#6EE7B7' : '#FCA5A5'};">
            ${result.is_safe ? (lang === 'ar' ? 'خليط آمن' : 'SAFE MIXTURE') : (lang === 'ar' ? 'خلط محظور / خطير' : 'RESTRICTED / DANGEROUS')} (${lang === 'ar' ? 'الخطورة:' : 'Severity:'} ${result.severity_score}/10)
          </span>
          <p style="font-weight: 500; font-size: 13px; margin-top: 6px;">${resultDesc}</p>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFF; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #3B82F6; margin-bottom: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px;">
          ${lang === 'ar' ? 'الخصائص الفيزيائية والحرارية للمزيج' : 'Physical & Thermal Properties'}
        </div>
        <div style="font-size: 12px; color: #334155;">${physProps}</div>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFF; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #3B82F6; margin-bottom: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px;">
          ${lang === 'ar' ? 'الخواص الكيميائية والاستقرار' : 'Chemical Properties & Stability'}
        </div>
        <div style="font-size: 12px; color: #334155;">${chemProps}</div>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #FFE082; background: #FFFDF5; border-right: ${lang === 'ar' ? '4px solid #D97706' : 'none'}; border-left: ${lang === 'ar' ? 'none' : '4px solid #D97706'}; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #D97706; margin-bottom: 8px; border-bottom: 1px solid #FFF8E1; padding-bottom: 4px;">
          ${lang === 'ar' ? 'آلية الأمان والسلامة المخبرية الدقيقة' : 'Precise Lab Safety & Hazard Controls'}
        </div>
        <div style="font-size: 12px; font-weight: 500; color: #92400E;">${safetyMeasures}</div>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #A7F3D0; background: #ECFDF5; border-right: ${lang === 'ar' ? '4px solid #059669' : 'none'}; border-left: ${lang === 'ar' ? 'none' : '4px solid #059669'}; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #059669; margin-bottom: 8px; border-bottom: 1px solid #D1FAE5; padding-bottom: 4px;">
          ${lang === 'ar' ? 'إرشادات التفاعل الصحيح والظروف المثالية' : 'Optimal Reaction Protocol & Recommended Conditions'}
        </div>
        <div style="font-size: 12px; font-weight: 500; color: #065F46;">${optimalConditions}</div>
      </div>

      ${result.product_name ? `
      <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #E9D5FF; background: #FAF5FF; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #8B5CF6; margin-bottom: 8px; border-bottom: 1px solid #F3E8FF; padding-bottom: 4px;">
          ${lang === 'ar' ? 'المركب الناتج المتكون' : 'Resulting Product'}
        </div>
        <div style="font-size: 12px; color: #5B21B6;">
          <strong>${lang === 'ar' ? 'الناتج:' : 'Product:'}</strong> ${result.product_name} (${result.product_formula || ''})
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 40px; font-size: 10px; color: #94A3B8; border-top: 1px dashed #E2E8F0; padding-top: 12px; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
        ChemVision Academic Simulator. All values generated represent simulation scenarios. Verify all safety protocols before conducting wet-lab assays.
      </div>
    `

    const opt = {
      margin:       15,
      filename:     `ChemVision_Report_${chemA.formula}_${chemB.formula}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    toast.promise(
      html2pdf().set(opt).from(element).save(),
      {
        loading: lang === 'ar' ? 'جاري إنشاء التقرير وتحميله...' : 'Generating and downloading PDF report...',
        success: lang === 'ar' ? 'تم تحميل التقرير بنجاح! 📄' : 'Report downloaded successfully! 📄',
        error: lang === 'ar' ? 'فشل تحميل التقرير' : 'Failed to download report'
      }
    )
  }

  const simulate = async () => {
    if (!chemA || !chemB) { toast.error('Please select both chemicals'); return }
    if (chemA.id === chemB.id) { toast.error('Cannot mix a chemical with itself'); return }
    
    setLoading(true)
    setResult(null)
    setAnimPhase('pouring')
    playLabSound('pour') // Play laboratory liquid pouring sound effect
    
    // Instantly predict locally to get reaction type for animating appropriate effects
    const localResult = predictReactionLocally(chemA, chemB)
    setAnimType(localResult.reaction_type)

    // Phase 1: Pouring animation (lasts 0.8 seconds)
    setTimeout(() => {
      setAnimPhase('reacting')
      
      // Trigger appropriate reaction sounds
      if (localResult.reaction_type === 'produces_gas' || localResult.reaction_type === 'toxic' || localResult.reaction_type === 'hazardous') {
        playLabSound('bubble')
      } else if (localResult.reaction_type === 'explosive') {
        playLabSound('explosion')
      }
      
      // Phase 2: Reaction mixing & kinetics animation (lasts 1.2 seconds)
      setTimeout(async () => {
        setAnimPhase('finished')
        playLabSound('success') // Chime when result is complete

        try {
          // 1. Check local static database rules first
          const { data: staticRule, error: dbError } = await supabase
            .from('mixing_rules')
            .select('*')
            .or(`and(chemical_a_id.eq.${chemA.id},chemical_b_id.eq.${chemB.id}),and(chemical_a_id.eq.${chemB.id},chemical_b_id.eq.${chemA.id})`)
            .maybeSingle()

          if (dbError) throw dbError

          if (staticRule) {
            setResult(staticRule)
            if (!staticRule.is_safe) {
              setScreenShake(true); setTimeout(() => setScreenShake(false), 800)
            } else {
              toast.success('Static database rule checked: Safe.')
            }
          } else {
            // 2. No database rule -> Invoke AI Edge Function using Gemini API
            try {
              const { data: aiResult, error: aiError } = await supabase.functions.invoke('simulate-mixing', {
                body: { chemA, chemB, varsA, varsB }
              })

              if (aiError) throw new Error(aiError.message || "Failed to contact AI model.")

              if (aiResult && !aiResult.error) {
                toast.success('Simulation generated securely by ChemVision AI 🧠')
                setResult(aiResult)
                if (!aiResult.is_safe) {
                  setScreenShake(true); setTimeout(() => setScreenShake(false), 800)
                }
              } else {
                throw new Error(aiResult?.error || "AI returned an empty response")
              }
            } catch (serverErr) {
              console.warn("Server-side Edge function blocked or failed. Trying client-side direct fallback...", serverErr)

              // 3. Client-side direct fallback (Useful for bypassing Google Cloud IP restriction on free-tier keys)
              const localKey = import.meta.env.VITE_GEMINI_API_KEY
              if (!localKey) {
                throw serverErr
              }

              const prompt = `You are an advanced chemical safety simulator.
Analyze what happens when mixing Chemical A and Chemical B in a laboratory setting.
Chemical A: ${chemA.name} (${chemA.formula})
  - Quantity: ${varsA.quantity} mL
  - Molar Concentration: ${varsA.concentration} mol/L
  - Temperature: ${varsA.temperature}°C
  - Physical State: ${varsA.state}
Chemical B: ${chemB.name} (${chemB.formula})
  - Quantity: ${varsB.quantity} mL
  - Molar Concentration: ${varsB.concentration} mol/L
  - Temperature: ${varsB.temperature}°C
  - Physical State: ${varsB.state}

Analyze their reactivity accounting for the given quantities, concentrations, temperatures, and physical states. Consider whether elevated temperatures or mismatched states alter the outcome. Describe the precise expected results, safety, potential products, and hazard severity.
You MUST respond with a valid JSON object matching this schema:
{
  "is_safe": boolean,
  "reaction_type": "safe" | "hazardous" | "explosive" | "toxic" | "produces_gas" | "new_product",
  "severity_score": number (1 to 10 scale of danger),
  "product_name": "Name of the resulting product if any (leave empty if none)",
  "product_formula": "Formula of the resulting product if any (leave empty if none)",
  "result_description_en": "A detailed, professional, easy-to-understand explanation of the reaction in English.",
  "result_description_ar": "A detailed, professional, easy-to-understand explanation of the reaction in Arabic (شرح مفصل للتفاعل باللغة العربية).",
  "physical_properties_en": "Detailed physical and thermal properties of the mixture in English.",
  "physical_properties_ar": "Detailed physical and thermal properties of the mixture in Arabic (الخصائص الفيزيائية والحرارية باللغة العربية).",
  "safety_measures_en": "Precise lab safety measures and hazard controls in English.",
  "safety_measures_ar": "Precise lab safety measures and hazard controls in Arabic (آلية الأمان والسلامة المخبرية باللغة العربية).",
  "chemical_properties_en": "Chemical properties and stability of the resulting mixture in English.",
  "chemical_properties_ar": "Chemical properties and stability of the resulting mixture in Arabic (الخواص الكيميائية باللغة العربية)."
}

Do not include any markdown styling or extra text. Return ONLY the raw JSON string.`

              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${localKey}`
              const response = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { responseMimeType: "application/json" }
                })
              })

              if (!response.ok) {
                const errText = await response.text()
                throw new Error(`Gemini client API error: ${errText}`)
              }

              const data = await response.json()
              const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
              if (!rawText) throw new Error("Empty response from client Gemini API")

              const parsedResult = JSON.parse(rawText.trim())
              toast.success('Simulation generated directly via Client-Side AI 🧠 (IP safe)')
              setResult(parsedResult)
              if (!parsedResult.is_safe) {
                setScreenShake(true); setTimeout(() => setScreenShake(false), 800)
              }
            }
          }
        } catch (err) {
          console.warn("AI Simulator fallback active, launching Local Smart Prediction Engine:", err)
          // 4. Ultimate Fallback: Smart Chemical Prediction Engine (C.P.E.)
          setResult(localResult)
          if (!localResult.is_safe) {
            setScreenShake(true); setTimeout(() => setScreenShake(false), 800)
          }
          toast.success('Simulation complete (Local AI Engine fallback 🧠)')
        } finally {
          setLoading(false)
        }
      }, 1200)
    }, 800)
  }

  const rStyle = result ? (reactionStyles[result.reaction_type] || reactionStyles.safe) : null

  return (
    <motion.div
      className="p-4 lg:p-6"
      animate={screenShake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-2xl text-left" style={{ color: '#2C3E50' }}>{t('mixing_simulator_title')}</h1>
          <p className="text-sm mt-1 text-left" style={{ color: '#64748B' }}>{t('mixing_simulator_sub')}</p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* If animPhase is 'idle', display Chemical Selectors */}
        {animPhase === 'idle' && (
          <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <ChemicalSelector label={t('chem_a')} selected={chemA} onSelect={(c) => { setChemA(c); setResult(null) }} chemicals={chemicals} exclude={chemB?.id} />

              {/* Swap button */}
              <motion.button
                onClick={swap}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
                style={{ background: '#EBF4FF' }}
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRightLeft size={16} style={{ color: '#4A90E2' }} />
              </motion.button>

              <ChemicalSelector label={t('chem_b')} selected={chemB} onSelect={(c) => { setChemB(c); setResult(null) }} chemicals={chemicals} exclude={chemA?.id} />
            </div>

            {/* Selected beakers visualization */}
            {(chemA || chemB) && (
              <motion.div className="flex items-center justify-center gap-8 mt-6 py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Beaker A */}
                <motion.div className="text-center" animate={chemA ? { y: [0, -4, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="text-5xl mb-2">🧪</div>
                  <p className="text-xs font-semibold" style={{ color: '#4A90E2' }}>{chemA?.formula || '?'}</p>
                </motion.div>

                <div className="text-2xl text-slate-300 font-bold">+</div>

                {/* Beaker B */}
                <motion.div className="text-center" animate={chemB ? { y: [0, -4, 0] } : {}} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                  <div className="text-5xl mb-2">⚗️</div>
                  <p className="text-xs font-semibold" style={{ color: '#7C3AED' }}>{chemB?.formula || '?'}</p>
                </motion.div>
              </motion.div>
            )}

            {/* ── Reaction Variables Panel ── */}
            {(chemA || chemB) && (
              <motion.div
                className="mt-5 rounded-2xl border overflow-hidden"
                style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {/* Panel header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#E2E8F0', background: '#EEF2FF' }}>
                  <span className="text-base">⚗️</span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4338CA' }}>Reaction Variables</span>
                  <span className="ml-auto text-xs" style={{ color: '#94A3B8' }}>Tune conditions for a more precise simulation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" style={{ divideColor: '#E2E8F0' }}>
                  {/* Chemical A Variables */}
                  {[
                    { label: chemA ? `${chemA.formula} (A)` : 'Chemical A', vars: varsA, setVars: setVarsA, accent: '#4A90E2', disabled: !chemA },
                    { label: chemB ? `${chemB.formula} (B)` : 'Chemical B', vars: varsB, setVars: setVarsB, accent: '#7C3AED', disabled: !chemB },
                  ].map(({ label, vars, setVars, accent, disabled }, idx) => (
                    <div key={idx} className="p-4 space-y-3" style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
                      <p className="text-xs font-bold mb-2" style={{ color: accent }}>{label}</p>

                      {/* Quantity */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-semibold" style={{ color: '#475569' }}>Quantity (mL)</label>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ color: accent, background: `${accent}15` }}>
                            {vars.quantity} mL
                          </span>
                        </div>
                        <input
                          type="range" min={1} max={500} step={1}
                          value={vars.quantity}
                          onChange={(e) => setVars(v => ({ ...v, quantity: Number(e.target.value) }))}
                          className="w-full h-2.5 rounded-full cursor-pointer transition-all accent-blue-600"
                          style={{
                            accentColor: accent,
                            background: `linear-gradient(to right, ${accent} 0%, ${accent} ${((vars.quantity - 1) / 499) * 100}%, #E2E8F0 ${((vars.quantity - 1) / 499) * 100}%, #E2E8F0 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs font-medium mt-1" style={{ color: '#64748B' }}>
                          <span>1 mL</span><span>500 mL</span>
                        </div>
                      </div>

                      {/* Concentration */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-semibold" style={{ color: '#475569' }}>Concentration (mol/L)</label>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ color: accent, background: `${accent}15` }}>
                            {vars.concentration.toFixed(1)} M
                          </span>
                        </div>
                        <input
                          type="range" min={0.1} max={12} step={0.1}
                          value={vars.concentration}
                          onChange={(e) => setVars(v => ({ ...v, concentration: Number(e.target.value) }))}
                          className="w-full h-2.5 rounded-full cursor-pointer transition-all"
                          style={{
                            accentColor: accent,
                            background: `linear-gradient(to right, ${accent} 0%, ${accent} ${((vars.concentration - 0.1) / 11.9) * 100}%, #E2E8F0 ${((vars.concentration - 0.1) / 11.9) * 100}%, #E2E8F0 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs font-medium mt-1" style={{ color: '#64748B' }}>
                          <span>0.1 M</span><span>12 M</span>
                        </div>
                      </div>

                      {/* Temperature */}
                      <div>
                        {(() => {
                          const tempColor = vars.temperature > 60 ? '#EF4444' : vars.temperature < 5 ? '#3B82F6' : accent
                          const tempPct = ((vars.temperature - (-20)) / 220) * 100
                          return (
                            <>
                              <div className="flex justify-between mb-1">
                                <label className="text-xs font-semibold" style={{ color: '#475569' }}>Temperature (°C)</label>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ color: tempColor, background: `${tempColor}15` }}>
                                  {vars.temperature}°C {vars.temperature > 60 ? '🔥' : vars.temperature < 5 ? '❄️' : '🌡️'}
                                </span>
                              </div>
                              <input
                                type="range" min={-20} max={200} step={1}
                                value={vars.temperature}
                                onChange={(e) => setVars(v => ({ ...v, temperature: Number(e.target.value) }))}
                                className="w-full h-2.5 rounded-full cursor-pointer transition-all"
                                style={{
                                  accentColor: tempColor,
                                  background: `linear-gradient(to right, ${tempColor} 0%, ${tempColor} ${tempPct}%, #E2E8F0 ${tempPct}%, #E2E8F0 100%)`
                                }}
                              />
                              <div className="flex justify-between text-xs font-medium mt-1" style={{ color: '#64748B' }}>
                                <span>−20°C</span><span>200°C</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>

                      {/* Physical State */}
                      <div>
                        <label className="text-xs font-semibold block mb-1.5" style={{ color: '#475569' }}>Physical State</label>
                        <div className="flex flex-wrap gap-1.5">
                          {PHYSICAL_STATES.map(s => (
                            <button
                              key={s}
                              onClick={() => setVars(v => ({ ...v, state: s }))}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all"
                              style={{
                                background: vars.state === s ? accent : '#fff',
                                color: vars.state === s ? '#fff' : '#64748B',
                                borderColor: vars.state === s ? accent : '#E2E8F0',
                                transform: vars.state === s ? 'scale(1.05)' : 'scale(1)',
                              }}
                            >
                              {s === 'solid' ? '🧱' : s === 'liquid' ? '💧' : s === 'gas' ? '💨' : '🫧'} {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Simulate button */}
            <motion.button
              className="btn-primary w-full justify-center py-3.5 mt-4 ripple"
              style={{ fontSize: '1rem' }}
              onClick={simulate}
              disabled={loading || !chemA || !chemB}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Beaker size={18} /> {t('simulate_btn')}
            </motion.button>

            {/* Quick Experiments Banner */}
            {chemicals && chemicals.length > 0 && (
              <div className="mt-6 pt-5 border-t" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3 text-left" style={{ color: '#94A3B8' }}>{t('famous_experiments')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => runTemplate('NaOH', 'H2SO4')}
                    className="p-2.5 rounded-xl border text-xs font-semibold text-left transition hover:bg-slate-50"
                    style={{ borderColor: '#E2E8F0', color: '#334155' }}
                  >
                    Neutralization (NaOH + H2SO4)
                  </button>
                  <button
                    onClick={() => runTemplate('CaCO3', 'HCl')}
                    className="p-2.5 rounded-xl border text-xs font-semibold text-left transition hover:bg-slate-50"
                    style={{ borderColor: '#E2E8F0', color: '#334155' }}
                  >
                    Gas Volcano (CaCO3 + HCl)
                  </button>
                  <button
                    onClick={() => runTemplate('C3H6O', 'C6H6')}
                    className="p-2.5 rounded-xl border text-xs font-semibold text-left transition hover:bg-slate-50"
                    style={{ borderColor: '#E2E8F0', color: '#334155' }}
                  >
                    Organic Blend (Acetone + Benzene)
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* If animPhase is NOT 'idle' (pouring, reacting, finished) */}
        {animPhase !== 'idle' && (
          <div className="space-y-6">
            {/* Reaction Chamber Animation */}
            <ReactionChamber chemA={chemA} chemB={chemB} phase={animPhase} reactType={animType} />

            {/* Loading / Processing Banners */}
            {(animPhase === 'pouring' || animPhase === 'reacting') && (
              <div className="card p-5 flex flex-col items-center justify-center text-center space-y-3" style={{ background: '#0F172A', borderColor: '#1E293B' }}>
                <motion.div 
                  className="w-10 h-10 rounded-full border-t-2 border-r-2 border-emerald-500 flex items-center justify-center text-lg"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  🧪
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {animPhase === 'pouring' ? t('pouring_reagents') : t('kinetics')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('analyzing_sds')}
                  </p>
                </div>
              </div>
            )}

            {/* Result display */}
            {result && animPhase === 'finished' && (
              <motion.div
                className="card overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ border: `2px solid ${rStyle.border}` }}
              >
                {/* Result header */}
                <div className="p-4 flex items-center justify-between" style={{ background: rStyle.bg }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rStyle.emoji}</span>
                    <div className="text-left">
                      <h3 className="font-heading font-bold text-lg" style={{ color: rStyle.color }}>{rStyle.label}</h3>
                      <p className="text-xs" style={{ color: rStyle.color, opacity: 0.8 }}>
                        Severity: {result.severity_score}/10 – {(result.reaction_type || '').replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {/* Reset button inside header */}
                  <button 
                    onClick={() => {
                      setChemA(null)
                      setChemB(null)
                      setResult(null)
                      setAnimPhase('idle')
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition"
                  >
                    {t('mix_new')}
                  </button>
                </div>

                {/* Description Panels */}
                <div className="p-5 space-y-4 text-left">
                  {/* General Reaction Summary */}
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5" style={{ background: '#EBF4FF', color: '#4A90E2' }}>
                      <Beaker size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#94A3B8' }}>
                        {lang === 'ar' ? 'ملخص التفاعل الكيميائي' : 'Reaction Summary'}
                      </h4>
                      <p className="text-sm mt-1 leading-relaxed font-semibold text-left" style={{ color: '#2C3E50' }}>
                        {lang === 'ar' 
                          ? (result.result_description_ar || result.result_description) 
                          : (result.result_description_en || result.result_description)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Physical & Thermal Properties */}
                  <div className="flex gap-3 items-start pt-3.5 border-t" style={{ borderColor: '#F0F2F5' }}>
                    <div className="p-2 rounded-lg flex-shrink-0 mt-0.5" style={{ background: '#FFF3E0', color: '#FF9800' }}>
                      <Flame size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#94A3B8' }}>
                        {lang === 'ar' ? 'الخصائص الفيزيائية والحرارية للمزيج' : 'Physical & Thermal Properties'}
                      </h4>
                      <p className="text-sm mt-1 leading-relaxed text-left" style={{ color: '#475569' }}>
                        {lang === 'ar' 
                          ? (result.physical_properties_ar || result.physical_properties) 
                          : (result.physical_properties_en || result.physical_properties)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Chemical Properties */}
                  <div className="flex gap-3 items-start pt-3.5 border-t" style={{ borderColor: '#F0F2F5' }}>
                    <div className="p-2 rounded-lg flex-shrink-0 mt-0.5" style={{ background: '#F3E5F5', color: '#9C27B0' }}>
                      <Zap size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#94A3B8' }}>
                        {lang === 'ar' ? 'الخواص الكيميائية للمزيج الناتج' : 'Chemical Properties of Mixture'}
                      </h4>
                      <p className="text-sm mt-1 leading-relaxed text-left" style={{ color: '#475569' }}>
                        {lang === 'ar' 
                          ? (result.chemical_properties_ar || result.chemical_properties) 
                          : (result.chemical_properties_en || result.chemical_properties)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Lab Safety & Hazard Controls */}
                  <div className="p-4 rounded-xl flex gap-3 items-start mt-2" style={{ background: '#FFF9E6', border: '1px solid #FFE082' }}>
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: '#FFF3CD', color: '#D97706' }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#B45309' }}>
                        {lang === 'ar' ? 'آلية الأمان والسلامة المخبرية الدقيقة' : 'Precise Lab Safety & Hazard Controls'}
                      </h4>
                      <p className="text-sm mt-1 leading-relaxed font-medium text-left" style={{ color: '#92400E' }}>
                        {lang === 'ar' 
                          ? (result.safety_measures_ar || result.safety_measures) 
                          : (result.safety_measures_en || result.safety_measures)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Optimal Reaction Protocol & Recommended Conditions */}
                  <div className="p-4 rounded-xl flex gap-3 items-start mt-2" style={{ background: '#ECFDF5', border: '1px solid #6EE7B7' }}>
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: '#D1FAE5', color: '#059669' }}>
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#047857' }}>
                        {lang === 'ar' ? 'إرشادات الظروف المثالية للتفاعل الصحيح والآمن' : 'Optimal Reaction Protocol & Recommended Conditions'}
                      </h4>
                      <p className="text-sm mt-1 leading-relaxed font-medium text-left" style={{ color: '#065F46' }}>
                        {lang === 'ar' 
                          ? (result.optimal_conditions_ar || `لضمان التفاعل الصحيح والآمن: يُوصى بضبط درجة الحرارة بين 15°C إلى 25°C، واستخدام حمّام ثلجي للتبريد، وتخفيف التركيز المولي أقل من 2.0M، والإضافة التدريجية للحمض للماء مع التقليب المستمر.`) 
                          : (result.optimal_conditions_en || `To ensure correct & safe reaction: Keep temperature between 15°C and 25°C using an ice bath for exotherms, keep molarity ≤ 2.0M, and add concentrated reagents slowly while stirring.`)
                        }
                      </p>
                    </div>
                  </div>

                  {result.product_name && (
                    <motion.div
                      className="mt-4 p-3.5 rounded-xl border text-left"
                      style={{ background: '#EDE9FE', borderColor: '#C084FC' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      <p className="text-xs font-semibold text-left" style={{ color: '#7C3AED' }}>
                        {lang === 'ar' ? 'المنتج المتشكل:' : 'Product formed:'}
                      </p>
                      <p className="text-sm font-bold mt-0.5 text-left" style={{ color: '#6326CA' }}>
                        {result.product_name} {result.product_formula && `(${result.product_formula})`}
                      </p>
                    </motion.div>
                  )}

                  {/* PDF Exporter & Big Mix Again button at the very bottom */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t" style={{ borderColor: '#E2E8F0' }}>
                    <button
                      onClick={exportReportPDF}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2 border"
                      style={{ borderColor: '#CBD5E1' }}
                    >
                      {t('export_report')}
                    </button>
                    <button
                      onClick={() => {
                        setChemA(null)
                        setChemB(null)
                        setResult(null)
                        setAnimPhase('idle')
                      }}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg"
                      style={{ background: '#3B82F6' }}
                    >
                      {t('mix_new')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

