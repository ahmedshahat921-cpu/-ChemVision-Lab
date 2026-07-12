import { useState, useEffect } from 'react'

export function useLanguage() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en')

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'en')
    }
    window.addEventListener('languageChange', handleLangChange)
    return () => window.removeEventListener('languageChange', handleLangChange)
  }, [])

  const t = (key) => {
    const dict = {
      en: {
        // AppLayout
        dashboard: 'Dashboard',
        chemicals: 'Chemicals',
        mixing_simulator: 'Mixing Simulator',
        qr_scanner: 'QR Scanner',
        lab_map: 'Lab Map',
        admin_panel: 'Admin Panel',
        profile: 'Profile',
        logout: 'Logout',
        search_placeholder: 'Quick search chemicals...',
        lab_hub: 'Lab Hub',

        // Dashboard
        total_chemicals: 'Total Chemicals',
        hazard_alerts: 'Hazard Alerts',
        active_experiments: 'Active Experiments',
        recent_activity: 'Recent Activity',
        chemical_stability: 'Chemical Stability Distribution',
        hazardous: 'Hazardous',
        warning: 'Warning',
        safe: 'Safe',
        lab_occupancy: 'Lab Occupancy Zones',
        system_status: 'System Status: Active',

        // Mixing Simulator
        mixing_simulator_title: 'Mixing Simulator',
        mixing_simulator_sub: 'Analyze molecular compatibility and safety in real-time',
        chem_a: 'Chemical A',
        chem_b: 'Chemical B',
        simulate_btn: 'Simulate Reaction',
        famous_experiments: 'Famous Experiments',
        pouring_reagents: 'Phase 1: Pouring reagents into reaction vessel...',
        kinetics: 'Phase 2: Molecular kinetics & reaction in progress...',
        analyzing_sds: 'Analyzing safety datasheet properties and thermodynamic changes.',
        export_report: 'Download Laboratory Report (PDF)',
        mix_new: 'Mix New Chemicals',
        
        // Chemicals inventory
        inventory_title: 'Chemicals Inventory',
        inventory_sub: 'Manage and search safety data sheets (SDS) of laboratory reagents',
        add_chemical: 'Add Chemical',
        search_label: 'Search name or formula...',
        hazard_level: 'Hazard Level',
        formula: 'Formula',
        cas_number: 'CAS Number',
        actions: 'Actions',
        view_details: 'View Details',
        
        // Lab Map
        map_title: 'Lab Heat Map',
        map_sub: 'Real-time hazard monitoring across laboratory zones',
        zone_info: 'Zone Details',
        zone_name: 'Zone Name',
        hazard_status: 'Hazard Status',
        associated_chemicals: 'Associated Chemicals',

        // QR Scanner
        qr_title: 'QR Code Scanner',
        qr_sub: 'Scan chemical labels to retrieve SDS sheets instantly',
        scanner_active: 'Camera active. Position QR code in frame.',
        
        // General
        ar_lang: 'العربية',
        en_lang: 'English'
      },
      ar: {
        // AppLayout
        dashboard: 'لوحة القيادة',
        chemicals: 'المواد الكيميائية',
        mixing_simulator: 'محاكي الخلط',
        qr_scanner: 'قارئ QR',
        lab_map: 'خريطة المختبر',
        admin_panel: 'لوحة التحكم',
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',
        search_placeholder: 'بحث سريع عن المواد...',
        lab_hub: 'مركز المختبر',

        // Dashboard
        total_chemicals: 'إجمالي المواد الكيميائية',
        hazard_alerts: 'تنبيهات الخطورة',
        active_experiments: 'التجارب النشطة',
        recent_activity: 'آخر الأنشطة',
        chemical_stability: 'توزيع استقرار المواد كيميائياً',
        hazardous: 'خطرة',
        warning: 'تحذير',
        safe: 'آمنة',
        lab_occupancy: 'مناطق إشغال المختبر',
        system_status: 'حالة النظام: نشط',

        // Mixing Simulator
        mixing_simulator_title: 'محاكي خلط المواد',
        mixing_simulator_sub: 'تحليل توافق الجزيئات والسلامة الكيميائية في الوقت الفعلي',
        chem_a: 'المادة الكيميائية أ',
        chem_b: 'المادة الكيميائية ب',
        simulate_btn: 'محاكاة التفاعل الكيميائي',
        famous_experiments: 'تجارب معملية شهيرة',
        pouring_reagents: 'المرحلة 1: صب الكواشف في وعاء التفاعل...',
        kinetics: 'المرحلة 2: الحركة الجزيئية والتفاعل قيد التقدم...',
        analyzing_sds: 'جاري تحليل خصائص ورقة بيانات السلامة والتغيرات الديناميكية الحرارية.',
        export_report: 'تحميل تقرير المختبر (PDF)',
        mix_new: 'خلط مواد جديدة',

        // Chemicals inventory
        inventory_title: 'مستودع المواد الكيميائية',
        inventory_sub: 'إدارة والبحث في أوراق بيانات السلامة (SDS) لكواشف المختبر',
        add_chemical: 'إضافة مادة كيميائية',
        search_label: 'البحث بالاسم أو الصيغة الكيميائية...',
        hazard_level: 'مستوى الخطورة',
        formula: 'الصيغة الكيميائية',
        cas_number: 'رقم CAS',
        actions: 'العمليات',
        view_details: 'عرض التفاصيل',

        // Lab Map
        map_title: 'الخريطة الحرارية للمختبر',
        map_sub: 'مراقبة المخاطر في الوقت الفعلي عبر مناطق المختبر المختلفة',
        zone_info: 'تفاصيل المنطقة',
        zone_name: 'اسم المنطقة',
        hazard_status: 'حالة الخطر',
        associated_chemicals: 'المواد الكيميائية المرتبطة',

        // QR Scanner
        qr_title: 'قارئ الرمز الاستجابة السريعة (QR)',
        qr_sub: 'افحص ملصقات المواد الكيميائية للحصول على أوراق السلامة (SDS) فوراً',
        scanner_active: 'الكاميرا نشطة. ضع رمز QR داخل الإطار.',

        // General
        ar_lang: 'العربية',
        en_lang: 'English'
      }
    }
    return dict[lang]?.[key] || key
  }

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar'
    localStorage.setItem('lang', nextLang)
    window.dispatchEvent(new Event('languageChange'))
  }

  return { lang, t, toggleLanguage }
}
