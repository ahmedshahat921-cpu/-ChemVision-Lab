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
  const loc = (chemical.location || '').toLowerCase().trim()
  let room = 'storage' // default
  
  if (loc.includes('lab a') || loc.includes('مختبر أ') || loc.includes('مختبر ا') || /\b(a)\b/i.test(loc)) {
    room = 'lab-a'
  } else if (loc.includes('lab b') || loc.includes('مختبر ب') || /\b(b)\b/i.test(loc)) {
    room = 'lab-b'
  } else if (loc.includes('lab c') || loc.includes('مختبر ج') || /\b(c)\b/i.test(loc)) {
    room = 'lab-c'
  } else if (loc.includes('lab d') || loc.includes('مختبر د') || /\b(d)\b/i.test(loc)) {
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
    <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden rounded border border-slate-200" style={{ transform: 'rotate(45deg)' }}>
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        <div className="bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white" style={{ transform: 'rotate(-45deg)' }}>{health}</div>
        <div className="bg-red-500 flex items-center justify-center text-[8px] font-bold text-white" style={{ transform: 'rotate(-45deg)' }}>{flammability}</div>
        <div className="bg-white flex items-center justify-center text-[6px] font-bold text-slate-800" style={{ transform: 'rotate(-45deg)' }}>{special || 'W'}</div>
        <div className="bg-yellow-400 flex items-center justify-center text-[8px] font-bold text-slate-800" style={{ transform: 'rotate(-45deg)' }}>{reactivity}</div>
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
  const [hoveredRoomId, setHoveredRoomId] = useState(null)
  const [showExits, setShowExits] = useState(false)

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

  const mappedChemicals = chemicals.map((c, idx) => {
    const coords = getChemicalCoords(c, idx)
    return { ...c, ...coords }
  })

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
  const filteredChemicals = mappedChemicals.filter(c => filterHazard === 'all' ? true : c.hazard_level === filterHazard)
  const selectedChem = mappedChemicals.find(c => c.id === selectedChemId)
  const chemDetails = selectedChem ? (getChemicalData(selectedChem.name) || selectedChem.detailed_data || null) : null
  const roomChems = selectedRoom ? mappedChemicals.filter(c => c.room === selectedRoom) : []
  const roomInfo = selectedRoom ? labLayout.find(l => l.id === selectedRoom) : null

  return (
    <div className={`p-4 lg:p-6 ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="font-heading font-bold text-2xl text-left animate-fade-in" style={{ color: '#2C3E50' }}>{t('map_title')}</h1>
        <p className="text-sm mt-1 text-left" style={{ color: '#64748B' }}>{t('map_sub')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <motion.div className="card p-5 lg:col-span-2 relative" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-heading font-semibold text-base" style={{ color: '#2C3E50' }}>
              {lang === 'ar' ? 'مخطط طابق المختبر التفاعلي' : 'Interactive Lab Floor Plan'}
            </h3>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              <button 
                onClick={() => setShowExits(!showExits)}
                className="text-xs px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1 shadow-sm mr-2"
                style={{
                  background: showExits ? '#10B981' : 'white',
                  color: showExits ? 'white' : '#10B981',
                  borderColor: '#10B981'
                }}
              >
                <Shield size={12} />
                <span>{lang === 'ar' ? 'مخارج الطوارئ' : 'Emergency Exits'}</span>
              </button>

              <div className="h-5 w-[1px] bg-slate-200" />

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
              <style>{`
                @keyframes dash { to { stroke-dashoffset: -12; } }
                .evacuation-path { animation: dash 1.2s linear infinite; }
              `}</style>
              
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
                    onMouseEnter={() => setHoveredRoomId(lab.id)}
                    onMouseLeave={() => setHoveredRoomId(null)}
                  >
                    <rect 
                      x={lab.x} y={lab.y} width={lab.w} height={lab.h} rx="2" 
                      fill={lab.color} 
                      stroke={isSelected ? '#3B82F6' : lab.border} 
                      strokeWidth={isSelected ? '0.9' : '0.4'}
                      opacity={isSelected ? 0.95 : 0.8}
                      className="transition-all duration-300"
                    />
                    <text x={lab.x + lab.w / 2} y={lab.y + 6} textAnchor="middle" fill="#334155" fontSize="2.4" fontWeight="700">
                      {translateLabName(lab.name)}
                    </text>
                  </g>
                )
              })}

              {showExits && (
                <g opacity="0.9">
                  {["M 24 26 L 24 49 L 3.5 49", "M 64 26 L 64 49 L 44 49 L 44 94", "M 24 73 L 24 49 L 3.5 49", "M 64 73 L 64 49 L 44 49 L 44 94", "M 92 49 L 85 49 L 44 49 L 44 94"].map((d, index) => (
                    <path key={index} d={d} fill="none" stroke="#10B981" strokeWidth="0.8" strokeDasharray="3,3" strokeLinecap="round" className="evacuation-path" />
                  ))}
                  <g transform="translate(0, 45)">
                    <rect x="0" y="0" width="3.5" height="8" rx="0.5" fill="#10B981" />
                    <text x="1.75" y="4.5" textAnchor="middle" fill="white" fontSize="3" fontWeight="bold">🚪</text>
                    <text x="1.75" y="7.5" textAnchor="middle" fill="white" fontSize="1.2" fontWeight="900">EXIT</text>
                  </g>
                  <g transform="translate(40.5, 96.5)">
                    <rect x="0" y="0" width="8" height="3.5" rx="0.5" fill="#10B981" />
                    <text x="4" y="2.2" textAnchor="middle" fill="white" fontSize="2.8" fontWeight="bold">🚪</text>
                    <text x="4" y="3.1" textAnchor="middle" fill="white" fontSize="0.9" fontWeight="900">EXIT</text>
                  </g>
                </g>
              )}

              {filteredChemicals.map((chem, i) => {
                const isSelected = selectedChemId === chem.id
                return (
                  <g key={chem.id} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedChemId(chem.id); setSelectedRoom(null); }}>
                    <motion.circle cx={chem.x} cy={chem.y} r={isSelected ? "3.5" : "2.2"} fill="none" stroke={levelColors[chem.hazard_level]} strokeWidth="0.5" animate={{ r: isSelected ? [3.5, 5, 3.5] : [2.2, 3.5, 2.2], opacity: [0.7, 0, 0.7] }} transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.15 }} />
                    <circle cx={chem.x} cy={chem.y} r={isSelected ? "2" : "1.2"} fill={levelColors[chem.hazard_level]} stroke={isSelected ? '#FFFFFF' : 'none'} strokeWidth="0.3" />
                  </g>
                )
              })}
            </svg>

            <AnimatePresence>
              {hoveredRoomId && (() => {
                const roomObj = zones.find(z => z.id === hoveredRoomId)
                const layoutObj = labLayout.find(l => l.id === hoveredRoomId)
                const chemicalsInRoom = mappedChemicals.filter(c => c.room === hoveredRoomId)
                if (!roomObj || !layoutObj) return null
                return (
                  <motion.div className="absolute z-20 pointer-events-none p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-56 bg-white dark:bg-slate-900 animate-fade-in text-slate-900 dark:text-slate-100" style={{ left: `${layoutObj.x + layoutObj.w / 2}%`, top: `${layoutObj.y + layoutObj.h / 2}%`, transform: 'translate(-50%, -50%)', borderLeft: `4px solid ${levelColors[roomObj.maxHazard]}` }} initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}>
                    <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1.5">
                      <span className="text-sm">{roomObj.icon}</span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{translateLabName(roomObj.name)}</h4>
                      <span className="badge text-[8px] font-bold ml-auto" style={{ background: levelColors[roomObj.maxHazard] + '15', color: levelColors[roomObj.maxHazard] }}>{translateLevel(roomObj.maxHazard)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'المواد المخزنة:' : 'Chemicals stored:'} <strong className="text-slate-800 dark:text-slate-200">{roomObj.chemicals}</strong></p>
                    {chemicalsInRoom.length > 0 ? (
                      <div className="space-y-1 mt-1 max-h-[85px] overflow-hidden">
                        {chemicalsInRoom.slice(0, 3).map(c => <div key={c.id} className="flex justify-between items-center text-[9px] text-slate-700 dark:text-slate-300 font-semibold"><span className="truncate max-w-[120px]">{c.name}</span><span className="font-mono text-slate-400 dark:text-slate-500">({c.formula})</span></div>)}
                        {chemicalsInRoom.length > 3 && <p className="text-[8px] text-slate-400 dark:text-slate-500 text-center font-bold mt-0.5">{lang === 'ar' ? `+${chemicalsInRoom.length - 3} مواد أخرى` : `+${chemicalsInRoom.length - 3} more chemicals`}</p>}
                      </div>
                    ) : <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold italic mt-1">{lang === 'ar' ? 'القسم فارغ حالياً' : 'Area is empty'}</p>}
                  </motion.div>
                )
              })()}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center mt-3 text-xs text-neutral-400">
            <span>💡 {lang === 'ar' ? 'اضغط على أي معمل بالخريطة لعرض قائمته' : 'Click any lab on the map to list its contents'}</span>
            <span>📍 {lang === 'ar' ? 'تحديث تلقائي فوري' : 'Live synced inventory'}</span>
          </div>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedChem ? (
              <motion.div key="chem-details" className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <h3 className="font-bold text-xs flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><MapPin size={14} className="text-blue-500" /> {lang === 'ar' ? 'المادة الكيميائية المحددة' : 'Selected Chemical'}</h3>
                  <button onClick={() => setSelectedChemId(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={14} /></button>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <MiniNfpa ratings={chemDetails?.nfpa} />
                  <div className="min-w-0">
                    <h2 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{selectedChem.name}</h2>
                    <p className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold mt-0.5">{selectedChem.formula}</p>
                    <span className="badge text-[10px] mt-1" style={{ background: levelColors[selectedChem.hazard_level] + '15', color: levelColors[selectedChem.hazard_level] }}>{translateLevel(selectedChem.hazard_level)}</span>
                  </div>
                </div>
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{lang === 'ar' ? 'الموقع الفعلي' : 'Location'}</span>
                    <p className="font-bold text-xs truncate mt-0.5 text-slate-900 dark:text-slate-100">{selectedChem.cabinet ? `(${selectedChem.cabinet}) ` : ''}{selectedChem.location}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{lang === 'ar' ? 'الكمية المتوفرة' : 'Stock Amount'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{selectedChem.quantity} {selectedChem.quantity_unit}</span>
                  </div>
                  {selectedChem.expiry_date && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{new Date(selectedChem.expiry_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => navigate(`/chemicals/${selectedChem.id}`)} className="btn-primary w-full justify-center py-2.5 text-xs font-bold ripple shadow-sm flex items-center gap-1.5"><Eye size={14} /> {lang === 'ar' ? 'فتح صفحة التفاصيل الكاملة' : 'Open Full Details'}</button>
              </motion.div>
            ) : selectedRoom ? (
              <motion.div key="room-details" className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <h3 className="font-bold text-xs flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Layers size={14} className="text-emerald-500" /> {translateLabName(roomInfo?.name || '')}</h3>
                  <button onClick={() => setSelectedRoom(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={14} /></button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/60"><span className="font-semibold text-slate-600 dark:text-slate-400">{lang === 'ar' ? 'إجمالي المواد المخزنة' : 'Total chemicals stored'}</span><span className="font-bold text-slate-900 dark:text-slate-100">{roomChems.length}</span></div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/60"><span className="font-semibold text-slate-600 dark:text-slate-400">{lang === 'ar' ? 'أعلى مستوى خطورة' : 'Max hazard rating'}</span><span className="badge text-[10px]" style={{ background: levelColors[zones.find(z => z.id === selectedRoom)?.maxHazard || 'low'] + '15', color: levelColors[zones.find(z => z.id === selectedRoom)?.maxHazard || 'low'] }}>{translateLevel(zones.find(z => z.id === selectedRoom)?.maxHazard || 'low')}</span></div>
                  <div className="mt-3">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase tracking-wide">{lang === 'ar' ? 'قائمة المواد داخل هذا القسم:' : 'Chemicals in this section:'}</p>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {roomChems.map(chem => (
                        <div key={chem.id} onClick={() => setSelectedChemId(chem.id)} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/70 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-600 cursor-pointer transition-all text-xs shadow-xs">
                          <div className="min-w-0 text-left"><span className="font-bold text-slate-900 dark:text-slate-100 truncate block">{chem.name}</span><span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">{chem.formula}</span></div>
                          <div className="flex items-center gap-1.5 flex-shrink-0"><span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{chem.quantity} {chem.quantity_unit}</span><div className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ background: levelColors[chem.hazard_level] }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="zone-overview" className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <h3 className="font-semibold text-sm mb-3 text-left text-slate-900 dark:text-slate-100">{lang === 'ar' ? 'مراقبة خطورة المناطق' : 'Zone Summary'}</h3>
                <div className="space-y-2">
                  {zones.map((zone, i) => {
                    const roomColor = levelColors[zone.maxHazard]
                    return (
                      <motion.div key={zone.id} onClick={() => setSelectedRoom(zone.id)} className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex items-center gap-2.5 text-left"><span className="text-lg">{zone.icon}</span><div className="text-left"><p className="text-xs font-bold text-slate-900 dark:text-slate-100">{translateLabName(zone.name)}</p><p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{lang === 'ar' ? `${zone.chemicals} مواد مخزنة` : `${zone.chemicals} chemicals`}</p></div></div>
                        <span className="badge text-[10px] font-bold flex items-center gap-1" style={{ background: roomColor + '15', color: roomColor }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: roomColor }} />{translateLevel(zone.maxHazard)}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
