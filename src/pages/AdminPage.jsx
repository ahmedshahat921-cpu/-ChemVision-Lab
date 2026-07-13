import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, Download, X, Loader2, QrCode, FlaskConical, Sparkles } from 'lucide-react'
import { useChemicalStore } from '../store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { QRCodeSVG as QRCode } from 'qrcode.react'

const PUBCHEM_BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound'

const emptyForm = {
  name: '', formula: '', molecular_weight: '', concentration: '',
  location: '', cabinet: '', hazard_level: 'low', expiry_date: '',
  quantity: '', quantity_unit: 'g', ghs_codes: [], smiles_string: '',
  cas_number: '', pubchem_cid: '', description: '', storage_conditions: '', first_aid: '',
}

function ChemicalForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial || emptyForm)
  const [fetching, setFetching] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  
  // AI Wizard sub-modal states
  const [aiPromptOpen, setAiPromptOpen] = useState(false)
  const [aiName, setAiName] = useState('')
  const [aiLocation, setAiLocation] = useState('')
  const [aiCabinet, setAiCabinet] = useState('')
  const [aiQuantity, setAiQuantity] = useState('')
  const [aiQuantityUnit, setAiQuantityUnit] = useState('g')

  const autoFill = async () => {
    if (!form.name) { toast.error('Enter a chemical name first'); return }
    setFetching(true)
    try {
      const res = await fetch(`${PUBCHEM_BASE}/name/${encodeURIComponent(form.name)}/property/MolecularFormula,MolecularWeight,IUPACName,IsomericSMILES/JSON`)
      const data = await res.json()
      const props = data?.PropertyTable?.Properties?.[0]
      if (props) {
        const cidRes = await fetch(`${PUBCHEM_BASE}/name/${encodeURIComponent(form.name)}/cids/JSON`)
        const cidData = await cidRes.json()
        setForm(f => ({
          ...f,
          formula: props.MolecularFormula || f.formula,
          molecular_weight: props.MolecularWeight || f.molecular_weight,
          smiles_string: props.IsomericSMILES || f.smiles_string,
          pubchem_cid: cidData?.IdentifierList?.CID?.[0] || f.pubchem_cid,
        }))
        toast.success('PubChem data loaded!')
      } else toast.error('Chemical not found on PubChem')
    } catch { toast.error('PubChem fetch failed') }
    setFetching(false)
  }

  const handleAiFill = async () => {
    if (!aiName) { toast.error('Enter a chemical name first'); return }
    if (!aiLocation) { toast.error('Select a location first'); return }
    if (!aiQuantity) { toast.error('Enter quantity first'); return }
    setAiLoading(true)
    try {
      // Invoke the secure Supabase Edge Function with action 'autocomplete'
      const { data, error } = await supabase.functions.invoke('simulate-mixing', {
        body: { action: 'autocomplete', chemicalName: aiName }
      })

      if (error) throw new Error(error.message || 'Server error calling AI edge function')
      if (!data) throw new Error('AI returned an empty response')

      // Calculate Expiry Date based on recommended_shelf_life_months
      let calculatedExpiry = ''
      const shelfLifeMonths = data.recommended_shelf_life_months || 24 // default to 2 years if not provided
      if (shelfLifeMonths) {
        const d = new Date()
        d.setMonth(d.getMonth() + shelfLifeMonths)
        calculatedExpiry = d.toISOString().split('T')[0]
      }

      setForm(f => ({
        ...f,
        name: aiName,
        location: aiLocation,
        cabinet: aiCabinet || null,
        quantity: aiQuantity,
        quantity_unit: aiQuantityUnit,
        expiry_date: calculatedExpiry,
        formula: data.formula || f.formula,
        molecular_weight: data.molecular_weight || f.molecular_weight,
        cas_number: data.cas_number || f.cas_number,
        hazard_level: data.hazard_level || f.hazard_level,
        ghs_codes: data.ghs_codes || f.ghs_codes,
        description: data.description || f.description,
        storage_conditions: data.storage_conditions || f.storage_conditions,
        first_aid: data.first_aid || f.first_aid,
      }))
      
      toast.success('AI completed all chemical details, including Expiry Date!')
      setAiPromptOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('AI autocomplete failed: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const toggleGHS = (code) => {
    setForm(f => ({ ...f, ghs_codes: f.ghs_codes.includes(code) ? f.ghs_codes.filter(c => c !== code) : [...f.ghs_codes, code] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.formula || !form.location || !form.quantity) { toast.error('Fill required fields'); return }
    
    // Clean up empty string fields to null for Postgres column compatibility
    const cleanedData = { ...form }
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '') {
        cleanedData[key] = null
      }
    })

    // Parse values
    cleanedData.molecular_weight = form.molecular_weight ? parseFloat(form.molecular_weight) : null
    cleanedData.quantity = parseFloat(form.quantity)
    cleanedData.pubchem_cid = form.pubchem_cid ? parseInt(form.pubchem_cid, 10) : null

    onSave(cleanedData)
  }

  const ghsCodes = ['GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09']
  const ghsEmoji = { GHS01: '💥', GHS02: '🔥', GHS03: '🔆', GHS04: '💨', GHS05: '⚗️', GHS06: '☠️', GHS07: '⚠️', GHS08: '🫀', GHS09: '🌿' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div className="modal-content p-6 w-full relative" style={{ maxWidth: '600px', position: 'relative', overflow: 'hidden' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
        
        {/* AI Wizard Overlay */}
        {aiPromptOpen && (
          <div className="absolute inset-0 bg-white z-50 p-6 rounded-2xl flex flex-col justify-between" style={{ minHeight: '400px' }}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-bold text-lg text-violet-700 flex items-center gap-2">
                  <Sparkles className="text-violet-500 animate-pulse" size={18} /> AI Chemical Autocomplete Wizard
                </h3>
                <button type="button" onClick={() => setAiPromptOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Enter the name, location, and cabinet. Our AI engine will automatically research and fill formulas, safety codes, descriptions, and storage conditions.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Chemical Name *</label>
                  <input 
                    type="text" 
                    value={aiName} 
                    onChange={(e) => setAiName(e.target.value)} 
                    placeholder="e.g. Nitrobenzene" 
                    className="input-field py-2 text-sm w-full" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Location *</label>
                  <select 
                    value={aiLocation} 
                    onChange={(e) => setAiLocation(e.target.value)} 
                    className="input-field py-2.5 text-sm bg-white w-full border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Location</option>
                    <option value="Lab A - Shelf 1">Lab A - Shelf 1</option>
                    <option value="Lab A - Shelf 2">Lab A - Shelf 2</option>
                    <option value="Lab A - Shelf 3">Lab A - Shelf 3</option>
                    <option value="Lab B - Shelf 1">Lab B - Shelf 1</option>
                    <option value="Lab B - Shelf 2">Lab B - Shelf 2</option>
                    <option value="Lab B - Shelf 3">Lab B - Shelf 3</option>
                    <option value="Lab C - Shelf 1">Lab C - Shelf 1</option>
                    <option value="Lab C - Shelf 2">Lab C - Shelf 2</option>
                    <option value="Lab C - Shelf 3">Lab C - Shelf 3</option>
                    <option value="Lab D - Shelf 1">Lab D - Shelf 1</option>
                    <option value="Lab D - Shelf 2">Lab D - Shelf 2</option>
                    <option value="Lab D - Shelf 3">Lab D - Shelf 3</option>
                    <option value="Storage - Shelf 1">Storage - Shelf 1</option>
                    <option value="Storage - Shelf 2">Storage - Shelf 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cabinet</label>
                  <select 
                    value={aiCabinet} 
                    onChange={(e) => setAiCabinet(e.target.value)} 
                    className="input-field py-2.5 text-sm bg-white w-full border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Cabinet</option>
                    <option value="C1">Cabinet C1</option>
                    <option value="C2">Cabinet C2</option>
                    <option value="C3">Cabinet C3</option>
                    <option value="C4">Cabinet C4</option>
                    <option value="C5">Cabinet C5</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                    <input 
                      type="number" 
                      value={aiQuantity} 
                      onChange={(e) => setAiQuantity(e.target.value)} 
                      placeholder="e.g. 500" 
                      className="input-field py-2 text-sm w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit *</label>
                    <select 
                      value={aiQuantityUnit} 
                      onChange={(e) => setAiQuantityUnit(e.target.value)} 
                      className="input-field py-2.5 text-sm bg-white w-full border border-gray-300 rounded-lg"
                    >
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="mL">Milliliters (mL)</option>
                      <option value="L">Liters (L)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setAiPromptOpen(false)} 
                className="btn-secondary flex-1 justify-center py-2.5 text-xs font-medium"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={aiLoading} 
                onClick={handleAiFill} 
                className="btn-primary flex-1 justify-center py-2.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 border-0 flex items-center gap-1 shadow-md text-white font-medium hover:from-violet-700 hover:to-indigo-700 transition-all"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Generate with AI
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-5">
          <h2 className="font-heading font-bold text-xl" style={{ color: '#2C3E50' }}>{initial ? 'Edit Chemical' : 'Add Chemical'}</h2>
          <button onClick={onClose}><X size={20} style={{ color: '#94A3B8' }} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Auto-fill & AI Autocomplete */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Chemical Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sulfuric Acid" className="input-field" required />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={autoFill} disabled={fetching} className="btn-secondary py-2.5 px-3 text-xs whitespace-nowrap flex items-center gap-1 shadow-sm">
                {fetching ? <Loader2 size={12} className="animate-spin" /> : '🔍'} PubChem
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setAiName(form.name)
                  setAiLocation(form.location)
                  setAiCabinet(form.cabinet)
                  setAiQuantity(form.quantity || '')
                  setAiQuantityUnit(form.quantity_unit || 'g')
                  setAiPromptOpen(true)
                }} 
                className="btn-primary py-2.5 px-3 text-xs whitespace-nowrap bg-gradient-to-r from-violet-600 to-indigo-600 border-0 flex items-center gap-1 shadow-sm"
              >
                <Sparkles size={12} /> AI Autocomplete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Formula *', key: 'formula', placeholder: 'H2SO4' },
              { label: 'MW (g/mol)', key: 'molecular_weight', placeholder: '98.079', type: 'number' },
              { label: 'Quantity *', key: 'quantity', placeholder: '500', type: 'number' },
              { label: 'Unit', key: 'quantity_unit', placeholder: 'g' },
              { label: 'Location *', key: 'location', type: 'select', options: [
                { value: '', label: 'Select Location' },
                { value: 'Lab A - Shelf 1', label: 'Lab A - Shelf 1' },
                { value: 'Lab A - Shelf 2', label: 'Lab A - Shelf 2' },
                { value: 'Lab A - Shelf 3', label: 'Lab A - Shelf 3' },
                { value: 'Lab B - Shelf 1', label: 'Lab B - Shelf 1' },
                { value: 'Lab B - Shelf 2', label: 'Lab B - Shelf 2' },
                { value: 'Lab B - Shelf 3', label: 'Lab B - Shelf 3' },
                { value: 'Lab C - Shelf 1', label: 'Lab C - Shelf 1' },
                { value: 'Lab C - Shelf 2', label: 'Lab C - Shelf 2' },
                { value: 'Lab C - Shelf 3', label: 'Lab C - Shelf 3' },
                { value: 'Lab D - Shelf 1', label: 'Lab D - Shelf 1' },
                { value: 'Lab D - Shelf 2', label: 'Lab D - Shelf 2' },
                { value: 'Lab D - Shelf 3', label: 'Lab D - Shelf 3' },
                { value: 'Storage - Shelf 1', label: 'Storage - Shelf 1' },
                { value: 'Storage - Shelf 2', label: 'Storage - Shelf 2' },
              ]},
              { label: 'Cabinet', key: 'cabinet', type: 'select', options: [
                { value: '', label: 'Select Cabinet' },
                { value: 'C1', label: 'Cabinet C1' },
                { value: 'C2', label: 'Cabinet C2' },
                { value: 'C3', label: 'Cabinet C3' },
                { value: 'C4', label: 'Cabinet C4' },
                { value: 'C5', label: 'Cabinet C5' },
              ]},
              { label: 'CAS Number', key: 'cas_number', placeholder: '7664-93-9' },
              { label: 'Expiry Date', key: 'expiry_date', type: 'date' },
            ].map(({ label, key, placeholder, type = 'text', options }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>{label}</label>
                {type === 'select' ? (
                  <select 
                    value={form[key] || ''} 
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })} 
                    className="input-field py-2 text-sm bg-white"
                  >
                    {options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input type={type} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="input-field py-2 text-sm" />
                )}
              </div>
            ))}
          </div>

          {/* Hazard level */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Hazard Level</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'critical'].map(level => (
                <button key={level} type="button" onClick={() => setForm({ ...form, hazard_level: level })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all`}
                  style={{ background: form.hazard_level === level ? '#4A90E2' : '#F0F2F5', color: form.hazard_level === level ? 'white' : '#64748B' }}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* GHS codes */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#64748B' }}>GHS Hazard Codes</label>
            <div className="flex flex-wrap gap-2">
              {ghsCodes.map(code => (
                <button key={code} type="button" onClick={() => toggleGHS(code)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                  style={{ background: form.ghs_codes.includes(code) ? '#EBF4FF' : '#F0F2F5', border: `1px solid ${form.ghs_codes.includes(code) ? '#4A90E2' : '#E2E8F0'}`, color: form.ghs_codes.includes(code) ? '#1B3A6B' : '#64748B' }}>
                  {ghsEmoji[code]} {code}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Chemical description..." className="input-field text-sm" rows={2} style={{ resize: 'vertical' }} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <motion.button type="submit" disabled={loading} className="btn-primary flex-1 justify-center ripple" whileTap={{ scale: 0.97 }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {initial ? 'Update' : 'Add Chemical'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminPage() {
  const { chemicals, fetchChemicals, addChemical, updateChemical, deleteChemical } = useChemicalStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingChemical, setEditingChemical] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showQRBatch, setShowQRBatch] = useState(false)

  useEffect(() => { fetchChemicals() }, [])

  const filtered = chemicals.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.formula.toLowerCase().includes(search.toLowerCase()))

  const handleSave = async (data) => {
    setSaving(true)
    if (editingChemical) {
      const res = await updateChemical(editingChemical.id, data)
      if (res.success) { 
        toast.success('Chemical updated!')
        setShowForm(false)
        setEditingChemical(null)
        // Generate detailed data in background for updated chemical
        generateDetailedData(editingChemical.id, data.name || editingChemical.name)
      }
      else toast.error(res.error)
    } else {
      const res = await addChemical(data)
      if (res.success) { 
        toast.success('Chemical added!')
        setShowForm(false)
        // Generate detailed data in background for new chemical
        generateDetailedData(res.data.id, data.name)
      }
      else toast.error(res.error)
    }
    setSaving(false)
  }

  // Background function to generate and save AI detailed data
  const generateDetailedData = async (chemicalId, chemicalName) => {
    try {
      toast.loading('🧠 AI is generating detailed properties...', { id: 'ai-details' })
      const { data, error } = await supabase.functions.invoke('simulate-mixing', {
        body: { action: 'generate-details', chemicalName }
      })
      if (error) throw new Error(error.message)
      if (!data || !data.physical) throw new Error('Invalid AI response structure')
      
      // Save to database
      const { error: updateError } = await supabase
        .from('chemicals')
        .update({ detailed_data: data })
        .eq('id', chemicalId)
      
      if (updateError) throw new Error(updateError.message)
      
      // Update local state
      const { chemicals } = useChemicalStore.getState()
      useChemicalStore.setState({
        chemicals: chemicals.map(c => c.id === chemicalId ? { ...c, detailed_data: data } : c)
      })
      
      toast.success('✨ Detailed properties generated by AI!', { id: 'ai-details' })
    } catch (err) {
      console.error('Failed to generate detailed data:', err)
      toast.error('AI details generation failed (chemical still saved)', { id: 'ai-details' })
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    const res = await deleteChemical(id)
    if (res.success) { toast.success('Chemical deleted') }
    else toast.error('Failed to delete: ' + res.error)
  }

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl" style={{ color: '#2C3E50' }}>⚙️ Admin Panel</h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>Manage chemical inventory</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => setShowQRBatch(!showQRBatch)}>
            <QrCode size={16} /> Batch QR
          </button>
          <motion.button className="btn-primary" onClick={() => { setEditingChemical(null); setShowForm(true) }} whileHover={{ scale: 1.02 }}>
            <Plus size={16} /> Add Chemical
          </motion.button>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chemicals..." className="input-field pl-10" />
      </div>

      {/* Batch QR */}
      <AnimatePresence>
        {showQRBatch && (
          <motion.div className="card p-5 mb-5" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#2C3E50' }}>Batch QR Codes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.slice(0, 12).map(c => (
                <div key={c.id} className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: '#F8F9FA' }}>
                  <QRCode value={`${window.location.origin}/chemicals/${c.id}`} size={70} fgColor="#0F2D52" />
                  <p className="text-xs text-center font-medium" style={{ color: '#2C3E50', fontSize: '0.65rem' }}>{c.name.slice(0, 12)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#F8F9FA', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                {['Chemical', 'Formula', 'Hazard', 'Quantity', 'Location', 'Expiry', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#64748B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr key={c.id} className="border-b" style={{ borderColor: '#F0F2F5' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  whileHover={{ background: '#F8F9FA' }}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>{c.name}</p>
                  </td>
                  <td className="px-4 py-3"><code className="text-xs px-2 py-0.5 rounded" style={{ background: '#EBF4FF', color: '#2D6A9F' }}>{c.formula}</code></td>
                  <td className="px-4 py-3"><span className={`badge badge-${c.hazard_level}`}>{c.hazard_level}</span></td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#2C3E50' }}>{c.quantity} {c.quantity_unit}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#64748B' }}>{c.location}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: c.expiry_date && new Date(c.expiry_date) < new Date() ? '#E85D5D' : '#64748B' }}>
                    {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingChemical(c); setShowForm(true) }} className="p-1.5 rounded-lg" style={{ background: '#EBF4FF' }}>
                        <Edit size={13} style={{ color: '#4A90E2' }} />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 rounded-lg" style={{ background: '#FDEAEA' }}>
                        <Trash2 size={13} style={{ color: '#E85D5D' }} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12"><FlaskConical size={32} style={{ color: '#CBD5E1', margin: '0 auto 0.5rem' }} /><p style={{ color: '#94A3B8' }}>No chemicals found</p></div>
          )}
        </div>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ChemicalForm
            initial={editingChemical}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingChemical(null) }}
            loading={saving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
