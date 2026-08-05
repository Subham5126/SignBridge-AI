import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hand, Mic, MicOff, Type, Send, Camera, X, Zap, Users, Clock } from 'lucide-react'
import { Button, Badge, GlowDot, Card } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { ISL_PHRASES } from '@/data/islSigns'

function MessageBubble({ msg }) {
  const isDeaf = msg.sender === 'deaf'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3 ${isDeaf ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${isDeaf ? 'bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)]' : 'bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-700)]'}`}>
        {isDeaf ? <Hand size={14} /> : <Mic size={14} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[65%] ${isDeaf ? '' : 'items-end'} flex flex-col gap-1`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isDeaf
            ? 'bg-[var(--color-primary-600)]/20 border border-[var(--color-primary-500)]/20 text-[var(--color-text-primary)] rounded-tl-sm'
            : 'bg-[var(--color-accent-500)]/20 border border-[var(--color-accent-500)]/20 text-[var(--color-text-primary)] rounded-tr-sm'
        }`}>
          {msg.rawSign && (
            <div className="text-xs text-[var(--color-text-muted)] mb-1 font-mono">[{msg.rawSign}]</div>
          )}
          {msg.text}
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-[var(--color-text-muted)]">{msg.time}</span>
          {msg.confidence && <span className="text-[10px] text-[var(--color-text-muted)]">· {msg.confidence}% confident</span>}
          <Badge variant={isDeaf ? 'primary' : 'accent'} className="text-[9px] py-0">
            {isDeaf ? 'Sign→Text' : msg.type === 'speech' ? 'Speech' : 'Typed'}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}

export function TwoWayConversation() {
  const [messages, setMessages] = useState([
    {
      id: 1, sender: 'deaf', text: 'Good morning! I will go to the market tomorrow.',
      rawSign: 'GOOD MORNING I GO MARKET TOMORROW', confidence: 87, time: '10:30 AM', type: 'sign'
    },
    {
      id: 2, sender: 'hearing', text: "That's great! Do you need any help carrying things?",
      time: '10:31 AM', type: 'typed'
    },
  ])
  const [hearingInput, setHearingInput] = useState('')
  const [signActive, setSignActive] = useState(false)
  const [hearingMicActive, setHearingMicActive] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [sessionActive])

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const sendHearingMsg = () => {
    if (!hearingInput.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'hearing', text: hearingInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'typed'
    }])
    setHearingInput('')
    if (!sessionActive) setSessionActive(true)
  }

  const simulateSign = () => {
    const phrases = ISL_PHRASES
    const phrase = phrases[Math.floor(Math.random() * phrases.length)]
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'deaf',
        rawSign: phrase.raw,
        text: phrase.corrected,
        confidence: 78 + Math.floor(Math.random() * 20),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'sign'
      }])
    }, 2000)
    if (!sessionActive) setSessionActive(true)
  }

  const startHearingMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'en-US'; r.continuous = false; r.interimResults = false
    r.onresult = (e) => {
      const text = e.results[0][0].transcript
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'hearing', text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'speech'
      }])
      setHearingMicActive(false)
    }
    r.onerror = () => setHearingMicActive(false)
    r.onend = () => setHearingMicActive(false)
    r.start()
    recognitionRef.current = r
    setHearingMicActive(true)
    if (!sessionActive) setSessionActive(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Left panel: Deaf user (sign input) */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Deaf User</span>
          <Badge variant="primary" className="ml-auto">Sign Input</Badge>
        </div>

        {/* Camera placeholder */}
        <div className="flex-1 relative rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] min-h-[160px] flex items-center justify-center overflow-hidden">
          {signActive ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-[var(--color-primary-600)]/20 border-2 border-[var(--color-primary-500)]/40 flex items-center justify-center mx-auto mb-2"
                >
                  <Hand size={28} className="text-[var(--color-primary-400)]" />
                </motion.div>
                <p className="text-xs text-[var(--color-text-muted)]">Recognizing signs...</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Camera size={24} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
              <p className="text-xs text-[var(--color-text-muted)]">Camera feed</p>
            </div>
          )}
        </div>

        <Button
          variant={signActive ? 'danger' : 'primary'}
          size="sm"
          icon={signActive ? <X size={14} /> : <Camera size={14} />}
          onClick={() => { setSignActive(s => !s); if (!signActive) simulateSign() }}
        >
          {signActive ? 'Stop Signs' : 'Start Signing'}
        </Button>
      </div>

      {/* Center: Conversation */}
      <div className="card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[var(--color-accent-500)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Conversation</span>
          </div>
          <div className="flex items-center gap-2">
            {sessionActive && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <Clock size={12} />
                <span className="font-mono">{formatTime(sessionTime)}</span>
              </div>
            )}
            <GlowDot active={signActive || hearingMicActive} color="#10b981" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <AnimatePresence>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="text-center text-xs text-[var(--color-text-muted)] mt-2 py-2 border-t border-[var(--color-border)]">
          {messages.length} messages · AI-corrected
        </div>
      </div>

      {/* Right panel: Hearing user */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-500)]" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Hearing User</span>
          <Badge variant="accent" className="ml-auto">Speech / Text</Badge>
        </div>

        {/* Mic button */}
        <div className="flex justify-center py-4">
          <motion.button
            onClick={hearingMicActive ? () => { recognitionRef.current?.stop(); setHearingMicActive(false) } : startHearingMic}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-5 rounded-full border-2 transition-all ${
              hearingMicActive
                ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_24px_rgba(239,68,68,0.3)]'
                : 'bg-[var(--color-accent-500)]/10 border-[var(--color-accent-500)]/30 text-[var(--color-accent-400)] hover:shadow-[0_0_24px_rgba(6,182,212,0.3)]'
            }`}
          >
            <motion.div
              animate={hearingMicActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {hearingMicActive ? <MicOff size={28} /> : <Mic size={28} />}
            </motion.div>
          </motion.button>
        </div>

        {/* Text input */}
        <div className="mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={hearingInput}
              onChange={e => setHearingInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendHearingMsg()}
              placeholder="Type a message..."
              className="flex-1 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-500)]/50"
              aria-label="Type message"
            />
            <Button variant="accent" size="sm" icon={<Send size={14} />} onClick={sendHearingMsg} disabled={!hearingInput.trim()}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
