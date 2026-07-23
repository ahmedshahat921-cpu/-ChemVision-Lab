import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Camera, CheckCircle, XCircle, Zap, Upload, FileImage } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChemicalStore } from '../store'
import toast from 'react-hot-toast'
import { useLanguage } from '../hooks/useLanguage'

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [detected, setDetected] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const html5QrRef = useRef(null)
  const isProcessingRef = useRef(false)
  const navigate = useNavigate()
  const { chemicals, fetchChemicals } = useChemicalStore()
  const { lang, t } = useLanguage()

  useEffect(() => { 
    fetchChemicals()
    return () => stopScanner()
  }, [])

  const startScanner = async () => {
    isProcessingRef.current = false
    setScanning(true)
    setDetected(false)
    setError(null)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      html5QrRef.current = new Html5Qrcode('qr-reader')

      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanSuccess(decodedText)
        },
        () => {} // Ignore scan errors
      )
    } catch (err) {
      setScanning(false)
      setError(
        lang === 'ar'
          ? 'تم رفض الوصول إلى الكاميرا أو أنها غير متوفرة. يرجى السماح بصلاحيات الكاميرا أو تحميل صورة.'
          : 'Camera access denied or not available. Please allow camera permissions or upload an image.'
      )
      toast.error(lang === 'ar' ? 'تعذر تشغيل الكاميرا' : 'Could not start camera')
    }
  }

  const handleScanSuccess = (decodedText) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    setDetected(true)
    toast.success(lang === 'ar' ? 'تم رصد رمز QR بنجاح!' : 'QR Code detected!')
    stopScanner()
    setTimeout(() => {
      if (decodedText.includes('/chemicals/')) {
        const id = decodedText.split('/chemicals/')[1]
        navigate(`/chemicals/${id}`)
      } else {
        toast((lang === 'ar' ? 'جاري التحويل إلى: ' : 'Redirecting to: ') + decodedText)
        window.open(decodedText, '_blank')
      }
    }, 800)
  }

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop() } catch {}
      html5QrRef.current = null
    }
    setScanning(false)
    setDetected(false)
  }

  // Handle local file QR scan
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const loadingToast = toast.loading(lang === 'ar' ? 'جاري قراءة رمز QR من الصورة...' : 'Reading QR code from image...')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      // Create a temporary scanner element
      const tempReaderId = 'qr-reader-temp'
      let tempEl = document.getElementById(tempReaderId)
      if (!tempEl) {
        tempEl = document.createElement('div')
        tempEl.id = tempReaderId
        tempEl.style.display = 'none'
        document.body.appendChild(tempEl)
      }

      const fileScanner = new Html5Qrcode(tempReaderId)
      const decodedText = await fileScanner.scanFile(file, true)
      
      toast.dismiss(loadingToast)
      handleScanSuccess(decodedText)
      
      // Cleanup temp
      tempEl.remove()
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error(lang === 'ar' ? 'لم يتم العثور على رمز QR صالح في هذه الصورة' : 'No valid QR code found in this image')
    }
  }

  return (
    <div className={`p-4 lg:p-6 ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-left" style={{ color: '#2C3E50' }}>{t('qr_title')}</h1>
        <p className="text-sm mt-1 text-left" style={{ color: '#64748B' }}>{t('qr_sub')}</p>
      </motion.div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Scanner area */}
        <motion.div
          className="card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="relative flex items-center justify-center p-2 sm:p-4 rounded-t-2xl overflow-hidden"
            style={{ background: '#0F2D52', minHeight: '280px' }}
          >
            {/* QR Reader element */}
            <div id="qr-reader" className={`w-full ${scanning ? 'block' : 'hidden'}`} />

            {/* Idle state */}
            {!scanning && !error && (
              <motion.div className="flex flex-col items-center gap-4 p-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <QrCode size={80} style={{ color: '#7AB8F5' }} />
                </motion.div>
                <p className="text-blue-100 text-sm">
                  {lang === 'ar' ? 'قم بتنشيط الكاميرا أو حدد ملف صورة QR محلي' : 'Activate camera or select a local QR image file'}
                </p>
              </motion.div>
            )}

            {/* Error state */}
            {error && !scanning && (
              <motion.div className="flex flex-col items-center gap-3 p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <XCircle size={48} style={{ color: '#E85D5D' }} />
                <p className="text-red-200 text-xs px-4">{error}</p>
              </motion.div>
            )}

            {/* Scanning overlay with scan line */}
            {scanning && !detected && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Corners */}
                {[['top-4 left-4', 'top right'], ['top-4 right-4', 'top left'], ['bottom-4 left-4', 'bottom right'], ['bottom-4 right-4', 'bottom left']].map(([pos, borders], i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8`}
                    style={{
                      borderTop: borders.includes('top') ? '3px solid #4A90E2' : 'none',
                      borderBottom: borders.includes('bottom') ? '3px solid #4A90E2' : 'none',
                      borderLeft: borders.includes('left') ? '3px solid #4A90E2' : 'none',
                      borderRight: borders.includes('right') ? '3px solid #4A90E2' : 'none',
                    }}
                  />
                ))}
                {/* Scan line */}
                <motion.div
                  className="absolute left-4 right-4 h-0.5"
                  style={{ background: 'linear-gradient(90deg, transparent, #4A90E2, transparent)', boxShadow: '0 0 8px #4A90E2' }}
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}

            {/* Detection success */}
            <AnimatePresence>
              {detected && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-20"
                  style={{ background: 'rgba(93, 185, 160, 0.95)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <CheckCircle size={80} color="white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-2 sm:gap-3">
              {!scanning ? (
                <motion.button
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-2 text-xs sm:text-sm font-bold whitespace-nowrap"
                  onClick={startScanner}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera size={16} className="flex-shrink-0" />
                  <span>{lang === 'ar' ? 'بدء الكاميرا' : 'Start Camera'}</span>
                </motion.button>
              ) : (
                <motion.button
                  className="btn-danger w-full inline-flex items-center justify-center gap-1.5 py-3 px-2 text-xs sm:text-sm font-bold whitespace-nowrap"
                  onClick={stopScanner}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: '#E85D5D', color: 'white', borderRadius: '0.625rem', border: 'none', cursor: 'pointer' }}
                >
                  <XCircle size={16} className="flex-shrink-0" />
                  <span>{lang === 'ar' ? 'إيقاف الكاميرا' : 'Stop Camera'}</span>
                </motion.button>
              )}

              {/* Upload file scan */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <motion.button
                className="btn-secondary flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-2 text-xs sm:text-sm font-bold whitespace-nowrap"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={scanning}
              >
                <Upload size={16} className="flex-shrink-0" />
                <span>{lang === 'ar' ? 'رفع صورة' : 'Upload Image'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div className="card p-5 text-left" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-left" style={{ color: '#2C3E50' }}>
            <Zap size={16} style={{ color: '#4A90E2' }} /> {lang === 'ar' ? 'طريقة الاستخدام' : 'How to use'}
          </h3>
          <div className="space-y-2">
            {[
              lang === 'ar' 
                ? 'باستخدام الكاميرا: انقر فوق "بدء الكاميرا" وقم بمحاذاة الرمز داخل الإطار.' 
                : 'Using Camera: Click "Start Camera" and align the code within the box.',
              lang === 'ar' 
                ? 'باستخدام الصورة: انقر فوق "رفع صورة" لاختيار ملف صورة يحتوي على رمز QR.' 
                : 'Using Image: Click "Upload Image" to select a file containing a QR code.',
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 text-left"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#EBF4FF', color: '#4A90E2' }}>{i + 1}</span>
                <p className="text-xs leading-relaxed text-left" style={{ color: '#64748B' }}>{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
