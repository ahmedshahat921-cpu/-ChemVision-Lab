import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, Download, X, Loader2, QrCode, FlaskConical } from 'lucide-react'
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

  const toggleGHS = (code) => {
    setForm(f => ({ ...f, ghs_codes: f.ghs_codes.includes(code) ? f.ghs_codes.filter(c => c !== code) : [...f.ghs_codes, code] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.formula || !form.location || !form.quantity) { toast.error('Fill required fields'); return }
    onSave({ ...form, molecular_weight: form.molecular_weight ? parseFloat(form.molecular_weight) : null, quantity: parseFloat(form.quantity) })
  }

  const ghsCodes = ['GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09']
  const ghsEmoji = { GHS01: '💥', GHS02: '🔥', GHS03: '🔆', GHS04: '💨', GHS05: '⚗️', GHS06: '☠️', GHS07: '⚠️', GHS08: '🫀', GHS09: '🌿' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div className="modal-content p-6 w-full" style={{ maxWidth: '600px' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-heading font-bold text-xl" style={{ color: '#2C3E50' }}>{initial ? 'Edit Chemical' : 'Add Chemical'}</h2>
          <button onClick={onClose}><X size={20} style={{ color: '#94A3B8' }} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Auto-fill */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Chemical Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sulfuric Acid" className="input-field" required />
            </div>
            <div className="self-end">
              <button type="button" onClick={autoFill} disabled={fetching} className="btn-secondary py-2.5 px-3 text-xs whitespace-nowrap">
                {fetching ? <Loader2 size={14} className="animate-spin" /> : '🔍'} PubChem
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Formula *', key: 'formula', placeholder: 'H2SO4' },
              { label: 'MW (g/mol)', key: 'molecular_weight', placeholder: '98.079', type: 'number' },
              { label: 'Quantity *', key: 'quantity', placeholder: '500', type: 'number' },
              { label: 'Unit', key: 'quantity_unit', placeholder: 'g' },
              { label: 'Location *', key: 'location', placeholder: 'Lab A - Shelf 1' },
              { label: 'Cabinet', key: 'cabinet', placeholder: 'C1' },
              { label: 'CAS Number', key: 'cas_number', placeholder: '7664-93-9' },
              { label: 'Expiry Date', key: 'expiry_date', type: 'date' },
            ].map(({ label, key, placeholder, type = 'text' }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="input-field py-2 text-sm" />
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
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Chemical description..." className="input-field text-sm" rows={2} style={{ resize: 'vertical' }} />
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
  const { chemicals, fetchChemicals, addChemical, updateChemical } = useChemicalStore()
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
      if (res.success) { toast.success('Chemical updated!'); setShowForm(false); setEditingChemical(null) }
      else toast.error(res.error)
    } else {
      const res = await addChemical(data)
      if (res.success) { toast.success('Chemical added!'); setShowForm(false) }
      else toast.error(res.error)
    }
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    const { error } = await supabase.from('chemicals').update({ is_active: false }).eq('id', id)
    if (!error) { toast.success('Chemical deleted'); fetchChemicals() }
    else toast.error('Failed to delete')
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
