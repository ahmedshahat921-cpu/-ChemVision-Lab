import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, AlertTriangle, Package, MapPin, Calendar, FlaskConical, Download, Loader2, CheckCircle } from 'lucide-react'
import { useChemicalStore, useAuthStore } from '../store'
import { supabase } from '../lib/supabase'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import toast from 'react-hot-toast'
import Confetti from 'react-confetti'

const hazardColors = {
  low: { bg: '#E8FBF6', color: '#2A7060', border: '#5DB9A0' },
  medium: { bg: '#FEF3DC', color: '#A66410', border: '#F5A623' },
  high: { bg: '#FDEAEA', color: '#A02A2A', border: '#E85D5D' },
  critical: { bg: '#FDEAEA', color: '#A02A2A', border: '#E85D5D' },
}

const GHSInfo = {
  GHS01: { icon: '💥', name: 'Explosive' },
  GHS02: { icon: '🔥', name: 'Flammable' },
  GHS03: { icon: '🔆', name: 'Oxidizing' },
  GHS04: { icon: '💨', name: 'Compressed Gas' },
  GHS05: { icon: '⚗️', name: 'Corrosive' },
  GHS06: { icon: '☠️', name: 'Toxic' },
  GHS07: { icon: '⚠️', name: 'Harmful' },
  GHS08: { icon: '🫀', name: 'Health Hazard' },
  GHS09: { icon: '🌿', name: 'Environmental' },
}

// CSS 3D Molecule Viewer inside a beautiful Glass Conical Flask
function MoleculeViewer({ formula, name, hazardLevel }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

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
              {[
                [0, 0, 0, -42], [0, 0, 42, -18], [0, 0, 42, 28],
                [0, 0, 0, 45], [0, 0, -42, 28], [0, 0, -42, -18]
              ].map(([x1, y1, x2, y2], i) => (
                <line 
                  key={i} 
                  x1={x1} y1={y1} x2={x2} y2={y2} 
                  stroke="#4A90E2" 
                  strokeWidth="2.5" 
                  opacity="0.7" 
                />
              ))}

              {/* Center Carbon atom */}
              <circle cx="0" cy="0" r="13" fill="#1B3A6B" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.18))" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="monospace">C</text>

              {/* Outer atoms (H, O, N) */}
              {[
                [0, -42, '#5DB9A0', 'H'], [42, -18, '#F5A623', 'O'],
                [42, 28, '#E85D5D', 'N'], [0, 45, '#5DB9A0', 'H'],
                [-42, 28, '#7C3AED', 'Cl'], [-42, -18, '#F5A623', 'O']
              ].map(([cx, cy, fill, label], i) => (
                <g key={i} transform={`translate(${cx}, ${cy})`}>
                  <circle cx="0" cy="0" r="10" fill={fill} filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.18))" />
                  <text x="0" y="3" textAnchor="middle" fill="white" fontSize="8" fontWeight="800" fontFamily="sans-serif">{label}</text>
                </g>
              ))}
            </motion.g>
          </g>
        </svg>
      </motion.div>

      {/* Interactive Title details */}
      <div className="absolute bottom-3 left-0 right-0 text-center flex flex-col items-center">
        <span className="text-xs font-heading font-semibold text-neutral-400">Chemical Compound Model</span>
        <span className="text-sm font-mono font-bold mt-0.5" style={{ color: colorSet.secondary }}>
          {formula}
        </span>
      </div>

      <div 
        className="absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-medium transition-opacity opacity-70 group-hover:opacity-100 flex items-center gap-1" 
        style={{ background: 'rgba(74,144,226,0.1)', color: '#4A90E2' }}
      >
        <span>🕹️ drag / hover to inspect</span>
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return }
    setLoading(true)
    const result = await reportUsage(chemical.id, parseFloat(amount), chemical.quantity_unit, purpose, user.id)
    setLoading(false)
    if (result.success) {
      toast.success('Usage reported successfully!')
      onSuccess()
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal-content p-6 w-full"
        style={{ maxWidth: '420px' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading font-bold text-xl mb-1" style={{ color: '#2C3E50' }}>Report Usage</h3>
        <p className="text-sm mb-5" style={{ color: '#64748B' }}>{chemical.name} – {chemical.formula}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Amount used ({chemical.quantity_unit})</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50" className="input-field" min="0.001" step="0.001" max={chemical.quantity} />
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Available: {chemical.quantity} {chemical.quantity_unit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>Purpose (optional)</label>
            <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Titration experiment" className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <motion.button type="submit" disabled={loading} className="btn-primary flex-1 justify-center ripple" whileTap={{ scale: 0.97 }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {loading ? 'Logging...' : 'Submit'}
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
  const [chemical, setChemical] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [pubchemData, setPubchemData] = useState(null)
  const [openAccordion, setOpenAccordion] = useState(null)

  useEffect(() => {
    const fetchChemical = async () => {
      if (chemicals.length === 0) await fetchChemicals()
      const { data } = await supabase.from('chemicals').select('*').eq('id', id).single()
      setChemical(data)
      setLoading(false)
      // Fetch PubChem data
      if (data?.pubchem_cid) {
        fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${data.pubchem_cid}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`)
          .then(r => r.json()).then(d => setPubchemData(d?.PropertyTable?.Properties?.[0]))
          .catch(() => {})
      }
    }
    fetchChemical()
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
    <div className="p-6 text-center"><p style={{ color: '#94A3B8' }}>Chemical not found</p></div>
  )

  const h = hazardColors[chemical.hazard_level] || hazardColors.low
  const qrUrl = `${window.location.origin}/chemicals/${chemical.id}`
  const accordionItems = [
    { key: 'storage', title: '🏷️ Storage Conditions', content: chemical.storage_conditions || 'Store in cool, dry, well-ventilated area.' },
    { key: 'firstaid', title: '🩺 First Aid Measures', content: chemical.first_aid || 'Contact medical professional immediately.' },
    { key: 'description', title: '📋 Description', content: chemical.description || 'No description available.' },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} onConfettiComplete={() => setShowConfetti(false)} />}

      {/* Back */}
      <motion.button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-sm font-medium group"
        style={{ color: '#64748B' }}
        whileHover={{ x: -3 }}
      >
        <ArrowLeft size={16} className="group-hover:text-blue-500 transition-colors" />
        Back to chemicals
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: 3D Viewer + QR */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div className="card overflow-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <MoleculeViewer formula={chemical.formula} name={chemical.name} hazardLevel={chemical.hazard_level} />
          </motion.div>

          {/* QR Code Section */}
          <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: '#2C3E50' }}>QR Code</h3>
              <motion.button
                onClick={() => setShowQR(!showQR)}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ background: '#EDE9FE', color: '#7C3AED' }}
                whileHover={{ scale: 1.05 }}
              >
                {showQR ? 'Hide' : 'Show QR'}
              </motion.button>
            </div>
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="p-3 rounded-xl" style={{ background: 'white', border: '2px solid #EDE9FE' }}>
                    <QRCode value={qrUrl} size={140} fgColor="#0F2D52" bgColor="#FFFFFF" level="H" />
                  </div>
                  <p className="text-xs text-center" style={{ color: '#94A3B8' }}>Scan to view details</p>
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
                    <Download size={13} /> Download QR
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {!showQR && (
              <p className="text-xs" style={{ color: '#94A3B8' }}>Click "Show QR" to generate the QR code for this chemical.</p>
            )}
          </motion.div>
        </div>

        {/* RIGHT: Details */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Card */}
          <motion.div className="card p-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="font-heading font-bold text-2xl" style={{ color: '#2C3E50' }}>{chemical.name}</h1>
                <p className="text-lg font-mono mt-1" style={{ color: '#4A90E2' }}>{chemical.formula}</p>
                {chemical.cas_number && <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>CAS: {chemical.cas_number}</p>}
              </div>
              <span className="badge text-sm flex-shrink-0" style={{ background: h.bg, color: h.color, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                ⚠️ {chemical.hazard_level.charAt(0).toUpperCase() + chemical.hazard_level.slice(1)}
              </span>
            </div>

            {/* GHS icons */}
            {chemical.ghs_codes?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium mb-2" style={{ color: '#64748B' }}>GHS Hazard Pictograms</p>
                <div className="flex gap-3 flex-wrap">
                  {chemical.ghs_codes.map((code, i) => (
                    <motion.div
                      key={code}
                      initial={{ opacity: 0, scale: 0, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl"
                      style={{ background: h.bg, minWidth: '56px' }}
                    >
                      <span className="text-2xl">{GHSInfo[code]?.icon || '⚗️'}</span>
                      <span className="text-xs text-center" style={{ color: h.color, fontSize: '0.65rem' }}>{GHSInfo[code]?.name || code}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Properties grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Molecular Weight', value: chemical.molecular_weight ? `${chemical.molecular_weight} g/mol` : 'N/A', icon: FlaskConical },
                { label: 'Quantity', value: `${chemical.quantity} ${chemical.quantity_unit}`, icon: Package },
                { label: 'Location', value: chemical.location, icon: MapPin },
                { label: 'Expiry Date', value: chemical.expiry_date ? new Date(chemical.expiry_date).toLocaleDateString() : 'N/A', icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#F8F9FA' }}>
                  <Icon size={15} style={{ color: '#4A90E2', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{label}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: '#2C3E50' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Accordion – Safety Info */}
          <motion.div className="card overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {accordionItems.map(({ key, title, content }, i) => (
              <div key={key} style={{ borderBottom: i < accordionItems.length - 1 ? '1px solid #F0F2F5' : 'none' }}>
                <motion.button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setOpenAccordion(openAccordion === key ? null : key)}
                  whileHover={{ background: '#F8F9FA' }}
                >
                  <span className="font-medium text-sm" style={{ color: '#2C3E50' }}>{title}</span>
                  <motion.span animate={{ rotate: openAccordion === key ? 180 : 0 }} style={{ color: '#94A3B8' }}>▼</motion.span>
                </motion.button>
                <AnimatePresence>
                  {openAccordion === key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: '#64748B' }}>{content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>

          {/* Report Usage */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <motion.button
              className="btn-primary w-full justify-center py-3.5 ripple"
              style={{ fontSize: '1rem' }}
              onClick={() => setShowReportModal(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package size={18} /> Report Usage
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Report Usage Modal */}
      <AnimatePresence>
        {showReportModal && (
          <ReportUsageModal
            chemical={chemical}
            onClose={() => setShowReportModal(false)}
            onSuccess={() => { setShowConfetti(true); fetchChemicals() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
