import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hand, Mic, MicOff, Type, Send, Camera, X, Zap, Users, Clock, Volume2, Trash2, Download, Sparkles, AlertCircle } from 'lucide-react'
import Webcam from 'react-webcam'
import { Button, Badge, GlowDot, Card } from '@/components/ui'
import { ISL_PHRASES, ISL_SIGNS } from '@/data/islSigns'
import { useAppStore } from '@/stores/useAppStore'
import { useTranslation } from '@/lib/i18n'

function MessageBubble({ msg, onSpeak }) {
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
      <div className={`max-w-[70%] ${isDeaf ? '' : 'items-end'} flex flex-col gap-1`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isDeaf
            ? 'bg-[var(--color-primary-600)]/20 border border-[var(--color-primary-500)]/30 text-[var(--color-text-primary)] rounded-tl-sm'
            : 'bg-[var(--color-accent-500)]/20 border border-[var(--color-accent-500)]/30 text-[var(--color-text-primary)] rounded-tr-sm'
        }`}>
          {msg.rawSign && (
            <div className="text-[11px] text-[var(--color-primary-400)] mb-1 font-mono">[{msg.rawSign}]</div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span>{msg.text}</span>
            <button
              onClick={() => onSpeak(msg.text)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-400)] transition-colors p-0.5"
              title="Speak out loud"
            >
              <Volume2 size={13} />
            </button>
          </div>

          {/* Render matching sign badges if speech */}
          {msg.signs && msg.signs.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-white/10 flex gap-1.5 flex-wrap">
              {msg.signs.map((s, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-[var(--color-accent-300)] font-semibold">
                  🤟 {s.word}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-[var(--color-text-muted)]">{msg.time}</span>
          {msg.confidence && <span className="text-[10px] text-[var(--color-text-muted)]">· {msg.confidence}% confident</span>}
          <Badge variant={isDeaf ? 'primary' : 'accent'} className="text-[9px] py-0">
            {isDeaf ? 'Sign → Text' : msg.type === 'speech' ? 'Speech → Sign' : 'Typed'}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}

export function TwoWayConversation() {
  const { language } = useAppStore()
  const { t } = useTranslation(language)

  const [messages, setMessages] = useState([
    {
      id: 1, sender: 'deaf', text: 'HELLO WORLD',
      rawSign: 'H E L L O  W O R L D', confidence: 94, time: '10:30 AM', type: 'sign'
    },
    {
      id: 2, sender: 'hearing', text: "Hello! Nice to meet you. How are you feeling today?",
      signs: [
        { word: 'HELLO', category: 'Greetings' },
        { word: 'HELP', category: 'Common' }
      ],
      time: '10:31 AM', type: 'speech'
    },
  ])
  const [hearingInput, setHearingInput] = useState('')
  const [signActive, setSignActive] = useState(false)
  const [hearingMicActive, setHearingMicActive] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [signBuffer, setSignBuffer] = useState('')
  const [aiCorrecting, setAiCorrecting] = useState(false)
  const [micError, setMicError] = useState('')

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const animFrameRef = useRef(null)
  const processingFrameRef = useRef(false)

  const speechLangCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US'

  const speakText = useCallback((text) => {
    if (!text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = speechLangCode
    window.speechSynthesis.speak(utterance)
  }, [speechLangCode])

  // Hearing user speech mic
  const startHearingMic = () => {
    setMicError('')
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setMicError('Speech recognition is not supported in this browser. Use Chrome or Edge.')
      return
    }

    try {
      const r = new SR()
      r.lang = speechLangCode
      r.continuous = false
      r.interimResults = false

      r.onstart = () => setHearingMicActive(true)

      r.onresult = (e) => {
        const text = e.results[0][0].transcript
        const words = text.toUpperCase().split(/\s+/)
        const matchedSigns = ISL_SIGNS.filter(s => words.includes(s.word.toUpperCase()))

        setMessages(prev => [...prev, {
          id: Date.now(), sender: 'hearing', text, signs: matchedSigns,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'speech'
        }])
        setHearingMicActive(false)
      }

      r.onerror = (e) => {
        console.warn('Speech err:', e.error)
        setMicError(e.error === 'not-allowed' ? 'Microphone permission denied.' : `Speech error: ${e.error}`)
        setHearingMicActive(false)
      }

      r.onend = () => setHearingMicActive(false)

      r.start()
      recognitionRef.current = r
      if (!sessionActive) setSessionActive(true)
    } catch (err) {
      console.error(err)
      setMicError('Could not start microphone.')
      setHearingMicActive(false)
    }
  }

  const exportChat = () => {
    const text = messages.map(m => `[${m.time}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `SignBridge-Conversation-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Left panel: Deaf user (sign input) */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-500)]" />
          <span className="text-sm font-bold text-[var(--color-text-primary)]">{t('deafSigner', 'Deaf Signer')}</span>
          <Badge variant="primary" className="ml-auto">Camera + AI</Badge>
        </div>

        {/* Live Camera Feed */}
        <div className="flex-1 relative rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] min-h-[220px] flex items-center justify-center overflow-hidden">
          {signActive ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </>
          ) : (
            <div className="text-center p-4">
              <Camera size={32} className="mx-auto mb-2 text-[var(--color-primary-400)]" />
              <p className="text-xs text-[var(--color-text-muted)]">Click Start Signing to open webcam</p>
            </div>
          )}
        </div>

        {/* Buffer box */}
        <div className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] min-h-[50px] flex items-center justify-between">
          <span className="text-xs font-mono text-[var(--color-text-primary)] break-all">{signBuffer || <span className="text-[var(--color-text-muted)] italic">{t('signedLettersPlaceholder', 'Signed letters will appear here...')}</span>}</span>
          {signBuffer && (
            <button onClick={() => setSignBuffer('')} className="text-[var(--color-text-muted)] hover:text-red-400 p-1">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={signActive ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1"
            icon={signActive ? <X size={14} /> : <Camera size={14} />}
            onClick={() => setSignActive(s => !s)}
          >
            {signActive ? t('stopCamera', 'Stop Camera') : t('startCamera', 'Start Camera')}
          </Button>

          <Button
            variant="accent"
            size="sm"
            icon={<Send size={14} />}
            onClick={sendSignMessage}
            disabled={!signBuffer.trim()}
            loading={aiCorrecting}
          >
            {t('send', 'Send')}
          </Button>
        </div>
      </div>

      {/* Center: Live Conversation */}
      <div className="card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border)]/50 pb-2">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[var(--color-accent-500)]" />
            <span className="text-sm font-bold text-[var(--color-text-primary)]">{t('sharedChat', 'Shared Live Chat')}</span>
          </div>
          <div className="flex items-center gap-2">
            {sessionActive && (
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] font-mono">
                <Clock size={12} />
                <span>{formatTime(sessionTime)}</span>
              </div>
            )}
            <button onClick={() => setMessages([])} title="Clear conversation" className="text-[var(--color-text-muted)] hover:text-red-400 p-1">
              <Trash2 size={14} />
            </button>
            <button onClick={exportChat} title="Export transcript" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-400)] p-1">
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <AnimatePresence>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} onSpeak={speakText} />)}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="text-center text-xs text-[var(--color-text-muted)] mt-2 py-2 border-t border-[var(--color-border)]/50">
          {messages.length} messages · Real-time AI Sign ⇄ Voice Translator
        </div>
      </div>

      {/* Right panel: Hearing user */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-500)]" />
          <span className="text-sm font-bold text-[var(--color-text-primary)]">{t('hearingSpeaker', 'Hearing Speaker')}</span>
          <Badge variant="accent" className="ml-auto">Voice / Text</Badge>
        </div>

        {/* Mic button */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl">
          <motion.button
            onClick={hearingMicActive ? () => { recognitionRef.current?.stop(); setHearingMicActive(false) } : startHearingMic}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-5 rounded-full border-2 transition-all cursor-pointer ${
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
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            {hearingMicActive ? t('listening', 'Listening... Speak now') : t('clickMicToSpeak', 'Click Mic to Speak')}
          </p>

          {micError && (
            <div className="mt-2 text-center text-xs text-red-400 flex items-center justify-center gap-1">
              <AlertCircle size={12} />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* Text input */}
        <div className="mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={hearingInput}
              onChange={e => setHearingInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendHearingMsg()}
              placeholder={t('typeMessagePlaceholder', 'Type message...')}
              className="flex-1 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-500)]/50"
              aria-label="Type message"
            />
            <Button variant="accent" size="sm" icon={<Send size={14} />} onClick={sendHearingMsg} disabled={!hearingInput.trim()}>
              {t('send', 'Send')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
