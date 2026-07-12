import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Beaker, AlertTriangle, CheckCircle, Zap, ChevronDown, ArrowRightLeft, Flame, Wind } from 'lucide-react'
import { useChemicalStore } from '../store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useLanguage } from '../hooks/useLanguage'

const reactionStyles = {
  safe: { bg: '#E8FBF6', color: '#2A7060', border: '#5DB9A0', icon: CheckCircle, label: 'Safe Reaction ✅', emoji: '🟢' },
  hazardous: { bg: '#FDEAEA', color: '#A02A2A', border: '#E85D5D', icon: AlertTriangle, label: 'Hazardous! ⚠️', emoji: '🔴' },
  explosive: { bg: '#FDEAEA', color: '#7F1D1D', border: '#A02A2A', icon: Flame, label: 'EXPLOSIVE! 💥', emoji: '💥' },
  toxic: { bg: '#FDEAEA', color: '#A02A2A', border: '#E85D5D', icon: AlertTriangle, label: 'Toxic! ☠️', emoji: '☠️' },
  produces_gas: { bg: '#FEF3DC', color: '#A66410', border: '#F5A623', icon: Wind, label: 'Produces Gas! 💨', emoji: '💨' },
  new_product: { bg: '#EDE9FE', color: '#6326CA', border: '#7C3AED', icon: Zap, label: 'New Product Formed 🧪', emoji: '⚗️' },
}

// Chemical Selector
function ChemicalSelector({ label, selected, onSelect, chemicals, exclude }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { lang } = useLanguage()
  const filtered = chemicals.filter(c => c.id !== exclude && (c.name.toLowerCase().includes(search.toLowerCase()) || c.formula.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="relative flex-1 text-left">
      <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>{label}</label>
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-full p-3.5 rounded-xl text-left flex items-center justify-between"
        style={{ background: selected ? '#EBF4FF' : '#F8F9FA', border: `2px solid ${selected ? '#4A90E2' : '#E2E8F0'}` }}
        whileHover={{ borderColor: '#4A90E2' }}
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono" style={{ background: '#4A90E2', color: 'white' }}>
              {selected.formula.slice(0, 3)}
            </div>
            <div>
              <p className="font-medium text-sm text-left" style={{ color: '#2C3E50' }}>{selected.name}</p>
              <p className="text-xs text-left" style={{ color: '#64748B' }}>{selected.formula}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-left" style={{ color: '#94A3B8' }}>
            {lang === 'ar' ? 'اختر مادة كيميائية...' : 'Select a chemical...'}
          </span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={16} style={{ color: '#64748B' }} /></motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="absolute z-30 w-full mt-2 rounded-xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
          >
            <div className="p-2 border-b" style={{ borderColor: '#F0F2F5' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                className="input-field py-2 text-sm"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(c => (
                <motion.button
                  key={c.id}
                  onClick={() => { onSelect(c); setOpen(false); setSearch('') }}
                  className="w-full flex items-center gap-3 p-3 text-left transition-colors"
                  whileHover={{ background: '#EBF4FF' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0" style={{ background: '#EBF4FF', color: '#2D6A9F' }}>
                    {c.formula.slice(0, 3)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{c.formula}</p>
                  </div>
                  <span className={`badge ml-auto badge-${c.hazard_level}`}>
                    {lang === 'ar' 
                      ? (c.hazard_level === 'safe' ? 'آمن' : c.hazard_level === 'warning' ? 'تحذير' : 'خطر') 
                      : c.hazard_level
                    }
                  </span>
                </motion.button>
              ))}
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
const predictReactionLocally = (chemA, chemB) => {
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

  // -- CHEMICAL REACTIONS --

  // 1. Acid + Carbonate (e.g. HCl + CaCO3) -> produces CO2 gas
  if ((acidA && nameB.includes('carbonate')) || (acidB && nameA.includes('carbonate'))) {
    const acid = acidA ? chemA : chemB
    const carbonate = acidA ? chemB : chemA
    return {
      is_safe: true,
      reaction_type: 'produces_gas',
      severity_score: 3,
      result_description: `Reaction between ${acid.name} (${acid.formula}) and ${carbonate.name} (${carbonate.formula}) generates Carbon Dioxide (CO2) gas bubbles. Neutralization is successful.\nتفاعل التعادل بين الحمض والكربونات ينتج غاز ثاني أكسيد الكربون.`,
      product_name: 'Carbon Dioxide & Salt Solution',
      product_formula: 'CO2 (g) + H2O (l) + Salt (aq)',
      physical_properties: `Exothermic neutralization (ΔH < 0). Active gas evolution causes effervescence (bubbling). Solution temperature rises moderately. High solubility of the formed calcium salt in water.\nتغير طارد للحرارة مع انطلاق فقاعات غاز CO2 مسبباً فوراناً وارتفاعاً معتدلاً في حرارة المحلول.`,
      safety_measures: `Wear splash goggles, protective laboratory coat, and nitrile gloves. Perform in a fume hood to vent CO2. Ensure closed vessels are vented to avoid pressure explosion.\nارتدِ نظارات الحماية المخبرية، قفازات النيتريل، ومعطف المختبر. يُجرى في هود تهوية لمنع تراكم الغاز.`,
      chemical_properties: `pH shifts from strong acid (pH < 1) towards weakly acidic/neutral (pH 5-6) depending on ratio. Carbonate ions convert to gaseous CO2 and H2O, leaving chloride/sulfate salts in solution.\nتغير قيمة الـ pH من حمضي قوي إلى حمضي ضعيف أو متعادل حسب النسب، وتتحلل أيونات الكربونات تماماً.`
    }
  }

  // 2. Acid + Base (Hydroxide/Ammonia) -> Exothermic Neutralization
  if ((acidA && baseB) || (acidB && baseA)) {
    const acid = acidA ? chemA : chemB
    const base = acidA ? chemB : chemA
    return {
      is_safe: true,
      reaction_type: 'safe',
      severity_score: 2,
      result_description: `Acid-base neutralization reaction between ${acid.name} and ${base.name}. Heat is released (exothermic), forming water and stable salt.\nتفاعل تعادل بين الحمض والقاعدة ينتج ملح وماء مع انطلاق حرارة.`,
      product_name: 'Water & Salt Solution',
      product_formula: 'H2O (l) + Salt (aq)',
      physical_properties: `Highly exothermic heat of neutralization (~57 kJ/mol). Rapid increase in mixture temperature. Transparent homogeneous liquid phase.\nانطلاق حرارة تعادل عالية جداً تؤدي لارتفاع سريع في حرارة الخليط السائل المتجانس.`,
      safety_measures: `Wear chemical splash goggles, heavy nitrile gloves, and protective apron. Always add acid to base slowly with stirring. Cool container if needed to prevent boiling splash.\nارتدِ نظارات واقية، قفازات نيتريل سميكة. أضف الحمض إلى القاعدة ببطء مع التحريك المستمر لتجنب الغليان المفاجئ.`,
      chemical_properties: `Rapid neutralization reaction resulting in pH shift to ~7. Electrolytes dissociate completely into active spectator ions (e.g., Na+, Cl-, SO4^2-).\nتغير سريع في الرقم الهيدروجيني pH باتجاه التعادل (~7)، وتتفكك الإلكتروليتات بالكامل إلى أيونات ذائبة مستقرة.`
    }
  }

  // 3. Oxidizer + Flammable organic solvent -> Danger of fire/explosion
  const isOxidizer = (n) => n.includes('nitrate') || n.includes('peroxide') || n.includes('permanganate') || n.includes('oxygen') || n.includes('sulfuric') || n.includes('nitric')
  const isFlammable = (n) => n.includes('alcohol') || n.includes('ethanol') || n.includes('acetone') || n.includes('benzene') || n.includes('methanol') || n.includes('hydrogen')
  
  if ((isOxidizer(nameA) && isFlammable(nameB)) || (isOxidizer(nameB) && isFlammable(nameA))) {
    const ox = isOxidizer(nameA) ? chemA : chemB
    const flam = isOxidizer(nameA) ? chemB : chemA
    return {
      is_safe: false,
      reaction_type: 'explosive',
      severity_score: 9,
      result_description: `CRITICAL DANGER: Mixing strong oxidizer ${ox.name} with flammable ${flam.name} results in violent oxidation, high heat release, and explosive combustion risk!\nخطر انفجار: خلط مادة مؤكسدة قوية مع مادة قابلة للاشتعال يسبب تفاعل سريع وخطر الحريق.`,
      product_name: 'Combustion Gases',
      product_formula: 'CO2 (g) + H2O (g)',
      physical_properties: `Extremely high exothermic heat release (ΔH << 0). Instantaneous boiling and vaporization of organic solvents. Immediate expansion of combustion gases.\nانطلاق حرارة هائلة طاردة للحرارة، وتبخر فوري للمذيبات العضوية مع تمدد سريع للغازات الناتجة.`,
      safety_measures: `DO NOT MIX. Requires blast shield, self-contained breathing apparatus (SCBA), chemical suit, and Class B fire extinguisher ready.\nممنوع الخلط بتاتاً. يتطلب درع حماية من الانفجار، وجهاز تنفس مستقل، وبدلة كيميائية مع توفير طفاية حريق مناسبة.`,
      chemical_properties: `Rapid destructive redox oxidation-reduction reaction. Complete cleavage of carbon-carbon bonds, yielding gaseous carbon dioxide, toxic nitrogen/sulfur oxides, and steam.\nتفاعل أكسدة واختزال تدميري سريع، يتفكك فيه المذيب العضوي تماماً وينتج غازات احتراق سامة وبخار ماء.`
    }
  }

  // 4. Concentrated Acid + Water -> Exothermic hazard
  if ((acidA && nameB === 'water') || (acidB && nameA === 'water')) {
    const acid = acidA ? chemA : chemB
    return {
      is_safe: false,
      reaction_type: 'hazardous',
      severity_score: 5,
      result_description: `Exothermic acid dilution. Mixing water with concentrated ${acid.name} releases high heat. Always add acid to water slowly, never the reverse to prevent acid splash.\nتخفيف الحمض الطارد للحرارة. يجب إضافة الحمض للماء ببطء لمنع التناثر.`,
      product_name: 'Hydronium Ions',
      product_formula: 'H3O+ (aq)',
      physical_properties: `Exothermic hydration energy release. Viscosity changes, and temperature rises. Risk of localized boiling and acid splattering.\nانطلاق طاقة هيدرة طاردة للحرارة مسببة لارتفاع درجة الحرارة وتغير اللزوجة مع خطر فوران الحمض.`,
      safety_measures: `Follow standard laboratory rule: Always add Acid to Water (A&W - never add water to acid!). Wear full face shield and acid-resistant gloves. Work inside a fume hood.\nقاعدة مخبرية صارمة: أضف الحمض دائماً إلى الماء ببطء وتجنب إضافة الماء للحمض المركز مطلقاً. ارتدِ واقي الوجه بالكامل.`,
      chemical_properties: `Strong ionization. The acid dissociates completely, increasing hydronium ion concentration (pH drops to < 1).\nتأين قوي جداً، يتفكك فيه الحمض كلياً مما يرفع تركيز أيونات الهيدرونيوم ويهبط بالـ pH إلى أقل من 1.`
    }
  }

  // -- PHYSICAL MIXTURES & SOLUBILITY --

  // 5. Ethanol + Water -> Fully Miscible
  if ((nameA.includes('ethanol') && nameB.includes('water')) || (nameB.includes('ethanol') && nameA.includes('water'))) {
    return {
      is_safe: true,
      reaction_type: 'safe',
      severity_score: 1,
      result_description: `Ethanol and Water are fully miscible in all proportions. They form a homogeneous solution due to strong hydrogen bonding. A slight volume contraction occurs.\nالإيثانول والماء ممتزجان تمامًا في جميع النسب، ويشكلان محلولًا متجانسًا بسبب الروابط الهيدروجينية القوية.`,
      product_name: 'Aqueous Ethanol Solution',
      product_formula: 'C2H5OH (aq)',
      physical_properties: `Slight exothermic heat of mixing. Density decreases, and volume contracts (e.g., 50ml + 50ml yields ~96ml of solution).\nانطلاق حرارة خلط طفيفة جداً، مع انكماش في الحجم الكلي للمزيج ونقصان الكثافة الناتجة عن تداخل الجزيئات.`,
      safety_measures: `Keep away from heat, open sparks, and hot surfaces. Wear standard eye protection and lab gloves.\nخليط قابل للاشتعال حسب التركيز. يُحفظ بعيداً عن مصادر الحرارة والشرر المفتوح مع ارتداء قفازات المختبر القياسية.`,
      chemical_properties: `Highly stable, non-reactive mixture. The solution is flammable depending on ethanol concentration (flash point decreases as ethanol percentage rises).\nمزيج فيزيائي مستقر تماماً ولا يوجد أي تفاعل كيميائي، تقل درجة الوميض للمزيج مع زيادة تركيز الكحول.`
    }
  }

  // 6. Acetone + Water -> Fully Miscible
  if ((nameA.includes('acetone') && nameB.includes('water')) || (nameB.includes('acetone') && nameA.includes('water'))) {
    return {
      is_safe: true,
      reaction_type: 'safe',
      severity_score: 1,
      result_description: `Acetone and Water are completely miscible. They form a single-phase polar organic solution. Commonly used as a laboratory cleaning and drying solvent.\nالأسيتون والماء ممتزجان تمامًا، ويشكلان محلولاً متجانسًا قطبيًا أحادي الطور.`,
      product_name: 'Aqueous Acetone Solution',
      product_formula: 'C3H6O (aq)',
      physical_properties: `Negligible heat of mixing. Highly volatile; vapors are heavier than air. Clear, homogeneous solution.\nحرارة خلط مهملة، الخليط ذو تطايرية عالية وتنتشر أبخرته العضوية في الهواء بسهولة وهو محلول رائق تماماً.`,
      safety_measures: `Ensure proper ventilation to prevent inhalation of volatile acetone vapors. Wear solvent-resistant gloves. Avoid spark sources.\nتأكد من التهوية الجيدة للغرفة لتفادي استنشاق أبخرة الأسيتون المتطايرة، ارتدِ قفازات النيتريل وتجنب الشرر.`,
      chemical_properties: `Stable mixture. Polar organic solvent remains flammable. No chemical reaction occurs under standard laboratory conditions.\nمزيج فيزيائي مستقر وقطبي غير تفاعلي، يظل الأسيتون قابلاً للاشتعال والتفاعل مع المؤكسدات القوية فقط.`
    }
  }

  // 7. Benzene + Water -> Immiscible (Two-phase)
  if ((nameA.includes('benzene') && nameB.includes('water')) || (nameB.includes('benzene') && nameA.includes('water'))) {
    return {
      is_safe: false,
      reaction_type: 'hazardous',
      severity_score: 4,
      result_description: `IMMISCIBLE MIXTURE: Benzene is non-polar and hydrophobic, so it does not dissolve in polar water. It forms a distinct two-phase liquid system where Benzene (density 0.87 g/cm³) floats on top of the water layer. Flammability hazard remains.\nخليط غير ممتزج: البنزين غير قطبي لا يذوب في الماء القطبي، ويشكل طبقتين منفصلتين حيث يطفو البنزين في الأعلى لخفة كثافته.`,
      product_name: 'Two-Phase Immiscible System',
      product_formula: 'C6H6 (l) + H2O (l)',
      physical_properties: `Zero miscibility. Forms two distinct liquid phases. Benzene (density 0.87 g/cm³) floats on top of water (density 1.0 g/cm³).\nانعدام تام للامتزاج، ينفصل الخليط إلى طورين سائلين، يطفو البنزين في الأعلى بسبب كثافته الأقل من الماء.`,
      safety_measures: `Benzene is a known human carcinogen. Wear viton gloves, safety goggles, and handle exclusively in a certified fume hood.\nالبنزين مادة مسرطنة وسامة جداً بالاستنشاق. ارتدِ قفازات الفيتون الخاصة وحرك السائل داخل هود المختبر حصراً.`,
      chemical_properties: `No chemical interaction. High chemical stability of both phases. Hydrophobic non-polar phase remains highly flammable.\nلا يوجد أي تآثر أو رابطة كيميائية بين الطورين، ويحتفظ كل سائل بخصائصه الكيميائية دون تغيير.`
    }
  }

  // 8. Acetone + Benzene -> Fully Miscible organic solution
  if ((nameA.includes('acetone') && nameB.includes('benzene')) || (nameB.includes('acetone') && nameA.includes('benzene'))) {
    return {
      is_safe: true,
      reaction_type: 'safe',
      severity_score: 2,
      result_description: `Acetone and Benzene are fully miscible organic solvents. They mix to form a homogeneous organic solvent mixture. Note: Both solvents are highly flammable and volatile; handle under a fume hood.\nالأسيتون والبنزين ممتزجان تمامًا ويشكلان خليطًا متجانسًا من المذيبات العضوية القابلة للاشتعال والتطاير.`,
      product_name: 'Acetone-Benzene Organic Solution',
      product_formula: 'C3H6O (l) + C6H6 (l)',
      physical_properties: `Homogeneous organic phase. Very low boiling point and high vapor pressure. Volatile organic smell.\nطور عضوي متجانس ذو درجة غليان منخفضة وتطايرية عالية مع انبعاث رائحة عطرية للمذيبات العضوية.`,
      safety_measures: `Highly flammable organic mixture. Wear solvent-resistant nitrile or viton gloves. Use static-free equipment and handle inside a fume hood.\nخليط شديد الاشتعال والتطاير. ارتدِ قفازات النيتريل المقاومة للمذيبات واستخدم أدوات خالية من الكهرباء الساكنة.`,
      chemical_properties: `Stable mixture. Polar/non-polar aprotic organic blend. No chemical reaction occurs.\nمزيج مستقر فيزيائياً بدون تفاعل كيميائي، يسلك المحلول سلوك الخليط المذيب العضوي غير المتفاعل.`
    }
  }

  // 9. Default response based on Hazard levels
  const dangerLevel = Math.max(
    chemA.hazard_level === 'danger' ? 7 : chemA.hazard_level === 'warning' ? 4 : 1,
    chemB.hazard_level === 'danger' ? 7 : chemB.hazard_level === 'warning' ? 4 : 1
  )

  if (dangerLevel >= 7) {
    return {
      is_safe: false,
      reaction_type: 'hazardous',
      severity_score: dangerLevel,
      result_description: `Potential hazard detected. Mixing ${chemA.name} and ${chemB.name} is restricted. Proceed with certified personal protective equipment under ventilation.\nتفاعل محتمل الخطورة بسبب وجود مواد عالية السمية أو الكاوية.`,
      product_name: 'Unstable Complex',
      product_formula: 'Complex',
      physical_properties: `Reaction enthalpy and temperature rise vary based on actual concentration levels. Vapor pressure may increase.\nتعتمد الخصائص الحرارية للخلط على تركيز المواد المخلوطة ودرجة الحرارة في الغرفة.`,
      safety_measures: `Handle with extreme care. Wear standard personal protective equipment (PPE) including safety goggles, lab coat, and chemical-resistant gloves under hood.\nيجب التعامل بحذر شديد مع ارتداء معدات الوقاية الشخصية بالكامل (نظارات معطف قفازات كيميائية) وتحت الشفاط الهوائي.`,
      chemical_properties: `Avoid contact with heat, incompatibles, and open atmosphere. Mixture properties are unknown; assume reactive.\nتجنب الحرارة والشرر، المزيج يعتبر غير مستقر كيميائياً ويجب افتراض تفاعليته العالية لتفادي الخطر.`
    }
  }

  return {
    is_safe: true,
    reaction_type: 'safe',
    severity_score: 1,
    result_description: `No active reaction expected. ${chemA.name} and ${chemB.name} are compatible for mixing under standard lab conditions.\nخلط آمن ومستقر. لا يوجد تفاعل كيميائي نشط متوقع تحت الظروف العادية.`,
    product_name: 'Stable Mixture',
    product_formula: `${formulaA} + ${formulaB}`,
    physical_properties: `No significant temperature changes. Solution remains stable at room temperature.\nلا يوجد أي تغير حراري ملحوظ أو تغير في الكثافة الكلية للخليط السائل.`,
    safety_measures: `Wear standard lab protection (goggles, coat, nitrile gloves). Work in a clean laboratory environment.\nارتدِ معدات الوقاية الشخصية المعيارية للمختبر (نظارات واقية، معطف المختبر، قفازات النيتريل).`,
    chemical_properties: `Compatible mixture. Highly stable chemical properties under normal atmosphere.\nخليط مستقر كيميائياً ومتوافق تماماً ولا يظهر أي علامات للتفكك أو النشاط الكيميائي الفوري.`
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

export default function MixingSimulatorPage() {
  const { chemicals, fetchChemicals } = useChemicalStore()
  const [chemA, setChemA] = useState(null)
  const [chemB, setChemB] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const { lang, t } = useLanguage()

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
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error("Failed to open print preview. Please allow popups for this site.")
      return
    }
    const dateStr = new Date().toLocaleString()

    const content = `
      <html>
        <head>
          <title>ChemVision Lab - Experiment Report</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1E293B; line-height: 1.6; }
            .header { border-bottom: 3px solid #3B82F6; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 26px; font-weight: bold; color: #1E3A8A; }
            .subtitle { font-size: 13px; color: #64748B; margin-top: 4px; }
            .meta-info { font-size: 11px; color: #64748B; }
            .chem-box { display: flex; gap: 15px; margin-bottom: 20px; }
            .chem-card { flex: 1; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC; }
            .chem-card strong { color: #1E3A8A; display: block; font-size: 15px; }
            .section { margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFF; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #3B82F6; margin-bottom: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px; }
            .badge { display: inline-block; padding: 5px 10px; border-radius: 6px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
            .danger { background-color: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
            .safe { background-color: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7; }
            .description { font-weight: 500; font-size: 13px; margin-top: 10px; }
            .val-text { font-size: 12.5px; color: #334155; }
            .footer-note { text-align: center; margin-top: 45px; font-size: 10px; color: #94A3B8; border-top: 1px dashed #E2E8F0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">🧪 ChemVision Lab Reports</div>
              <div class="subtitle">Official Compatibility & Laboratory Safety Datasheet (SDS)</div>
            </div>
            <div class="meta-info">Report ID: CV-${Math.floor(100000 + Math.random() * 900000)}<br>Date: ${dateStr}</div>
          </div>

          <div class="chem-box">
            <div class="chem-card">
              <strong>Chemical A (المادة أ)</strong>
              Name: ${chemA.name || 'N/A'}<br>Formula: ${chemA.formula || 'N/A'}<br>Hazard Level: ${(chemA.hazard_level || 'N/A').toUpperCase()}
            </div>
            <div class="chem-card">
              <strong>Chemical B (المادة ب)</strong>
              Name: ${chemB.name || 'N/A'}<br>Formula: ${chemB.formula || 'N/A'}<br>Hazard Level: ${(chemB.hazard_level || 'N/A').toUpperCase()}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Reaction Summary & Safety Rating</div>
            <div class="val-text">
              <span class="badge ${result.is_safe ? 'safe' : 'danger'}">
                ${result.is_safe ? 'SAFE MIXTURE' : 'RESTRICTED / DANGEROUS'} (Severity: ${result.severity_score}/10)
              </span>
              <p class="description">${result.result_description || 'No matching database rule found.'}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Physical & Thermal Properties (الخصائص الفيزيائية والحرارية للمزيج)</div>
            <div class="val-text">${result.physical_properties || 'Standard solution properties apply.'}</div>
          </div>

          <div class="section">
            <div class="section-title">Chemical Properties & Stability (الخواص الكيميائية والاستقرار)</div>
            <div class="val-text">${result.chemical_properties || 'Compatible mixture under normal conditions.'}</div>
          </div>

          <div class="section" style="border-left: 4px solid #D97706; background: #FFFDF5;">
            <div class="section-title" style="color: #D97706;">Precise Lab Safety & Hazard Controls (آلية الأمان والسلامة المخبرية)</div>
            <div class="val-text" style="font-weight: 500; color: #92400E;">${result.safety_measures || 'Wear standard laboratory protection.'}</div>
          </div>

          ${result.product_name ? `
          <div class="section" style="background: #FAF5FF; border-color: #E9D5FF;">
            <div class="section-title" style="color: #8B5CF6;">Resulting Product / المركب الكيميائي المتشكل</div>
            <div class="val-text"><strong>Product:</strong> ${result.product_name} (${result.product_formula || ''})</div>
          </div>
          ` : ''}

          <div class="footer-note">
            ChemVision Academic Simulator. All values generated represent simulation scenarios. Verify all safety protocols before conducting wet-lab assays.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
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

    // Phase 1: Pouring animation (lasts 1.5 seconds)
    setTimeout(() => {
      setAnimPhase('reacting')
      
      // Trigger appropriate reaction sounds
      if (localResult.reaction_type === 'produces_gas' || localResult.reaction_type === 'toxic' || localResult.reaction_type === 'hazardous') {
        playLabSound('bubble')
      } else if (localResult.reaction_type === 'explosive') {
        playLabSound('explosion')
      }
      
      // Phase 2: Reaction mixing & kinetics animation (lasts 2.3 seconds)
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
                body: { chemA, chemB }
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
Chemical B: ${chemB.name} (${chemB.formula})

Analyze their reactivity, safety, potential products, and hazard severity.
You MUST respond with a valid JSON object matching this schema:
{
  "is_safe": boolean,
  "reaction_type": "safe" | "hazardous" | "explosive" | "toxic" | "produces_gas" | "new_product",
  "result_description": "A detailed, professional, easy-to-understand explanation of the reaction, listing hazards, safety measures, and chemical products in Arabic and English.",
  "severity_score": number (1 to 10 scale of danger),
  "product_name": "Name of the resulting product if any (leave empty if none)",
  "product_formula": "Formula of the resulting product if any (leave empty if none)",
  "physical_properties": "Detailed physical and thermal properties of the mixture in Arabic and English.",
  "safety_measures": "Precise lab safety measures and hazard controls in Arabic and English.",
  "chemical_properties": "Chemical properties and stability of the resulting mixture in Arabic and English."
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
      }, 2300)
    }, 1500)
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
                    🧪 Neutralization (NaOH + H2SO4)
                  </button>
                  <button
                    onClick={() => runTemplate('CaCO3', 'HCl')}
                    className="p-2.5 rounded-xl border text-xs font-semibold text-left transition hover:bg-slate-50"
                    style={{ borderColor: '#E2E8F0', color: '#334155' }}
                  >
                    💨 Gas Volcano (CaCO3 + HCl)
                  </button>
                  <button
                    onClick={() => runTemplate('C3H6O', 'C6H6')}
                    className="p-2.5 rounded-xl border text-xs font-semibold text-left transition hover:bg-slate-50"
                    style={{ borderColor: '#E2E8F0', color: '#334155' }}
                  >
                    🟢 Organic Blend (Acetone + Benzene)
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
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#94A3B8' }}>Reaction Summary / ملخص التفاعل</h4>
                      <p className="text-sm mt-1 leading-relaxed font-semibold text-left" style={{ color: '#2C3E50' }}>{result.result_description}</p>
                    </div>
                  </div>

                  {/* Physical & Thermal Properties */}
                  <div className="flex gap-3 items-start pt-3.5 border-t" style={{ borderColor: '#F0F2F5' }}>
                    <div className="p-2 rounded-lg flex-shrink-0 mt-0.5" style={{ background: '#FFF3E0', color: '#FF9800' }}>
                      <Flame size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#94A3B8' }}>Physical & Thermal Properties / الخصائص الفيزيائية الحرارية للمزيج</h4>
                      <p className="text-sm mt-1 leading-relaxed text-left" style={{ color: '#475569' }}>{result.physical_properties}</p>
                    </div>
                  </div>

                  {/* Chemical Properties */}
                  <div className="flex gap-3 items-start pt-3.5 border-t" style={{ borderColor: '#F0F2F5' }}>
                    <div className="p-2 rounded-lg flex-shrink-0 mt-0.5" style={{ background: '#F3E5F5', color: '#9C27B0' }}>
                      <Zap size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#94A3B8' }}>Chemical Properties of Mixture / الخواص الكيميائية للمزيج الناتج</h4>
                      <p className="text-sm mt-1 leading-relaxed text-left" style={{ color: '#475569' }}>{result.chemical_properties}</p>
                    </div>
                  </div>

                  {/* Lab Safety & Hazard Controls */}
                  <div className="p-4 rounded-xl flex gap-3 items-start mt-2" style={{ background: '#FFF9E6', border: '1px solid #FFE082' }}>
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: '#FFF3CD', color: '#D97706' }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: '#B45309' }}>Precise Lab Safety & Hazard Controls / آلية الأمان والسلامة المخبرية الدقيقة</h4>
                      <p className="text-sm mt-1 leading-relaxed font-medium text-left" style={{ color: '#92400E' }}>{result.safety_measures}</p>
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
                      <p className="text-xs font-semibold text-left" style={{ color: '#7C3AED' }}>Product formed / الناتج المتكون:</p>
                      <p className="text-sm font-bold mt-0.5 text-left" style={{ color: '#6326CA' }}>{result.product_name} {result.product_formula && `(${result.product_formula})`}</p>
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

