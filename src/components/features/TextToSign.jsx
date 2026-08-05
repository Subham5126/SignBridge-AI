import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type, Play, Pause, RotateCcw, ChevronRight, Zap, BookOpen } from 'lucide-react'
import { Button, Badge, Card } from '@/components/ui'
import { ISL_SIGNS, ISL_PHRASES } from '@/data/islSigns'

// Animated hand SVG that morphs between signs
function HandAvatar({ sign, animating }) {
  const signs = {
    default: { fingers: [0.3, 0.3, 0.3, 0.3, 0.3], thumb: 0.3 },
    'Hello': { fingers: [1, 1, 1, 1, 1], thumb: 1 },
    'Yes': { fingers: [0.2, 0.2, 0.2, 0.2, 0.2], thumb: 0.5 },
    'No': { fingers: [1, 1, 0.2, 0.2, 0.2], thumb: 0.2 },
    'Thank You': { fingers: [1, 1, 1, 1, 1], thumb: 1 },
    'Please': { fingers: [1, 1, 1, 1, 1], thumb: 0.8 },
    'Help': { fingers: [0.8, 0.2, 0.2, 0.2, 1], thumb: 1 },
    'Good': { fingers: [1, 1, 1, 1, 1], thumb: 1 },
    'Bad': { fingers: [1, 1, 1, 1, 1], thumb: 0.2 },
    'Love': { fingers: [0.2, 0.2, 0.2, 1, 1], thumb: 1 },
    'Stop': { fingers: [1, 1, 1, 1, 1], thumb: 0.5 },
    'I': { fingers: [0.2, 0.2, 0.2, 0.2, 1], thumb: 0.5 },
    'You': { fingers: [0.2, 1, 0.2, 0.2, 0.2], thumb: 0.2 },
    'Water': { fingers: [0.2, 1, 1, 1, 0.2], thumb: 0.2 },
    'Food': { fingers: [0.5, 0.5, 0.5, 0.5, 0.5], thumb: 0.5 },
  }

  const config = signs[sign] || signs.default
  const fingerColors = ['#a78bfa', '#8b5cf6', '#7c3aed', '#8b5cf6', '#a78bfa']

  return (
    <div className="relative w-32 h-40 mx-auto">
      <svg viewBox="0 0 128 160" className="w-full h-full drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]">
        {/* Palm */}
        <motion.ellipse
          cx="64" cy="120"
          animate={{ rx: 28, ry: 20 }}
          fill="rgba(124,58,237,0.2)"
          stroke="#7c3aed"
          strokeWidth="1.5"
        />

        {/* Fingers */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 30 + i * 18
          const ext = config.fingers[i]
          const h = 60 * ext
          const y1 = 110
          const y0 = y1 - h
          return (
            <motion.g key={i}>
              <motion.line
                x1={x} y1={y1}
                animate={{ x2: x + (i - 2) * 3, y2: y0 }}
                stroke={fingerColors[i]}
                strokeWidth="6"
                strokeLinecap="round"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
              <motion.circle
                cx={x} animate={{ cy: y0 }}
                r={4}
                fill={fingerColors[i]}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </motion.g>
          )
        })}

        {/* Thumb */}
        <motion.line
          x1="24" y1="110"
          animate={{ x2: 8 + config.thumb * 10, y2: 90 - config.thumb * 20 }}
          stroke="#06b6d4"
          strokeWidth="6"
          strokeLinecap="round"
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {/* Glow effect */}
        {animating && (
          <motion.ellipse
            cx="64" cy="80" rx="40" ry="60"
            fill="none"
            stroke="rgba(124,58,237,0.2)"
            strokeWidth="1"
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </svg>

      {/* Sign label */}
      <motion.div
        key={sign}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 text-center"
      >
        <span className="text-sm font-bold gradient-text">{sign || '—'}</span>
      </motion.div>
    </div>
  )
}

export function TextToSign() {
  const [inputText, setInputText] = useState('')
  const [words, setWords] = useState([])
  const [currentWordIdx, setCurrentWordIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1500)
  const [corrected, setCorrected] = useState('')
  const [correcting, setCorrecting] = useState(false)
  const intervalRef = useRef(null)

  const aiCorrect = () => {
    setCorrecting(true)
    setTimeout(() => {
      const phrase = ISL_PHRASES.find(p =>
        p.raw.toLowerCase().split(' ').some(w => inputText.toLowerCase().includes(w.toLowerCase()))
      )
      setCorrected(phrase ? phrase.corrected : inputText + (inputText.endsWith('.') ? '' : '.'))
      setCorrecting(false)
    }, 1200)
  }

  const playAnimation = () => {
    const text = corrected || inputText
    if (!text.trim()) return
    const wordList = text.toUpperCase().split(/\s+/).filter(Boolean)
    setWords(wordList)
    setCurrentWordIdx(0)
    setPlaying(true)
  }

  useEffect(() => {
    if (!playing || words.length === 0) return
    if (currentWordIdx >= words.length) {
      setPlaying(false)
      setCurrentWordIdx(-1)
      return
    }
    intervalRef.current = setTimeout(() => {
      setCurrentWordIdx(i => i + 1)
    }, speed)
    return () => clearTimeout(intervalRef.current)
  }, [playing, currentWordIdx, words, speed])

  const currentWord = words[currentWordIdx] || ''
  const foundSign = ISL_SIGNS.find(s => s.word.toUpperCase() === currentWord || s.id === currentWord)

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="card p-5">
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
          Enter text to convert to sign language
        </label>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type a sentence... e.g., 'Good morning, how are you?'"
          className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] resize-none focus:outline-none focus:border-[var(--color-primary-500)] transition-colors text-sm"
          rows={3}
          aria-label="Text input for sign conversion"
        />

        {corrected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-[var(--color-bg-surface-3)] border border-[var(--color-primary-500)]/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap size={12} className="text-[var(--color-primary-400)]" />
              <span className="text-xs text-[var(--color-primary-400)] font-medium">AI Corrected</span>
            </div>
            <p className="text-sm text-[var(--color-text-primary)]">{corrected}</p>
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
            AI Correct
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-[var(--color-text-muted)]">Speed:</label>
            <input
              type="range" min={500} max={3000} step={250}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-20 accent-[var(--color-primary-500)]"
              aria-label="Animation speed"
            />
            <span className="text-xs text-[var(--color-text-muted)] w-10">{(speed/1000).toFixed(1)}s</span>
          </div>

          <Button
            variant="primary" size="sm"
            icon={playing ? <Pause size={14} /> : <Play size={14} />}
            onClick={playing ? () => { setPlaying(false); clearTimeout(intervalRef.current) } : playAnimation}
            disabled={!inputText.trim() && !corrected}
          >
            {playing ? 'Stop' : 'Animate Signs'}
          </Button>
        </div>
      </div>

      {/* Animation area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avatar */}
        <div className="card p-6 flex flex-col items-center justify-center min-h-[240px]">
          <HandAvatar sign={foundSign?.word || currentWord} animating={playing} />

          {playing && (
            <div className="mt-4 flex gap-1.5">
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  animate={{
                    opacity: i === currentWordIdx ? 1 : i < currentWordIdx ? 0.4 : 0.2,
                    scale: i === currentWordIdx ? 1.1 : 1,
                  }}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: i === currentWordIdx ? 'rgba(124,58,237,0.3)' : 'rgba(42,42,58,0.5)',
                    color: i === currentWordIdx ? '#a78bfa' : 'var(--color-text-muted)',
                  }}
                >
                  {w}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* Sign info */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-[var(--color-accent-500)]" />
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Current Sign</span>
          </div>

          {foundSign ? (
            <>
              <div className="text-2xl font-bold text-[var(--color-text-primary)]">{foundSign.word}</div>
              <Badge variant={foundSign.difficulty === 'easy' ? 'success' : foundSign.difficulty === 'hard' ? 'error' : 'warning'}>
                {foundSign.difficulty}
              </Badge>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{foundSign.description}</p>
              <div className="text-xs text-[var(--color-text-muted)]">Category: <span className="text-[var(--color-text-secondary)]">{foundSign.category}</span></div>
            </>
          ) : (
            <div className="text-[var(--color-text-muted)] text-sm">
              {playing ? `Showing: ${currentWord}` : 'Start the animation to see sign details.'}
            </div>
          )}
        </div>
      </div>

      {/* Quick phrases */}
      <div className="card p-4">
        <p className="text-xs font-medium text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">Quick Phrases</p>
        <div className="flex flex-wrap gap-2">
          {ISL_PHRASES.slice(0, 5).map((p, i) => (
            <button
              key={i}
              onClick={() => { setInputText(p.corrected); setCorrected(p.corrected) }}
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
