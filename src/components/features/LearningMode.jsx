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

import Webcam from 'react-webcam'

function PracticeModal({ sign, onClose }) {
  const [score, setScore] = useState(null)
  const [detectedSign, setDetectedSign] = useState('')
  const [liveConfidence, setLiveConfidence] = useState(0)
  const [webcamActive, setWebcamActive] = useState(false)
  const webcamRef = useRef(null)
  const wsRef = useRef(null)
  const animFrameRef = useRef(null)

  const targetSign = sign.word.toUpperCase()

  // Setup WebSocket AI recognition inside practice modal
  useEffect(() => {
    if (!webcamActive) return

    const ws = new WebSocket('ws://localhost:8000/ws/recognize')
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.sign && data.sign !== 'UNKNOWN') {
          setDetectedSign(data.sign.toUpperCase())
          setLiveConfidence(data.confidence || 0)

          // Check match with target sign
          if (data.sign.toUpperCase() === targetSign && data.confidence >= 65) {
            setScore(data.confidence)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    // Capture loop
    const offscreen = document.createElement('canvas')
    offscreen.width = 320; offscreen.height = 240
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
    let count = 0

    const sendLoop = () => {
      count++
      const webcam = webcamRef.current
      if (webcam?.video && webcam.video.readyState === 4) {
        if (count % 6 === 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          offCtx.drawImage(webcam.video, 0, 0, 320, 240)
          const frame = offscreen.toDataURL('image/jpeg', 0.5)
          wsRef.current.send(frame)
        }
      }
      animFrameRef.current = requestAnimationFrame(sendLoop)
    }

    animFrameRef.current = requestAnimationFrame(sendLoop)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    }
  }, [webcamActive, targetSign])

  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const scoreFeedback = score >= 80
    ? "🎉 Perfect match! Your hand posture and sign are accurate."
    : score >= 60
      ? "Good effort! Keep holding the hand shape clearly."
      : "Keep practicing. Make sure your hand is well lit in front of the camera."

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card p-6 max-w-md w-full border border-[var(--color-primary-500)]/30"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-[var(--color-primary-400)] font-semibold uppercase tracking-wider">AI Practice Mode</span>
            <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Target: {sign.word}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <XCircle size={20} />
          </button>
        </div>

        {/* Description & Target */}
        <div className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] mb-4">
          <p className="text-xs text-[var(--color-text-secondary)]">{sign.description}</p>
        </div>

        {/* Live Webcam & Evaluation Area */}
        <div className="aspect-video rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] mb-4 flex items-center justify-center relative overflow-hidden">
          {webcamActive ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white font-mono flex items-center gap-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE AI EVALUATION</span>
              </div>

              {detectedSign && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[var(--color-primary-500)]/50 text-center">
                  <span className="text-xs text-[var(--color-text-muted)] block">Detected:</span>
                  <span className="text-sm font-bold text-[var(--color-primary-400)]">{detectedSign} ({liveConfidence}%)</span>
                </div>
              )}
            </>
          ) : score !== null ? (
            <div className="text-center p-4">
              <ProgressRing value={score} size={100} color={scoreColor} label="Score" />
              <p className="text-sm text-[var(--color-text-secondary)] mt-3 font-medium">{scoreFeedback}</p>
            </div>
          ) : (
            <div className="text-center">
              <Camera size={32} className="mx-auto mb-2 text-[var(--color-primary-400)]" />
              <p className="text-xs text-[var(--color-text-muted)]">Click "Start Live Practice" to test your sign</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!webcamActive ? (
            <Button
              variant="primary" size="sm" className="flex-1"
              icon={<Camera size={14} />}
              onClick={() => { setScore(null); setWebcamActive(true) }}
            >
              Start Live Practice
            </Button>
          ) : (
            <Button
              variant="secondary" size="sm" className="flex-1"
              onClick={() => setWebcamActive(false)}
            >
              Stop & View Result
            </Button>
          )}
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
