import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Beaker, AlertTriangle, CheckCircle, Zap, ChevronDown, ArrowRightLeft, Flame, Wind } from 'lucide-react'
import { useChemicalStore } from '../store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

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
  const filtered = chemicals.filter(c => c.id !== exclude && (c.name.toLowerCase().includes(search.toLowerCase()) || c.formula.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="relative flex-1">
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
              <p className="font-medium text-sm" style={{ color: '#2C3E50' }}>{selected.name}</p>
              <p className="text-xs" style={{ color: '#64748B' }}>{selected.formula}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm" style={{ color: '#94A3B8' }}>Select a chemical...</span>
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
                placeholder="Search..."
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
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{c.formula}</p>
                  </div>
                  <span className={`badge ml-auto badge-${c.hazard_level}`}>{c.hazard_level}</span>
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

export default function MixingSimulatorPage() {
  const { chemicals, fetchChemicals } = useChemicalStore()
  const [chemA, setChemA] = useState(null)
  const [chemB, setChemB] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [screenShake, setScreenShake] = useState(false)

  useEffect(() => { fetchChemicals() }, [])

  const swap = () => { setChemA(chemB); setChemB(chemA); setResult(null) }

  const simulate = async () => {
    if (!chemA || !chemB) { toast.error('Please select both chemicals'); return }
    if (chemA.id === chemB.id) { toast.error('Cannot mix a chemical with itself'); return }
    setLoading(true); setResult(null)

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
            throw serverErr // If no key is set locally, re-throw the original error to trigger fallback warning
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
  "product_formula": "Formula of the resulting product if any (leave empty if none)"
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
      const localPredictionResult = predictReactionLocally(chemA, chemB)
      setResult(localPredictionResult)
      if (!localPredictionResult.is_safe) {
        setScreenShake(true); setTimeout(() => setScreenShake(false), 800)
      }
      toast.success('Simulation complete (Local AI Engine fallback 🧠)')
    } finally {
      setLoading(false)
    }
  }

  const rStyle = result ? (reactionStyles[result.reaction_type] || reactionStyles.safe) : null

  return (
    <motion.div
      className="p-4 lg:p-6"
      animate={screenShake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading font-bold text-2xl" style={{ color: '#2C3E50' }}>🧪 Mixing Simulator</h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>Select two chemicals to check reaction safety</p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Chemical Selectors */}
        <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-end gap-4">
            <ChemicalSelector label="Chemical A" selected={chemA} onSelect={(c) => { setChemA(c); setResult(null) }} chemicals={chemicals} exclude={chemB?.id} />

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

            <ChemicalSelector label="Chemical B" selected={chemB} onSelect={(c) => { setChemB(c); setResult(null) }} chemicals={chemicals} exclude={chemA?.id} />
          </div>

          {/* Selected beakers visualization */}
          {(chemA || chemB) && (
            <motion.div className="flex items-center justify-center gap-8 mt-6 py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Beaker A */}
              <motion.div className="text-center" animate={chemA ? { y: [0, -4, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
                <div className="text-5xl mb-2">🧪</div>
                <p className="text-xs font-medium" style={{ color: '#4A90E2' }}>{chemA?.formula || '?'}</p>
              </motion.div>

              <div className="text-2xl">+</div>

              {/* Beaker B */}
              <motion.div className="text-center" animate={chemB ? { y: [0, -4, 0] } : {}} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                <div className="text-5xl mb-2">⚗️</div>
                <p className="text-xs font-medium" style={{ color: '#7C3AED' }}>{chemB?.formula || '?'}</p>
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
            {loading ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>🧪</motion.span>
                Analyzing reaction...
              </>
            ) : (
              <><Beaker size={18} /> Simulate Reaction</>
            )}
          </motion.button>
        </motion.div>

        {/* RESULT */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="card overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ border: `2px solid ${rStyle.border}` }}
            >
              {/* Result header */}
              <div className="p-4 flex items-center gap-3" style={{ background: rStyle.bg }}>
                <span className="text-2xl">{rStyle.emoji}</span>
                <div>
                  <h3 className="font-heading font-bold text-lg" style={{ color: rStyle.color }}>{rStyle.label}</h3>
                  <p className="text-xs" style={{ color: rStyle.color, opacity: 0.8 }}>
                    Severity: {result.severity_score}/10 – {result.reaction_type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Animation */}
              <ReactionAnimation type={result.reaction_type} />

              {/* Description */}
              {/* Description */}
              <div className="p-5 space-y-4">
                {/* General Reaction Summary */}
                <div className="flex gap-3 items-start">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5" style={{ background: '#EBF4FF', color: '#4A90E2' }}>
                    <Beaker size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Reaction Summary / ملخص التفاعل</h4>
                    <p className="text-sm mt-1 leading-relaxed font-semibold" style={{ color: '#2C3E50' }}>{result.result_description}</p>
                  </div>
                </div>

                {/* Physical & Thermal Properties */}
                <div className="flex gap-3 items-start pt-3.5 border-t" style={{ borderColor: '#F0F2F5' }}>
                  <div className="p-2 rounded-lg flex-shrink-0 mt-0.5" style={{ background: '#FFF3E0', color: '#FF9800' }}>
                    <Flame size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Physical & Thermal Properties / الخصائص الفيزيائية الحرارية للمزيج</h4>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: '#475569' }}>{result.physical_properties || "Standard solution thermodynamic properties apply. Temperature shift depends on actual mixture concentration."}</p>
                  </div>
                </div>

                {/* Chemical Properties */}
                <div className="flex gap-3 items-start pt-3.5 border-t" style={{ borderColor: '#F0F2F5' }}>
                  <div className="p-2 rounded-lg flex-shrink-0 mt-0.5" style={{ background: '#F3E5F5', color: '#9C27B0' }}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Chemical Properties of Mixture / الخواص الكيميائية للمزيج الناتج</h4>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: '#475569' }}>{result.chemical_properties || "Chemically compatible mixture under normal laboratory atmosphere. No toxic gaseous decomposition."}</p>
                  </div>
                </div>

                {/* Lab Safety & Hazard Controls */}
                <div className="p-4 rounded-xl flex gap-3 items-start mt-2" style={{ background: '#FFF9E6', border: '1px solid #FFE082' }}>
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ background: '#FFF3CD', color: '#D97706' }}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#B45309' }}>Precise Lab Safety & Hazard Controls / آلية الأمان والسلامة المخبرية الدقيقة</h4>
                    <p className="text-sm mt-1 leading-relaxed font-medium" style={{ color: '#92400E' }}>{result.safety_measures || "Wear standard laboratory protection including nitrile gloves, protective lab coat, and splash goggles. Conduct mixing inside a certified fume hood."}</p>
                  </div>
                </div>

                {result.product_name && (
                  <motion.div
                    className="mt-4 p-3.5 rounded-xl border"
                    style={{ background: '#EDE9FE', borderColor: '#C084FC' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <p className="text-xs font-semibold" style={{ color: '#7C3AED' }}>Product formed / الناتج المتكون:</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: '#6326CA' }}>{result.product_name} {result.product_formula && `(${result.product_formula})`}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
