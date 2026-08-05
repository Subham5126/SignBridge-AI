import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, BookOpen, Camera, Star, StarOff,
  ChevronRight, Award, Flame, TrendingUp, CheckCircle, XCircle,
  Play, RotateCcw, Trophy
} from 'lucide-react'
import { Button, Badge, Card, ProgressRing, StatCard } from '@/components/ui'
import { ISL_SIGNS, SIGN_CATEGORIES } from '@/data/islSigns'
import { useAppStore } from '@/stores/useAppStore'

function SignCard({ sign, onPractice, isFavorite, onFavoriteToggle }) {
  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' }

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
      className="card p-4 cursor-pointer group"
    >
      {/* Sign visual */}
      <div className="rounded-xl mb-3 flex items-center justify-center py-5" style={{ background: `${sign.color}15`, border: `1px solid ${sign.color}25` }}>
        <div className="text-4xl font-black" style={{ color: sign.color }}>{sign.word[0]}</div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{sign.word}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">{sign.description}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFavoriteToggle(sign) }}
          className="shrink-0 text-[var(--color-text-muted)] hover:text-yellow-400 transition-colors p-0.5"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? <Star size={14} className="text-yellow-400 fill-yellow-400" /> : <Star size={14} />}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${diffColor[sign.difficulty]}22`, color: diffColor[sign.difficulty] }}>
          {sign.difficulty}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{sign.category}</span>
        <button
          onClick={() => onPractice(sign)}
          className="ml-1 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--color-primary-600)]/20 text-[var(--color-primary-400)]"
          aria-label={`Practice ${sign.word}`}
        >
          <Play size={12} />
        </button>
      </div>
    </motion.div>
  )
}

function PracticeModal({ sign, onClose }) {
  const [score, setScore] = useState(null)
  const [countdown, setCountdown] = useState(3)
  const [capturing, setCapturing] = useState(false)
  const webcamRef = useRef(null)

  useEffect(() => {
    if (!capturing) return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          setCapturing(false)
          const s = 65 + Math.floor(Math.random() * 33)
          setScore(s)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [capturing])

  const startCapture = () => { setScore(null); setCountdown(3); setCapturing(true) }

  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const scoreFeedback = score >= 80
    ? "Excellent! Your hand position is accurate."
    : score >= 60
      ? "Good effort! Try to keep your fingers more extended."
      : "Keep practicing. Focus on the hand orientation."

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Practice: {sign.word}</h3>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <XCircle size={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] mb-4">
          <p className="text-sm text-[var(--color-text-secondary)]">{sign.description}</p>
        </div>

        {/* Camera area */}
        <div className="aspect-video rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] mb-4 flex items-center justify-center relative overflow-hidden">
          {capturing ? (
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-5xl font-black gradient-text mb-2"
              >
                {countdown}
              </motion.div>
              <p className="text-xs text-[var(--color-text-muted)]">Hold the sign steady...</p>
            </div>
          ) : score !== null ? (
            <div className="text-center p-4">
              <ProgressRing value={score} size={100} color={scoreColor} label="Score" />
              <p className="text-sm text-[var(--color-text-secondary)] mt-3">{scoreFeedback}</p>
            </div>
          ) : (
            <div className="text-center">
              <Camera size={28} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
              <p className="text-xs text-[var(--color-text-muted)]">Position your hand and click Capture</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {score !== null && (
            <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={startCapture}>
              Try Again
            </Button>
          )}
          <Button
            variant="primary" size="sm" className="flex-1"
            icon={<Camera size={14} />}
            onClick={startCapture}
            disabled={capturing}
          >
            {capturing ? `Capturing in ${countdown}...` : 'Capture & Score'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function LearningMode() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [practicingSign, setPracticingSign] = useState(null)
  const [favorites, setFavorites] = useState(['HELLO', 'THANK_YOU', 'PLEASE'])
  const { learningProgress } = useAppStore()

  const filtered = ISL_SIGNS.filter(s => {
    const matchesSearch = s.word.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    const matchesCat = category === 'all' || s.category === category
    return matchesSearch && matchesCat
  })

  const toggleFavorite = (sign) => {
    setFavorites(prev =>
      prev.includes(sign.id) ? prev.filter(f => f !== sign.id) : [...prev, sign.id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Streak" value={`${learningProgress.streak} days`} icon={<Flame size={18} />} color="#f59e0b" />
        <StatCard title="Signs Learned" value={learningProgress.totalSigns} icon={<BookOpen size={18} />} color="#7c3aed" />
        <StatCard title="Accuracy" value={`${learningProgress.accuracy}%`} icon={<Trophy size={18} />} color="#10b981" />
        <StatCard title="Practice Time" value={`${learningProgress.practiceMinutes}m`} icon={<TrendingUp size={18} />} color="#06b6d4" />
      </div>

      {/* Search and filter */}
      <div className="card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search signs..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-500)]/50"
              aria-label="Search signs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SIGN_CATEGORIES.slice(0, 6).map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  category === cat.id
                    ? 'bg-[var(--color-primary-600)]/20 text-[var(--color-primary-400)] border border-[var(--color-primary-500)]/30'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-2)] border border-transparent'
                }`}
              >
                {cat.label} <span className="opacity-60">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Signs grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            {filtered.length} sign{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <AnimatePresence>
            {filtered.map(sign => (
              <motion.div
                key={sign.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <SignCard
                  sign={sign}
                  onPractice={setPracticingSign}
                  isFavorite={favorites.includes(sign.id)}
                  onFavoriteToggle={toggleFavorite}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Practice modal */}
      <AnimatePresence>
        {practicingSign && (
          <PracticeModal sign={practicingSign} onClose={() => setPracticingSign(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
