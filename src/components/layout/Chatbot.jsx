import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Trash2, Loader2, Sparkles, Bot } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { useChemicalStore } from '../../store'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Chatbot() {
  const { lang } = useLanguage()
  const { chemicals } = useChemicalStore()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Initialize chat history with greeting
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: lang === 'ar'
          ? 'مرحباً! أنا مساعد ChemVision الذكي للسلامة والمختبرات. كيف يمكنني مساعدتك اليوم في فحص المواد أو التفاعلات الكيميائية؟'
          : 'Hello! I am your ChemVision AI Safety & Laboratory Companion. How can I assist you with inventory, safety precautions, or chemical questions today?'
      }
    ])
  }, [lang])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
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

  const handleClear = () => {
    if (window.confirm(lang === 'ar' ? 'هل تريد مسح سجل المحادثة الحالي؟' : 'Are you sure you want to clear the conversation history?')) {
      setMessages([
        {
          role: 'model',
          content: lang === 'ar'
            ? 'تم مسح المحادثة. كيف يمكنني مساعدتك الآن؟'
            : 'Chat cleared. How can I help you now?'
        }
      ])
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl relative cursor-pointer"
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
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="open" className="relative" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={24} />
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
            className="absolute bottom-20 right-0 w-[380px] max-w-[90vw] h-[520px] rounded-2xl border flex flex-col overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              borderColor: 'rgba(226, 232, 240, 0.7)'
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between text-white" style={{ background: 'linear-gradient(135deg, #0F2D52, #1E3A8A)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot size={18} className="text-violet-300" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm leading-tight flex items-center gap-1">
                    {lang === 'ar' ? 'مساعد كيمياء الذكي' : 'ChemVision Companion'}
                    <Sparkles size={12} className="text-yellow-400" />
                  </h4>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    {lang === 'ar' ? 'متصل بالذكاء الاصطناعي' : 'AI Assistant Online'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                title={lang === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 flex flex-col">
              {messages.map((m, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[80%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
                >
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/50 rounded-tl-none'
                    }`}
                    style={{
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {m.content}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 self-end font-medium">
                    {m.role === 'user' ? (lang === 'ar' ? 'أنت' : 'You') : (lang === 'ar' ? 'المساعد' : 'Companion')}
                  </span>
                </div>
              ))}

              {/* Thinking Loader */}
              {loading && (
                <div className="flex flex-col max-w-[80%] self-start">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white border border-slate-200/50 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin text-violet-600" />
                    <span className="text-slate-400 text-[10px] font-medium">
                      {lang === 'ar' ? 'جاري التفكير...' : 'Companion is thinking...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t bg-white/50 flex gap-2" style={{ borderColor: 'rgba(226, 232, 240, 0.7)' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder={lang === 'ar' ? 'اكتب سؤالك الكيميائي هنا...' : 'Ask your chemistry question...'}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 disabled:opacity-60 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
