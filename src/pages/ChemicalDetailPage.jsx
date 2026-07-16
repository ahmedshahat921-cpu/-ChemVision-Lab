import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, AlertTriangle, Package, MapPin, Calendar, FlaskConical, Download, Loader2, CheckCircle, Shield, Info, ExternalLink, Eye, Flame, User, FileText, Activity } from 'lucide-react'
import { useChemicalStore, useAuthStore } from '../store'
import { supabase } from '../lib/supabase'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import toast from 'react-hot-toast'
import { useLanguage } from '../hooks/useLanguage'
import { getChemicalData } from '../data/chemicalData'

const hazardColors = {
  low: { bg: '#E8FBF6', color: '#2A7060', border: '#5DB9A0' },
  medium: { bg: '#FEF3DC', color: '#A66410', border: '#F5A623' },
  high: { bg: '#FDEAEA', color: '#A02A2A', border: '#E85D5D' },
  critical: { bg: '#FDEAEA', color: '#A02A2A', border: '#E85D5D' },
}

const chemicalTranslations = {
  'Acetone': {
    name: 'أسيتون',
    location: 'مختبر ج - الرف 1',
    storage_conditions: 'يُحفظ في مكان بارد وجاف وجيد التهوية بعيداً عن مصادر الاشتعال والحرارة.',
    first_aid: 'في حالة الملامسة بالعين: تُشطف بالماء لعدة دقائق. في حالة الاستنشاق: يُنقل الشخص للهواء الطلق.',
    description: 'سائل عضوي شفاف، سريع التطاير والاشتعال، ويستخدم كمذيب كيميائي شائع في المختبرات.'
  },
  'Ammonia Solution': {
    name: 'محلول الأمونيا',
    location: 'مختبر ب - الرف 3',
    storage_conditions: 'يُحفظ في وعاء محكم الإغلاق في مكان بارد وجاف مع تهوية مناسبة.',
    first_aid: 'في حالة ملامسة الجلد: تُزال الملابس الملوثة ويُغسل الجلد بالماء فوراً. استنشاق الغاز يتطلب هواء نقي فوراً.',
    description: 'محلول مائي من الأمونيا ذو رائحة نفاذة وقوية، وهو مادة قاعدية أكالة ومخرشة للجلد والأغشية المخاطية.'
  },
  'Benzene': {
    name: 'بنزين',
    location: 'مختبر ج - الرف 3',
    storage_conditions: 'يُحفظ في خزانة المواد القابلة للاشتعال المعزولة والمقاومة للانفجار.',
    first_aid: 'تجنب استنشاق أبخرته. في حالة الملامسة: يُغسل الجلد جيداً بالماء والصابون. اتصل بالطوارئ فوراً.',
    description: 'مركب هيدروكربوني عطري سائل عديم اللون، شديد الاشتعال ومسرطن، ويستخدم بحذر شديد كمركب وسيط.'
  },
  'Calcium Carbonate': {
    name: 'كربونات الكالسيوم',
    location: 'مختبر د - الرف 3',
    storage_conditions: 'يُحفظ في وعاء مغلق في درجة حرارة الغرفة بعيداً عن الأحماض القوية.',
    first_aid: 'شطف العينين بالماء كإجراء وقائي. غسل اليدين بعد الاستخدام.',
    description: 'مركب كيميائي صلب أبيض غير قابل للذوبان في الماء، ويوجد طبيعياً في الصخور والحجر الجيري.'
  },
  'Copper Sulfate': {
    name: 'كبريتات النحاس',
    location: 'مختبر ج - الرف 4',
    storage_conditions: 'يُحفظ في عبوات مغلقة جيداً بعيداً عن الرطوبة والمواد القلوية.',
    first_aid: 'في حالة الابتلاع: يُغسل الفم بالماء ويطلب العون الطبي فوراً. غسل الجلد المصاب بالماء.',
    description: 'ملح بلوري أزرق زاهي (كبريتات النحاس الثنائي المائية)، سام للبيئة المائية ويستخدم في العديد من التفاعلات الكيميائية.'
  },
  'Ethanol': {
    name: 'إيثانول',
    location: 'مختبر ب - الرف 1',
    storage_conditions: 'يُحفظ في حاويات مغلقة بإحكام بعيداً عن الحرارة والشرر والطلب المفتوح.',
    first_aid: 'في حالة ملامسة العين: تُشطف بالماء الوفير. في حالة الدوار: يُنقل المصاب لمكان جيد التهوية.',
    description: 'كحول إيثيلي سائل شفاف قابل للاشتعال، يستخدم كمذيب عضوي ومطهر فعال في المختبرات والتعقيم.'
  },
  'Glucose': {
    name: 'جلوكوز',
    location: 'مختبر د - الرف 2',
    storage_conditions: 'يُحفظ في مكان جاف وبارد في عبوات مغلقة لمنع امتصاص الرطوبة.',
    first_aid: 'غير خطير. اغسل بالماء إذا حدث تهيج بسيط.',
    description: 'سكر أحادي بسيط صلب أبيض بلوري، يستخدم ككاشف ومصدر طاقة رئيسي في التجارب الحيوية والكيميائية.'
  },
  'Hydrochloric Acid': {
    name: 'حمض الهيدروكلوريك',
    location: 'مختبر أ - الرف 1',
    storage_conditions: 'يُحفظ في خزانة الأحماض المخصصة والمقاومة للتآكل والصدأ.',
    first_aid: 'في حالة الانسكاب على الجلد أو العينين: تُغسل المنطقة بالماء الوفير لمدة 15 دقيقة على الأقل واتصل بالطبيب فوراً.',
    description: 'حمض معدني قوي أكال وشفاف، ذو رائحة خانقة، يتفاعل بشدة مع القواعد والمعادن ويصدر أبخرة مخرشة.'
  },
  'Sodium Hydroxide': {
    name: 'هيدروكسيد الصوديوم',
    location: 'مختبر أ - الرف 2',
    storage_conditions: 'يُحفظ في عبوات بلاستيكية محكمة الإغلاق بعيداً عن الرطوبة والأحماض (مادة مستقطبة للرطوبة).',
    first_aid: 'أكال جداً للجلد والعينين. يُغسل فوراً بماء وفير متدفق لمدة 20 دقيقة مع إزالة الملابس الملوثة.',
    description: 'قاعدة قوية صلبة بيضاء (الصودا الكاوية)، تذوب في الماء بشدة مطلقة حرارة عالية، وتسبب حروقاً كيميائية شديدة.'
  },
  'Sulfuric Acid': {
    name: 'حمض الكبريتيك',
    location: 'مختبر أ - الرف 3',
    storage_conditions: 'يُحفظ في مكان بارد وجاف في حاويات زجاجية مخصصة للأحماض القوية.',
    first_aid: 'خطير وحارق للغاية. يُغسل الجسم بماء وفير مستمر وتجنب استخدام معادلات الأحماض مباشرة على الحروق.',
    description: 'حمض معدني قوي جداً زيتي القوام، شره لامتصاص الماء، يتفاعل بعنف شديد مع الماء ومواد الخلط القلوية.'
  },
  'Water': {
    name: 'ماء مقطر',
    location: 'مختبر أ - الرف 4',
    storage_conditions: 'يُحفظ في عبوات نظيفة مخصصة للمياه المقطرة.',
    first_aid: 'آمن تماماً. لا توجد إجراءات إسعافات خاصة.',
    description: 'مياه نقية منزوعة الأيونات تستخدم كمذيب أساسي في معظم التحاليل والتفاعلات المخبرية.'
  },
  'Nitric Acid': {
    name: 'حمض النتريك',
    location: 'مختبر أ - الرف 5',
    storage_conditions: 'يُحفظ في خزانة أحماض مهواة معزولاً عن الأحماض العضوية والمركبات القابلة للاشتعال.',
    first_aid: 'حارق وأكال للجلد والعينين ويتسبب بصبغ الجلد باللون الأصفر. اغسل بماء وفير فوراً واتصل بالطبيب.',
    description: 'حمض معدني قوي ومؤكسد قوي جداً، يتفاعل بعنف مع المركبات العضوية ويطلق غازات ثاني أكسيد النيتروجين السامة ذات اللون البني.'
  },
  'Sodium Bicarbonate': {
    name: 'بيكربونات الصوديوم',
    location: 'مختبر د - الرف 4',
    storage_conditions: 'يُحفظ في مكان بارد وجاف بعيداً عن المواد الحمضية.',
    first_aid: 'شطف العين بالماء في حال حدوث تهيج خفيف.',
    description: 'مسحوق بلوري أبيض ناعم قاعدي خفيف، يستخدم كعامل تفاعل مع الأحماض لإنتاج غاز ثاني أكسيد الكربون.'
  },
  'Acetic Acid': {
    name: 'حمض الخليك',
    location: 'مختبر ب - الرف 2',
    storage_conditions: 'يُحفظ بعيداً عن المؤكسدات القوية والأحماض المعدنية في خزانة باردة ومهواة.',
    first_aid: 'في حالة الاستنشاق: ينقل المصاب لهواء نقي. ملامسة الجلد: يغسل بالماء الوفير.',
    description: 'حمض عضوي ضعيف ذو رائحة خل نفاذة وقوية، وفي حالته النقية يسمى حمض الخليك الثلجي.'
  },
  'Potassium Permanganate': {
    name: 'برمنغنات البوتاسيوم',
    location: 'مختبر ج - الرف 5',
    storage_conditions: 'يُحفظ في عبوات مغلقة بإحكام بعيداً عن المواد العضوية والاختزالية لأنه عامل مؤكسد قوي جداً.',
    first_aid: 'في حالة ملامسة العين أو الجلد: يشطف بماء وفير فوراً. الابتلاع يتطلب رعاية طبية طارئة وعاجلة.',
    description: 'مركب صلب بلوري ذو لون بنفسجي داكن، عامل مؤكسد قوي، صبغته قوية وتترك آثاراً بنية على الجلد والأدوات.'
  },
  'Glycerol': {
    name: 'جليسرول',
    location: 'مختبر ب - الرف 4',
    storage_conditions: 'يُحفظ في مكان بارد وجاف وعبوات محكمة لكونه يمتص رطوبة الهواء.',
    first_aid: 'آمن بشكل عام. شطف خفيف بالماء في حالة حدوث تهيج بسيط للعين.',
    description: 'سائل كحولي لزج عديم اللون والرائحة وحلو المذاق، يستخدم كمذيب ومرطب ووسيط تفاعل.'
  }
}

const getTranslation = (chem, field, lang) => {
  if (!chem) return ''
  if (lang === 'ar') {
    const matched = chemicalTranslations[chem.name]
    if (matched && matched[field]) {
      return matched[field]
    }
    // Fallbacks
    if (field === 'storage_conditions') return chem.storage_conditions || 'يُحفظ في مكان بارد وجاف وجيد التهوية.'
    if (field === 'first_aid') return chem.first_aid || 'اتصل بالطبيب أو الطوارئ فوراً.'
    if (field === 'description') return chem.description || 'لا يوجد وصف متاح حالياً.'
    if (field === 'location') return chem.location || 'غير محدد'
    if (field === 'name') return chem.name_ar || chem.name
  }
  return chem[field]
}

const getHazardLabel = (level, lang) => {
  const labels = {
    low: { en: 'Low Hazard', ar: 'خطورة منخفضة' },
    medium: { en: 'Medium Hazard', ar: 'خطورة متوسطة' },
    high: { en: 'High Hazard', ar: 'خطورة عالية' },
    critical: { en: 'Critical Hazard', ar: 'خطورة حرجة' },
  }
  return labels[level]?.[lang] || labels[level]?.en || level
}

const getGHSName = (code, lang) => {
  const info = {
    GHS01: 'Explosive',
    GHS02: 'Flammable',
    GHS03: 'Oxidizing',
    GHS04: 'Compressed Gas',
    GHS05: 'Corrosive',
    GHS06: 'Toxic',
    GHS07: 'Harmful',
    GHS08: 'Health Hazard',
    GHS09: 'Environmental',
  }
  const infoAr = {
    GHS01: 'قابل للانفجار',
    GHS02: 'قابل للاشتعال',
    GHS03: 'مؤكسد',
    GHS04: 'غاز مضغوط',
    GHS05: 'أكّال / حارق',
    GHS06: 'سام جداً',
    GHS07: 'ضار / مخرش',
    GHS08: 'مخاطر صحية',
    GHS09: 'خطر بيئي',
  }
  return lang === 'ar' ? (infoAr[code] || code) : (info[code] || code)
}

const GHSInfo = {
  GHS01: { icon: '💥' },
  GHS02: { icon: '🔥' },
  GHS03: { icon: '🔆' },
  GHS04: { icon: '💨' },
  GHS05: { icon: '⚗️' },
  GHS06: { icon: '☠️' },
  GHS07: { icon: '⚠️' },
  GHS08: { icon: '🫀' },
  GHS09: { icon: '🌿' },
}

function NfpaDiamond({ ratings, lang }) {
  if (!ratings) return null
  const { health = 0, flammability = 0, reactivity = 0, special = '' } = ratings

  return (
    <div className="card p-4 flex flex-col items-center">
      <h4 className="text-xs font-bold mb-4 uppercase tracking-wider text-center" style={{ color: '#94A3B8' }}>
        {lang === 'ar' ? 'معيار الجمعية الوطنية للحماية من الحرائق (NFPA)' : 'NFPA 704 Safety Diamond'}
      </h4>
      
      {/* Container for the diamond */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Diamond Container rotated 45deg */}
        <div className="w-24 h-24 rotate-45 border-2 border-neutral-800 grid grid-cols-2 grid-rows-2 overflow-hidden shadow-md">
          {/* Top (Flammability) - Red */}
          <div className="bg-[#EF4444] border border-neutral-900 flex items-center justify-center">
            <span className="-rotate-45 text-white font-extrabold text-xl translate-x-[4px] translate-y-[4px]">{flammability}</span>
          </div>
          {/* Right (Reactivity) - Yellow */}
          <div className="bg-[#FBBF24] border border-neutral-900 flex items-center justify-center">
            <span className="-rotate-45 text-neutral-900 font-extrabold text-xl -translate-x-[4px] translate-y-[4px]">{reactivity}</span>
          </div>
          {/* Left (Health) - Blue */}
          <div className="bg-[#2563EB] border border-neutral-900 flex items-center justify-center">
            <span className="-rotate-45 text-white font-extrabold text-xl translate-x-[4px] -translate-y-[4px]">{health}</span>
          </div>
          {/* Bottom (Special) - White */}
          <div className="bg-[#FFFFFF] border border-neutral-900 flex items-center justify-center">
            <span className="-rotate-45 text-neutral-900 font-extrabold text-sm -translate-x-[4px] -translate-y-[4px]">{special || ' '}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold text-neutral-600">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#2563EB] rounded-sm" />
          <span>{lang === 'ar' ? 'خطر صحي' : 'Health Hazard'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#EF4444] rounded-sm" />
          <span>{lang === 'ar' ? 'قابل للاشتعال' : 'Flammability'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#FBBF24] rounded-sm" />
          <span>{lang === 'ar' ? 'عدم الاستقرار' : 'Instability'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-neutral-200 border border-neutral-400 rounded-sm" />
          <span>{lang === 'ar' ? 'مخاطر خاصة' : 'Special'}</span>
        </div>
      </div>
    </div>
  )
}

// CSS 3D Molecule Viewer inside a beautiful Glass Conical Flask
function MoleculeViewer({ formula, name, hazardLevel }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { lang } = useLanguage()

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 35,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -35,
    })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  // Get hazard level custom liquid color
  const liquidColors = {
    low: { primary: '#5DB9A0', secondary: '#3D9B83', glass: '#C5F4E7' },
    medium: { primary: '#F5A623', secondary: '#D4861A', glass: '#FDE4B3' },
    high: { primary: '#E85D5D', secondary: '#C93C3C', glass: '#FBCECE' },
    critical: { primary: '#A02A2A', secondary: '#7F1D1D', glass: '#FBCECE' },
  }
  const colorSet = liquidColors[hazardLevel] || liquidColors.low

  // Dynamic chemical formula parser
  const getMoleculeData = (rawFormula) => {
    if (!rawFormula) return { center: { label: 'C', fill: '#1B3A6B' }, outer: [] }
    
    // Normalize formula string (e.g. C2H5OH -> group components)
    const regex = /([A-Z][a-z]?)([0-9]*)/g
    const elements = {}
    let match
    while ((match = regex.exec(rawFormula)) !== null) {
      const el = match[1]
      const count = parseInt(match[2] || '1', 10)
      elements[el] = (elements[el] || 0) + count
    }

    // Determine the most central/heavy atom
    let centerLabel = 'C'
    if (elements['C'] && elements['C'] > 0) {
      centerLabel = 'C'
      elements['C']--
    } else if (elements['S'] && elements['S'] > 0) {
      centerLabel = 'S'
      elements['S']--
    } else if (elements['N'] && elements['N'] > 0) {
      centerLabel = 'N'
      elements['N']--
    } else if (elements['P'] && elements['P'] > 0) {
      centerLabel = 'P'
      elements['P']--
    } else if (elements['Cu'] && elements['Cu'] > 0) {
      centerLabel = 'Cu'
      elements['Cu']--
    } else {
      const nonH = Object.keys(elements).find(el => el !== 'H')
      if (nonH) {
        centerLabel = nonH
        elements[nonH]--
      } else if (elements['H'] && elements['H'] > 0) {
        centerLabel = 'H'
        elements['H']--
      }
    }

    // Standard CPK colors for chemistry representation
    const atomColors = {
      'H': '#5DB9A0',     // Light Green/Teal representation
      'C': '#1F2937',     // Dark slate grey (Carbon)
      'O': '#F5A623',     // Orange/Red-orange (Oxygen)
      'N': '#E85D5D',     // Red (Nitrogen)
      'Cl': '#A3E635',    // Bright lime green (Chlorine)
      'S': '#FBBF24',     // Yellow (Sulfur)
      'P': '#C084FC',     // Light purple (Phosphorus)
      'Cu': '#3B82F6',    // Copper blue
      'Na': '#8B5CF6',    // Violet (Sodium)
      'K': '#EC4899',     // Pink (Potassium)
      'Ca': '#64748B',    // Slate grey (Calcium)
    }

    const centerColor = atomColors[centerLabel] || '#4A90E2'

    // Compile remaining outer atoms
    const outerList = []
    Object.entries(elements).forEach(([el, count]) => {
      for (let i = 0; i < count; i++) {
        outerList.push(el)
      }
    })

    // Slice to maximum of 6 elements to fit cleanly on screen
    const trimmedOuter = outerList.slice(0, 6)

    // Calculate circular coordinates dynamically
    const R = 42
    const outerAtoms = trimmedOuter.map((label, i) => {
      const angle = (i * 2 * Math.PI) / trimmedOuter.length - Math.PI / 2
      const cx = Math.round(R * Math.cos(angle))
      const cy = Math.round(R * Math.sin(angle))
      const fill = atomColors[label] || '#94A3B8'
      return { cx, cy, fill, label }
    })

    return {
      center: { label: centerLabel, fill: centerColor },
      outer: outerAtoms
    }
  }

  const { center, outer } = getMoleculeData(formula)

  return (
    <div
      className="relative flex items-center justify-center rounded-2xl overflow-hidden shadow-inner group"
      style={{ 
        background: 'radial-gradient(circle at center, #FFFFFF 0%, #F0F4F8 100%)', 
        height: '320px', 
        cursor: 'grab',
        border: '1px solid #E2E8F0'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background scientific grid pattern */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(#4A90E2 1px, transparent 1px), radial-gradient(#4A90E2 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* Outer interactive motion wrapper */}
      <motion.div
        animate={{ rotateX: mousePos.y, rotateY: mousePos.x }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full flex items-center justify-center relative"
      >
        <svg width="240" height="280" viewBox="0 0 200 220" className="drop-shadow-lg overflow-visible">
          <defs>
            {/* Liquid Gradient */}
            <linearGradient id="liquidGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={colorSet.secondary} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colorSet.primary} stopOpacity="0.6" />
            </linearGradient>
            
            {/* Liquid Surface Ellipse Gradient */}
            <radialGradient id="liquidSurface" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colorSet.primary} stopOpacity="0.7" />
              <stop offset="100%" stopColor={colorSet.secondary} stopOpacity="0.85" />
            </radialGradient>

            {/* Glass Shadow & Highlights */}
            <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* 1. ELEGANT ORBITAL PATHS FOR 3D SCI-FI LOOK */}
          <ellipse cx="100" cy="110" rx="75" ry="32" stroke="#4A90E2" strokeWidth="1" fill="none" opacity="0.25" />
          <ellipse cx="100" cy="110" rx="32" ry="75" stroke="#7AB8F5" strokeWidth="1" fill="none" opacity="0.2" />

          {/* 2. THE FLOATING 3D MOLECULE - Restored to clear, high-contrast larger scale */}
          <g transform="translate(100, 110)">
            <motion.g
              animate={{ rotate: 360, y: [-5, 5, -5] }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Bonds (Molecule grid) */}
              {outer.map((atom, i) => (
                <line 
                  key={i} 
                  x1="0" y1="0" x2={atom.cx} y2={atom.cy} 
                  stroke="#4A90E2" 
                  strokeWidth="2.5" 
                  opacity="0.7" 
                />
              ))}

              {/* Center Carbon atom */}
              <circle cx="0" cy="0" r="13" fill={center.fill} filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.18))" />
              <text x="0" y="3.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="monospace">{center.label}</text>

              {/* Outer atoms */}
              {outer.map((atom, i) => (
                <g key={i} transform={`translate(${atom.cx}, ${atom.cy})`}>
                  <circle cx="0" cy="0" r="10" fill={atom.fill} filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.18))" />
                  <text x="0" y="3" textAnchor="middle" fill="white" fontSize="8" fontWeight="800" fontFamily="sans-serif">{atom.label}</text>
                </g>
              ))}
            </motion.g>
          </g>
        </svg>
      </motion.div>

      {/* Interactive Title details */}
      <div className="absolute bottom-3 left-0 right-0 text-center flex flex-col items-center">
        <span className="text-xs font-heading font-semibold text-neutral-400">
          {lang === 'ar' ? 'نموذج ثلاثي الأبعاد للمركب' : 'Chemical Compound Model'}
        </span>
        <span className="text-sm font-mono font-bold mt-0.5" style={{ color: colorSet.secondary }}>
          {formula}
        </span>
      </div>

      <div 
        className="absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-medium transition-opacity opacity-70 group-hover:opacity-100 flex items-center gap-1" 
        style={{ background: 'rgba(74,144,226,0.1)', color: '#4A90E2' }}
      >
        <span>{lang === 'ar' ? 'اسحب / مرر الفأرة للمعاينة' : 'drag / hover to inspect'}</span>
      </div>
    </div>
  )
}

// Report Usage Modal
function ReportUsageModal({ chemical, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [loading, setLoading] = useState(false)
  const { reportUsage } = useChemicalStore()
  const { user } = useAuthStore()
  const { lang } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)

    // Validate empty or zero
    if (!amount || parsedAmount <= 0) {
      toast.error(lang === 'ar' ? 'الرجاء إدخال كمية صالحة للاستهلاك' : 'Enter a valid amount')
      return
    }

    // Validate exceeds available quantity
    if (parsedAmount > chemical.quantity) {
      toast.error(
        lang === 'ar'
          ? `الكمية المطلوبة (${parsedAmount} ${chemical.quantity_unit}) تتجاوز المتاح (${chemical.quantity} ${chemical.quantity_unit}). الرجاء إدخال كمية أقل.`
          : `Requested amount (${parsedAmount} ${chemical.quantity_unit}) exceeds available stock (${chemical.quantity} ${chemical.quantity_unit}). Please enter a smaller amount.`
      )
      return
    }

    // Validate chemical is already depleted
    if (chemical.quantity <= 0) {
      toast.error(
        lang === 'ar'
          ? `المادة "${getTranslation(chemical, 'name', lang)}" نفدت بالكامل ولا يمكن سحب أي كمية منها.`
          : `"${chemical.name}" is completely out of stock. No usage can be reported.`
      )
      return
    }

    setLoading(true)
    const result = await reportUsage(chemical.id, parsedAmount, chemical.quantity_unit, purpose, user.id)
    setLoading(false)

    if (result.success) {
      const remainingQty = Math.max(0, chemical.quantity - parsedAmount)

      // Success toast
      toast.success(
        lang === 'ar'
          ? `تم تسجيل استهلاك ${parsedAmount} ${chemical.quantity_unit} بنجاح!`
          : `Successfully logged ${parsedAmount} ${chemical.quantity_unit} usage!`
      )

      // Out of stock alert
      if (remainingQty === 0) {
        setTimeout(() => {
          toast(
            lang === 'ar'
              ? `تنبيه: المادة "${getTranslation(chemical, 'name', lang)}" نفدت بالكامل! يرجى إعادة الطلب.`
              : `Alert: "${chemical.name}" is now completely out of stock! Please reorder.`,
            { icon: '🚨', duration: 6000, style: { background: '#FEE2E2', color: '#991B1B', fontWeight: 600 } }
          )
        }, 800)
      }
      // Low stock warning (less than 10% of original or below a threshold)
      else if (remainingQty > 0 && remainingQty <= chemical.quantity * 0.1) {
        setTimeout(() => {
          toast(
            lang === 'ar'
              ? `تحذير: الكمية المتبقية من "${getTranslation(chemical, 'name', lang)}" منخفضة جداً (${remainingQty} ${chemical.quantity_unit} فقط).`
              : `Warning: "${chemical.name}" stock is critically low (${remainingQty} ${chemical.quantity_unit} remaining).`,
            { icon: '⚠️', duration: 5000, style: { background: '#FEF3C7', color: '#92400E', fontWeight: 600 } }
          )
        }, 800)
      }

      onSuccess()
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  const chemName = getTranslation(chemical, 'name', lang)
  const isOutOfStock = chemical.quantity <= 0

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal-content p-6 w-full"
        style={{ maxWidth: '420px', direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading font-bold text-xl mb-1" style={{ color: '#2C3E50' }}>
          {lang === 'ar' ? 'تسجيل استهلاك مادة' : 'Report Usage'}
        </h3>
        <p className="text-sm mb-5 font-semibold" style={{ color: '#64748B' }}>
          {chemName} – {chemical.formula}
        </p>

        {isOutOfStock && (
          <div className="mb-4 p-3 rounded-xl text-sm font-semibold" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            {lang === 'ar' ? 'هذه المادة نفدت بالكامل. لا يمكن تسجيل استهلاك.' : 'This chemical is out of stock. Usage cannot be reported.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>
              {lang === 'ar' ? 'الكمية المستهلكة' : 'Amount used'} ({chemical.quantity_unit})
            </label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder={lang === 'ar' ? 'مثال: 50' : 'e.g. 50'} 
              className="input-field" 
              min="0.001" 
              step="0.001" 
              max={chemical.quantity} 
              disabled={isOutOfStock}
              style={parseFloat(amount) > chemical.quantity ? { borderColor: '#E85D5D', boxShadow: '0 0 0 2px rgba(232,93,93,0.2)' } : {}}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs" style={{ color: chemical.quantity <= 0 ? '#E85D5D' : '#94A3B8' }}>
                {lang === 'ar' ? 'المتاح:' : 'Available:'} {chemical.quantity} {chemical.quantity_unit}
              </p>
              {parseFloat(amount) > chemical.quantity && (
                <p className="text-xs font-semibold" style={{ color: '#E85D5D' }}>
                  {lang === 'ar' ? 'الكمية تتجاوز المتاح!' : 'Exceeds available!'}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>
              {lang === 'ar' ? 'الغرض من الاستخدام (اختياري)' : 'Purpose (optional)'}
            </label>
            <input 
              type="text" 
              value={purpose} 
              onChange={(e) => setPurpose(e.target.value)} 
              placeholder={lang === 'ar' ? 'مثال: تجربة معايرة حمضية' : 'e.g. Titration experiment'} 
              className="input-field" 
              disabled={isOutOfStock}
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <motion.button 
              type="submit" 
              disabled={loading || isOutOfStock} 
              className="btn-primary flex-1 justify-center ripple" 
              whileTap={{ scale: 0.97 }}
              style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {loading 
                ? (lang === 'ar' ? 'جاري التسجيل...' : 'Logging...') 
                : (lang === 'ar' ? 'تأكيد' : 'Submit')
              }
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function ChemicalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { chemicals, fetchChemicals } = useChemicalStore()
  const { profile } = useAuthStore()
  const [chemical, setChemical] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const [pubchemData, setPubchemData] = useState(null)
  const [openAccordion, setOpenAccordion] = useState(null)
  const [usageHistory, setUsageHistory] = useState([])
  const { lang } = useLanguage()
  const isAdmin = profile?.role === 'admin'

  const fetchChemicalAndLogs = async () => {
    if (chemicals.length === 0) await fetchChemicals()
    const { data } = await supabase.from('chemicals').select('*').eq('id', id).single()
    if (data) {
      setChemical(data)
      // Fetch PubChem data
      if (data.pubchem_cid) {
        fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${data.pubchem_cid}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`)
          .then(r => r.json()).then(d => setPubchemData(d?.PropertyTable?.Properties?.[0]))
          .catch(() => {})
      }
    }

    // Fetch usage logs for this chemical
    const { data: logs } = await supabase
      .from('usage_logs')
      .select('*, profiles(name)')
      .eq('chemical_id', id)
      .order('timestamp', { ascending: false })
    setUsageHistory(logs || [])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchChemicalAndLogs()
  }, [id])

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-64 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
      </div>
    </div>
  )

  if (!chemical) return (
    <div className="p-6 text-center">
      <p style={{ color: '#94A3B8' }}>
        {lang === 'ar' ? 'المادة الكيميائية غير موجودة' : 'Chemical not found'}
      </p>
    </div>
  )


  const h = hazardColors[chemical.hazard_level] || hazardColors.low
  const qrUrl = `${window.location.origin}/chemicals/${chemical.id}`
  const accordionItems = [
    { key: 'storage', title: lang === 'ar' ? 'شروط التخزين ورعاية السلامة' : 'Storage Conditions', content: getTranslation(chemical, 'storage_conditions', lang) },
    { key: 'firstaid', title: lang === 'ar' ? 'إجراءات الإسعافات الأولية الطارئة' : 'First Aid Measures', content: getTranslation(chemical, 'first_aid', lang) },
    { key: 'description', title: lang === 'ar' ? 'الوصف الكيميائي والخصائص العامة' : 'Description', content: getTranslation(chemical, 'description', lang) },
  ]

  const translatedName = getTranslation(chemical, 'name', lang)
  const translatedLocation = getTranslation(chemical, 'location', lang)
  const detailedData = getChemicalData(chemical.name) || chemical.detailed_data || null

  return (
    <div className={`p-4 lg:p-6 max-w-7xl mx-auto ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}>

      {/* Back */}
      <motion.button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-5 text-sm font-medium group"
        style={{ color: '#64748B' }}
        whileHover={lang === 'ar' ? { x: 3 } : { x: -3 }}
      >
        <ArrowLeft size={16} className="group-hover:text-blue-500 transition-colors" style={lang === 'ar' ? { transform: 'rotate(180deg)' } : {}} />
        {lang === 'ar' ? 'العودة إلى المواد الكيميائية' : 'Back to chemicals'}
      </motion.button>

      {/* ══════════════════════════════════════════════
          ZONE 1: Premium Top Row — Details (col-span-8) + Molecule Viewer (col-span-4)
         ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">
        
        {/* Main Info Card Banner (col-span-8) */}
        <div className="lg:col-span-8 flex">
          <motion.div 
            className="card p-5 w-full flex flex-col justify-between" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-heading font-bold text-2xl lg:text-3xl" style={{ color: '#2C3E50' }}>{translatedName}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-lg font-mono font-semibold" style={{ color: '#4A90E2' }}>{chemical.formula}</p>
                    {chemical.cas_number && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-500">
                        CAS: {chemical.cas_number}
                      </span>
                    )}
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-100 font-mono text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors"
                      title={lang === 'ar' ? 'انقر لنسخ المعرف' : 'Click to copy ID'}
                      onClick={() => {
                        navigator.clipboard.writeText(chemical.id)
                        toast.success(lang === 'ar' ? 'تم نسخ المعرف!' : 'ID copied to clipboard!')
                      }}
                    >
                      ID: {chemical.id}
                    </span>
                  </div>
                </div>
                <span className="badge flex-shrink-0" style={{ background: h.bg, color: h.color, padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  ⚠️ {getHazardLabel(chemical.hazard_level, lang)}
                </span>
              </div>

              {chemical.ghs_codes?.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold mb-2" style={{ color: '#64748B' }}>
                    {lang === 'ar' ? 'رموز خطورة GHS' : 'GHS Hazard Pictograms'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {chemical.ghs_codes.map((code, i) => (
                      <motion.div
                        key={code}
                        initial={{ opacity: 0, scale: 0 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08, type: 'spring' }}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl"
                        style={{ background: h.bg, minWidth: '55px' }}
                      >
                        <span className="text-xl">{GHSInfo[code]?.icon || '⚗️'}</span>
                        <span className="text-center font-bold" style={{ color: h.color, fontSize: '0.6rem' }}>
                          {getGHSName(code, lang)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Basic Info Horizontal Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              <div className="flex items-start gap-2 p-2.5 rounded-xl border border-neutral-100" style={{ background: '#F8F9FA' }}>
                <FlaskConical size={14} style={{ color: '#4A90E2', marginTop: '2px', flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    {lang === 'ar' ? 'الوزن الجزيئي' : 'Molecular Weight'}
                  </p>
                  <p className="text-xs font-bold mt-0.5 break-words" style={{ color: '#2C3E50' }}>
                    {chemical.molecular_weight ? `${chemical.molecular_weight} g/mol` : (lang === 'ar' ? 'غير متوفر' : 'N/A')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl border border-neutral-100" style={{ background: '#F8F9FA' }}>
                <Package size={14} style={{ color: '#4A90E2', marginTop: '2px', flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    {lang === 'ar' ? 'الكمية المتوفرة' : 'Quantity'}
                  </p>
                  <p className="text-xs font-bold mt-0.5 break-words" style={{ color: '#2C3E50' }}>
                    {chemical.quantity} {chemical.quantity_unit}
                  </p>
                </div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.03, backgroundColor: '#EBF4FF', borderColor: '#4A90E2' }}
                onClick={() => navigate(`/dashboard?selectChemicalId=${chemical.id}`)}
                className="flex items-start gap-2 p-2.5 rounded-xl border border-neutral-100 cursor-pointer transition-all duration-200" 
                style={{ background: '#F8F9FA' }}
              >
                <MapPin size={14} style={{ color: '#4A90E2', marginTop: '2px', flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    {lang === 'ar' ? 'موقع التخزين 🗺️' : 'Location 🗺️'}
                  </p>
                  <p className="text-xs font-bold mt-0.5 break-words text-blue-600 underline" style={{ textDecorationStyle: 'dashed' }}>
                    {translatedLocation} {chemical.cabinet ? `(${chemical.cabinet})` : ''}
                  </p>
                </div>
              </motion.div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl border border-neutral-100" style={{ background: '#F8F9FA' }}>
                <Calendar size={14} style={{ color: '#4A90E2', marginTop: '2px', flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    {lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                  </p>
                  <p className="text-xs font-bold mt-0.5 break-words" style={{ color: '#2C3E50' }}>
                    {chemical.expiry_date ? new Date(chemical.expiry_date).toLocaleDateString() : (lang === 'ar' ? 'غير محدد' : 'N/A')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Molecule 3D Model Card (col-span-4) */}
        <div className="lg:col-span-4 flex">
          <motion.div 
            className="card overflow-hidden w-full flex flex-col justify-center" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <MoleculeViewer formula={chemical.formula} name={chemical.name} hazardLevel={chemical.hazard_level} />
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ZONE 2: Two Parallel Details Columns (col-span-6 + col-span-6)
         ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-start">

        {/* LEFT COLUMN: Properties & Uses (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Physical & Chemical Properties Card (Compact 2-Column Grid) */}
          {detailedData && (
            <motion.div className="card p-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: '#F0F2F5' }}>
                <FlaskConical size={16} style={{ color: '#4A90E2' }} />
                <h3 className="font-bold text-sm" style={{ color: '#2C3E50' }}>
                  {lang === 'ar' ? 'الخصائص الفيزيائية والكيميائية' : 'Physical & Chemical Properties'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: lang === 'ar' ? 'درجة الغليان' : 'Boiling Point', value: detailedData.physical.boilingPoint[lang] || detailedData.physical.boilingPoint.en },
                  { label: lang === 'ar' ? 'درجة الانصهار' : 'Melting Point', value: detailedData.physical.meltingPoint[lang] || detailedData.physical.meltingPoint.en },
                  { label: lang === 'ar' ? 'الكثافة' : 'Density', value: detailedData.physical.density[lang] || detailedData.physical.density.en },
                  { label: lang === 'ar' ? 'الذوبانية' : 'Solubility', value: detailedData.physical.solubility[lang] || detailedData.physical.solubility.en },
                  { label: lang === 'ar' ? 'المظهر' : 'Appearance', value: detailedData.physical.appearance[lang] || detailedData.physical.appearance.en },
                  { label: lang === 'ar' ? 'الرائحة' : 'Odor', value: detailedData.physical.odor[lang] || detailedData.physical.odor.en },
                  { label: lang === 'ar' ? 'نقطة الوميض' : 'Flash Point', value: detailedData.physical.flashPoint[lang] || detailedData.physical.flashPoint.en },
                  { label: lang === 'ar' ? 'الضغط البخاري' : 'Vapor Pressure', value: detailedData.physical.vaporPressure[lang] || detailedData.physical.vaporPressure.en },
                  { label: lang === 'ar' ? 'الأس الهيدروجيني pH' : 'pH Level', value: detailedData.physical.ph[lang] || detailedData.physical.ph.en },
                  { label: lang === 'ar' ? 'التصنيف الكيميائي' : 'Chemical Class', value: detailedData.chemical.class[lang] || detailedData.chemical.class.en },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col p-2 rounded-lg border border-neutral-50" style={{ background: '#FAFBFD' }}>
                    <span className="font-semibold" style={{ color: '#94A3B8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                    <span className="font-semibold text-xs mt-0.5 leading-snug" style={{ color: '#2C3E50' }}>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Uses & Applications Card */}
          {detailedData && (
            <motion.div className="card p-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: '#F0F2F5' }}>
                <Activity size={16} style={{ color: '#5DB9A0' }} />
                <h3 className="font-bold text-sm" style={{ color: '#2C3E50' }}>
                  {lang === 'ar' ? 'الاستخدامات والتطبيقات' : 'Uses & Applications'}
                </h3>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(detailedData.uses[lang] || detailedData.uses.en).map((use, i) => (
                  <li key={i} className="flex items-start gap-1.5 p-2 rounded-lg border border-neutral-50" style={{ background: '#FAFBFD' }}>
                    <span className="text-emerald-500 font-bold text-xs select-none">•</span>
                    <span className="font-semibold text-xs leading-normal" style={{ color: '#475569' }}>{use}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* PubChem Link Button */}
          {chemical.pubchem_cid && (
            <motion.a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${chemical.pubchem_cid}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all shadow-sm"
              style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#1E293B' }}
              whileHover={{ scale: 1.01, borderColor: '#3B82F6', background: '#EFF6FF' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            >
              <div className="flex items-center gap-2">
                <Info size={14} style={{ color: '#3B82F6' }} />
                <span>{lang === 'ar' ? 'استعراض التفاصيل الكاملة على PubChem' : 'Explore detailed dossier on PubChem'}</span>
              </div>
              <ExternalLink size={13} style={{ color: '#94A3B8' }} />
            </motion.a>
          )}
        </div>

        {/* RIGHT COLUMN: Safety & Controls (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Safety & PPE Card */}
          {detailedData && (
            <motion.div className="card p-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: '#F0F2F5' }}>
                <Shield size={16} style={{ color: '#E85D5D' }} />
                <h3 className="font-bold text-sm" style={{ color: '#2C3E50' }}>
                  {lang === 'ar' ? 'السلامة ومعدات الحماية' : 'Safety & PPE'}
                </h3>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-3.5">
                {(detailedData.safety.ppe[lang] || detailedData.safety.ppe.en).map((item, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm"
                    style={{ background: '#FEF2F2', color: '#991B1B', borderColor: '#FCA5A5' }}>
                    🛡️ {item}
                  </span>
                ))}
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg border border-orange-100" style={{ background: '#FFF7ED' }}>
                  <p className="font-bold mb-0.5" style={{ color: '#92400E', fontSize: '0.62rem', textTransform: 'uppercase' }}>
                    {lang === 'ar' ? 'حدود التعرض الآمنة' : 'Exposure Limits'}
                  </p>
                  <p className="font-semibold leading-snug" style={{ color: '#78350F' }}>
                    {detailedData.safety.exposureLimits[lang] || detailedData.safety.exposureLimits.en}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-rose-100" style={{ background: '#FFF1F2' }}>
                  <p className="font-bold mb-0.5" style={{ color: '#9F1239', fontSize: '0.62rem', textTransform: 'uppercase' }}>
                    {lang === 'ar' ? 'السمية الحادة (LD₅₀)' : 'Acute Toxicity (LD₅₀)'}
                  </p>
                  <p className="font-semibold leading-snug" style={{ color: '#881337' }}>
                    {detailedData.safety.ldValue[lang] || detailedData.safety.ldValue.en}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-emerald-100" style={{ background: '#F0FFF4' }}>
                  <p className="font-bold mb-0.5" style={{ color: '#166534', fontSize: '0.62rem', textTransform: 'uppercase' }}>
                    {lang === 'ar' ? 'إطفاء الحريق' : 'Fire Extinguishing'}
                  </p>
                  <p className="font-semibold leading-snug" style={{ color: '#15803D' }}>
                    {detailedData.safety.fireExtinguishing[lang] || detailedData.safety.fireExtinguishing.en}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* NFPA Diamond Card */}
          {detailedData?.nfpa && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <NfpaDiamond ratings={detailedData.nfpa} lang={lang} />
            </motion.div>
          )}

          {/* QR Code (Admin only) */}
          {isAdmin && (
            <motion.div className="card p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm" style={{ color: '#2C3E50' }}>
                  {lang === 'ar' ? 'رمز QR للمادة' : 'QR Code'}
                </h3>
                <motion.button
                  onClick={() => setShowQR(!showQR)}
                  className="text-xs px-2.5 py-1 rounded-lg font-semibold shadow-sm"
                  style={{ background: '#EDE9FE', color: '#7C3AED' }}
                  whileHover={{ scale: 1.05 }}
                >
                  {showQR ? (lang === 'ar' ? 'إخفاء' : 'Hide') : (lang === 'ar' ? 'عرض' : 'Show')}
                </motion.button>
              </div>
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }} 
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="p-3 rounded-xl bg-white border border-neutral-200 shadow-sm">
                      <QRCode value={qrUrl} size={120} fgColor="#0F2D52" bgColor="#FFFFFF" level="H" />
                    </div>
                    <button
                      className="btn-secondary w-full justify-center py-2 text-xs"
                      onClick={() => {
                        const canvas = document.querySelector('canvas')
                        if (canvas) {
                          const link = document.createElement('a')
                          link.download = `${chemical.name}-QR.png`
                          link.href = canvas.toDataURL()
                          link.click()
                        }
                      }}
                    >
                      <Download size={13} /> {lang === 'ar' ? 'تحميل الرمز للأدمن' : 'Download QR Code'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {!showQR && (
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  {lang === 'ar' ? 'رمز الاستجابة السريعة متاح لعرضه وطباعته من قبل المسؤولين فقط.' : 'QR Code generation is restricted to administrative staff.'}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ZONE 3: Bottom Grid Area — Accordions LEFT (col-span-6) + History & Report RIGHT (col-span-6)
         ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-start">
        
        {/* LEFT column (col-span-6) — Accordions */}
        <div className="lg:col-span-6">
          <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            {accordionItems.map(({ key, title, content }, i) => (
              <div key={key} style={{ borderBottom: i < accordionItems.length - 1 ? '1px solid #F0F2F5' : 'none' }}>
                <motion.button
                  className="w-full flex items-center justify-between p-4 font-semibold text-sm transition-all"
                  style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                  onClick={() => setOpenAccordion(openAccordion === key ? null : key)}
                  whileHover={{ background: '#F8FAFC' }}
                >
                  <span style={{ color: '#2C3E50' }}>{title}</span>
                  <motion.span animate={{ rotate: openAccordion === key ? 180 : 0 }} style={{ color: '#94A3B8' }}>▼</motion.span>
                </motion.button>
                <AnimatePresence>
                  {openAccordion === key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} 
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-xs leading-relaxed font-semibold" style={{ color: '#64748B', textAlign: lang === 'ar' ? 'right' : 'left' }}>{content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT column (col-span-6) — History Log & Action Button */}
        <div className="lg:col-span-6 space-y-4">
          <motion.div className="card p-5 animate-fade-in" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: '#F0F2F5' }}>
              <FileText size={16} style={{ color: '#7C3AED' }} />
              <h3 className="font-bold text-sm" style={{ color: '#2C3E50' }}>
                {lang === 'ar' ? 'سجل الاستهلاك والعمليات الأخيرة' : 'Usage & History Log'}
              </h3>
              {usageHistory.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: '#EDE9FE', color: '#7C3AED', marginInlineStart: 'auto' }}>
                  {usageHistory.length}
                </span>
              )}
            </div>

            {usageHistory.length === 0 ? (
              <p className="text-xs text-center py-6 font-semibold" style={{ color: '#94A3B8' }}>
                {lang === 'ar' ? 'لا توجد أي عمليات استهلاك مسجلة لهذه المادة.' : 'No logged usage records for this chemical.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {usageHistory.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border" style={{ background: '#FAFBFD', borderColor: '#F0F2F5' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs" style={{ color: '#374151' }}>
                        {log.profiles?.name || (lang === 'ar' ? 'مستخدم' : 'User')}
                      </span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-xs">
                        -{log.amount_used} {log.unit}
                      </span>
                    </div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>
                      {log.purpose || (lang === 'ar' ? 'غير محدد' : 'Not specified')}
                    </p>
                    <p className="font-semibold" style={{ color: '#94A3B8', fontSize: '0.65rem' }}>
                      {new Date(log.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Action button (Report Usage) - aligned properly, not full width */}
          <div className={`flex ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
            <motion.button
              className="btn-primary px-6 py-2.5 ripple shadow-md text-xs font-bold"
              onClick={() => setShowReportModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            >
              <Package size={14} /> {lang === 'ar' ? 'تسجيل استهلاك المادة' : 'Report Usage'}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReportModal && (
          <ReportUsageModal
            chemical={chemical}
            onClose={() => setShowReportModal(false)}
            onSuccess={async () => {
              await fetchChemicals(true)
              await fetchChemicalAndLogs()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

