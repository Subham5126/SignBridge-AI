import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, X, Sparkles, Volume2, Copy, Check, MessageSquare,
  HelpCircle, RefreshCw, ChevronRight, Zap
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'

const PRESET_QUESTIONS = [
  '💡 How does ASL grammar structure work?',
  '🤟 What is the posture difference between M and N?',
  '😶 Explain Non-Manual Markers (NMMs) in ASL',
  '🎓 Recommend a 5-minute daily ASL practice routine'
]

export function AITutorDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I am your AI ASL Tutor. 🤟 Ask me anything about ASL hand postures, fingerspelling tips, grammar syntax, or Deaf Culture!'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    const userMsg = { id: Date.now(), role: 'user', content: query }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const chatHistory = updatedMessages.map(m => ({ role: m.role, content: m.content }))

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/api/v1/nlp/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_query: query,
          chat_history: chatHistory
        })
      })

      if (!res.ok) throw new Error('API request failed')
      const data = await res.json()

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: data.response_text }
      ])
    } catch (err) {
      console.error(err)
      // Offline fallback
      let fallbackText = "ASL uses a Topic-Comment grammar structure (e.g. 'STORE I GO'). Keep practicing clear hand shapes and facial expressions!"
      const qLower = query.toLowerCase()
      if (qLower.includes('m') || qLower.includes('n')) {
        fallbackText = "For 'M', tuck thumb under 3 fingers. For 'N', tuck thumb under 2 fingers!"
      } else if (qLower.includes('routine') || qLower.includes('practice')) {
        fallbackText = "5-Min Routine: 1m fingerspelling A-Z, 2m common greetings, 2m Speed Quiz Challenge!"
      }
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: fallbackText }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    if (speakingId === msgId) {
      setSpeakingId(null)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onstart = () => setSpeakingId(msgId)
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    window.speechSynthesis.speak(utterance)
  }

  const handleCopy = (msgId, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(msgId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md h-full bg-[var(--color-bg-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col relative overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface-2)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center text-white shadow-md">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-1.5">
                  AI ASL Tutor Assistant
                  <Badge variant="primary" className="text-[10px] py-0 px-1.5">Groq / LLM</Badge>
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">Ask posture tips, grammar & deaf culture</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-3)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Preset Questions Chips */}
          <div className="p-3 bg-[var(--color-bg-surface-2)]/50 border-b border-[var(--color-border)] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.replace(/^[^\s]+\s/, ''))}
                disabled={loading}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-bg-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-400)] hover:bg-[var(--color-primary-600)]/15 border border-[var(--color-border)] transition-all shrink-0"
              >
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === 'user' ? 'bg-[var(--color-primary-600)] text-white' : 'bg-[var(--color-accent-600)] text-white'}`}>
                  {msg.role === 'user' ? 'U' : <Bot size={14} />}
                </div>

                <div className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[var(--color-primary-600)] text-white rounded-tr-none' : 'bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-none shadow-sm'}`}>
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--color-border)]/50 text-[10px] text-[var(--color-text-muted)]">
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`flex items-center gap-1 hover:text-[var(--color-primary-400)] transition-colors ${speakingId === msg.id ? 'text-[var(--color-primary-400)] font-bold animate-pulse' : ''}`}
                      >
                        <Volume2 size={12} /> {speakingId === msg.id ? 'Speaking...' : 'Listen'}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-[var(--color-primary-400)] transition-colors"
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-600)] text-white flex items-center justify-center">
                  <Bot size={14} className="animate-spin" />
                </div>
                <div className="rounded-2xl p-3 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-400)] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-400)] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-400)] animate-bounce [animation-delay:0.4s]" />
                  <span>Thinking ASL advice...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-surface-2)]">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ASL grammar or posture..."
                className="flex-1 px-3 py-2 bg-[var(--color-bg-surface-3)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-500)]"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!input.trim() || loading}
                icon={<Send size={14} />}
              />
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
