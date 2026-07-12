// Comprehensive Chemical Data for all default chemicals
// Contains: Physical Properties, Chemical Properties, Safety Data, Common Uses, NFPA Ratings, PubChem CIDs
// All data available in English and Arabic

const chemicalDatabase = {
  'Acetone': {
    physical: {
      boilingPoint: { en: '56.05 °C (132.89 °F)', ar: '56.05 درجة مئوية' },
      meltingPoint: { en: '-94.7 °C (-138.5 °F)', ar: '-94.7 درجة مئوية' },
      density: { en: '0.791 g/cm³', ar: '0.791 جم/سم³' },
      solubility: { en: 'Miscible with water in all proportions', ar: 'قابل للامتزاج مع الماء بجميع النسب' },
      appearance: { en: 'Colorless, volatile liquid', ar: 'سائل شفاف عديم اللون ومتطاير' },
      odor: { en: 'Pungent, fruity, mint-like', ar: 'رائحة نفاذة، فاكهية، شبيهة بالنعناع' },
      flashPoint: { en: '-20 °C (-4 °F)', ar: '-20 درجة مئوية' },
      vaporPressure: { en: '24 kPa at 20°C', ar: '24 كيلو باسكال عند 20 درجة مئوية' },
      ph: { en: '7 (neutral)', ar: '7 (متعادل)' },
    },
    chemical: {
      class: { en: 'Ketone (Organic Solvent)', ar: 'كيتون (مذيب عضوي)' },
      molecularStructure: { en: 'CH₃COCH₃ - Simplest ketone', ar: 'CH₃COCH₃ - أبسط أنواع الكيتونات' },
      reactivity: { en: 'Moderate - reacts with strong oxidizers', ar: 'متوسطة - يتفاعل مع المؤكسدات القوية' },
      incompatible: { en: 'Strong oxidizers, strong acids, strong bases, amines, chloroform', ar: 'المؤكسدات القوية، الأحماض القوية، القواعد القوية، الأمينات، الكلوروفورم' },
      stability: { en: 'Stable under normal conditions. May form explosive peroxides on prolonged storage.', ar: 'مستقر في الظروف العادية. قد يشكل بيروكسيدات متفجرة عند التخزين المطول.' },
      decomposition: { en: 'CO, CO₂ when burned', ar: 'أول أكسيد الكربون وثاني أكسيد الكربون عند الاحتراق' },
    },
    safety: {
      ppe: {
        en: ['Safety goggles/splash shield', 'Chemical-resistant gloves (nitrile)', 'Lab coat', 'Use in fume hood'],
        ar: ['نظارات أمان/درع واقي', 'قفازات مقاومة للكيماويات (نيتريل)', 'معطف مختبر', 'يُستخدم داخل خزانة الأبخرة']
      },
      exposureLimits: { en: 'TWA: 250 ppm (590 mg/m³) | STEL: 500 ppm', ar: 'متوسط التعرض: 250 جزء في المليون | الحد قصير المدى: 500 جزء في المليون' },
      fireExtinguishing: { en: 'CO₂, dry chemical powder, alcohol-resistant foam. Water spray to cool fire-exposed containers.', ar: 'ثاني أكسيد الكربون، مسحوق كيميائي جاف، رغوة مقاومة للكحول. رذاذ ماء لتبريد الحاويات المعرضة للحريق.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 5,800 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 5,800 ملغ/كغ' },
    },
    uses: {
      en: ['Laboratory solvent for cleaning glassware', 'Organic synthesis intermediate', 'Nail polish remover', 'Paint and varnish thinner', 'Pharmaceutical manufacturing', 'Dehydrating agent'],
      ar: ['مذيب مختبري لتنظيف الأدوات الزجاجية', 'وسيط في التخليق العضوي', 'مزيل طلاء الأظافر', 'مخفف الدهانات والورنيش', 'تصنيع الأدوية', 'عامل تجفيف']
    },
    nfpa: { health: 1, flammability: 3, reactivity: 0, special: '' },
    pubchemCid: 180,
  },

  'Ammonia Solution': {
    physical: {
      boilingPoint: { en: '38 °C (100.4 °F) for 25% solution', ar: '38 درجة مئوية لمحلول 25%' },
      meltingPoint: { en: '-57.5 °C (-71.5 °F)', ar: '-57.5 درجة مئوية' },
      density: { en: '0.91 g/cm³ (25% solution)', ar: '0.91 جم/سم³ (محلول 25%)' },
      solubility: { en: 'Highly soluble in water (exothermic dissolution)', ar: 'عالي الذوبانية في الماء (ذوبان طارد للحرارة)' },
      appearance: { en: 'Colorless liquid', ar: 'سائل شفاف عديم اللون' },
      odor: { en: 'Strong, pungent, suffocating', ar: 'رائحة قوية ونفاذة وخانقة' },
      flashPoint: { en: 'Not flammable in aqueous solution', ar: 'غير قابل للاشتعال في المحلول المائي' },
      vaporPressure: { en: '287 kPa at 26°C', ar: '287 كيلو باسكال عند 26 درجة مئوية' },
      ph: { en: '11.6 (1% solution, strongly alkaline)', ar: '11.6 (محلول 1%، قلوي قوي)' },
    },
    chemical: {
      class: { en: 'Inorganic Base (Alkaline Solution)', ar: 'قاعدة غير عضوية (محلول قلوي)' },
      molecularStructure: { en: 'NH₃·H₂O - Ammonium hydroxide', ar: 'NH₃·H₂O - هيدروكسيد الأمونيوم' },
      reactivity: { en: 'Reacts vigorously with acids (neutralization)', ar: 'يتفاعل بقوة مع الأحماض (معادلة)' },
      incompatible: { en: 'Strong acids, halogens, mercury, calcium hypochlorite, oxidizers', ar: 'الأحماض القوية، الهالوجينات، الزئبق، هيبوكلوريت الكالسيوم، المؤكسدات' },
      stability: { en: 'Stable, but releases ammonia gas readily upon heating', ar: 'مستقر، لكنه يطلق غاز الأمونيا بسهولة عند التسخين' },
      decomposition: { en: 'NH₃ gas, nitrogen oxides at high temperature', ar: 'غاز الأمونيا وأكاسيد النيتروجين عند درجات الحرارة المرتفعة' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles', 'Butyl rubber or nitrile gloves', 'Lab coat with closed collar', 'Work in fume hood (mandatory)'],
        ar: ['نظارات واقية من الرذاذ الكيميائي', 'قفازات بوتيل أو نيتريل', 'معطف مختبر بياقة مغلقة', 'العمل داخل خزانة الأبخرة (إلزامي)']
      },
      exposureLimits: { en: 'TWA: 25 ppm | STEL: 35 ppm', ar: 'متوسط التعرض: 25 جزء في المليون | الحد قصير المدى: 35 جزء في المليون' },
      fireExtinguishing: { en: 'Water spray, dry chemical, CO₂. Ammonia gas is flammable at high concentrations.', ar: 'رذاذ ماء، مسحوق كيميائي جاف، ثاني أكسيد الكربون. غاز الأمونيا قابل للاشتعال بتركيزات عالية.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 350 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 350 ملغ/كغ' },
    },
    uses: {
      en: ['pH adjustment in laboratory reactions', 'Cleaning agent for laboratory equipment', 'Qualitative analysis reagent', 'Fertilizer manufacturing', 'Complexometric titrations', 'Refrigeration systems'],
      ar: ['ضبط الأس الهيدروجيني في التفاعلات المخبرية', 'عامل تنظيف للمعدات المخبرية', 'كاشف التحليل النوعي', 'تصنيع الأسمدة', 'المعايرات المركبية', 'أنظمة التبريد']
    },
    nfpa: { health: 3, flammability: 1, reactivity: 0, special: '' },
    pubchemCid: 222,
  },

  'Benzene': {
    physical: {
      boilingPoint: { en: '80.1 °C (176.2 °F)', ar: '80.1 درجة مئوية' },
      meltingPoint: { en: '5.5 °C (41.9 °F)', ar: '5.5 درجة مئوية' },
      density: { en: '0.879 g/cm³', ar: '0.879 جم/سم³' },
      solubility: { en: 'Slightly soluble in water (1.8 g/L at 25°C)', ar: 'ضعيف الذوبانية في الماء (1.8 جم/لتر عند 25 درجة مئوية)' },
      appearance: { en: 'Colorless to light yellow liquid', ar: 'سائل عديم اللون إلى أصفر فاتح' },
      odor: { en: 'Sweet, aromatic, gasoline-like', ar: 'رائحة حلوة وعطرية شبيهة بالبنزين' },
      flashPoint: { en: '-11.1 °C (12 °F)', ar: '-11.1 درجة مئوية' },
      vaporPressure: { en: '12.7 kPa at 25°C', ar: '12.7 كيلو باسكال عند 25 درجة مئوية' },
      ph: { en: '7 (neutral)', ar: '7 (متعادل)' },
    },
    chemical: {
      class: { en: 'Aromatic Hydrocarbon', ar: 'هيدروكربون عطري' },
      molecularStructure: { en: 'C₆H₆ - Planar hexagonal ring with delocalized π electrons', ar: 'C₆H₆ - حلقة سداسية مسطحة بإلكترونات باي منتشرة' },
      reactivity: { en: 'Undergoes electrophilic aromatic substitution', ar: 'يخضع لتفاعلات الاستبدال العطري الإلكتروفيلي' },
      incompatible: { en: 'Strong oxidizers, nitric acid, sulfuric acid, halogens, permanganates', ar: 'المؤكسدات القوية، حمض النيتريك، حمض الكبريتيك، الهالوجينات، البرمنجنات' },
      stability: { en: 'Stable under normal conditions', ar: 'مستقر في الظروف العادية' },
      decomposition: { en: 'CO, CO₂, soot when burned incompletely', ar: 'أول أكسيد الكربون وثاني أكسيد الكربون والسخام عند الاحتراق غير الكامل' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles', 'Butyl rubber gloves', 'Lab coat', 'Work in fume hood ONLY', 'Respiratory protection for spills'],
        ar: ['نظارات واقية من الرذاذ الكيميائي', 'قفازات بوتيل', 'معطف مختبر', 'يُستخدم فقط داخل خزانة الأبخرة', 'حماية الجهاز التنفسي عند الانسكابات']
      },
      exposureLimits: { en: 'TWA: 0.5 ppm | STEL: 2.5 ppm (KNOWN CARCINOGEN)', ar: 'متوسط التعرض: 0.5 جزء في المليون | الحد قصير المدى: 2.5 جزء في المليون (مسرطن معروف)' },
      fireExtinguishing: { en: 'Dry chemical, CO₂, foam. Do NOT use water jet - may spread fire.', ar: 'مسحوق كيميائي جاف، ثاني أكسيد الكربون، رغوة. لا تستخدم نفاث الماء - قد ينشر الحريق.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 930 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 930 ملغ/كغ' },
    },
    uses: {
      en: ['Organic synthesis (Friedel-Crafts reactions)', 'Solvent in research laboratories', 'Precursor for styrene, phenol, cyclohexane', 'Spectroscopy standard', 'Petrochemical industry', 'Rubber manufacturing'],
      ar: ['التخليق العضوي (تفاعلات فريدل-كرافتس)', 'مذيب في مختبرات الأبحاث', 'سلف للستايرين والفينول والسيكلوهكسان', 'معيار قياس في التحليل الطيفي', 'الصناعات البتروكيميائية', 'تصنيع المطاط']
    },
    nfpa: { health: 2, flammability: 3, reactivity: 0, special: '' },
    pubchemCid: 241,
  },

  'Calcium Carbonate': {
    physical: {
      boilingPoint: { en: 'Decomposes at 840 °C', ar: 'يتحلل عند 840 درجة مئوية' },
      meltingPoint: { en: '825 °C (calcite form)', ar: '825 درجة مئوية (صورة الكالسيت)' },
      density: { en: '2.71 g/cm³', ar: '2.71 جم/سم³' },
      solubility: { en: 'Practically insoluble in water (0.013 g/L)', ar: 'غير قابل للذوبان عملياً في الماء (0.013 جم/لتر)' },
      appearance: { en: 'White, odorless powder or crystals', ar: 'مسحوق أو بلورات بيضاء عديمة الرائحة' },
      odor: { en: 'Odorless', ar: 'عديم الرائحة' },
      flashPoint: { en: 'Non-flammable', ar: 'غير قابل للاشتعال' },
      vaporPressure: { en: 'Negligible', ar: 'ضئيل' },
      ph: { en: '9.5 (saturated solution, alkaline)', ar: '9.5 (محلول مشبع، قلوي)' },
    },
    chemical: {
      class: { en: 'Inorganic Salt (Carbonate)', ar: 'ملح غير عضوي (كربونات)' },
      molecularStructure: { en: 'CaCO₃ - Ionic compound with Ca²⁺ and CO₃²⁻', ar: 'CaCO₃ - مركب أيوني مكون من Ca²⁺ وCO₃²⁻' },
      reactivity: { en: 'Reacts with acids producing CO₂ effervescence', ar: 'يتفاعل مع الأحماض مع إنتاج فوران ثاني أكسيد الكربون' },
      incompatible: { en: 'Acids, fluorine, ammonium salts, alum', ar: 'الأحماض، الفلور، أملاح الأمونيوم، الشبّة' },
      stability: { en: 'Very stable. Decomposes to CaO + CO₂ at high temperature.', ar: 'مستقر جداً. يتحلل إلى CaO + CO₂ عند درجات حرارة مرتفعة.' },
      decomposition: { en: 'CaO (quicklime) + CO₂ above 840°C', ar: 'أكسيد الكالسيوم (الجير الحي) + ثاني أكسيد الكربون فوق 840 درجة مئوية' },
    },
    safety: {
      ppe: {
        en: ['Safety glasses', 'Dust mask for powder handling', 'Lab gloves', 'Lab coat'],
        ar: ['نظارات أمان', 'قناع للغبار عند التعامل مع المسحوق', 'قفازات مخبرية', 'معطف مختبر']
      },
      exposureLimits: { en: 'TWA: 10 mg/m³ (total dust)', ar: 'متوسط التعرض: 10 ملغ/م³ (الغبار الكلي)' },
      fireExtinguishing: { en: 'Non-combustible. Use appropriate media for surrounding fire.', ar: 'غير قابل للاحتراق. استخدم وسائل الإطفاء المناسبة للحريق المحيط.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 6,450 mg/kg (low toxicity)', ar: 'الجرعة المميتة (فموي، فأر): 6,450 ملغ/كغ (سمية منخفضة)' },
    },
    uses: {
      en: ['Antacid in pharmaceutical preparations', 'Calcium supplement', 'pH buffering agent', 'Construction material (limestone, marble)', 'Toothpaste filler', 'Paper and paint filler'],
      ar: ['مضاد للحموضة في المستحضرات الصيدلانية', 'مكمل غذائي للكالسيوم', 'عامل تنظيم الأس الهيدروجيني', 'مادة بناء (حجر جيري، رخام)', 'مادة مالئة في معجون الأسنان', 'مادة مالئة في الورق والدهانات']
    },
    nfpa: { health: 1, flammability: 0, reactivity: 0, special: '' },
    pubchemCid: 10112,
  },

  'Copper Sulfate': {
    physical: {
      boilingPoint: { en: 'Decomposes above 650 °C', ar: 'يتحلل فوق 650 درجة مئوية' },
      meltingPoint: { en: '110 °C (loses water), 560 °C (anhydrous)', ar: '110 درجة مئوية (يفقد الماء)، 560 درجة مئوية (لا مائي)' },
      density: { en: '2.286 g/cm³ (pentahydrate)', ar: '2.286 جم/سم³ (خماسي الهيدرات)' },
      solubility: { en: '316 g/L at 20°C (highly soluble)', ar: '316 جم/لتر عند 20 درجة مئوية (عالي الذوبانية)' },
      appearance: { en: 'Blue crystals (pentahydrate) or white powder (anhydrous)', ar: 'بلورات زرقاء (خماسي الهيدرات) أو مسحوق أبيض (لا مائي)' },
      odor: { en: 'Odorless', ar: 'عديم الرائحة' },
      flashPoint: { en: 'Non-flammable', ar: 'غير قابل للاشتعال' },
      vaporPressure: { en: 'Negligible', ar: 'ضئيل' },
      ph: { en: '4.0 (acidic in solution)', ar: '4.0 (حمضي في المحلول)' },
    },
    chemical: {
      class: { en: 'Inorganic Salt (Transition Metal Sulfate)', ar: 'ملح غير عضوي (كبريتات معدن انتقالي)' },
      molecularStructure: { en: 'CuSO₄·5H₂O - Copper(II) sulfate pentahydrate', ar: 'CuSO₄·5H₂O - كبريتات النحاس(II) خماسية الهيدرات' },
      reactivity: { en: 'Strong oxidizer in concentrated form', ar: 'مؤكسد قوي في الصورة المركزة' },
      incompatible: { en: 'Magnesium, sodium, hydroxylamine, acetylene, zinc', ar: 'المغنيسيوم، الصوديوم، الهيدروكسيل أمين، الأسيتيلين، الزنك' },
      stability: { en: 'Stable. Loses water of crystallization on heating.', ar: 'مستقر. يفقد ماء التبلور عند التسخين.' },
      decomposition: { en: 'Sulfur oxides, copper oxide at very high temperatures', ar: 'أكاسيد الكبريت وأكسيد النحاس عند درجات حرارة عالية جداً' },
    },
    safety: {
      ppe: {
        en: ['Safety goggles', 'Chemical-resistant gloves', 'Lab coat', 'Avoid breathing dust'],
        ar: ['نظارات أمان', 'قفازات مقاومة للكيماويات', 'معطف مختبر', 'تجنب استنشاق الغبار']
      },
      exposureLimits: { en: 'TWA: 1 mg/m³ (as Cu dust)', ar: 'متوسط التعرض: 1 ملغ/م³ (كغبار نحاس)' },
      fireExtinguishing: { en: 'Non-combustible. Use water spray for surrounding fire.', ar: 'غير قابل للاحتراق. استخدم رذاذ الماء للحريق المحيط.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 300 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 300 ملغ/كغ' },
    },
    uses: {
      en: ['Biuret test for proteins', 'Benedict\'s reagent preparation', 'Electroplating solutions', 'Fungicide (Bordeaux mixture)', 'Water treatment', 'Analytical chemistry reagent'],
      ar: ['اختبار البيوريت للبروتينات', 'تحضير كاشف بنديكت', 'محاليل الطلاء الكهربائي', 'مبيد فطري (خليط بوردو)', 'معالجة المياه', 'كاشف في الكيمياء التحليلية']
    },
    nfpa: { health: 2, flammability: 0, reactivity: 0, special: '' },
    pubchemCid: 24462,
  },

  'Ethanol': {
    physical: {
      boilingPoint: { en: '78.37 °C (173.1 °F)', ar: '78.37 درجة مئوية' },
      meltingPoint: { en: '-114.1 °C (-173.5 °F)', ar: '-114.1 درجة مئوية' },
      density: { en: '0.789 g/cm³', ar: '0.789 جم/سم³' },
      solubility: { en: 'Miscible with water in all proportions', ar: 'قابل للامتزاج مع الماء بجميع النسب' },
      appearance: { en: 'Colorless, volatile liquid', ar: 'سائل شفاف عديم اللون ومتطاير' },
      odor: { en: 'Pleasant, wine-like, slightly sweet', ar: 'رائحة لطيفة، شبيهة بالنبيذ، حلوة قليلاً' },
      flashPoint: { en: '16.6 °C (61.9 °F)', ar: '16.6 درجة مئوية' },
      vaporPressure: { en: '5.95 kPa at 20°C', ar: '5.95 كيلو باسكال عند 20 درجة مئوية' },
      ph: { en: '7.33 (nearly neutral)', ar: '7.33 (شبه متعادل)' },
    },
    chemical: {
      class: { en: 'Primary Alcohol (Organic Solvent)', ar: 'كحول أولي (مذيب عضوي)' },
      molecularStructure: { en: 'C₂H₅OH - Ethyl alcohol with hydroxyl group', ar: 'C₂H₅OH - كحول إيثيلي مع مجموعة هيدروكسيل' },
      reactivity: { en: 'Reacts with alkali metals, strong oxidizers, acids', ar: 'يتفاعل مع الفلزات القلوية والمؤكسدات القوية والأحماض' },
      incompatible: { en: 'Strong oxidizers, acetyl chloride, chromyl chloride, nitric acid, perchlorates', ar: 'المؤكسدات القوية، كلوريد الأسيتيل، كلوريد الكروميل، حمض النيتريك، البركلورات' },
      stability: { en: 'Stable under normal conditions. Hygroscopic.', ar: 'مستقر في الظروف العادية. ماص للرطوبة.' },
      decomposition: { en: 'CO, CO₂ when burned', ar: 'أول أكسيد الكربون وثاني أكسيد الكربون عند الاحتراق' },
    },
    safety: {
      ppe: {
        en: ['Safety goggles', 'Nitrile gloves', 'Lab coat', 'Use in fume hood for large volumes'],
        ar: ['نظارات أمان', 'قفازات نيتريل', 'معطف مختبر', 'يُستخدم في خزانة الأبخرة للكميات الكبيرة']
      },
      exposureLimits: { en: 'TWA: 1,000 ppm (1,880 mg/m³)', ar: 'متوسط التعرض: 1,000 جزء في المليون' },
      fireExtinguishing: { en: 'Alcohol-resistant foam, CO₂, dry chemical. Water may be ineffective.', ar: 'رغوة مقاومة للكحول، ثاني أكسيد الكربون، مسحوق كيميائي جاف. قد يكون الماء غير فعال.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 7,060 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 7,060 ملغ/كغ' },
    },
    uses: {
      en: ['Disinfection and sterilization', 'Solvent for organic reactions', 'Histological tissue preservation', 'Fuel (bioethanol)', 'Beverage production', 'Extraction solvent in pharmacology'],
      ar: ['التطهير والتعقيم', 'مذيب للتفاعلات العضوية', 'حفظ الأنسجة النسيجية', 'وقود (الإيثانول الحيوي)', 'إنتاج المشروبات', 'مذيب استخلاص في علم الأدوية']
    },
    nfpa: { health: 0, flammability: 3, reactivity: 0, special: '' },
    pubchemCid: 702,
  },

  'Glucose': {
    physical: {
      boilingPoint: { en: 'Decomposes before boiling', ar: 'يتحلل قبل الغليان' },
      meltingPoint: { en: '146 °C (α-D-glucose)', ar: '146 درجة مئوية (ألفا-د-جلوكوز)' },
      density: { en: '1.54 g/cm³', ar: '1.54 جم/سم³' },
      solubility: { en: '909 g/L at 25°C (very highly soluble)', ar: '909 جم/لتر عند 25 درجة مئوية (ذوبانية عالية جداً)' },
      appearance: { en: 'White crystalline powder', ar: 'مسحوق بلوري أبيض' },
      odor: { en: 'Odorless, sweet taste', ar: 'عديم الرائحة، طعم حلو' },
      flashPoint: { en: 'Not applicable (solid)', ar: 'غير قابل للتطبيق (صلب)' },
      vaporPressure: { en: 'Negligible', ar: 'ضئيل' },
      ph: { en: '5.9 (10% solution)', ar: '5.9 (محلول 10%)' },
    },
    chemical: {
      class: { en: 'Monosaccharide (Simple Sugar, Aldohexose)', ar: 'سكر أحادي (سكر بسيط، ألدوهكسوز)' },
      molecularStructure: { en: 'C₆H₁₂O₆ - Six-carbon aldehyde sugar with ring structure', ar: 'C₆H₁₂O₆ - سكر ألدهيدي سداسي الكربون بتركيب حلقي' },
      reactivity: { en: 'Reducing sugar - reacts with Benedict\'s and Fehling\'s reagents', ar: 'سكر مختزل - يتفاعل مع كاشفي بنديكت وفهلنج' },
      incompatible: { en: 'Strong oxidizers, strong acids', ar: 'المؤكسدات القوية، الأحماض القوية' },
      stability: { en: 'Stable. May caramelize above 160°C.', ar: 'مستقر. قد يتكرمل فوق 160 درجة مئوية.' },
      decomposition: { en: 'CO₂, H₂O upon combustion', ar: 'ثاني أكسيد الكربون وماء عند الاحتراق' },
    },
    safety: {
      ppe: {
        en: ['Safety glasses', 'Lab gloves (optional)', 'Lab coat', 'Dust mask for fine powder'],
        ar: ['نظارات أمان', 'قفازات مخبرية (اختياري)', 'معطف مختبر', 'قناع غبار للمسحوق الناعم']
      },
      exposureLimits: { en: 'No specific OEL established (low hazard)', ar: 'لا يوجد حد تعرض محدد (خطورة منخفضة)' },
      fireExtinguishing: { en: 'Water spray, foam, CO₂, dry chemical.', ar: 'رذاذ ماء، رغوة، ثاني أكسيد الكربون، مسحوق كيميائي جاف.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 25,800 mg/kg (practically non-toxic)', ar: 'الجرعة المميتة (فموي، فأر): 25,800 ملغ/كغ (غير سام عملياً)' },
    },
    uses: {
      en: ['Biochemical assays and fermentation studies', 'Cell culture media component', 'Energy source in microbiology', 'Pharmaceutical excipient', 'Food industry sweetener', 'IV fluid preparations'],
      ar: ['الاختبارات البيوكيميائية ودراسات التخمر', 'مكون في وسط استنبات الخلايا', 'مصدر طاقة في علم الأحياء الدقيقة', 'سواغ صيدلاني', 'مُحلي في الصناعات الغذائية', 'تحضير المحاليل الوريدية']
    },
    nfpa: { health: 0, flammability: 1, reactivity: 0, special: '' },
    pubchemCid: 5793,
  },

  'Hydrochloric Acid': {
    physical: {
      boilingPoint: { en: '110 °C (concentrated, 37%)', ar: '110 درجة مئوية (مركز، 37%)' },
      meltingPoint: { en: '-26 °C (37% solution)', ar: '-26 درجة مئوية (محلول 37%)' },
      density: { en: '1.19 g/cm³ (37%)', ar: '1.19 جم/سم³ (37%)' },
      solubility: { en: 'Miscible with water (exothermic)', ar: 'قابل للامتزاج مع الماء (طارد للحرارة)' },
      appearance: { en: 'Colorless to yellowish fuming liquid', ar: 'سائل شفاف إلى أصفر مائل مع أبخرة' },
      odor: { en: 'Pungent, irritating, acrid', ar: 'رائحة نفاذة ومهيجة وحادة' },
      flashPoint: { en: 'Non-flammable', ar: 'غير قابل للاشتعال' },
      vaporPressure: { en: '16.5 kPa at 20°C', ar: '16.5 كيلو باسكال عند 20 درجة مئوية' },
      ph: { en: '< 1 (strongly acidic)', ar: '< 1 (حمضي قوي جداً)' },
    },
    chemical: {
      class: { en: 'Strong Inorganic Acid (Mineral Acid)', ar: 'حمض غير عضوي قوي (حمض معدني)' },
      molecularStructure: { en: 'HCl - Hydrogen chloride in aqueous solution', ar: 'HCl - كلوريد الهيدروجين في محلول مائي' },
      reactivity: { en: 'Highly reactive with metals, bases, and many organic compounds', ar: 'شديد التفاعل مع المعادن والقواعد والعديد من المركبات العضوية' },
      incompatible: { en: 'Metals, amines, strong bases (NaOH, KOH), oxidizers, permanganates', ar: 'المعادن، الأمينات، القواعد القوية (NaOH, KOH)، المؤكسدات، البرمنجنات' },
      stability: { en: 'Stable. Concentrated solutions release HCl fumes.', ar: 'مستقر. المحاليل المركزة تطلق أبخرة HCl.' },
      decomposition: { en: 'HCl gas, hydrogen, chlorine at very high temperatures', ar: 'غاز HCl والهيدروجين والكلور عند درجات حرارة عالية جداً' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles', 'Acid-resistant gloves (PVC/neoprene)', 'Rubber apron', 'Work in fume hood ALWAYS', 'Face shield for concentrated acid'],
        ar: ['نظارات واقية من الرذاذ الكيميائي', 'قفازات مقاومة للأحماض (PVC/نيوبرين)', 'مريلة مطاطية', 'يُستخدم دائماً في خزانة الأبخرة', 'واقي وجه للحمض المركز']
      },
      exposureLimits: { en: 'TWA: 2 ppm (ceiling) | STEL: 5 ppm', ar: 'حد السقف: 2 جزء في المليون | الحد قصير المدى: 5 أجزاء في المليون' },
      fireExtinguishing: { en: 'Non-combustible. Use water spray to dilute spills. Neutralize with soda ash or lime.', ar: 'غير قابل للاحتراق. استخدم رذاذ الماء لتخفيف الانسكابات. يُعادل برماد الصودا أو الجير.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 900 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 900 ملغ/كغ' },
    },
    uses: {
      en: ['pH adjustment in chemical reactions', 'Metal cleaning and pickling', 'Titration standard (acidimetry)', 'Food processing (E507)', 'Ore processing in mining', 'Stomach acid simulation in pharmacy'],
      ar: ['ضبط الأس الهيدروجيني في التفاعلات الكيميائية', 'تنظيف المعادن والتخليل', 'معيار المعايرة (قياس الحمضية)', 'معالجة الأغذية (E507)', 'معالجة الخامات في التعدين', 'محاكاة حمض المعدة في الصيدلة']
    },
    nfpa: { health: 3, flammability: 0, reactivity: 1, special: '' },
    pubchemCid: 313,
  },

  'Hydrogen Peroxide': {
    physical: {
      boilingPoint: { en: '150.2 °C (pure) / 103 °C (30%)', ar: '150.2 درجة مئوية (نقي) / 103 (30%)' },
      meltingPoint: { en: '-0.43 °C', ar: '-0.43 درجة مئوية' },
      density: { en: '1.11 g/cm³ (30%)', ar: '1.11 جم/سم³ (30%)' },
      solubility: { en: 'Miscible with water in all proportions', ar: 'قابل للامتزاج مع الماء بجميع النسب' },
      appearance: { en: 'Colorless liquid (slightly viscous when concentrated)', ar: 'سائل عديم اللون (لزج قليلاً عند التركيز)' },
      odor: { en: 'Slightly sharp, acidic odor', ar: 'رائحة حادة قليلاً وحمضية' },
      flashPoint: { en: 'Non-flammable but strong oxidizer', ar: 'غير قابل للاشتعال لكنه مؤكسد قوي' },
      vaporPressure: { en: '2.0 kPa at 25°C (30%)', ar: '2.0 كيلو باسكال عند 25 درجة مئوية (30%)' },
      ph: { en: '4.5 (30% solution)', ar: '4.5 (محلول 30%)' },
    },
    chemical: {
      class: { en: 'Peroxide (Strong Oxidizing Agent)', ar: 'بيروكسيد (عامل مؤكسد قوي)' },
      molecularStructure: { en: 'H₂O₂ - Simplest peroxide with O-O single bond', ar: 'H₂O₂ - أبسط بيروكسيد مع رابطة O-O أحادية' },
      reactivity: { en: 'Powerful oxidizer. Decomposes catalytically with MnO₂, Fe³⁺, catalase', ar: 'مؤكسد قوي. يتحلل محفزياً مع MnO₂ وFe³⁺ والكاتالاز' },
      incompatible: { en: 'Organic materials, metals (Fe, Cu, Mn), reducing agents, combustibles', ar: 'المواد العضوية، المعادن (Fe, Cu, Mn)، العوامل المختزلة، المواد القابلة للاحتراق' },
      stability: { en: 'Slowly decomposes to water and oxygen. Light and heat accelerate decomposition.', ar: 'يتحلل ببطء إلى ماء وأكسجين. الضوء والحرارة يسرعان التحلل.' },
      decomposition: { en: '2H₂O₂ → 2H₂O + O₂ (exothermic)', ar: '2H₂O₂ → 2H₂O + O₂ (تفاعل طارد للحرارة)' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles', 'Nitrile or rubber gloves', 'Lab coat', 'Face shield for concentrated (>30%)', 'Fume hood recommended'],
        ar: ['نظارات واقية من الرذاذ', 'قفازات نيتريل أو مطاط', 'معطف مختبر', 'واقي وجه للمركز (>30%)', 'يُوصى بخزانة الأبخرة']
      },
      exposureLimits: { en: 'TWA: 1 ppm (1.4 mg/m³)', ar: 'متوسط التعرض: 1 جزء في المليون (1.4 ملغ/م³)' },
      fireExtinguishing: { en: 'Water spray (copious amounts). Do NOT use dry chemical or CO₂.', ar: 'رذاذ ماء (كميات كبيرة). لا تستخدم المسحوق الكيميائي الجاف أو ثاني أكسيد الكربون.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 376 mg/kg (30%)', ar: 'الجرعة المميتة (فموي، فأر): 376 ملغ/كغ (30%)' },
    },
    uses: {
      en: ['Oxidizing agent in organic synthesis', 'Bleaching agent', 'Wound disinfectant (3%)', 'Fenton reagent preparation', 'Rocket propellant oxidizer', 'Environmental water treatment'],
      ar: ['عامل مؤكسد في التخليق العضوي', 'عامل تبييض', 'مطهر جروح (3%)', 'تحضير كاشف فنتون', 'مؤكسد لوقود الصواريخ', 'معالجة المياه البيئية']
    },
    nfpa: { health: 2, flammability: 0, reactivity: 1, special: 'OX' },
    pubchemCid: 784,
  },

  'Methanol': {
    physical: {
      boilingPoint: { en: '64.7 °C (148.5 °F)', ar: '64.7 درجة مئوية' },
      meltingPoint: { en: '-97.6 °C (-143.7 °F)', ar: '-97.6 درجة مئوية' },
      density: { en: '0.792 g/cm³', ar: '0.792 جم/سم³' },
      solubility: { en: 'Miscible with water', ar: 'قابل للامتزاج مع الماء' },
      appearance: { en: 'Colorless, volatile liquid', ar: 'سائل شفاف عديم اللون ومتطاير' },
      odor: { en: 'Faint alcoholic odor', ar: 'رائحة كحولية خفيفة' },
      flashPoint: { en: '11 °C (52 °F)', ar: '11 درجة مئوية' },
      vaporPressure: { en: '13.02 kPa at 20°C', ar: '13.02 كيلو باسكال عند 20 درجة مئوية' },
      ph: { en: '7 (neutral)', ar: '7 (متعادل)' },
    },
    chemical: {
      class: { en: 'Primary Alcohol (Toxic Organic Solvent)', ar: 'كحول أولي (مذيب عضوي سام)' },
      molecularStructure: { en: 'CH₃OH - Simplest alcohol (methyl alcohol)', ar: 'CH₃OH - أبسط كحول (كحول ميثيلي)' },
      reactivity: { en: 'Burns with nearly invisible blue flame. Reacts with strong oxidizers.', ar: 'يحترق بلهب أزرق شبه غير مرئي. يتفاعل مع المؤكسدات القوية.' },
      incompatible: { en: 'Strong oxidizers, acids, acid anhydrides, alkali metals', ar: 'المؤكسدات القوية، الأحماض، أنهيدريدات الأحماض، الفلزات القلوية' },
      stability: { en: 'Stable under normal conditions', ar: 'مستقر في الظروف العادية' },
      decomposition: { en: 'CO, CO₂, formaldehyde when burned', ar: 'أول أكسيد الكربون وثاني أكسيد الكربون والفورمالدهيد عند الاحتراق' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles', 'Butyl or nitrile gloves', 'Lab coat', 'Work in fume hood (mandatory)', 'Respiratory protection for spills'],
        ar: ['نظارات واقية من الرذاذ', 'قفازات بوتيل أو نيتريل', 'معطف مختبر', 'العمل في خزانة الأبخرة (إلزامي)', 'حماية الجهاز التنفسي عند الانسكابات']
      },
      exposureLimits: { en: 'TWA: 200 ppm (262 mg/m³) | STEL: 250 ppm (TOXIC)', ar: 'متوسط التعرض: 200 جزء في المليون | الحد قصير المدى: 250 جزء في المليون (سام)' },
      fireExtinguishing: { en: 'Alcohol-resistant foam, CO₂, dry chemical. Water spray for container cooling.', ar: 'رغوة مقاومة للكحول، ثاني أكسيد الكربون، مسحوق كيميائي جاف. رذاذ ماء لتبريد الحاويات.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 5,628 mg/kg (DANGEROUS: 30-240 mL fatal for humans)', ar: 'الجرعة المميتة (فموي، فأر): 5,628 ملغ/كغ (خطير: 30-240 مل قاتل للإنسان)' },
    },
    uses: {
      en: ['HPLC solvent (chromatography)', 'Organic synthesis reagent', 'Formaldehyde production', 'Fuel cells and biodiesel', 'Antifreeze component', 'Denaturing agent for ethanol'],
      ar: ['مذيب HPLC (الكروماتوغرافيا)', 'كاشف في التخليق العضوي', 'إنتاج الفورمالدهيد', 'خلايا الوقود والديزل الحيوي', 'مكون مانع التجمد', 'عامل تمسيخ للإيثانول']
    },
    nfpa: { health: 1, flammability: 3, reactivity: 0, special: '' },
    pubchemCid: 887,
  },

  'Nitric Acid': {
    physical: {
      boilingPoint: { en: '83 °C (concentrated, 68%)', ar: '83 درجة مئوية (مركز، 68%)' },
      meltingPoint: { en: '-42 °C', ar: '-42 درجة مئوية' },
      density: { en: '1.51 g/cm³ (68%)', ar: '1.51 جم/سم³ (68%)' },
      solubility: { en: 'Miscible with water (highly exothermic)', ar: 'قابل للامتزاج مع الماء (طارد للحرارة بشدة)' },
      appearance: { en: 'Colorless to yellowish fuming liquid', ar: 'سائل عديم اللون إلى أصفر مائل مع أبخرة' },
      odor: { en: 'Acrid, suffocating, choking', ar: 'رائحة حادة وخانقة ومزعجة' },
      flashPoint: { en: 'Non-flammable but powerful oxidizer', ar: 'غير قابل للاشتعال لكنه مؤكسد قوي' },
      vaporPressure: { en: '6.4 kPa at 20°C', ar: '6.4 كيلو باسكال عند 20 درجة مئوية' },
      ph: { en: '< 1 (strongly acidic)', ar: '< 1 (حمضي قوي جداً)' },
    },
    chemical: {
      class: { en: 'Strong Mineral Acid & Oxidizer', ar: 'حمض معدني قوي ومؤكسد' },
      molecularStructure: { en: 'HNO₃ - Strong monoprotic acid with nitrogen(V)', ar: 'HNO₃ - حمض أحادي البروتون قوي مع نيتروجين (V)' },
      reactivity: { en: 'Extremely reactive. Dissolves most metals except gold and platinum.', ar: 'شديد التفاعل. يذيب معظم المعادن باستثناء الذهب والبلاتين.' },
      incompatible: { en: 'Organic materials, metals, bases, reducing agents, carbides, sulfides', ar: 'المواد العضوية، المعادن، القواعد، العوامل المختزلة، الكربيدات، الكبريتيدات' },
      stability: { en: 'Concentrated solutions decompose releasing toxic NO₂ fumes (brown gas)', ar: 'المحاليل المركزة تتحلل مطلقة أبخرة NO₂ السامة (الغاز البني)' },
      decomposition: { en: '4HNO₃ → 4NO₂ + O₂ + 2H₂O', ar: '4HNO₃ → 4NO₂ + O₂ + 2H₂O' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles + face shield', 'Acid-resistant gloves (neoprene)', 'Acid-resistant apron', 'Work in fume hood ALWAYS', 'Respiratory protection mandatory'],
        ar: ['نظارات واقية + واقي وجه', 'قفازات مقاومة للأحماض (نيوبرين)', 'مريلة مقاومة للأحماض', 'يُستخدم دائماً في خزانة الأبخرة', 'حماية الجهاز التنفسي إلزامية']
      },
      exposureLimits: { en: 'TWA: 2 ppm | STEL: 4 ppm', ar: 'متوسط التعرض: 2 جزء في المليون | الحد قصير المدى: 4 أجزاء في المليون' },
      fireExtinguishing: { en: 'Water spray (copious). Contact with organic materials may cause spontaneous fire.', ar: 'رذاذ ماء (كميات كبيرة). ملامسته للمواد العضوية قد تسبب حريقاً تلقائياً.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 430 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 430 ملغ/كغ' },
    },
    uses: {
      en: ['Aqua regia preparation (with HCl)', 'Metal etching and cleaning', 'Nitration reactions in organic chemistry', 'Fertilizer manufacturing (NH₄NO₃)', 'Explosives production (TNT, nitroglycerin)', 'Analytical chemistry reagent'],
      ar: ['تحضير الماء الملكي (مع HCl)', 'حفر وتنظيف المعادن', 'تفاعلات النيترة في الكيمياء العضوية', 'تصنيع الأسمدة (NH₄NO₃)', 'إنتاج المتفجرات (TNT، نيتروغليسرين)', 'كاشف في الكيمياء التحليلية']
    },
    nfpa: { health: 3, flammability: 0, reactivity: 0, special: 'OX' },
    pubchemCid: 944,
  },

  'Potassium Permanganate': {
    physical: {
      boilingPoint: { en: 'Decomposes at 240 °C', ar: 'يتحلل عند 240 درجة مئوية' },
      meltingPoint: { en: '240 °C (decomposes)', ar: '240 درجة مئوية (يتحلل)' },
      density: { en: '2.703 g/cm³', ar: '2.703 جم/سم³' },
      solubility: { en: '64 g/L at 20°C (produces deep purple solution)', ar: '64 جم/لتر عند 20 درجة مئوية (ينتج محلولاً بنفسجياً غامقاً)' },
      appearance: { en: 'Dark purple/bronze crystalline solid', ar: 'بلورات صلبة بنفسجية داكنة/برونزية' },
      odor: { en: 'Odorless', ar: 'عديم الرائحة' },
      flashPoint: { en: 'Non-flammable but strong oxidizer', ar: 'غير قابل للاشتعال لكنه مؤكسد قوي' },
      vaporPressure: { en: 'Negligible', ar: 'ضئيل' },
      ph: { en: '7.2 (neutral solution)', ar: '7.2 (محلول متعادل)' },
    },
    chemical: {
      class: { en: 'Inorganic Salt (Strong Oxidizer)', ar: 'ملح غير عضوي (مؤكسد قوي)' },
      molecularStructure: { en: 'KMnO₄ - Potassium salt with permanganate anion (Mn⁷⁺)', ar: 'KMnO₄ - ملح بوتاسيوم مع أيون البرمنجنات (Mn⁷⁺)' },
      reactivity: { en: 'Powerful oxidizer. Can ignite organic materials on contact.', ar: 'مؤكسد قوي جداً. يمكن أن يشعل المواد العضوية عند ملامستها.' },
      incompatible: { en: 'Sulfuric acid, organic materials, reducing agents, glycerol, ethylene glycol', ar: 'حمض الكبريتيك، المواد العضوية، العوامل المختزلة، الجلسرين، إيثيلين جلايكول' },
      stability: { en: 'Decomposes at 240°C to K₂MnO₄, MnO₂, and O₂', ar: 'يتحلل عند 240 درجة مئوية إلى K₂MnO₄ وMnO₂ وO₂' },
      decomposition: { en: '2KMnO₄ → K₂MnO₄ + MnO₂ + O₂', ar: '2KMnO₄ → K₂MnO₄ + MnO₂ + O₂' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles', 'Chemical-resistant gloves (stains skin brown!)', 'Lab coat (stains fabric permanently)', 'Fume hood for heated solutions'],
        ar: ['نظارات واقية من الرذاذ الكيميائي', 'قفازات مقاومة للكيماويات (يصبغ الجلد بالبني!)', 'معطف مختبر (يصبغ الأقمشة بشكل دائم)', 'خزانة أبخرة للمحاليل المسخنة']
      },
      exposureLimits: { en: 'TWA: 5 mg/m³ (as Mn)', ar: 'متوسط التعرض: 5 ملغ/م³ (كمنغنيز)' },
      fireExtinguishing: { en: 'Water spray. May intensify fire if mixed with combustibles.', ar: 'رذاذ ماء. قد يزيد الحريق إذا اختلط بمواد قابلة للاحتراق.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 1,090 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 1,090 ملغ/كغ' },
    },
    uses: {
      en: ['Oxidation-reduction titrations (permanganometry)', 'Water purification and treatment', 'Organic synthesis oxidizing agent', 'Wound treatment antiseptic', 'Qualitative analysis for unsaturation', 'Chemical oxygen demand (COD) testing'],
      ar: ['معايرات الأكسدة والاختزال (البرمنغناتومتري)', 'تنقية ومعالجة المياه', 'عامل مؤكسد في التخليق العضوي', 'مطهر لمعالجة الجروح', 'التحليل النوعي لعدم التشبع', 'اختبار الطلب الكيميائي على الأكسجين (COD)']
    },
    nfpa: { health: 1, flammability: 0, reactivity: 1, special: 'OX' },
    pubchemCid: 516875,
  },

  'Sodium Chloride': {
    physical: {
      boilingPoint: { en: '1,413 °C (2,575 °F)', ar: '1,413 درجة مئوية' },
      meltingPoint: { en: '801 °C (1,474 °F)', ar: '801 درجة مئوية' },
      density: { en: '2.165 g/cm³', ar: '2.165 جم/سم³' },
      solubility: { en: '360 g/L at 25°C (highly soluble)', ar: '360 جم/لتر عند 25 درجة مئوية (عالي الذوبانية)' },
      appearance: { en: 'White crystalline solid', ar: 'مادة صلبة بلورية بيضاء' },
      odor: { en: 'Odorless', ar: 'عديم الرائحة' },
      flashPoint: { en: 'Non-flammable', ar: 'غير قابل للاشتعال' },
      vaporPressure: { en: 'Negligible at room temperature', ar: 'ضئيل عند درجة حرارة الغرفة' },
      ph: { en: '7 (neutral solution)', ar: '7 (محلول متعادل)' },
    },
    chemical: {
      class: { en: 'Inorganic Salt (Alkali Metal Halide)', ar: 'ملح غير عضوي (هاليد معدن قلوي)' },
      molecularStructure: { en: 'NaCl - Face-centered cubic crystal lattice (Na⁺ Cl⁻)', ar: 'NaCl - شبكة بلورية مكعبة محورية الأوجه (Na⁺ Cl⁻)' },
      reactivity: { en: 'Low reactivity. Electrolysis produces Na, Cl₂, and NaOH.', ar: 'منخفض التفاعلية. التحليل الكهربائي ينتج Na وCl₂ وNaOH.' },
      incompatible: { en: 'Lithium, bromine trifluoride, strong acids (may release HCl fumes)', ar: 'الليثيوم، ثلاثي فلوريد البروم، الأحماض القوية (قد تطلق أبخرة HCl)' },
      stability: { en: 'Very stable. Hygroscopic in humid conditions.', ar: 'مستقر جداً. ماص للرطوبة في الظروف الرطبة.' },
      decomposition: { en: '2NaCl → 2Na + Cl₂ (electrolysis only)', ar: '2NaCl → 2Na + Cl₂ (بالتحليل الكهربائي فقط)' },
    },
    safety: {
      ppe: {
        en: ['Safety glasses', 'Lab gloves (optional)', 'Lab coat', 'No special precautions needed'],
        ar: ['نظارات أمان', 'قفازات مخبرية (اختياري)', 'معطف مختبر', 'لا يحتاج احتياطات خاصة']
      },
      exposureLimits: { en: 'No specific OEL (GRAS - Generally Recognized as Safe)', ar: 'لا يوجد حد تعرض (معترف به عموماً كآمن)' },
      fireExtinguishing: { en: 'Non-combustible. No fire hazard.', ar: 'غير قابل للاحتراق. لا يمثل خطر حريق.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 3,000 mg/kg (low toxicity)', ar: 'الجرعة المميتة (فموي، فأر): 3,000 ملغ/كغ (سمية منخفضة)' },
    },
    uses: {
      en: ['Saline solution preparation (0.9% NaCl)', 'Salting-out protein precipitation', 'Density gradient centrifugation', 'Food preservation', 'Chlor-alkali industrial process', 'De-icing roads in winter'],
      ar: ['تحضير المحلول الملحي (0.9% NaCl)', 'ترسيب البروتينات بالتمليح', 'الطرد المركزي بتدرج الكثافة', 'حفظ الأغذية', 'عملية الكلور-قلوي الصناعية', 'إذابة الجليد على الطرق في الشتاء']
    },
    nfpa: { health: 0, flammability: 0, reactivity: 0, special: '' },
    pubchemCid: 5234,
  },

  'Sodium Hydroxide': {
    physical: {
      boilingPoint: { en: '1,388 °C (2,530 °F)', ar: '1,388 درجة مئوية' },
      meltingPoint: { en: '318 °C (604 °F)', ar: '318 درجة مئوية' },
      density: { en: '2.13 g/cm³ (solid)', ar: '2.13 جم/سم³ (صلب)' },
      solubility: { en: '1,110 g/L at 20°C (extremely exothermic!)', ar: '1,110 جم/لتر عند 20 درجة مئوية (طارد للحرارة بشدة!)' },
      appearance: { en: 'White, translucent solid (pellets, flakes, or solution)', ar: 'مادة صلبة بيضاء شفافة (حبيبات أو رقائق أو محلول)' },
      odor: { en: 'Odorless', ar: 'عديم الرائحة' },
      flashPoint: { en: 'Non-flammable', ar: 'غير قابل للاشتعال' },
      vaporPressure: { en: 'Negligible at room temperature', ar: 'ضئيل عند درجة حرارة الغرفة' },
      ph: { en: '14 (1M solution, strongly alkaline)', ar: '14 (محلول 1 مولاري، قلوي قوي جداً)' },
    },
    chemical: {
      class: { en: 'Strong Inorganic Base (Caustic Alkali)', ar: 'قاعدة غير عضوية قوية (قلوي كاوي)' },
      molecularStructure: { en: 'NaOH - Ionic compound (Na⁺ OH⁻), fully dissociates in water', ar: 'NaOH - مركب أيوني (Na⁺ OH⁻)، ينفصل كلياً في الماء' },
      reactivity: { en: 'Highly corrosive. Reacts violently with acids (neutralization).', ar: 'شديد التآكل. يتفاعل بعنف مع الأحماض (معادلة).' },
      incompatible: { en: 'Strong acids, chloroform, metals (Al, Zn, Sn), halogenated organic solvents', ar: 'الأحماض القوية، الكلوروفورم، المعادن (Al, Zn, Sn)، المذيبات العضوية المهلجنة' },
      stability: { en: 'Very stable. Absorbs CO₂ and moisture from air.', ar: 'مستقر جداً. يمتص ثاني أكسيد الكربون والرطوبة من الهواء.' },
      decomposition: { en: 'Na₂O + H₂O at very high temperatures', ar: 'Na₂O + H₂O عند درجات حرارة عالية جداً' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles + face shield', 'Chemical-resistant gloves (neoprene/butyl)', 'Rubber apron', 'Lab coat', 'Emergency eyewash station nearby'],
        ar: ['نظارات واقية + واقي وجه', 'قفازات مقاومة للكيماويات (نيوبرين/بوتيل)', 'مريلة مطاطية', 'معطف مختبر', 'محطة غسل العيون الطارئة قريبة']
      },
      exposureLimits: { en: 'TWA: 2 mg/m³ (ceiling)', ar: 'حد السقف: 2 ملغ/م³' },
      fireExtinguishing: { en: 'Water spray, CO₂, dry chemical. Dissolving in water generates intense heat.', ar: 'رذاذ ماء، ثاني أكسيد الكربون، مسحوق كيميائي جاف. إذابته في الماء تولد حرارة شديدة.' },
      ldValue: { en: 'LD₅₀ (oral, rat): 325 mg/kg (corrosive)', ar: 'الجرعة المميتة (فموي، فأر): 325 ملغ/كغ (مادة كاوية)' },
    },
    uses: {
      en: ['pH adjustment and neutralization', 'Soap and detergent manufacturing', 'Paper pulping (Kraft process)', 'Drain cleaner', 'Titration standard (alkalimetry)', 'Petroleum refining'],
      ar: ['ضبط الأس الهيدروجيني والمعادلة', 'تصنيع الصابون والمنظفات', 'تلبيب الورق (عملية كرافت)', 'منظف المصارف', 'معيار المعايرة (قياس القلوية)', 'تكرير البترول']
    },
    nfpa: { health: 3, flammability: 0, reactivity: 1, special: '' },
    pubchemCid: 14798,
  },

  'Sulfuric Acid': {
    physical: {
      boilingPoint: { en: '337 °C (639 °F, concentrated)', ar: '337 درجة مئوية (مركز)' },
      meltingPoint: { en: '10.3 °C (50.6 °F)', ar: '10.3 درجة مئوية' },
      density: { en: '1.84 g/cm³ (98%)', ar: '1.84 جم/سم³ (98%)' },
      solubility: { en: 'Miscible with water (EXTREMELY exothermic - always add acid to water!)', ar: 'قابل للامتزاج مع الماء (طارد للحرارة بشدة - أضف الحمض دائماً إلى الماء!)' },
      appearance: { en: 'Colorless, oily, viscous liquid', ar: 'سائل عديم اللون، زيتي ولزج' },
      odor: { en: 'Odorless when pure, pungent when fuming', ar: 'عديم الرائحة عند النقاوة، نفاذ عند التدخين' },
      flashPoint: { en: 'Non-flammable but reacts with metals to produce H₂', ar: 'غير قابل للاشتعال لكنه يتفاعل مع المعادن لإنتاج H₂' },
      vaporPressure: { en: '< 0.001 kPa at 20°C', ar: '< 0.001 كيلو باسكال عند 20 درجة مئوية' },
      ph: { en: '< 1 (strongly acidic)', ar: '< 1 (حمضي قوي جداً)' },
    },
    chemical: {
      class: { en: 'Strong Mineral Acid (Diprotic)', ar: 'حمض معدني قوي (ثنائي البروتون)' },
      molecularStructure: { en: 'H₂SO₄ - Sulfur(VI) oxoacid, diprotic acid', ar: 'H₂SO₄ - حمض أوكسو الكبريت (VI)، حمض ثنائي البروتون' },
      reactivity: { en: 'Extremely reactive. Powerful dehydrating agent. Chars organic materials.', ar: 'شديد التفاعل. عامل تجفيف قوي. يفحّم المواد العضوية.' },
      incompatible: { en: 'Water (exothermic!), bases, metals, organic materials, oxidizers, permanganates', ar: 'الماء (طارد للحرارة!)، القواعد، المعادن، المواد العضوية، المؤكسدات، البرمنجنات' },
      stability: { en: 'Very stable. Concentrated acid is a powerful dehydrating agent.', ar: 'مستقر جداً. الحمض المركز عامل تجفيف قوي.' },
      decomposition: { en: 'SO₃ + H₂O above 340°C', ar: 'SO₃ + H₂O فوق 340 درجة مئوية' },
    },
    safety: {
      ppe: {
        en: ['Chemical splash goggles + full face shield', 'Acid-resistant gloves (neoprene)', 'Acid-resistant apron', 'Closed-toe shoes', 'Work in fume hood ALWAYS', 'Emergency shower and eyewash accessible'],
        ar: ['نظارات واقية + واقي وجه كامل', 'قفازات مقاومة للأحماض (نيوبرين)', 'مريلة مقاومة للأحماض', 'أحذية مغلقة', 'يُستخدم دائماً في خزانة الأبخرة', 'الدش الطارئ وغسل العيون في متناول اليد']
      },
      exposureLimits: { en: 'TWA: 0.2 mg/m³ | STEL: 0.6 mg/m³', ar: 'متوسط التعرض: 0.2 ملغ/م³ | الحد قصير المدى: 0.6 ملغ/م³' },
      fireExtinguishing: { en: 'Water spray (copious). NEVER add water to acid - always add acid to water!', ar: 'رذاذ ماء (كميات كبيرة). لا تضف الماء أبداً للحمض - أضف الحمض دائماً إلى الماء!' },
      ldValue: { en: 'LD₅₀ (oral, rat): 2,140 mg/kg', ar: 'الجرعة المميتة (فموي، فأر): 2,140 ملغ/كغ' },
    },
    uses: {
      en: ['Lead-acid battery electrolyte', 'Fertilizer manufacturing (superphosphate)', 'Metal processing and electroplating', 'Petroleum refining', 'Organic synthesis (sulfonation, esterification)', 'Laboratory acid standard'],
      ar: ['إلكتروليت بطاريات الرصاص الحمضية', 'تصنيع الأسمدة (سوبر فوسفات)', 'معالجة المعادن والطلاء الكهربائي', 'تكرير البترول', 'التخليق العضوي (السلفنة، الأسترة)', 'معيار حمض مخبري']
    },
    nfpa: { health: 3, flammability: 0, reactivity: 2, special: 'W' },
    pubchemCid: 1118,
  },
}

export function getChemicalData(chemicalName) {
  return chemicalDatabase[chemicalName] || null
}

export default chemicalDatabase
