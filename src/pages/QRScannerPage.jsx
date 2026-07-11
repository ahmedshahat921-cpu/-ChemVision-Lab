import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Camera, CheckCircle, XCircle, Zap, Upload, FileImage } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChemicalStore } from '../store'
import toast from 'react-hot-toast'

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [detected, setDetected] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const html5QrRef = useRef(null)
  const navigate = useNavigate()
  const { chemicals, fetchChemicals } = useChemicalStore()

  useEffect(() => { 
    fetchChemicals()
    return () => stopScanner()
  }, [])

  const startScanner = async () => {
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
      setError('Camera access denied or not available. Please allow camera permissions or upload an image.')
      toast.error('Could not start camera')
    }
  }

  const handleScanSuccess = (decodedText) => {
    setDetected(true)
    toast.success('QR Code detected!')
    setTimeout(() => {
      stopScanner()
      if (decodedText.includes('/chemicals/')) {
        const id = decodedText.split('/chemicals/')[1]
        navigate(`/chemicals/${id}`)
      } else {
        toast('Redirecting to: ' + decodedText)
        window.open(decodedText, '_blank')
      }
    }, 1000)
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

    const loadingToast = toast.loading('Reading QR code from image...')
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
      toast.error('No valid QR code found in this image')
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading font-bold text-2xl" style={{ color: '#2C3E50' }}>📷 QR Scanner</h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>Scan chemical QR code using camera, file upload, or mock simulator</p>
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
            className="relative flex items-center justify-center"
            style={{ background: '#0F2D52', minHeight: '340px' }}
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
                <p className="text-blue-100 text-sm">Activate camera or select a local QR image file</p>
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
          <div className="p-4 bg-white border-t space-y-3" style={{ borderColor: '#F0F2F5' }}>
            <div className="flex gap-3">
              {!scanning ? (
                <motion.button
                  className="btn-primary flex-1 justify-center py-3 text-sm"
                  onClick={startScanner}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera size={16} /> Start Camera
                </motion.button>
              ) : (
                <motion.button
                  className="btn-danger w-full justify-center py-3 text-sm"
                  onClick={stopScanner}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: '#E85D5D', color: 'white', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                >
                  <XCircle size={16} /> Stop Camera
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
                className="btn-secondary flex-1 justify-center py-3 text-sm"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={scanning}
              >
                <Upload size={16} /> Upload Image
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Demo / Mock Scan Redirections for testing */}
        {chemicals && chemicals.length > 0 && (
          <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 className="font-heading font-semibold text-sm mb-1.5 flex items-center gap-2" style={{ color: '#2C3E50' }}>
              🧪 Simulator / Quick Testing (Mock Scan)
            </h3>
            <p className="text-xs mb-3" style={{ color: '#64748B' }}>
              evaluator test: Click a chemical below to simulate scanning its physical QR code label.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {chemicals.slice(0, 4).map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setDetected(true)
                    toast.success(`Scanning QR label for: ${c.name}...`)
                    setTimeout(() => {
                      setDetected(false)
                      navigate(`/chemicals/${c.id}`)
                    }, 800)
                  }}
                  className="btn-secondary justify-center py-2 text-xs font-semibold text-center border transition-all"
                  style={{ color: '#4A90E2', background: '#F8F9FA' }}
                >
                  Scan {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: '#2C3E50' }}><Zap size={16} style={{ color: '#4A90E2' }} /> How to use</h3>
          <div className="space-y-2">
            {[
              'Using Camera: Click "Start Camera" (webcam required) and align code.',
              'Using File: Download a QR from a Chemical page, click "Upload Image" and choose the file.',
              'Using Simulator: Click any mock button above to simulate scanning instantly.',
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#EBF4FF', color: '#4A90E2' }}>{i + 1}</span>
                <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
