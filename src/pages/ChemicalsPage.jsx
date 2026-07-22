import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, FlaskConical, QrCode, AlertTriangle, Clock, ChevronDown } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useChemicalStore } from '../store'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import toast from 'react-hot-toast'
import { useLanguage } from '../hooks/useLanguage'

const hazardColors = {
  low: { bg: '#E8FBF6', color: '#2A7060', dot: '#5DB9A0' },
  medium: { bg: '#FEF3DC', color: '#A66410', dot: '#F5A623' },
  high: { bg: '#FDEAEA', color: '#A02A2A', dot: '#E85D5D' },
  critical: { bg: '#E85D5D', color: 'white', dot: '#A02A2A' },
}

const GHSIcons = {
  GHS01: '💥', GHS02: '🔥', GHS03: '🔆', GHS04: '💨',
  GHS05: '⚗️', GHS06: '☠️', GHS07: '⚠️', GHS08: '🫀', GHS09: '🌿',
}

// Miniature clean glass conical flask icon for cards
function MiniFlask({ hazardLevel }) {
  const liquidColors = {
    low: { primary: '#5DB9A0', secondary: '#3D9B83' },
    medium: { primary: '#F5A623', secondary: '#D4861A' },
    high: { primary: '#E85D5D', secondary: '#C93C3C' },
    critical: { primary: '#A02A2A', secondary: '#7F1D1D' },
  }
  const colorSet = liquidColors[hazardLevel] || liquidColors.low

  return (
    <svg width="44" height="48" viewBox="0 0 40 44" className="flex-shrink-0 drop-shadow-sm overflow-visible">
      {/* Liquid at the bottom */}
      <path
        d="M 24 28 L 10 39 C 9 40, 11 41, 13 41 L 27 41 C 29 41, 31 40, 30 39 L 16 28 Z"
        fill={colorSet.primary}
        opacity="0.8"
      />
      <ellipse cx="20" cy="28" rx="4" ry="1" fill={colorSet.secondary} opacity="0.9" />

      {/* Flask Glass Outline */}
      <path
        d="M 17 4 L 17 12 L 7 36 C 6 38, 9 41, 12 41 L 28 41 C 31 41, 34 38, 33 36 L 23 12 L 23 4 Z"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <ellipse cx="20" cy="4" rx="3" ry="0.8" fill="none" stroke="#94A3B8" strokeWidth="1.5" opacity="0.8" />

      {/* Highlight reflections */}
      <path d="M 18 6 L 18 10 M 18 12 L 11 36" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function ChemicalCard({ chemical, index }) {
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const h = hazardColors[chemical.hazard_level] || hazardColors.low
  const isExpiringSoon = chemical.expiry_date && (new Date(chemical.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) <= 30
  const isExpired = chemical.expiry_date && new Date(chemical.expiry_date) < new Date()

  return (
    <motion.div
      className={`card cursor-pointer overflow-hidden group text-left ${lang === 'ar' ? 'rtl' : 'ltr'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      onClick={() => navigate(`/chemicals/${chemical.id}`)}
      whileHover={{ y: -4 }}
      layout
    >
      {/* Top color bar */}
      <div className="h-1.5" style={{ background: h.dot }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Clean Mini Conical Flask Icon instead of formula text */}
            <MiniFlask hazardLevel={chemical.hazard_level} />
            <div className="min-w-0 text-left">
              <h3 className="font-bold text-sm leading-tight truncate text-left" style={{ color: 'var(--text-primary)', maxWidth: '140px' }}>{chemical.name}</h3>
              <p className="text-xs mt-0.5 text-left font-medium" style={{ color: 'var(--text-subtle)' }}>{chemical.formula}</p>
            </div>
          </div>
          {/* Hazard badge */}
          {isExpired ? (
            <span className="badge text-[10px] font-bold flex-shrink-0 animate-pulse border" style={{ background: '#FDEAEA', color: '#E85D5D', borderColor: '#E85D5D' }}>
              ⚠️ {lang === 'ar' ? 'منتهي الصلاحية' : 'EXPIRED'}
            </span>
          ) : (
            <span className="badge text-xs flex-shrink-0" style={{ background: h.bg, color: h.color }}>
              {lang === 'ar'
                ? (chemical.hazard_level === 'safe' || chemical.hazard_level === 'low' ? 'آمن' : chemical.hazard_level === 'warning' || chemical.hazard_level === 'medium' ? 'تحذير' : 'خطر')
                : chemical.hazard_level
              }
            </span>
          )}
        </div>

        {/* GHS icons */}
        {chemical.ghs_codes?.length > 0 && (
          <div className="flex gap-1 mb-3">
            {chemical.ghs_codes.slice(0, 4).map(code => (
              <span key={code} className="text-base" title={code}>{GHSIcons[code] || '⚗️'}</span>
            ))}
            {chemical.ghs_codes.length > 4 && <span className="text-xs font-semibold" style={{ color: 'var(--text-subtle)' }}>+{chemical.ghs_codes.length - 4}</span>}
          </div>
        )}

        {/* Details */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'الكمية' : 'Quantity'}</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{chemical.quantity} {chemical.quantity_unit}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'الموقع' : 'Location'}</span>
            <span className="font-bold truncate ml-2" style={{ color: 'var(--text-primary)', maxWidth: '160px' }} title={`${chemical.cabinet ? `(${chemical.cabinet}) ` : ''}${chemical.location}`}>
              {chemical.cabinet ? `(${chemical.cabinet}) ` : ''}{chemical.location}
            </span>
          </div>
          {chemical.expiry_date && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expires'}</span>
              <span className="font-bold flex items-center gap-1" style={{ color: isExpired ? '#E85D5D' : isExpiringSoon ? '#F5A623' : '#5DB9A0' }}>
                {(isExpired || isExpiringSoon) && <Clock size={10} />}
                {new Date(chemical.expiry_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <motion.button
            className="btn-primary py-1.5 px-3 text-xs flex-1 justify-center"
            onClick={(e) => { e.stopPropagation(); navigate(`/chemicals/${chemical.id}`) }}
            whileTap={{ scale: 0.95 }}
          >
            {t('view_details')}
          </motion.button>
          <motion.button
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            onClick={(e) => { e.stopPropagation() }}
            whileTap={{ scale: 0.95 }}
            title="Show QR"
          >
            <QrCode size={14} className="text-purple-600 dark:text-purple-400" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ChemicalsPage() {
  const { filteredChemicals, fetchChemicals, loading, searchQuery, setSearch, setFilter, filters, error } = useChemicalStore()
  const [showFilters, setShowFilters] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { lang, t } = useLanguage()
  const searchRef = useRef(null)
  const [searchParams] = useSearchParams()

  const filterParam = searchParams.get('filter')
  const usedIdsStr = searchParams.get('ids')

  useEffect(() => {
    fetchChemicals()

    // Clear any previous filters before applying new parameters
    setFilter('hazardLevel', 'all')
    setFilter('location', 'all')
    setFilter('expiryStatus', 'all')
    setSearch('')

    if (filterParam === 'expiring') {
      setFilter('expiryStatus', 'expiring')
      setShowFilters(true)
    } else if (filterParam === 'hazardous') {
      setShowFilters(true)
    } else if (filterParam === 'used') {
      setShowFilters(true)
    }
  }, [filterParam])

  useEffect(() => {
    if (error) {
      toast.error(`Fetch Error: ${error}`)
    }
  }, [error])

  let displayedChemicals = filteredChemicals || []
  if (filterParam === 'used' && usedIdsStr) {
    const ids = usedIdsStr.split(',')
    displayedChemicals = displayedChemicals.filter(c => ids.includes(c.id))
  } else if (filterParam === 'hazardous') {
    displayedChemicals = displayedChemicals.filter(c => c.hazard_level === 'critical' || c.hazard_level === 'high')
  }

  const filterOptions = [
    { key: 'hazardLevel', label: lang === 'ar' ? 'مستوى الخطورة' : 'Hazard Level', options: ['all', 'low', 'medium', 'high', 'critical'] },
    { key: 'location', label: lang === 'ar' ? 'الموقع' : 'Location', options: ['all', 'Lab A', 'Lab B', 'Lab C', 'Lab D'] },
    { key: 'expiryStatus', label: lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry', options: ['all', 'expiring', 'expired'] },
  ]

  return (
    <div className={`p-4 lg:p-6 ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-left" style={{ color: '#2C3E50' }}>{t('inventory_title')}</h1>
        <p className="text-sm mt-1 text-left" style={{ color: '#64748B' }}>
          {lang === 'ar'
            ? `تم العثور على ${(displayedChemicals || []).length} مادة كيميائية`
            : `${(displayedChemicals || []).length} chemical${(displayedChemicals || []).length !== 1 ? 's' : ''} found`
          }
        </p>
      </motion.div>

      {/* Search + Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-3">
        {/* Search */}
        <div className="flex gap-3">
          <motion.div
            className="flex-1 relative"
            animate={{ scale: isSearchFocused ? 1.01 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Search size={18} className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 pointer-events-none z-10`} style={{ color: isSearchFocused ? '#4A90E2' : '#94A3B8' }} />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={lang === 'ar' ? 'البحث بالاسم، الصيغة، رقم CAS...' : 'Search by name, formula, CAS number...'}
              className="input-field px-11"
              id="chemicals-search"
            />
            {searchQuery && (
              <button onClick={() => setSearch('')} className={`absolute ${lang === 'ar' ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 z-10 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}>
                <X size={16} style={{ color: '#94A3B8' }} />
              </button>
            )}
          </motion.div>

          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 flex-shrink-0 ${showFilters ? 'bg-blue-50' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter size={16} />
            <span>{lang === 'ar' ? 'الفلاتر' : 'Filters'}</span>
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>

        {/* Filter chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div 
                className="flex flex-wrap gap-4 p-4.5 rounded-2xl text-left transition-colors"
                style={{
                  background: 'var(--filter-box-bg, #F1F5F9)',
                  border: '1px solid var(--filter-box-border, #CBD5E1)'
                }}
              >
                {filterOptions.map(({ key, label, options }) => (
                  <div key={key} className="flex flex-col gap-2 text-left">
                    <label className="text-xs font-bold uppercase tracking-wider text-left" style={{ color: 'var(--text-primary)' }}>
                      {label}
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {options.map(opt => {
                        const isSelected = filters[key] === opt
                        return (
                          <motion.button
                            key={opt}
                            type="button"
                            onClick={() => setFilter(key, opt)}
                            className="text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shadow-xs"
                            style={{
                              background: isSelected ? '#4A90E2' : 'var(--chip-bg, #FFFFFF)',
                              color: isSelected ? '#FFFFFF' : 'var(--chip-text, #334155)',
                              border: `1px solid ${isSelected ? '#4A90E2' : 'var(--chip-border, #CBD5E1)'}`,
                            }}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {opt === 'all'
                              ? (lang === 'ar' ? 'الكل' : 'All')
                              : opt.charAt(0).toUpperCase() + opt.slice(1)
                            }
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Chemicals Grid */}
      {!loading && (
        <AnimatePresence>
          {(!displayedChemicals || displayedChemicals.length === 0) ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FlaskConical size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem' }} />
              <h3 className="font-heading font-semibold text-lg" style={{ color: '#64748B' }}>
                {lang === 'ar' ? 'لم يتم العثور على أي مواد كيميائية' : 'No chemicals found'}
              </h3>
              <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                {lang === 'ar' ? 'جرب تغيير شروط البحث أو الفلاتر النشطة' : 'Try adjusting your search or filters'}
              </p>
              <button
                onClick={() => { setSearch(''); setFilter('hazardLevel', 'all'); setFilter('location', 'all'); setFilter('expiryStatus', 'all') }}
                className="btn-secondary mt-4"
              >
                {lang === 'ar' ? 'إعادة ضبط الفلاتر' : 'Clear filters'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              layout
            >
              {(displayedChemicals || []).map((chemical, i) => (
                <ChemicalCard key={chemical.id} chemical={chemical} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
