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

    const { data } = await supabase
      .from('mixing_rules')
      .select('*')
      .or(`and(chemical_a_id.eq.${chemA.id},chemical_b_id.eq.${chemB.id}),and(chemical_a_id.eq.${chemB.id},chemical_b_id.eq.${chemA.id})`)
      .maybeSingle()

    setTimeout(() => {
      setLoading(false)
      if (data) {
        setResult(data)
        if (!data.is_safe) { setScreenShake(true); setTimeout(() => setScreenShake(false), 800) }
        else toast.success('Reaction is safe to proceed')
      } else {
        setResult({ reaction_type: 'safe', result_description: 'No known reaction rule for this combination. Proceed with caution and consult safety protocols.', is_safe: true, severity_score: 1 })
      }
    }, 1200)
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
              <div className="p-5">
                <p className="text-sm leading-relaxed" style={{ color: '#2C3E50' }}>{result.result_description}</p>

                {result.product_name && (
                  <motion.div
                    className="mt-4 p-3 rounded-xl"
                    style={{ background: '#EDE9FE', border: '1px solid #7C3AED' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <p className="text-xs font-semibold" style={{ color: '#7C3AED' }}>Product formed:</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: '#6326CA' }}>{result.product_name} {result.product_formula && `(${result.product_formula})`}</p>
                  </motion.div>
                )}

                {/* Safety warning for dangerous reactions */}
                {!result.is_safe && (
                  <motion.div
                    className="mt-4 p-3 rounded-xl flex items-start gap-2"
                    style={{ background: '#FDEAEA', border: '1px solid #E85D5D' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <AlertTriangle size={16} style={{ color: '#E85D5D', flexShrink: 0, marginTop: '2px' }} />
                    <p className="text-xs" style={{ color: '#A02A2A' }}>
                      ⚠️ Do NOT mix these chemicals without proper safety equipment and supervision. Consult your safety officer immediately.
                    </p>
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
