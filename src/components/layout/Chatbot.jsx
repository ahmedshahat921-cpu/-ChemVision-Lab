import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Trash2, Loader2, Sparkles, Bot } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { useChemicalStore } from '../../store'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const CHAT_STORAGE_KEY = 'chemvision_chat_history'
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export default function Chatbot() {
  const { lang } = useLanguage()
  const { chemicals } = useChemicalStore()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Initialize chat history with 24-hour persistence from localStorage
  const [messages, setMessages] = useState(() => {
    const defaultGreeting = {
      role: 'model',
      content: lang === 'ar'
        ? 'مرحباً! أنا مساعد ChemVision الذكي للسلامة والمختبرات. كيف يمكنني مساعدتك اليوم في فحص المواد أو التفاعلات الكيميائية؟'
        : 'Hello! I am your ChemVision AI Safety & Laboratory Companion. How can I assist you with inventory, safety precautions, or chemical questions today?'
    }

    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.timestamp && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          const isValid = (Date.now() - parsed.timestamp) < TWENTY_FOUR_HOURS
          if (isValid) {
            return parsed.messages
          }
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }

    return [defaultGreeting]
  })

  // Persist messages to localStorage whenever updated
  useEffect(() => {
    if (messages && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
          timestamp: Date.now(),
          messages: messages
        }))
      } catch (err) {
        console.error('Failed to save chat history:', err)
      }
    }
  }, [messages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  // Auto-expand textarea height dynamically like WhatsApp / ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollH = textareaRef.current.scrollHeight
      const newH = Math.min(scrollH, 130)
      textareaRef.current.style.height = `${newH}px`
      textareaRef.current.style.overflowY = scrollH > 130 ? 'auto' : 'hidden'
    }
  }, [input])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.overflowY = 'hidden'
    }
    
    // Add user message to state
    const updatedMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      // Prepare lightweight inventory context
      const inventoryContext = (chemicals || []).map(c => ({
        name: c.name,
        formula: c.formula,
        quantity: c.quantity,
        quantity_unit: c.quantity_unit,
        location: c.location,
        cabinet: c.cabinet,
        is_active: c.is_active,
        expiry_date: c.expiry_date
      }))

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('simulate-mixing', {
        body: {
          action: 'chat',
          messages: updatedMessages,
          inventoryContext
        }
      })

      if (error) throw error

      if (data && data.text) {
        setMessages([...updatedMessages, { role: 'model', content: data.text }])
      } else {
        throw new Error('Invalid response from AI server')
      }
    } catch (err) {
      console.error('Chatbot error:', err)
      setMessages([
        ...updatedMessages,
        {
          role: 'model',
          content: lang === 'ar'
            ? 'عذراً، واجهت مشكلة في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.'
            : 'Sorry, I encountered an issue connecting to the server. Please check your internet connection and try again.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const confirmClearChat = () => {
    localStorage.removeItem(CHAT_STORAGE_KEY)
    const freshGreeting = {
      role: 'model',
      content: lang === 'ar'
        ? 'تم مسح المحادثة. كيف يمكنني مساعدتك الآن؟'
        : 'Chat cleared. How can I help you now?'
    }
    setMessages([freshGreeting])
    setShowConfirmClear(false)
    toast.success(lang === 'ar' ? 'تم مسح المحادثة بنجاح' : 'Chat history cleared successfully')
  }

  return (
    <div className={`fixed bottom-4 sm:bottom-6 ${lang === 'ar' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-[9999]`} style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-2xl relative cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.35)'
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="open" className="relative" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={22} />
              {/* Online pulse indicator */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-violet-600 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className={`absolute bottom-16 sm:bottom-20 ${lang === 'ar' ? 'left-0' : 'right-0'} w-[calc(100vw-2rem)] sm:w-[380px] max-w-[420px] h-[70vh] sm:h-[520px] rounded-2xl border flex flex-col overflow-hidden shadow-2xl bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-colors backdrop-blur-xl relative`}
          >
            {/* Custom Clear Confirmation Modal Overlay */}
            <AnimatePresence>
              {showConfirmClear && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
                  onClick={() => setShowConfirmClear(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-[320px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
                      <Trash2 size={24} />
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
                        {lang === 'ar' ? 'مسح سجل المحادثة؟' : 'Clear Chat History?'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                        {lang === 'ar'
                          ? 'هل أنت تأكد من رغبتك في مسح كافة المحادثات السابقة؟ لا يمكن التراجع عن هذه الخطوة.'
                          : 'Are you sure you want to delete all previous messages? This action cannot be undone.'}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowConfirmClear(false)}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={confirmClearChat}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        {lang === 'ar' ? 'مسح الآن' : 'Clear Now'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between text-white" style={{ background: 'linear-gradient(135deg, #0F2D52, #1E3A8A)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8.5 h-8.5 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Bot size={20} className="text-violet-300" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm leading-tight flex items-center gap-1">
                    {lang === 'ar' ? 'مساعد كيمياء الذكي' : 'ChemVision Companion'}
                    <Sparkles size={12} className="text-yellow-400 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    {lang === 'ar' ? 'متصل بالذكاء الاصطناعي' : 'AI Assistant Online'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmClear(true)}
                title={lang === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 flex flex-col bg-slate-50/50 dark:bg-slate-950/60">
              {messages.map((m, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      m.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-none font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none font-medium'
                    }`}
                    style={{
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 px-1 self-end font-semibold">
                    {m.role === 'user' ? (lang === 'ar' ? 'أنت' : 'You') : (lang === 'ar' ? 'المساعد' : 'Companion')}
                  </span>
                </div>
              ))}

              {/* Thinking Loader */}
              {loading && (
                <div className="flex flex-col max-w-[80%] self-start">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 shadow-xs">
                    <Loader2 size={14} className="animate-spin text-violet-500" />
                    <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      {lang === 'ar' ? 'جاري التفكير...' : 'Companion is thinking...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                disabled={loading}
                placeholder={lang === 'ar' ? 'اكتب سؤالك الكيميائي هنا...' : 'Ask your chemistry question...'}
                className="flex-1 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 disabled:opacity-60 transition-all font-medium resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 shadow-sm mb-0.5"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
