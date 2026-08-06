import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Zap, BookOpen, Sparkles } from 'lucide-react'
import { Button, Badge, Card } from '@/components/ui'
import { ISL_SIGNS, ISL_PHRASES } from '@/data/islSigns'

// ASL Alphabet Finger Guide Descriptions
const ASL_ALPHABET_GUIDE = {
  'A': 'Fist made with thumb upright alongside index finger.',
  'B': 'Open palm facing forward with thumb tucked across palm.',
  'C': 'Curved hand forming a C-shape.',
  'D': 'Index finger pointing straight up, other fingers forming circle with thumb.',
  'E': 'Fist with fingers curled down and thumb tucked across under fingertips.',
  'F': 'Index finger touching thumb to form O, other 3 fingers raised straight.',
  'G': 'Index finger and thumb pointing forward horizontally.',
  'H': 'Index and middle fingers extended forward together horizontally.',
  'I': 'Pinky finger extended straight up, all other fingers closed in fist.',
  'J': 'Pinky finger extended drawing a J curve in the air.',
  'K': 'Index finger up, middle finger out, thumb touching middle knuckle.',
  'L': 'Index finger and thumb forming an L-shape.',
  'M': 'Thumb tucked under index, middle, and ring fingers.',
  'N': 'Thumb tucked under index and middle fingers.',
  'O': 'All fingers curved touching thumb to form an O.',
  'P': 'K-hand shape pointing downward.',
  'Q': 'G-hand shape pointing downward.',
  'R': 'Index and middle fingers crossed.',
  'S': 'Fist with thumb wrapped across front of fingers.',
  'T': 'Thumb tucked under index finger only.',
  'U': 'Index and middle fingers extended straight up together.',
  'V': 'Index and middle fingers extended in a V-shape.',
  'W': 'Index, middle, and ring fingers extended up in a W-shape.',
  'X': 'Index finger hooked in a claw shape.',
  'Y': 'Thumb and pinky extended, middle 3 fingers closed (hang loose).',
  'Z': 'Index finger tracing a Z-shape in the air.'
}

// Clear Visual ASL Hand Sign Card Display using REAL Human Hand Dataset Images
function HandAvatar({ letter, signWord, animating }) {
  const char = (letter || signWord || 'A').toUpperCase()[0]
  const isSpace = char === ' ' || letter === ' '
  const fileName = isSpace ? 'space_test.jpg' : `${char}_test.jpg`
  const imgSrc = `/asl_cards/${fileName}`
  const guide = ASL_ALPHABET_GUIDE[char] || 'ASL Sign Posture'

  return (
    <div className="relative flex flex-col items-center justify-center p-2 text-center w-full">
      {/* Clear Visual ASL Hand Card with Real Dataset Image */}
      <div className="relative w-56 h-64 mx-auto bg-gradient-to-b from-[var(--color-primary-600)]/30 via-[var(--color-bg-surface-2)] to-black/60 rounded-2xl border-2 border-[var(--color-primary-500)]/40 p-3 flex flex-col items-center justify-between shadow-[0_0_40px_rgba(124,58,237,0.3)] overflow-hidden">
        
        {/* Letter Badge Header */}
        <div className="w-full flex items-center justify-between px-2 pt-1 border-b border-white/10 pb-2">
          <span className="text-xs font-bold text-[var(--color-primary-300)] uppercase tracking-wider">Real ASL Dataset Sign</span>
          <span className="w-9 h-9 rounded-xl bg-[var(--color-primary-600)] text-white font-black font-mono text-xl flex items-center justify-center shadow-lg border border-white/20">
            {isSpace ? '␣' : char}
          </span>
        </div>

        {/* Real Human Hand Image */}
        <div className="w-full h-40 flex items-center justify-center relative my-1 overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <motion.img
            key={fileName}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={imgSrc}
            alt={`ASL Sign ${char}`}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.onerror = null
              e.target.style.display = 'none'
            }}
          />
          {animating && (
            <motion.div
              className="absolute inset-0 border-2 border-[var(--color-accent-400)]/60 rounded-xl"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Card Footer Badge */}
        <div className="w-full bg-black/70 rounded-xl py-1.5 px-2 border border-white/10 text-center">
          <span className="text-xs font-bold text-[var(--color-accent-300)]">Real Hand Sign: "{isSpace ? 'SPACE' : char}"</span>
        </div>
      </div>

      {/* Posture Description Callout */}
      <motion.div
        key={char + 'guide'}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 space-y-1"
      >
        <p className="text-xs text-[var(--color-text-primary)] max-w-xs leading-relaxed font-medium bg-[var(--color-bg-surface-2)] p-2.5 rounded-xl border border-[var(--color-primary-500)]/30">
          💡 <span className="font-bold text-[var(--color-primary-300)]">Posture Guide:</span> {guide}
        </p>
      </motion.div>
    </div>
  )
}

export function TextToSign() {
  const [inputText, setInputText] = useState('')
  const [sequence, setSequence] = useState([])
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const [corrected, setCorrected] = useState('')
  const [correcting, setCorrecting] = useState(false)
  const intervalRef = useRef(null)

  const aiCorrect = async () => {
    if (!inputText.trim()) return
    setCorrecting(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/nlp/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: inputText })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.corrected_text && !data.corrected_text.startsWith('[')) {
          setCorrected(data.corrected_text)
        } else {
          setCorrected(inputText)
        }
      } else {
        setCorrected(inputText)
      }
    } catch (e) {
      console.error(e)
      setCorrected(inputText)
    } finally {
      setCorrecting(false)
    }
  }

  const prepareSequence = (textStr) => {
    const raw = textStr || corrected || inputText
    if (!raw.trim()) return []
    // Extract letters and spaces
    return raw.toUpperCase().split('').filter(char => /[A-Z0-9\s]/.test(char))
  }

  const playAnimation = () => {
    const seq = prepareSequence()
    if (seq.length === 0) return
    setSequence(seq)
    setCurrentIdx(0)
    setPlaying(true)
  }

  useEffect(() => {
    if (!playing || sequence.length === 0) return
    if (currentIdx >= sequence.length - 1) {
      setPlaying(false)
      return
    }
    intervalRef.current = setTimeout(() => {
      setCurrentIdx(i => i + 1)
    }, speed)
    return () => clearTimeout(intervalRef.current)
  }, [playing, currentIdx, sequence, speed])

  const currentChar = sequence[currentIdx] || ''
  const isSpace = currentChar === ' '

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="card p-5">
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
          Enter text to translate into ASL sign & fingerspelling sequence
        </label>
        <textarea
          value={inputText}
          onChange={e => { setInputText(e.target.value); setSequence([]) }}
          placeholder="Type a sentence... e.g., 'HELLO WORLD'"
          className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] resize-none focus:outline-none focus:border-[var(--color-primary-500)] transition-colors text-sm font-mono"
          rows={3}
          aria-label="Text input for sign conversion"
        />

        {corrected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-[var(--color-bg-surface-3)] border border-[var(--color-primary-500)]/20 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-[var(--color-primary-400)]" />
                <span className="text-xs text-[var(--color-primary-400)] font-medium">AI Corrected Sentence</span>
              </div>
              <p className="text-sm text-[var(--color-text-primary)] font-medium">{corrected}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setInputText(corrected)}>
              Use Sentence
            </Button>
          </motion.div>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Button
            variant="ghost" size="sm"
            icon={<Zap size={14} />}
            loading={correcting}
            onClick={aiCorrect}
            disabled={!inputText.trim()}
          >
            AI Format
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-[var(--color-text-muted)]">Animation Speed:</label>
            <input
              type="range" min={400} max={2500} step={200}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-24 accent-[var(--color-primary-500)]"
              aria-label="Animation speed"
            />
            <span className="text-xs font-mono text-[var(--color-text-muted)] w-10">{(speed/1000).toFixed(1)}s</span>
          </div>

          <Button
            variant="primary" size="sm"
            icon={playing ? <Pause size={14} /> : <Play size={14} />}
            onClick={playing ? () => { setPlaying(false); clearTimeout(intervalRef.current) } : playAnimation}
            disabled={!inputText.trim() && !corrected}
          >
            {playing ? 'Pause' : 'Animate ASL Sequence'}
          </Button>
        </div>
      </div>

      {/* Animation Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hand Pose Display */}
        <div className="card p-6 flex flex-col items-center justify-center min-h-[260px]">
          {currentChar && !isSpace ? (
            <HandAvatar letter={currentChar} animating={playing} />
          ) : isSpace ? (
            <div className="text-center p-6">
              <span className="text-3xl font-mono text-[var(--color-accent-400)] block mb-2">[ SPACE ]</span>
              <p className="text-xs text-[var(--color-text-muted)]">Pause between words</p>
            </div>
          ) : (
            <div className="text-center">
              <Sparkles size={32} className="mx-auto mb-2 text-[var(--color-primary-400)] opacity-50" />
              <p className="text-xs text-[var(--color-text-muted)]">Click "Animate ASL Sequence" to view hand postures</p>
            </div>
          )}
        </div>

        {/* Step-by-Step Character Sequence Ribbon */}
        <div className="card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[var(--color-accent-500)]" />
                <span className="text-sm font-semibold text-[var(--color-text-secondary)]">ASL Sequence Cards</span>
              </div>
              {sequence.length > 0 && (
                <Badge variant="accent">{currentIdx + 1} / {sequence.length}</Badge>
              )}
            </div>

            {sequence.length > 0 ? (
              <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto p-1">
                {sequence.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIdx(idx); setPlaying(false) }}
                    className={`w-9 h-11 rounded-xl text-sm font-bold font-mono transition-all flex items-center justify-center border ${
                      idx === currentIdx
                        ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-400)] scale-110 shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                        : ch === ' '
                          ? 'bg-[var(--color-bg-surface-3)] text-[var(--color-text-muted)] border-dashed border-[var(--color-border)]'
                          : 'bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary-500)]/40'
                    }`}
                  >
                    {ch === ' ' ? '␣' : ch}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] py-6 text-center">
                Enter text above to generate step-by-step ASL character sequence cards.
              </p>
            )}
          </div>

          {/* Stepper buttons */}
          {sequence.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              <Button
                variant="ghost" size="sm" icon={<ChevronLeft size={14} />}
                onClick={() => { setCurrentIdx(i => Math.max(0, i - 1)); setPlaying(false) }}
                disabled={currentIdx <= 0}
              >
                Previous Letter
              </Button>
              <Button
                variant="ghost" size="sm" icon={<ChevronRight size={14} />}
                onClick={() => { setCurrentIdx(i => Math.min(sequence.length - 1, i + 1)); setPlaying(false) }}
                disabled={currentIdx >= sequence.length - 1}
              >
                Next Letter
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick phrases */}
      <div className="card p-4">
        <p className="text-xs font-medium text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">Quick Sentences</p>
        <div className="flex flex-wrap gap-2">
          {ISL_PHRASES.slice(0, 5).map((p, i) => (
            <button
              key={i}
              onClick={() => { setInputText(p.corrected); setSequence(prepareSequence(p.corrected)) }}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-500)]/40 hover:text-[var(--color-text-primary)] transition-all"
            >
              {p.corrected}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
