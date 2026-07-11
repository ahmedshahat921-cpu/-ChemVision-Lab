import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Map, Thermometer, FlaskConical } from 'lucide-react'
import { useChemicalStore } from '../store'

const labLayout = [
  { id: 'lab-a', name: 'Laboratory A', x: 5, y: 5, w: 38, h: 42, color: '#EBF4FF', border: '#4A90E2' },
  { id: 'lab-b', name: 'Laboratory B', x: 45, y: 5, w: 38, h: 42, color: '#E8FBF6', border: '#5DB9A0' },
  { id: 'lab-c', name: 'Laboratory C', x: 5, y: 52, w: 38, h: 42, color: '#FEF3DC', border: '#F5A623' },
  { id: 'lab-d', name: 'Laboratory D', x: 45, y: 52, w: 38, h: 42, color: '#FDEAEA', border: '#E85D5D' },
  { id: 'storage', name: 'Storage', x: 85, y: 5, w: 14, h: 89, color: '#EDE9FE', border: '#7C3AED' },
]

const chemicalLocations = [
  { id: 1, name: 'H₂SO₄', x: 18, y: 22, level: 'critical' },
  { id: 2, name: 'NaOH', x: 28, y: 30, level: 'high' },
  { id: 3, name: 'HCl', x: 12, y: 15, level: 'critical' },
  { id: 4, name: 'C₂H₅OH', x: 55, y: 18, level: 'medium' },
  { id: 5, name: 'H₂O₂', x: 68, y: 28, level: 'high' },
  { id: 6, name: 'NH₃', x: 62, y: 35, level: 'high' },
  { id: 7, name: 'C₃H₆O', x: 18, y: 65, level: 'medium' },
  { id: 8, name: 'KMnO₄', x: 28, y: 78, level: 'high' },
  { id: 9, name: 'C₆H₆', x: 20, y: 72, level: 'critical' },
  { id: 10, name: 'NaCl', x: 55, y: 60, level: 'low' },
  { id: 11, name: 'CaCO₃', x: 68, y: 80, level: 'low' },
  { id: 12, name: 'CuSO₄', x: 62, y: 68, level: 'medium' },
  { id: 13, name: 'HNO₃', x: 90, y: 18, level: 'critical' },
  { id: 14, name: 'CH₃OH', x: 90, y: 35, level: 'high' },
  { id: 15, name: 'C₆H₁₂O₆', x: 90, y: 55, level: 'low' },
]

const levelColors = { low: '#5DB9A0', medium: '#F5A623', high: '#E85D5D', critical: '#A02A2A' }

export default function LabMapPage() {
  const [selected, setSelected] = React.useState(null)

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading font-bold text-2xl" style={{ color: '#2C3E50' }}>🗺️ Lab Map</h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>Interactive chemical location heatmap</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAP */}
        <motion.div className="card p-5 lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-base" style={{ color: '#2C3E50' }}>Lab Floor Plan</h3>
            <div className="flex gap-3">
              {Object.entries(levelColors).map(([level, color]) => (
                <div key={level} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-xs capitalize" style={{ color: '#64748B' }}>{level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SVG Map */}
          <div className="relative w-full rounded-xl overflow-hidden" style={{ background: '#F8F9FA', border: '1px solid #E2E8F0', paddingBottom: '60%' }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Lab rooms */}
              {labLayout.map((lab, i) => (
                <motion.g key={lab.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                  <rect x={lab.x} y={lab.y} width={lab.w} height={lab.h} rx="2" fill={lab.color} stroke={lab.border} strokeWidth="0.5" />
                  <text x={lab.x + lab.w / 2} y={lab.y + 5} textAnchor="middle" fill={lab.border} fontSize="2.2" fontWeight="600">{lab.name}</text>
                </motion.g>
              ))}

              {/* Chemical dots */}
              {chemicalLocations.map((chem, i) => (
                <motion.g
                  key={chem.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.05, type: 'spring' }}
                  style={{ transformOrigin: `${chem.x}% ${chem.y}%`, cursor: 'pointer' }}
                  onClick={() => setSelected(chem)}
                >
                  {/* Pulse ring */}
                  <motion.circle
                    cx={chem.x} cy={chem.y} r="2.5"
                    fill="none" stroke={levelColors[chem.level]} strokeWidth="0.5"
                    animate={{ r: [2.5, 4, 2.5], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                  <circle cx={chem.x} cy={chem.y} r="1.5" fill={levelColors[chem.level]} />
                  {selected?.id === chem.id && (
                    <text x={chem.x + 2} y={chem.y - 2} fontSize="1.8" fill="#2C3E50" fontWeight="600">{chem.name}</text>
                  )}
                </motion.g>
              ))}
            </svg>
          </div>

          <p className="text-xs mt-2 text-center" style={{ color: '#94A3B8' }}>Click on a dot to see chemical details</p>
        </motion.div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          {/* Zone summary */}
          <motion.div className="card p-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: '#2C3E50' }}>Zone Summary</h3>
            <div className="space-y-2">
              {[
                { name: 'Lab A', chemicals: 3, level: 'critical', icon: '⚠️' },
                { name: 'Lab B', chemicals: 3, level: 'high', icon: '🔥' },
                { name: 'Lab C', chemicals: 3, level: 'high', icon: '🔥' },
                { name: 'Lab D', chemicals: 3, level: 'low', icon: '✅' },
                { name: 'Storage', chemicals: 3, level: 'medium', icon: '📦' },
              ].map((zone, i) => (
                <motion.div
                  key={zone.name}
                  className="flex items-center justify-between p-2.5 rounded-lg"
                  style={{ background: '#F8F9FA' }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <span>{zone.icon}</span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#2C3E50' }}>{zone.name}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{zone.chemicals} chemicals</p>
                    </div>
                  </div>
                  <span className={`badge badge-${zone.level}`}>{zone.level}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Selected chemical info */}
          {selected ? (
            <motion.div className="card p-5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <MapPin size={14} style={{ color: '#4A90E2' }} /> Selected Chemical
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: levelColors[selected.level] + '20', color: levelColors[selected.level] }}>
                  {selected.name.slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: '#2C3E50' }}>{selected.name}</p>
                  <span className={`badge badge-${selected.level}`}>{selected.level}</span>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-lg text-xs" style={{ background: '#F0F2F5', color: '#64748B' }}>
                📍 Coordinates: ({selected.x}%, {selected.y}%)
              </div>
            </motion.div>
          ) : (
            <motion.div className="card p-5 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Map size={32} style={{ color: '#CBD5E1', margin: '0 auto 0.5rem' }} />
              <p className="text-sm" style={{ color: '#94A3B8' }}>Click a dot on the map to see chemical details</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
