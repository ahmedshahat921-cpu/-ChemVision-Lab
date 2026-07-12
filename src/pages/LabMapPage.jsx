import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Map, FlaskConical, Eye, Shield, Activity, Info, AlertTriangle, Layers, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChemicalStore } from '../store'
import { useLanguage } from '../hooks/useLanguage'
import { getChemicalData } from '../data/chemicalData'

const labLayout = [
  { id: 'lab-a', name: 'Laboratory A', x: 5, y: 5, w: 38, h: 42, color: '#EBF4FF', border: '#4A90E2' },
  { id: 'lab-b', name: 'Laboratory B', x: 45, y: 5, w: 38, h: 42, color: '#E8FBF6', border: '#5DB9A0' },
  { id: 'lab-c', name: 'Laboratory C', x: 5, y: 52, w: 38, h: 42, color: '#FEF3DC', border: '#F5A623' },
  { id: 'lab-d', name: 'Laboratory D', x: 45, y: 52, w: 38, h: 42, color: '#FDEAEA', border: '#E85D5D' },
  { id: 'storage', name: 'Storage', x: 85, y: 5, w: 14, h: 89, color: '#EDE9FE', border: '#7C3AED' },
]

const levelColors = { 
  low: '#5DB9A0', 
  medium: '#F5A623', 
  high: '#E85D5D', 
  critical: '#A02A2A' 
}

const hazardWeight = { low: 1, medium: 2, high: 3, critical: 4 }

const GHSIcons = {
  GHS01: '💥', GHS02: '🔥', GHS03: '🔆', GHS04: '💨',
  GHS05: '⚗️', GHS06: '☠️', GHS07: '⚠️', GHS08: '🫀', GHS09: '🌿',
}

// Helper to assign chemical to room coordinates deterministically
function getChemicalCoords(chemical, index) {
  const loc = (chemical.location || '').toLowerCase()
  let room = 'storage' // default
  
  if (loc.includes('lab a') || loc.includes('أ') || loc.includes('a')) {
    room = 'lab-a'
  } else if (loc.includes('lab b') || loc.includes('ب') || loc.includes('b')) {
    room = 'lab-b'
  } else if (loc.includes('lab c') || loc.includes('ج') || loc.includes('c')) {
    room = 'lab-c'
  } else if (loc.includes('lab d') || loc.includes('د') || loc.includes('d')) {
    room = 'lab-d'
  }

  // Create seed based on id
  let idNum = 0
  if (chemical.id) {
    idNum = parseInt(chemical.id.replace(/[^0-9]/g, '')) || index
  } else {
    idNum = index
  }
  const seed = idNum * 23

  let x = 0
  let y = 0

  switch (room) {
    case 'lab-a':
      x = 8 + (seed % 28)
      y = 12 + ((seed >> 2) % 27)
      break;
    case 'lab-b':
      x = 48 + (seed % 28)
      y = 12 + ((seed >> 2) % 27)
      break;
    case 'lab-c':
      x = 8 + (seed % 28)
      y = 59 + ((seed >> 2) % 27)
      break;
    case 'lab-d':
      x = 48 + (seed % 28)
      y = 59 + ((seed >> 2) % 27)
      break;
    case 'storage':
    default:
      x = 88 + (seed % 7)
      y = 10 + ((seed >> 2) % 71)
      break;
  }

  return { x, y, room }
}

function MiniNfpa({ ratings }) {
  if (!ratings) return null
  const { health = 0, flammability = 0, reactivity = 0, special = '' } = ratings
  return (
    <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded border border-slate-200" style={{ transform: 'rotate(45deg)' }}>
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {/* Top-Left -> Left (Blue / Health) */}
        <div className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ transform: 'rotate(-45deg)' }}>
          {health}
        </div>
        {/* Top-Right -> Top (Red / Flammability) */}
        <div className="bg-red-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ transform: 'rotate(-45deg)' }}>
          {flammability}
        </div>
        {/* Bottom-Left -> Bottom (White / Special) */}
        <div className="bg-white flex items-center justify-center text-[8px] font-bold text-slate-800" style={{ transform: 'rotate(-45deg)' }}>
          {special || 'W'}
        </div>
        {/* Bottom-Right -> Right (Yellow / Reactivity) */}
        <div className="bg-yellow-400 flex items-center justify-center text-[10px] font-bold text-slate-800" style={{ transform: 'rotate(-45deg)' }}>
          {reactivity}
        </div>
      </div>
    </div>
  )
}

export default function LabMapPage() {
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { chemicals, fetchChemicals, loading } = useChemicalStore()
  
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedChemId, setSelectedChemId] = useState(null)
  const [filterHazard, setFilterHazard] = useState('all')

  useEffect(() => {
    fetchChemicals()
  }, [])

  const translateLevel = (lvl) => {
    if (lang === 'ar') {
      return lvl === 'low' ? 'منخفض' : lvl === 'medium' ? 'متوسط' : lvl === 'high' ? 'مرتفع' : 'خطير'
    }
    return lvl
  }

  const translateLabName = (name) => {
    if (lang === 'ar') {
      if (name.includes('Laboratory A')) return 'المختبر أ'
      if (name.includes('Laboratory B')) return 'المختبر ب'
      if (name.includes('Laboratory C')) return 'المختبر ج'
      if (name.includes('Laboratory D')) return 'المختبر د'
      if (name.includes('Storage')) return 'المستودع'
    }
    return name
  }

  // 1. Map all chemicals in store to their SVG room coordinates
  const mappedChemicals = chemicals.map((c, idx) => {
    const coords = getChemicalCoords(c, idx)
    return { ...c, ...coords }
  })

  // 2. Calculate dynamic room summaries based on actual chemicals list
  const initialZones = {
    'lab-a': { id: 'lab-a', name: 'Laboratory A', chemicals: 0, maxHazard: 'low', icon: '🔬', color: '#EBF4FF', border: '#4A90E2' },
    'lab-b': { id: 'lab-b', name: 'Laboratory B', chemicals: 0, maxHazard: 'low', icon: '🔬', color: '#E8FBF6', border: '#5DB9A0' },
    'lab-c': { id: 'lab-c', name: 'Laboratory C', chemicals: 0, maxHazard: 'low', icon: '🔬', color: '#FEF3DC', border: '#F5A623' },
    'lab-d': { id: 'lab-d', name: 'Laboratory D', chemicals: 0, maxHazard: 'low', icon: '🔬', color: '#FDEAEA', border: '#E85D5D' },
    'storage': { id: 'storage', name: 'Storage', chemicals: 0, maxHazard: 'low', icon: '📦', color: '#EDE9FE', border: '#7C3AED' },
  }

  mappedChemicals.forEach(chem => {
    const zone = initialZones[chem.room]
    if (zone) {
      zone.chemicals += 1
      if (hazardWeight[chem.hazard_level] > hazardWeight[zone.maxHazard]) {
        zone.maxHazard = chem.hazard_level
      }
    }
  })

  const zones = Object.values(initialZones)

  // 3. Filter dots shown on the SVG floor plan
  const filteredChemicals = mappedChemicals.filter(c => {
    if (filterHazard === 'all') return true
    return c.hazard_level === filterHazard
  })

  const selectedChem = mappedChemicals.find(c => c.id === selectedChemId)
  const chemDetails = selectedChem ? getChemicalData(selectedChem.name) : null
  const roomChems = selectedRoom ? mappedChemicals.filter(c => c.room === selectedRoom) : []
  const roomInfo = selectedRoom ? labLayout.find(l => l.id === selectedRoom) : null

  return (
    <div className={`p-4 lg:p-6 ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="font-heading font-bold text-2xl text-left" style={{ color: '#2C3E50' }}>{t('map_title')}</h1>
        <p className="text-sm mt-1 text-left" style={{ color: '#64748B' }}>{t('map_sub')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAP COLUMN */}
        <motion.div className="card p-5 lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          
          {/* Controls / Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-heading font-semibold text-base" style={{ color: '#2C3E50' }}>
              {lang === 'ar' ? 'مخطط طابق المختبر التفاعلي' : 'Interactive Lab Floor Plan'}
            </h3>
            
            {/* Hazard Level Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button 
                onClick={() => setFilterHazard('all')}
                className="text-xs px-2.5 py-1 rounded-lg font-bold border transition-all"
                style={{
                  background: filterHazard === 'all' ? '#2C3E50' : 'white',
                  color: filterHazard === 'all' ? 'white' : '#64748B',
                  borderColor: '#E2E8F0'
                }}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              {Object.entries(levelColors).map(([level, color]) => (
                <button
                  key={level}
                  onClick={() => setFilterHazard(level)}
                  className="text-xs px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1.5"
                  style={{
                    background: filterHazard === level ? color : 'white',
                    color: filterHazard === level ? 'white' : '#64748B',
                    borderColor: '#E2E8F0'
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: filterHazard === level ? 'white' : color }} />
                  <span>{translateLevel(level)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SVG Map Layout Container */}
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-200" style={{ background: '#FAFBFD', paddingBottom: '60%' }}>
            
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 bg-opacity-75 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : null}

            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Lab Rooms */}
              {labLayout.map((lab, i) => {
                const isSelected = selectedRoom === lab.id
                return (
                  <g 
                    key={lab.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedRoom(isSelected ? null : lab.id)
                      setSelectedChemId(null)
                    }}
                  >
                    {/* Background Room Rect */}
                    <rect 
                      x={lab.x} y={lab.y} width={lab.w} height={lab.h} rx="2" 
                      fill={lab.color} 
                      stroke={isSelected ? '#3B82F6' : lab.border} 
                      strokeWidth={isSelected ? '0.9' : '0.4'}
                      opacity={isSelected ? 0.95 : 0.8}
                      className="transition-all duration-300"
                    />
                    
                    {/* Room Name Label */}
                    <text x={lab.x + lab.w / 2} y={lab.y + 6} textAnchor="middle" fill="#334155" fontSize="2.4" fontWeight="700">
                      {translateLabName(lab.name)}
                    </text>
                  </g>
                )
              })}

              {/* Dynamic Chemical Dots */}
              {filteredChemicals.map((chem, i) => {
                const isSelected = selectedChemId === chem.id
                return (
                  <g
                    key={chem.id}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation() // prevent room click trigger
                      setSelectedChemId(chem.id)
                      setSelectedRoom(null)
                    }}
                  >
                    {/* Pulse outer ring */}
                    <motion.circle
                      cx={chem.x} cy={chem.y} r={isSelected ? "3.5" : "2.2"}
                      fill="none" stroke={levelColors[chem.hazard_level]} strokeWidth="0.5"
                      animate={{ r: isSelected ? [3.5, 5, 3.5] : [2.2, 3.5, 2.2], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.15 }}
                    />
                    
                    {/* Solid center dot */}
                    <circle 
                      cx={chem.x} cy={chem.y} 
                      r={isSelected ? "2" : "1.2"} 
                      fill={levelColors[chem.hazard_level]} 
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth="0.3"
                    />
                    
                    {/* Hover tooltip label */}
                    <text 
                      x={chem.x} y={chem.y - 3} 
                      textAnchor="middle"
                      fontSize="1.8" 
                      fill="#0F172A" 
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {chem.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <div className="flex justify-between items-center mt-3 text-xs text-neutral-400">
            <span>💡 {lang === 'ar' ? 'اضغط على أي معمل بالخريطة لعرض قائمته' : 'Click any lab on the map to list its contents'}</span>
            <span>📍 {lang === 'ar' ? 'تحديث تلقائي فوري' : 'Live synced inventory'}</span>
          </div>
        </motion.div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-4">
          
          {/* Drill-down Interactive panel */}
          <AnimatePresence mode="wait">
            
            {/* Case 1: Chemical Selected */}
            {selectedChem ? (
              <motion.div 
                key="chem-details"
                className="card p-5 border border-slate-100"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <h3 className="font-bold text-xs flex items-center gap-1.5" style={{ color: '#64748B' }}>
                    <MapPin size={14} style={{ color: '#3B82F6' }} /> {lang === 'ar' ? 'المادة الكيميائية المحددة' : 'Selected Chemical'}
                  </h3>
                  <button 
                    onClick={() => setSelectedChemId(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex items-start gap-3 text-left mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: levelColors[selectedChem.hazard_level] + '18', color: levelColors[selectedChem.hazard_level] }}>
                    {selectedChem.formula ? selectedChem.formula.slice(0, 3) : '⚗️'}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-sm truncate" style={{ color: '#2C3E50' }}>{selectedChem.name}</p>
                    <p className="font-mono text-xs font-semibold text-blue-500 mt-0.5">{selectedChem.formula}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-neutral-400 font-semibold">{lang === 'ar' ? 'الكمية المتوفرة' : 'Available Stock'}</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedChem.quantity} {selectedChem.quantity_unit}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-neutral-400 font-semibold">{lang === 'ar' ? 'مستوى الخطورة' : 'Hazard Rating'}</span>
                    <p className="font-bold mt-0.5 flex items-center gap-1" style={{ color: levelColors[selectedChem.hazard_level] }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: levelColors[selectedChem.hazard_level] }} />
                      {translateLevel(selectedChem.hazard_level)}
                    </p>
                  </div>
                </div>

                {/* NFPA & GHS indicators */}
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-slate-100 mb-4 gap-3">
                  <div className="min-w-0 text-left">
                    <span className="text-[10px] text-neutral-400 font-semibold">{lang === 'ar' ? 'موقع التخزين الدقيق' : 'Precise Location'}</span>
                    <p className="font-bold text-xs truncate mt-0.5 text-slate-700">{selectedChem.location}</p>
                  </div>
                  {chemDetails?.nfpa && <MiniNfpa ratings={chemDetails.nfpa} />}
                </div>

                {selectedChem.ghs_codes?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-neutral-400 font-semibold mb-1.5">{lang === 'ar' ? 'رموز وقاية GHS' : 'GHS Pictograms'}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {selectedChem.ghs_codes.map(c => (
                        <span key={c} className="text-xs bg-slate-100 px-2 py-0.5 rounded-lg font-bold" title={c}>
                          {GHSIcons[c] || '⚠️'} {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => navigate(`/chemicals/${selectedChem.id}`)}
                  className="btn-primary w-full justify-center py-2.5 text-xs font-bold ripple shadow-sm flex items-center gap-1.5"
                >
                  <Eye size={14} /> {lang === 'ar' ? 'فتح صفحة التفاصيل الكاملة' : 'Open Full Details'}
                </button>
              </motion.div>
            ) : selectedRoom ? (
              
              /* Case 2: Room Selected */
              <motion.div 
                key="room-details"
                className="card p-5 border border-slate-100"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <h3 className="font-bold text-xs flex items-center gap-1.5" style={{ color: '#64748B' }}>
                    <Layers size={14} style={{ color: '#10B981' }} /> {translateLabName(roomInfo?.name || '')}
                  </h3>
                  <button 
                    onClick={() => setSelectedRoom(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-50">
                    <span className="font-semibold text-neutral-500">{lang === 'ar' ? 'إجمالي المواد المخزنة' : 'Total chemicals stored'}</span>
                    <span className="font-bold text-neutral-800">{roomChems.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-50">
                    <span className="font-semibold text-neutral-500">{lang === 'ar' ? 'أعلى مستوى خطورة' : 'Max hazard rating'}</span>
                    <span className="badge text-[10px]" style={{
                      background: levelColors[zones.find(z => z.id === selectedRoom)?.maxHazard || 'low'] + '15',
                      color: levelColors[zones.find(z => z.id === selectedRoom)?.maxHazard || 'low']
                    }}>
                      {translateLevel(zones.find(z => z.id === selectedRoom)?.maxHazard || 'low')}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] text-neutral-400 font-bold mb-2 uppercase tracking-wide">
                      {lang === 'ar' ? 'قائمة المواد داخل هذا القسم:' : 'Chemicals in this section:'}
                    </p>
                    {roomChems.length === 0 ? (
                      <p className="text-xs text-center py-6 text-neutral-400 font-semibold bg-neutral-50 rounded-xl">
                        {lang === 'ar' ? 'لا توجد مواد كيميائية مخزنة هنا حالياً.' : 'No chemicals stored in this area.'}
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {roomChems.map(chem => (
                          <div 
                            key={chem.id}
                            onClick={() => setSelectedChemId(chem.id)}
                            className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-[#FAFBFD] hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all text-xs"
                          >
                            <div className="min-w-0 text-left">
                              <span className="font-bold text-slate-800 truncate block">{chem.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{chem.formula}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[10px] font-bold text-slate-500">{chem.quantity} {chem.quantity_unit}</span>
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: levelColors[chem.hazard_level] }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              
              /* Case 3: Zone Overview (Default) */
              <motion.div 
                key="zone-overview"
                className="card p-5"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              >
                <h3 className="font-semibold text-sm mb-3 text-left" style={{ color: '#2C3E50' }}>
                  {lang === 'ar' ? 'مراقبة خطورة المناطق' : 'Zone Summary'}
                </h3>
                
                <div className="space-y-2">
                  {zones.map((zone, i) => {
                    const roomColor = levelColors[zone.maxHazard]
                    return (
                      <motion.div
                        key={zone.id}
                        onClick={() => setSelectedRoom(zone.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer border border-neutral-100 hover:border-neutral-300 bg-[#F8F9FA] hover:bg-slate-50 transition-all text-left"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex items-center gap-2.5 text-left">
                          <span className="text-lg">{zone.icon}</span>
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-700">
                              {translateLabName(zone.name)}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-semibold">
                              {lang === 'ar' ? `${zone.chemicals} مواد مخزنة` : `${zone.chemicals} chemicals`}
                            </p>
                          </div>
                        </div>
                        <span className="badge text-[10px] font-bold flex items-center gap-1" style={{ background: roomColor + '15', color: roomColor }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: roomColor }} />
                          {translateLevel(zone.maxHazard)}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats Summary Card */}
          <div className="card p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 shadow-md">
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
              {lang === 'ar' ? 'إجمالي حالة المخزون' : 'Overall Inventory Status'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white bg-opacity-10">
                <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'المواد الكلية' : 'Total Materials'}</span>
                <span className="text-lg font-bold">{chemicals.length}</span>
              </div>
              <div className="p-2 rounded-lg bg-white bg-opacity-10">
                <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'أقسام المختبر' : 'Lab Rooms'}</span>
                <span className="text-lg font-bold">{labLayout.length}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
