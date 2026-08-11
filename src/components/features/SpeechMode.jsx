import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Copy, Trash2, Globe, AlertCircle, Download, BookOpen, Sparkles } from 'lucide-react'
import { Button, Badge, GlowDot } from '@/components/ui'
import { ISL_SIGNS } from '@/data/islSigns'
import { useAppStore } from '@/stores/useAppStore'
import { useTranslation } from '@/lib/i18n'

const LANGUAGES = [
  { code: 'en-US', langKey: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi-IN', langKey: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr-IN', langKey: 'mr', label: 'मराठी', flag: '🇮🇳' },
]

// Audio waveform visualizer
function Waveform({ active }) {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ background: 'linear-gradient(to top, #7c3aed, #06b6d4)' }}
          animate={active ? {
            scaleY: [0.2, Math.random() * 0.8 + 0.2, 0.2],
            opacity: [0.4, 1, 0.4],
          } : { scaleY: 0.15, opacity: 0.2 }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.03,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Extract sign matches from spoken text
function extractSignMatches(text) {
  if (!text) return []
  const words = text.toUpperCase().split(/\s+/)
  return ISL_SIGNS.filter(s => 
    words.some(w => w === s.word.toUpperCase() || w === s.id.toUpperCase())
  )
}

export function SpeechMode() {
  const { language, setLanguage } = useAppStore()
  const { t } = useTranslation(language)

  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState([])
  const [interim, setInterim] = useState('')
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState('')
  const isListeningRef = useRef(false)
  const isExplicitStopRef = useRef(false)
  const scrollRef = useRef(null)

  // Map global language ('en' | 'hi' | 'mr') to BCP-47 speech language code ('en-US' | 'hi-IN' | 'mr-IN')
  const selectedLang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US'

  const handleLanguageSelect = (code, langKey) => {
    setLanguage(langKey)
    if (isListeningRef.current) {
      stopListening()
    }
  }

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setSupported(false)
    }
  }, [])

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setSupported(false)
      setError('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      return
    }

    // Stop existing instance if running
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }

    isExplicitStopRef.current = false
    isListeningRef.current = true
    setError('')

    try {
      const recognition = new SR()
      recognition.lang = selectedLang
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setListening(true)
        isListeningRef.current = true
        setError('')
      }

      recognition.onend = () => {
        if (!isExplicitStopRef.current && isListeningRef.current) {
          // Restart if closed automatically by browser silence
          try {
            recognition.start()
            return
          } catch (e) {}
        }
        isListeningRef.current = false
        setListening(false)
        setInterim('')
      }

      recognition.onerror = (e) => {
        console.warn('SpeechRecognition error:', e.error)
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setError('Microphone access denied. Please click the lock icon in your browser URL bar to allow microphone permissions.')
          isListeningRef.current = false
          setListening(false)
        } else if (e.error === 'network') {
          setError('Network error during speech recognition. Please check your internet connection.')
          isListeningRef.current = false
          setListening(false)
        } else if (e.error === 'no-speech') {
          // Ignore no-speech silence timeouts
        } else {
          setError(`Speech error: ${e.error}`)
        }
      }

      recognition.onresult = (event) => {
        let interimText = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            const finalStr = result[0].transcript.trim()
            if (finalStr) {
              setTranscript(prev => [...prev, {
                id: Date.now(),
                text: finalStr,
                signs: extractSignMatches(finalStr),
                confidence: Math.round((result[0].confidence || 0.9) * 100),
                lang: selectedLang,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              }])
            }
            setInterim('')
          } else {
            interimText += result[0].transcript
          }
        }
        setInterim(interimText)
      }

      recognition.start()
      recognitionRef.current = recognition
    } catch (err) {
      console.error('Failed to start SpeechRecognition:', err)
      setError('Could not access microphone. Please ensure microphone permissions are granted.')
      isListeningRef.current = false
      setListening(false)
    }
  }, [selectedLang])

  const toggleListening = async () => {
    if (listening) {
      stopListening()
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true })
        }
      } catch (e) {
        console.warn('getUserMedia mic request warning:', e)
      }
      startListening()
    }
  }

  const stopListening = () => {
    isExplicitStopRef.current = true
    isListeningRef.current = false
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }
    setListening(false)
    setInterim('')
  }

  const clearTranscript = () => { setTranscript([]); setInterim('') }

  const copyAll = () => {
    if (transcript.length === 0) return
    navigator.clipboard.writeText(transcript.map(t => t.text).join('\n'))
  }

  const downloadTranscript = () => {
    if (transcript.length === 0) return
    const textContent = transcript.map(t => `[${t.time}] ${t.text}`).join('\n')
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SignBridge-Speech-Transcript-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const speakText = (text) => {
    if (!text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = selectedLang
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [transcript, interim])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-5">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Language selector */}
          <div className="flex gap-1.5">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code, lang.langKey)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  selectedLang === lang.code
                    ? 'bg-[var(--color-primary-600)]/20 text-[var(--color-primary-400)] border border-[var(--color-primary-500)]/30 shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-2)] border border-transparent'
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={clearTranscript}>{t('clearCaptions', 'Clear')}</Button>
            <Button variant="ghost" size="sm" icon={<Copy size={14} />} onClick={copyAll} disabled={transcript.length === 0}>{t('copyText', 'Copy')}</Button>
            <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={downloadTranscript} disabled={transcript.length === 0}>{t('exportTxt', 'Export .txt')}</Button>
          </div>
        </div>

        {/* Waveform & Mic button */}
        <div className="flex items-center gap-4 mt-5 p-4 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)]">
          <Waveform active={listening} />

          <div className="flex items-center gap-2 ml-auto">
            <GlowDot active={listening} color="#10b981" />
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {listening ? 'Listening...' : 'Idle'}
            </span>
          </div>

          <motion.button
            onClick={toggleListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!supported}
            className={`p-4 rounded-full transition-all ${
              listening
                ? 'bg-red-500/20 border-2 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'bg-[var(--color-primary-600)]/20 border-2 border-[var(--color-primary-500)]/50 text-[var(--color-primary-400)] shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]'
            }`}
            aria-label={listening ? 'Stop listening' : 'Start listening'}
          >
            <motion.div
              animate={listening ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {listening ? <MicOff size={24} /> : <Mic size={24} />}
            </motion.div>
          </motion.button>
        </div>

        {!supported && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
            <AlertCircle size={14} />
            <span>Web Speech API not supported in this browser. Use Chrome or Edge.</span>
          </div>
        )}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Transcript */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-[var(--color-accent-500)]" />
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Live Speech-to-Sign Captions</span>
            {transcript.length > 0 && (
              <Badge variant="accent">{transcript.length} lines</Badge>
            )}
          </div>
        </div>

        <div ref={scrollRef} className="space-y-3 max-h-96 overflow-y-auto pr-1">
          <AnimatePresence>
            {transcript.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="group p-4 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary-500)]/30 transition-all space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-accent-500)] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[var(--color-text-primary)] text-sm leading-relaxed font-medium">{entry.text}</p>
                      <button
                        onClick={() => speakText(entry.text)}
                        title="Re-play audio"
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-400)] transition-colors p-1"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--color-text-muted)]">{entry.time}</span>
                      {entry.confidence > 0 && (
                        <span className="text-xs text-[var(--color-text-muted)]">· {entry.confidence}% confidence</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sign cards corresponding to spoken text */}
                {entry.signs && entry.signs.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border)]/40">
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-primary-400)] font-medium mb-2">
                      <Sparkles size={12} />
                      <span>Matching Sign Language Cards:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {entry.signs.map((sign) => (
                        <div
                          key={sign.id}
                          className="px-3 py-1.5 rounded-lg bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/20 text-xs text-[var(--color-text-primary)] flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[var(--color-primary-300)]">{sign.word}</span>
                            <Badge variant="accent" className="text-[9px] px-1 py-0">{sign.category}</Badge>
                          </div>
                          <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-1">{sign.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Interim text */}
          {interim && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-xl border border-dashed border-[var(--color-primary-500)]/40 bg-[var(--color-primary-500)]/5"
            >
              <p className="text-[var(--color-text-primary)] text-sm italic">{interim}<span className="typing-cursor" /></p>
            </motion.div>
          )}

          {!transcript.length && !interim && (
            <div className="text-center py-8">
              <Mic size={28} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-40" />
              <p className="text-sm text-[var(--color-text-muted)]">
                {listening ? 'Listening... Speak in English, Hindi, or Marathi.' : 'Press the microphone button to start live speech translation.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
