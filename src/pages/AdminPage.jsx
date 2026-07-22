import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, Download, X, Loader2, QrCode, FlaskConical, Sparkles, AlertTriangle, ClipboardList, Calendar, TrendingUp, Package, Beaker } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useChemicalStore } from '../store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const PUBCHEM_BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound'

const emptyForm = {
  name: '', formula: '', molecular_weight: '', concentration: '',
  location: '', cabinet: '', hazard_level: 'low', expiry_date: '',
  quantity: '', quantity_unit: 'g', ghs_codes: [], smiles_string: '',
  cas_number: '', pubchem_cid: '', description: '', storage_conditions: '', first_aid: '',
}

function ChemicalForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial || emptyForm)
  const { chemicals } = useChemicalStore()
  const { lang } = useLanguage()
  const [fetching, setFetching] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const allLocations = [
    'Lab A - Shelf 1', 'Lab A - Shelf 2', 'Lab A - Shelf 3', 'Lab A - Shelf 4',
    'Lab B - Shelf 1', 'Lab B - Shelf 2', 'Lab B - Shelf 3', 'Lab B - Shelf 4',
    'Lab C - Shelf 1', 'Lab C - Shelf 2', 'Lab C - Shelf 3', 'Lab C - Shelf 4',
    'Lab D - Shelf 1', 'Lab D - Shelf 2', 'Lab D - Shelf 3', 'Lab D - Shelf 4',
    'Storage - Shelf 1', 'Storage - Shelf 2', 'Storage - Shelf 3', 'Storage - Shelf 4',
  ]
  const allCabinets = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']

  const isSpotOccupied = (loc, cab) => {
    return (chemicals || []).some(c => {
      if (!c.is_active || !c.location || !c.cabinet) return false
      if (c.id === (initial?.id || null)) return false
      
      const cLocNorm = c.location.replace(/\s+/g, '').toLowerCase()
      const locNorm = loc.replace(/\s+/g, '').toLowerCase()
      if (cLocNorm !== locNorm) return false
      
      const cCabMatch = c.cabinet.match(/C\d+/i)
      const cCabNorm = cCabMatch ? cCabMatch[0].toUpperCase() : ''
      const cabMatch = cab.match(/C\d+/i)
      const cabNorm = cabMatch ? cabMatch[0].toUpperCase() : ''
      
      return cCabNorm === cabNorm
    })
  }

  const getAvailableLocations = () => {
    return allLocations.filter(loc => {
      return allCabinets.some(cab => !isSpotOccupied(loc, cab))
    })
  }

  const getAvailableCabinets = (selectedLoc) => {
    if (!selectedLoc) return []
    return allCabinets.filter(cab => !isSpotOccupied(selectedLoc, cab))
  }

  // AI Wizard sub-modal states
  const [aiPromptOpen, setAiPromptOpen] = useState(false)
  const [aiName, setAiName] = useState('')
  const [aiLocation, setAiLocation] = useState('')
  const [aiCabinet, setAiCabinet] = useState('')
  const [aiQuantity, setAiQuantity] = useState('')
  const [aiQuantityUnit, setAiQuantityUnit] = useState('g')

  // Validation feedback states
  const [aiError, setAiError] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState([])

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
    if (aiName.trim().length < 3) {
      toast.error('Please enter a valid chemical name (minimum 3 characters)')
      return
    }
    if (!aiLocation) { toast.error('Select a location first'); return }
    if (!aiCabinet) { toast.error('Select a cabinet first'); return }
    if (!aiQuantity) { toast.error('Enter quantity first'); return }

    setAiLoading(true)
    setAiError('')
    setAiSuggestions([])

    try {
      // Invoke the secure Supabase Edge Function with action 'autocomplete'
      const { data, error } = await supabase.functions.invoke('simulate-mixing', {
        body: { action: 'autocomplete', chemicalName: aiName.trim() }
      })

      if (error) throw new Error(error.message || 'Server error calling AI edge function')
      if (!data) throw new Error('AI returned an empty response')

      // If AI detects this name is invalid (gibberish/non-chemical)
      if (data.is_valid === false) {
        setAiError(data.error_message || 'Invalid or unrecognized chemical name.')
        setAiSuggestions(data.suggestions || [])
        toast.error('Unrecognized chemical name!')
        return
      }

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
        name: data.corrected_name || aiName.trim(),
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
    if (!form.name || !form.formula || !form.location || !form.cabinet || !form.quantity) {
      toast.error(lang === 'ar'
        ? 'يرجى ملء جميع الحقول المطلوبة بما في ذلك الموقع والخزانة!'
        : 'Please fill in all required fields, including Location and Cabinet!'
      )
      return
    }

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
          <div 
            className="absolute inset-0 bg-white dark:bg-slate-900 z-50 p-6 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors"
            style={{ minHeight: '400px', direction: lang === 'ar' ? 'rtl' : 'ltr' }}
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-bold text-lg text-violet-600 dark:text-violet-400 flex items-center gap-2">
                  <Sparkles className="text-violet-500 animate-pulse" size={20} />
                  {lang === 'ar' ? 'معالج الإكمال التلقائي بالذكاء الاصطناعي 🪄' : 'AI Chemical Autocomplete Wizard'}
                </h3>
                <button type="button" onClick={() => setAiPromptOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed font-medium">
                {lang === 'ar'
                  ? 'أدخل اسم المادة والموقع والرف. وسيقوم محرك الذكاء الاصطناعي تلقائياً بالبحث وتعبئة الصيغ الكيميائية، أكواد الأمان، الوصف، وشروط التخزين الدقيقة.'
                  : 'Enter the name, location, and cabinet. Our AI engine will automatically research and fill formulas, safety codes, descriptions, and storage conditions.'}
              </p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'اسم المادة الكيميائية *' : 'Chemical Name *'}
                  </label>
                  <input
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: نتروبنزين Nitrobenzene' : 'e.g. Nitrobenzene'}
                    className="input-field py-2.5 text-sm w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'الموقع / المختبر *' : 'Location *'}
                  </label>
                  <select
                    value={aiLocation}
                    onChange={(e) => {
                      setAiLocation(e.target.value)
                      setAiCabinet('')
                    }}
                    className="input-field py-2.5 text-sm w-full font-medium"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">{lang === 'ar' ? 'اختر الموقع' : 'Select Location'}</option>
                    {getAvailableLocations().map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'الرف / الخزانة *' : 'Cabinet *'}
                  </label>
                  <select
                    value={aiCabinet}
                    onChange={(e) => setAiCabinet(e.target.value)}
                    className="input-field py-2.5 text-sm w-full font-medium"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">{lang === 'ar' ? 'اختر الخزانة' : 'Select Cabinet'}</option>
                    {getAvailableCabinets(aiLocation).map(cab => (
                      <option key={cab} value={cab}>{lang === 'ar' ? `خزانة ${cab}` : `Cabinet ${cab}`}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'الكمية *' : 'Quantity *'}
                    </label>
                    <input
                      type="number"
                      value={aiQuantity}
                      onChange={(e) => setAiQuantity(e.target.value)}
                      placeholder="e.g. 500"
                      className="input-field py-2.5 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'الوحدة *' : 'Unit *'}
                    </label>
                    <select
                      value={aiQuantityUnit}
                      onChange={(e) => setAiQuantityUnit(e.target.value)}
                      className="input-field py-2.5 text-sm w-full font-medium"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="g">{lang === 'ar' ? 'جرام (g)' : 'Grams (g)'}</option>
                      <option value="kg">{lang === 'ar' ? 'كيلوجرام (kg)' : 'Kilograms (kg)'}</option>
                      <option value="mL">{lang === 'ar' ? 'مليلتر (mL)' : 'Milliliters (mL)'}</option>
                      <option value="L">{lang === 'ar' ? 'لتر (L)' : 'Liters (L)'}</option>
                    </select>
                  </div>
                </div>

                {/* AI Validation Errors & Suggestions */}
                {aiError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs mt-2">
                    <p className="font-bold mb-1">⚠️ {aiError}</p>
                    {aiSuggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                          {lang === 'ar' ? 'هل تقصد:' : 'Did you mean:'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {aiSuggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => {
                                setAiName(sug)
                                setAiError('')
                                setAiSuggestions([])
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-900/40 hover:text-violet-600 dark:hover:text-violet-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono transition-colors text-xs font-medium"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setAiPromptOpen(false)}
                className="btn-secondary flex-1 justify-center py-2.5 text-xs font-bold"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAiFill}
                className="btn-primary flex-1 justify-center py-2.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 border-0 flex items-center gap-1.5 shadow-md text-white font-bold hover:from-violet-700 hover:to-indigo-700 transition-all cursor-pointer"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {lang === 'ar' ? 'توليد بالذكاء الاصطناعي ✨' : 'Generate with AI ✨'}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-5">
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            {initial ? (lang === 'ar' ? 'تعديل مركب كيميائي' : 'Edit Chemical') : (lang === 'ar' ? 'إضافة مركب كيميائي جديد' : 'Add Chemical')}
          </h2>
          <button onClick={onClose}><X size={20} style={{ color: 'var(--text-subtle)' }} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Auto-fill & AI Autocomplete */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                {lang === 'ar' ? 'اسم المادة الكيميائية *' : 'Chemical Name *'}
              </label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === 'ar' ? 'مثال: Sulfuric Acid' : 'e.g. Sulfuric Acid'} className="input-field" required />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={autoFill} disabled={fetching} className="btn-secondary py-2.5 px-3 text-xs whitespace-nowrap flex items-center gap-1 shadow-sm font-semibold">
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
                  setAiError('')
                  setAiSuggestions([])
                  setAiPromptOpen(true)
                }}
                className="btn-primary py-2.5 px-3 text-xs whitespace-nowrap bg-gradient-to-r from-violet-600 to-indigo-600 border-0 flex items-center gap-1 shadow-sm font-semibold"
              >
                <Sparkles size={12} /> {lang === 'ar' ? 'توليد AI' : 'AI Autocomplete'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: lang === 'ar' ? 'الصيغة الكيميائية *' : 'Formula *', key: 'formula', placeholder: 'H2SO4' },
              { label: lang === 'ar' ? 'الوزن الجزيئي (g/mol)' : 'MW (g/mol)', key: 'molecular_weight', placeholder: '98.079', type: 'number' },
              { label: lang === 'ar' ? 'الكمية *' : 'Quantity *', key: 'quantity', placeholder: '500', type: 'number' },
              { label: lang === 'ar' ? 'الوحدة' : 'Unit', key: 'quantity_unit', placeholder: 'g' },
              {
                label: lang === 'ar' ? 'الموقع / المختبر *' : 'Location *', key: 'location', type: 'select', options: [
                  { value: '', label: lang === 'ar' ? 'اختر الموقع' : 'Select Location' },
                  ...getAvailableLocations().map(loc => ({ value: loc, label: loc }))
                ]
              },
              {
                label: lang === 'ar' ? 'الرف / الخزانة *' : 'Cabinet *', key: 'cabinet', type: 'select', options: [
                  { value: '', label: lang === 'ar' ? 'اختر الخزانة' : 'Select Cabinet' },
                  ...getAvailableCabinets(form.location).map(cab => ({ value: cab, label: lang === 'ar' ? `خزانة ${cab}` : `Cabinet ${cab}` }))
                ]
              },
              { label: lang === 'ar' ? 'رقم CAS' : 'CAS Number', key: 'cas_number', placeholder: '7664-93-9' },
              { label: lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date', key: 'expiry_date', type: 'date' },
            ].map(({ label, key, placeholder, type = 'text', options }) => (
              <div key={key}>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                {type === 'select' ? (
                  <select
                    value={form[key] || ''}
                    onChange={(e) => {
                      if (key === 'location') {
                        setForm({ ...form, location: e.target.value, cabinet: '' })
                      } else {
                        setForm({ ...form, [key]: e.target.value })
                      }
                    }}
                    className="input-field py-2 text-sm font-medium"
                    style={{ cursor: 'pointer' }}
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
            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? 'مستوى الخطورة' : 'Hazard Level'}
            </label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'critical'].map(level => (
                <button key={level} type="button" onClick={() => setForm({ ...form, hazard_level: level })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all`}
                  style={{ background: form.hazard_level === level ? '#4A90E2' : 'var(--chip-bg, #F0F2F5)', color: form.hazard_level === level ? 'white' : 'var(--text-secondary)' }}>
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
  const { lang, t } = useLanguage()
  const { chemicals, fetchChemicals, addChemical, updateChemical, deleteChemical } = useChemicalStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingChemical, setEditingChemical] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showQRBatch, setShowQRBatch] = useState(false)
  const [duplicateCheck, setDuplicateCheck] = useState(null) // null or { match, pendingData }
  const [deleteConfirmation, setDeleteConfirmation] = useState(null) // null or { id, name }
  const [occupiedCheck, setOccupiedCheck] = useState(null) // null or { location, cabinet, occupiedBy, pendingData, suggestions }
  const [showTransactionLog, setShowTransactionLog] = useState(false)
  const [transactionLogs, setTransactionLogs] = useState([])
  const [logPeriod, setLogPeriod] = useState('week') // 'week' | 'month' | 'year'
  const [logLoading, setLogLoading] = useState(false)

  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchChemicals()
    const prefillLoc = searchParams.get('prefillLocation')
    const prefillCab = searchParams.get('prefillCabinet')
    if (prefillLoc) {
      setEditingChemical(null)
      setShowForm(true)
      // Populate prefilled data into emptyForm structure
      emptyForm.location = prefillLoc
      emptyForm.cabinet = prefillCab || ''
    }
  }, [searchParams])

  const fetchTransactionLogs = async (period) => {
    setLogLoading(true)
    try {
      const now = new Date()
      let since = new Date()
      if (period === 'week') since.setDate(now.getDate() - 7)
      else if (period === 'month') since.setMonth(now.getMonth() - 1)
      else if (period === 'year') since.setFullYear(now.getFullYear() - 1)

      const { data: usageLogs, error: usageErr } = await supabase
        .from('usage_logs')
        .select('*, chemicals(name, formula)')
        .gte('timestamp', since.toISOString())
        .order('timestamp', { ascending: false })

      if (usageErr) throw usageErr

      // Build transaction records from usage_logs (consume events)
      const consumeLogs = (usageLogs || []).map(l => ({
        id: l.id,
        type: 'consume',
        chemical: l.chemicals?.name || 'Unknown Chemical',
        formula: l.chemicals?.formula || '',
        amount: `${l.amount_used} ${l.unit}`,
        purpose: l.purpose || '—',
        timestamp: l.timestamp,
      }))

      // Add add/delete events from chemicals created_at / deleted (from chemicals list)
      const addLogs = (chemicals || [])
        .filter(c => {
          const createdAt = new Date(c.created_at || 0)
          return createdAt >= since
        })
        .map(c => ({
          id: `add-${c.id}`,
          type: 'add',
          chemical: c.name,
          formula: c.formula || '',
          amount: `${c.quantity} ${c.quantity_unit}`,
          purpose: c.location ? `${c.location} / ${c.cabinet}` : '—',
          timestamp: c.created_at,
        }))

      const all = [...consumeLogs, ...addLogs].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      )

      setTransactionLogs(all)
    } catch (err) {
      toast.error('Failed to load transaction logs: ' + err.message)
    } finally {
      setLogLoading(false)
    }
  }

  useEffect(() => {
    if (showTransactionLog) fetchTransactionLogs(logPeriod)
  }, [showTransactionLog, logPeriod])

  const downloadReport = async () => {
    const toastId = toast.loading(lang === 'ar' ? 'جاري تحضير ملف الـ PDF للتحميل...' : 'Preparing PDF file for download...')
    try {
      const element = document.getElementById('print-section')
      
      // Temporarily render off-screen to allow html2canvas to capture it
      element.style.display = 'block'
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.top = '0'
      element.style.width = '800px'
      element.classList.remove('hidden')
      
      // Capture the element using html2canvas, resolving default exports for Vite/Rollup
      const html2canvasFn = html2canvas.default || html2canvas
      const canvas = await html2canvasFn(element, {
        scale: 2,
        useCORS: true,
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      
      // Calculate width and height for A4 page format
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      const doc = new jsPDF('p', 'mm', 'a4')
      let position = 0
      
      doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      doc.save(`chemvision-report-${logPeriod}-${new Date().toISOString().slice(0,10)}.pdf`)
      
      // Clean up styles
      element.style.display = 'none'
      element.style.position = ''
      element.style.left = ''
      element.style.top = ''
      element.style.width = ''
      element.classList.add('hidden')
      
      toast.success(lang === 'ar' ? 'تم تحميل ملف الـ PDF بنجاح!' : 'PDF downloaded successfully!', { id: toastId })
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error(
        lang === 'ar' 
          ? `فشل تحميل ملف الـ PDF: ${error.message}` 
          : `Failed to download PDF: ${error.message}`, 
        { id: toastId }
      )
    }
  }

  const filtered = chemicals.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.formula.toLowerCase().includes(search.toLowerCase()))

  const handleSave = async (data) => {
    // 0. Check if the location and cabinet is occupied by another active chemical
    if (data.location && data.cabinet) {
      const occupiedChem = (chemicals || []).find(c =>
        c.is_active &&
        c.id !== (editingChemical?.id || null) &&
        (c.location || '').toLowerCase() === data.location.toLowerCase() &&
        (c.cabinet || '').toLowerCase() === data.cabinet.toLowerCase()
      )

      if (occupiedChem) {
        const suggestions = getEmptySpots(data.location)
        setOccupiedCheck({
          location: data.location,
          cabinet: data.cabinet,
          occupiedBy: occupiedChem.name,
          pendingData: data,
          suggestions: suggestions
        })
        return
      }
    }

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
      // 1. Verify chemical name is valid via AI to block gibberish (e.g. asd)
      toast.loading('🧠 Verifying chemical name...', { id: 'validate-chem' })
      try {
        const { data: aiVal, error: aiErr } = await supabase.functions.invoke('simulate-mixing', {
          body: { action: 'autocomplete', chemicalName: data.name }
        })

        if (aiErr || !aiVal) throw new Error(aiErr?.message || 'Verification service offline')

        if (aiVal.is_valid === false) {
          toast.error(aiVal.error_message || 'Invalid or unrecognized chemical name.', { id: 'validate-chem' })
          setSaving(false)
          return
        }

        // Apply spelling correction if available (e.g., corrected 'etanol' to 'Ethanol')
        if (aiVal.corrected_name) {
          data.name = aiVal.corrected_name
        }

        toast.success('Chemical verified!', { id: 'validate-chem' })
      } catch (err) {
        console.error('Failed to validate chemical name:', err)
        toast.error('Could not verify name with AI, proceeding anyway...', { id: 'validate-chem' })
      }

      // 2. Case-insensitive duplicate check directly in Supabase using the (possibly corrected) name
      const { data: existing, error } = await supabase
        .from('chemicals')
        .select('*')
        .ilike('name', data.name)
        .limit(1)

      if (existing && existing.length > 0) {
        setDuplicateCheck({ match: existing[0], pendingData: data })
        setSaving(false)
        return
      }

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

  const handleAddToStock = async () => {
    if (!duplicateCheck) return
    const { match, pendingData } = duplicateCheck
    const updatedQty = Number(match.quantity || 0) + Number(pendingData.quantity || 0)

    setSaving(true)
    const res = await updateChemical(match.id, {
      quantity: updatedQty,
      is_active: true
    })
    setSaving(false)

    if (res.success) {
      toast.success(`Successfully added ${pendingData.quantity} ${pendingData.quantity_unit} to "${match.name}" stock!`)
      setDuplicateCheck(null)
      setShowForm(false)
    } else {
      toast.error('Failed to update stock: ' + res.error)
    }
  }

  const handleRestoreInactive = async () => {
    if (!duplicateCheck) return
    const { match, pendingData } = duplicateCheck

    // Check if the target spot is occupied by another active chemical
    if (pendingData.location && pendingData.cabinet) {
      const occupiedChem = (chemicals || []).find(c =>
        c.is_active &&
        c.id !== match.id &&
        (c.location || '').toLowerCase() === pendingData.location.toLowerCase() &&
        (c.cabinet || '').toLowerCase() === pendingData.cabinet.toLowerCase()
      )

      if (occupiedChem) {
        const suggestions = getEmptySpots(pendingData.location)
        setOccupiedCheck({
          location: pendingData.location,
          cabinet: pendingData.cabinet,
          occupiedBy: occupiedChem.name,
          pendingData: { ...pendingData, id: match.id, isRestore: true },
          suggestions: suggestions
        })
        return
      }
    }

    setSaving(true)
    const res = await updateChemical(match.id, {
      ...pendingData,
      is_active: true
    })
    setSaving(false)

    if (res.success) {
      toast.success(`"${match.name}" has been restored and updated successfully!`)
      // Refresh detailed data
      generateDetailedData(match.id, pendingData.name)
      setDuplicateCheck(null)
      setShowForm(false)
    } else {
      toast.error('Failed to restore: ' + res.error)
    }
  }

  const getEmptySpots = (currentLocation) => {
    const list = []
    let targetLab = "Lab A"
    if (currentLocation) {
      const match = currentLocation.match(/(Lab\s+[A-D]|Storage)/i)
      if (match) {
        targetLab = match[1]
      }
    }
    const labsList = [targetLab, "Lab A", "Lab B", "Lab C", "Lab D", "Storage"]
    const uniqueLabs = [...new Set(labsList)]
    const shelvesList = [1, 2, 3, 4]
    const cabinetsList = ["C1", "C2", "C3", "C4", "C5", "C6"]
    
    for (const lab of uniqueLabs) {
      for (const shelf of shelvesList) {
        for (const cab of cabinetsList) {
          const locStr = `${lab} - Shelf ${shelf}`
          const isOccupied = (chemicals || []).some(c =>
            c.is_active &&
            c.id !== (editingChemical?.id || occupiedCheck?.pendingData?.id || null) &&
            (c.location || '').toLowerCase() === locStr.toLowerCase() &&
            (c.cabinet || '').toLowerCase() === cab.toLowerCase()
          )
          if (!isOccupied) {
            list.push({ location: locStr, cabinet: cab })
            if (list.length >= 4) return list
          }
        }
      }
    }
    return list
  }

  const handleSelectSuggestedSpot = async (spot) => {
    if (!occupiedCheck) return
    const updatedData = {
      ...occupiedCheck.pendingData,
      location: spot.location,
      cabinet: spot.cabinet
    }
    setOccupiedCheck(null)
    
    if (occupiedCheck.pendingData.isRestore) {
      setSaving(true)
      const res = await updateChemical(occupiedCheck.pendingData.id, {
        ...updatedData,
        is_active: true
      })
      setSaving(false)
      if (res.success) {
        toast.success(`"${occupiedCheck.pendingData.name}" has been restored and updated successfully!`)
        generateDetailedData(occupiedCheck.pendingData.id, updatedData.name)
        setDuplicateCheck(null)
        setShowForm(false)
      } else {
        toast.error('Failed to restore: ' + res.error)
      }
    } else {
      await handleSave(updatedData)
    }
  }

  const handleEditExisting = () => {
    if (!duplicateCheck) return
    const { match } = duplicateCheck
    setEditingChemical(match)
    setDuplicateCheck(null)
  }

  const handleDeleteClick = (id, name) => {
    setDeleteConfirmation({ id, name })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return
    const { id } = deleteConfirmation
    setSaving(true)
    const res = await deleteChemical(id)
    setSaving(false)
    setDeleteConfirmation(null)
    if (res.success) {
      toast.success('Chemical deleted successfully!')
    } else {
      toast.error('Failed to delete: ' + res.error)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl whitespace-nowrap" style={{ color: 'var(--text-primary, #2C3E50)' }}>
            ⚙️ {lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#64748B' }}>
            {lang === 'ar' ? 'إدارة مخزون المواد الكيميائية' : 'Manage chemical inventory'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
          <motion.button
            className="btn-secondary justify-center py-2.5 text-xs sm:text-sm"
            onClick={() => setShowQRBatch(!showQRBatch)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <QrCode size={15} /> Batch QR
          </motion.button>

          <motion.button
            className="btn-secondary justify-center py-2.5 text-xs sm:text-sm"
            onClick={() => setShowTransactionLog(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ borderColor: '#A855F7', color: '#7C3AED', background: '#F5F3FF' }}
          >
            <ClipboardList size={15} /> {lang === 'ar' ? 'سجل المعاملات' : 'Transaction Log'}
          </motion.button>

          <motion.button
            className="btn-primary col-span-2 sm:col-span-1 justify-center py-2.5 text-xs sm:text-sm font-bold shadow-md"
            onClick={() => { setEditingChemical(null); setShowForm(true) }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> {lang === 'ar' ? 'إضافة مادة' : 'Add Chemical'}
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
                  <QRCode
                    value={`${window.location.origin}/chemicals/${c.id}`}
                    size={96}
                    fgColor="#0F2D52"
                    bgColor="#FFFFFF"
                    level="H"
                    includeMargin={true}
                  />
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
          <table className="w-full" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {[
                  { en: 'Chemical', ar: 'المادة الكيميائية' },
                  { en: 'Formula', ar: 'الصيغة' },
                  { en: 'Hazard', ar: 'الخطورة' },
                  { en: 'Quantity', ar: 'الكمية' },
                  { en: 'Location', ar: 'الموقع' },
                  { en: 'Expiry', ar: 'الانتهاء' },
                  { en: 'Actions', ar: 'الإجراءات' }
                ].map(h => (
                  <th key={h.en} className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {lang === 'ar' ? h.ar : h.en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60">
                      {c.formula}
                    </code>
                  </td>
                  <td className="px-4 py-3"><span className={`badge badge-${c.hazard_level}`}>{c.hazard_level}</span></td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.quantity} {c.quantity_unit}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{c.location}</td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: c.expiry_date && new Date(c.expiry_date) < new Date() ? '#E85D5D' : 'var(--text-subtle)' }}>
                    {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditingChemical(c); setShowForm(true) }} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteClick(c.id, c.name)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <FlaskConical size={32} className="text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-400 text-sm">{lang === 'ar' ? 'لم يتم العثور على مواد كيميائية' : 'No chemicals found'}</p>
            </div>
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

      {/* Duplicate Chemical Alert Modal */}
      <AnimatePresence>
        {duplicateCheck && (
          <div className="modal-overlay" onClick={() => setDuplicateCheck(null)}>
            <motion.div
              className="modal-content p-6 w-full relative"
              style={{ maxWidth: '480px' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <AlertTriangle size={32} />
                <h3 className="font-heading font-bold text-lg text-slate-800">
                  {duplicateCheck.match.is_active
                    ? 'Chemical Already Exists'
                    : 'Chemical Previously Deleted'}
                </h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600 mb-6 leading-relaxed">
                {duplicateCheck.match.is_active ? (
                  <>
                    <p>
                      <strong>"{duplicateCheck.match.name}"</strong> already exists in inventory at
                      <strong> {duplicateCheck.match.location}</strong> (Cabinet: {duplicateCheck.match.cabinet || 'None'})
                      with quantity <strong>{duplicateCheck.match.quantity} {duplicateCheck.match.quantity_unit}</strong>.
                    </p>
                    <p className="text-xs text-slate-400 border-t pt-2">
                      هذا المركب موجود بالفعل في المخزون بالموقع المحدد وبكمية {duplicateCheck.match.quantity} {duplicateCheck.match.quantity_unit}.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>"{duplicateCheck.match.name}"</strong> exists but is deactivated (archived/deleted).
                      Would you like to restore and update it?
                    </p>
                    <p className="text-xs text-slate-400 border-t pt-2">
                      هذا المركب موجود مسبقاً ولكنه غير نشط (محذوف). هل ترغب في استعادته وتحديث بياناته؟
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {duplicateCheck.match.is_active ? (
                  <>
                    <button
                      onClick={handleAddToStock}
                      className="btn-primary justify-center py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-0 flex items-center gap-1"
                    >
                      ➕ Add to Existing Stock (+{duplicateCheck.pendingData.quantity} {duplicateCheck.pendingData.quantity_unit})
                    </button>
                    <button
                      onClick={handleEditExisting}
                      className="btn-secondary justify-center py-2.5 border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                    >
                      ✏️ Edit Existing Chemical Details
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleRestoreInactive}
                    className="btn-primary justify-center py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 flex items-center gap-1"
                  >
                    🔄 Restore & Update Chemical
                  </button>
                )}
                <button
                  onClick={() => setDuplicateCheck(null)}
                  className="btn-secondary justify-center py-2.5 border-0 hover:bg-slate-100 text-slate-500 flex items-center gap-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation && (
          <div className="modal-overlay" onClick={() => setDeleteConfirmation(null)}>
            <motion.div
              className="modal-content p-6 w-full relative"
              style={{ maxWidth: '400px' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4 text-rose-500">
                <Trash2 size={32} />
                <h3 className="font-heading font-bold text-lg text-slate-800">
                  Delete Chemical?
                </h3>
              </div>

              <div className="space-y-2 text-sm text-slate-600 mb-6 leading-relaxed">
                <p>
                  Are you sure you want to delete <strong>"{deleteConfirmation.name}"</strong>?
                  This will temporarily deactivate it from the active inventory.
                </p>
                <p className="text-xs text-slate-400 border-t pt-2">
                  هل أنت متأكد من رغبتك في حذف المادة "{deleteConfirmation.name}"؟ سيتم إلغاء تنشيطها من المخزون.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="btn-primary flex-1 justify-center py-2 bg-rose-600 hover:bg-rose-700 border-0 flex items-center gap-1 text-white font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="btn-secondary flex-1 justify-center py-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Occupied Spot Alert Modal */}
      <AnimatePresence>
        {occupiedCheck && (
          <div className="modal-overlay" onClick={() => setOccupiedCheck(null)}>
            <motion.div
              className="modal-content p-6 w-full relative"
              style={{ maxWidth: '480px', direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4 text-rose-500">
                <AlertTriangle size={32} />
                <h3 className="font-heading font-bold text-lg text-slate-800">
                  {lang === 'ar' ? 'الموقع مشغول حالياً' : 'Storage Location Occupied'}
                </h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600 mb-6 leading-relaxed">
                <p>
                  {lang === 'ar' ? (
                    <>
                      عذراً، هذا المكان <strong>({occupiedCheck.location} - {occupiedCheck.cabinet})</strong> ممتلئ ومستغل حالياً بواسطة المركب <strong>"{occupiedCheck.occupiedBy}"</strong>.
                    </>
                  ) : (
                    <>
                      Sorry, this spot <strong>({occupiedCheck.location} - {occupiedCheck.cabinet})</strong> is currently occupied by <strong>"{occupiedCheck.occupiedBy}"</strong>.
                    </>
                  )}
                </p>
                <p className="text-xs font-bold text-slate-400 border-t pt-2 uppercase tracking-wide">
                  {lang === 'ar' ? 'الأماكن الشاغرة المقترحة:' : 'Suggested Available Spots:'}
                </p>
                
                {occupiedCheck.suggestions.length === 0 ? (
                  <p className="text-xs italic text-red-500 font-semibold">
                    {lang === 'ar' ? 'لا توجد أماكن شاغرة حالياً في المستودع!' : 'No empty spots available in the storage right now!'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {occupiedCheck.suggestions.map((spot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSuggestedSpot(spot)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-sm"
                        style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                      >
                        <div>
                          <span className="block text-slate-800">{spot.location}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Cabinet: {spot.cabinet}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                          {lang === 'ar' ? 'اختيار' : 'Choose'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 border-t pt-4">
                <button
                  onClick={() => setOccupiedCheck(null)}
                  className="btn-secondary flex-1 justify-center py-2.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  {lang === 'ar' ? 'إلغاء وتعديل يدوي' : 'Cancel & Edit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Log Modal */}
      <AnimatePresence>
        {showTransactionLog && (
          <div className="modal-overlay" onClick={() => setShowTransactionLog(false)}>
            <motion.div
              className="modal-content w-full relative flex flex-col"
              style={{ maxWidth: '780px', maxHeight: '88vh' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                    <ClipboardList size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-800">
                      {lang === 'ar' ? 'سجل المعاملات والتقارير' : 'Transaction Log & Reports'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'ar' ? 'جميع العمليات على مواد المخزون' : 'All inventory operations & consumption events'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowTransactionLog(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              {/* Period Filter + Download */}
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100" style={{ background: '#FAFBFD' }}>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">{lang === 'ar' ? 'الفترة الزمنية:' : 'Time Period:'}</span>
                  {['week', 'month', 'year'].map(p => (
                    <button
                      key={p}
                      onClick={() => setLogPeriod(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: logPeriod === p ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : '#F0F2F5',
                        color: logPeriod === p ? 'white' : '#64748B',
                      }}
                    >
                      {p === 'week' ? (lang === 'ar' ? 'الأسبوع' : 'Week') : p === 'month' ? (lang === 'ar' ? 'الشهر' : 'Month') : (lang === 'ar' ? 'السنة' : 'Year')}
                    </button>
                  ))}
                </div>
                <motion.button
                  onClick={downloadReport}
                  disabled={transactionLogs.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Download size={13} />
                  {lang === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                </motion.button>
              </div>

              {/* Summary stats */}
              {!logLoading && transactionLogs.length > 0 && (
                <div className="grid grid-cols-3 gap-3 px-5 pt-4">
                  {[
                    {
                      label: lang === 'ar' ? 'إجمالي العمليات' : 'Total Events',
                      value: transactionLogs.length,
                      color: '#7C3AED', bg: '#F5F3FF',
                      icon: <TrendingUp size={14} />,
                    },
                    {
                      label: lang === 'ar' ? 'عمليات الاستهلاك' : 'Consumptions',
                      value: transactionLogs.filter(l => l.type === 'consume').length,
                      color: '#E85D5D', bg: '#FDEAEA',
                      icon: <Beaker size={14} />,
                    },
                    {
                      label: lang === 'ar' ? 'مواد أضيفت' : 'Chemicals Added',
                      value: transactionLogs.filter(l => l.type === 'add').length,
                      color: '#10B981', bg: '#ECFDF5',
                      icon: <Package size={14} />,
                    },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-2 p-3 rounded-xl border" style={{ background: stat.bg, borderColor: stat.color + '30' }}>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                      <div>
                        <p className="text-lg font-bold leading-none" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[10px] font-medium mt-0.5 text-slate-500">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Logs list */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                {logLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 size={28} className="animate-spin text-violet-500" />
                    <p className="text-sm text-slate-400">{lang === 'ar' ? 'جاري تحميل السجل...' : 'Loading transactions...'}</p>
                  </div>
                ) : transactionLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <ClipboardList size={36} className="text-slate-200" />
                    <p className="text-sm text-slate-400 font-medium">
                      {lang === 'ar' ? 'لا توجد معاملات في هذه الفترة الزمنية' : 'No transactions found in this period'}
                    </p>
                  </div>
                ) : (
                  transactionLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                    >
                      {/* Type Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: log.type === 'consume' ? '#FDEAEA' : '#ECFDF5',
                          color: log.type === 'consume' ? '#E85D5D' : '#10B981',
                        }}
                      >
                        {log.type === 'consume' ? <Beaker size={14} /> : <Package size={14} />}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800 truncate">{log.chemical}</span>
                          {log.formula && (
                            <code className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: '#EBF4FF', color: '#2D6A9F' }}>{log.formula}</code>
                          )}
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: log.type === 'consume' ? '#FDEAEA' : '#ECFDF5',
                              color: log.type === 'consume' ? '#E85D5D' : '#10B981',
                            }}
                          >
                            {log.type === 'consume'
                              ? (lang === 'ar' ? 'استهلاك' : 'Consumption')
                              : (lang === 'ar' ? 'إضافة للمخزون' : 'Added')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {log.type === 'consume' ? '📋 ' : '📍 '}
                          {log.purpose}
                          {log.amount && <span className="font-semibold text-slate-700"> — {log.amount}</span>}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-medium text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                        <p className="text-[10px] text-slate-300">
                          {new Date(log.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between" style={{ background: '#FAFBFD' }}>
                <p className="text-xs text-slate-400">
                  {transactionLogs.length > 0 && `${transactionLogs.length} ${lang === 'ar' ? 'معاملة' : 'transactions'}`}
                </p>
                <button
                  onClick={() => setShowTransactionLog(false)}
                  className="btn-secondary py-1.5 px-4 text-xs font-bold"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Section (Hidden on screen, shown on print) */}
      <div id="print-section" className="hidden" style={{ color: '#1E293B', backgroundColor: '#FFFFFF' }}>
        <div className="flex justify-between items-center pb-4 mb-6" style={{ borderBottom: '2px solid #7C3AED', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div className="text-2xl font-bold" style={{ color: '#7C3AED' }}>🧪 ChemVision Lab Hub</div>
          <div className="text-lg font-bold" style={{ color: '#1E293B' }}>
            {lang === 'ar' ? 'تقرير سجل المعاملات والتقارير' : 'Transaction Log Report'}
          </div>
        </div>

        <div className="p-4 rounded-xl mb-6 text-sm leading-relaxed" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <div><strong>{lang === 'ar' ? 'الفترة الزمنية للتقرير:' : 'Report Time Period:'}</strong> {
            logPeriod === 'week' 
              ? (lang === 'ar' ? 'الأسبوع الأخير' : 'Last 7 Days') 
              : logPeriod === 'month' 
                ? (lang === 'ar' ? 'الشهر الأخير' : 'Last 30 Days') 
                : (lang === 'ar' ? 'السنة الأخيرة' : 'Last Year')
          }</div>
          <div><strong>{lang === 'ar' ? 'تاريخ ووقت التصدير:' : 'Generated At:'}</strong> {new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</div>
          <div><strong>{lang === 'ar' ? 'تم التصدير بواسطة:' : 'Generated By:'}</strong> Admin Panel</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg text-center" style={{ border: '1px solid #DDD6FE', backgroundColor: '#F5F3FF' }}>
            <div className="text-xs font-semibold" style={{ color: '#7C3AED' }}>{lang === 'ar' ? 'إجمالي العمليات' : 'Total Events'}</div>
            <div className="text-xl font-bold" style={{ color: '#6D28D9' }}>{transactionLogs.length}</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2' }}>
            <div className="text-xs font-semibold" style={{ color: '#EF4444' }}>{lang === 'ar' ? 'عمليات الاستهلاك' : 'Consumptions'}</div>
            <div className="text-xl font-bold" style={{ color: '#B91C1C' }}>{transactionLogs.filter(l => l.type === 'consume').length}</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ border: '1px solid #D1FAE5', backgroundColor: '#ECFDF5' }}>
            <div className="text-xs font-semibold" style={{ color: '#10B981' }}>{lang === 'ar' ? 'مواد كيميائية مضافة' : 'Chemicals Added'}</div>
            <div className="text-xl font-bold" style={{ color: '#047857' }}>{transactionLogs.filter(l => l.type === 'add').length}</div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-xs" style={{ border: '1px solid #E2E8F0', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <th className="p-3 font-semibold" style={{ border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#475569', textAlign: lang === 'ar' ? 'right' : 'left' }}>{lang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</th>
              <th className="p-3 font-semibold" style={{ border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#475569', textAlign: lang === 'ar' ? 'right' : 'left' }}>{lang === 'ar' ? 'العملية' : 'Event Type'}</th>
              <th className="p-3 font-semibold" style={{ border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#475569', textAlign: lang === 'ar' ? 'right' : 'left' }}>{lang === 'ar' ? 'المادة الكيميائية' : 'Chemical'}</th>
              <th className="p-3 font-semibold" style={{ border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#475569', textAlign: lang === 'ar' ? 'right' : 'left' }}>{lang === 'ar' ? 'الصيغة الكيميائية' : 'Formula'}</th>
              <th className="p-3 font-semibold" style={{ border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#475569', textAlign: lang === 'ar' ? 'right' : 'left' }}>{lang === 'ar' ? 'الكمية / الموقع' : 'Amount / Location'}</th>
              <th className="p-3 font-semibold" style={{ border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#475569', textAlign: lang === 'ar' ? 'right' : 'left' }}>{lang === 'ar' ? 'التفاصيل / الغرض' : 'Purpose / Location'}</th>
            </tr>
          </thead>
          <tbody>
            {transactionLogs.map((l, index) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                <td className="p-3 whitespace-nowrap" style={{ border: '1px solid #E2E8F0', textAlign: lang === 'ar' ? 'right' : 'left' }}>{new Date(l.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</td>
                <td className="p-3 text-center" style={{ border: '1px solid #E2E8F0', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: l.type === 'consume' ? '#FEE2E2' : '#D1FAE5', color: l.type === 'consume' ? '#B91C1C' : '#047857' }}>
                    {l.type === 'consume' ? (lang === 'ar' ? 'استهلاك' : 'Consumption') : (lang === 'ar' ? 'إضافة' : 'Added')}
                  </span>
                </td>
                <td className="p-3 font-semibold" style={{ border: '1px solid #E2E8F0', textAlign: lang === 'ar' ? 'right' : 'left' }}>{l.chemical}</td>
                <td className="p-3 font-mono text-[10px]" style={{ border: '1px solid #E2E8F0', textAlign: lang === 'ar' ? 'right' : 'left' }}>{l.formula || '—'}</td>
                <td className="p-3" style={{ border: '1px solid #E2E8F0', textAlign: lang === 'ar' ? 'right' : 'left' }}>{l.amount}</td>
                <td className="p-3" style={{ border: '1px solid #E2E8F0', textAlign: lang === 'ar' ? 'right' : 'left' }}>{l.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center text-[10px] mt-10 pt-4" style={{ color: '#94A3B8', borderTop: '1px dashed #E2E8F0' }}>
          {lang === 'ar' 
            ? 'تم إنشاء هذا التقرير تلقائيًا بواسطة نظام ChemVision لإدارة المختبرات الذكية.' 
            : 'This report was automatically generated by ChemVision Smart Laboratory Management System.'
          }
        </div>
      </div>
    </div>
  )
}
