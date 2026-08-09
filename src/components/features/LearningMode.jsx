import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, BookOpen, Camera, Star, StarOff,
  ChevronRight, Award, Flame, TrendingUp, CheckCircle, XCircle,
  Play, RotateCcw, Trophy, Zap, Sparkles, X, ArrowRight
} from 'lucide-react'
import { Button, Badge, Card, ProgressRing, StatCard } from '@/components/ui'
import { ISL_SIGNS, SIGN_CATEGORIES } from '@/data/islSigns'
import { useAppStore } from '@/stores/useAppStore'
import Webcam from 'react-webcam'

const ASL_QUIZ_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

function QuizChallengeModal({ onClose }) {
  const { quizXP, quizHighScore, addQuizXP } = useAppStore()
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [currentTarget, setCurrentTarget] = useState('W')
  const [detectedSign, setDetectedSign] = useState('')
  const [liveConfidence, setLiveConfidence] = useState(0)
  const [matchSuccess, setMatchSuccess] = useState(false)
  const [matchedCount, setMatchedCount] = useState(0)

  const webcamRef = useRef(null)
  const wsRef = useRef(null)
  const timerRef = useRef(null)

  const pickNextTarget = (current) => {
    const remaining = ASL_QUIZ_LETTERS.filter(l => l !== current)
    const next = remaining[Math.floor(Math.random() * remaining.length)]
    setCurrentTarget(next)
  }

  const startGame = () => {
    setScore(0)
    setCombo(0)
    setTimeLeft(20)
    setMatchedCount(0)
    setGameOver(false)
    setGameStarted(true)
    pickNextTarget('')
  }

  // Timer loop
  useEffect(() => {
    if (!gameStarted || gameOver) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [gameStarted, gameOver])

  // WebSocket recognition loop
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/recognize'
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.sign && data.sign !== 'UNKNOWN' && data.sign !== 'NOTHING') {
          const detected = data.sign.toUpperCase()
          setDetectedSign(detected)
          setLiveConfidence(data.confidence || 0)

          if (detected === currentTarget && data.confidence >= 60) {
            setMatchSuccess(true)
            const pts = 100 + combo * 25
            setScore(s => {
              const newS = s + pts
              addQuizXP(pts, newS)
              return newS
            })
            setCombo(c => c + 1)
            setMatchedCount(m => m + 1)
            setTimeLeft(t => Math.min(30, t + 4))

            setTimeout(() => {
              setMatchSuccess(false)
              pickNextTarget(currentTarget)
            }, 600)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    const offscreen = document.createElement('canvas')
    offscreen.width = 240; offscreen.height = 180
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })

    const sendLoop = () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4 && ws.readyState === WebSocket.OPEN) {
        if (ws.bufferedAmount === 0) {
          offCtx.drawImage(webcamRef.current.video, 0, 0, 240, 180)
          const frameData = offscreen.toDataURL('image/jpeg', 0.35)
          ws.send(frameData)
        }
      }
    }

    const interval = setInterval(sendLoop, 120)
    return () => {
      clearInterval(interval)
      if (ws.readyState === WebSocket.OPEN) ws.close()
    }
  }, [gameStarted, gameOver, currentTarget, combo, addQuizXP])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="card w-full max-w-2xl p-6 relative overflow-hidden border border-[var(--color-primary-500)]/40 shadow-[0_0_50px_rgba(124,58,237,0.2)]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <X size={18} />
        </button>

        {!gameStarted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-600)]/20 border border-[var(--color-primary-500)]/40 flex items-center justify-center mx-auto text-amber-400">
              <Zap size={36} className="fill-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-[var(--color-text-primary)]">⚡ Speed Sign Quiz Challenge</h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
              Test your ASL recognition speed! Sign the target letters as fast as you can before the countdown timer runs out. Earn combos and XP!
            </p>

            <div className="flex justify-center gap-4 py-2">
              <div className="px-4 py-2 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-center">
                <span className="text-xs text-[var(--color-text-muted)] block">Total Quiz XP</span>
                <span className="text-lg font-bold text-amber-400">⚡ {quizXP} XP</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-center">
                <span className="text-xs text-[var(--color-text-muted)] block">High Score</span>
                <span className="text-lg font-bold text-[var(--color-primary-400)]">🏆 {quizHighScore} pts</span>
              </div>
            </div>

            <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />} onClick={startGame} className="w-full max-w-xs mx-auto shadow-lg">
              Start Speed Challenge!
            </Button>
          </div>
        ) : gameOver ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <Trophy size={36} />
            </div>
            <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Game Over! 🎉</h2>
            <p className="text-sm text-[var(--color-text-muted)]">You matched <span className="font-bold text-emerald-400">{matchedCount} ASL signs</span>!</p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-center">
                <span className="text-xs text-[var(--color-text-muted)] block">Final Score</span>
                <span className="text-xl font-black text-amber-400">{score} pts</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-center">
                <span className="text-xs text-[var(--color-text-muted)] block">High Score</span>
                <span className="text-xl font-black text-[var(--color-primary-400)]">{Math.max(quizHighScore, score)} pts</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Button variant="secondary" size="md" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" size="md" icon={<RotateCcw size={16} />} onClick={startGame}>
                Play Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs font-mono font-bold">
                  Score: {score} pts
                </Badge>
                {combo > 1 && (
                  <Badge variant="warning" className="text-xs font-bold animate-bounce">
                    🔥 {combo}x COMBO (+{combo * 25} XP)
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-text-muted)]">TIME:</span>
                <span className={`text-lg font-black font-mono ${timeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-amber-400'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-[var(--color-bg-surface-3)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-1000"
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-2xl p-4 border text-center transition-all ${matchSuccess ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-[var(--color-bg-surface-2)] border-[var(--color-primary-500)]/30'}`}>
                <span className="text-xs font-bold text-[var(--color-primary-400)] uppercase tracking-wider block mb-1">
                  SIGN THIS LETTER NOW:
                </span>

                <div className="relative w-28 h-28 mx-auto my-2 rounded-2xl overflow-hidden border-2 border-[var(--color-primary-500)]/40 shadow-lg">
                  <img
                    src={`/asl_cards/${currentTarget}_test.jpg`}
                    alt={`Target Sign ${currentTarget}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-1">
                    <span className="text-3xl font-black text-white font-mono">{currentTarget}</span>
                  </div>
                </div>

                {matchSuccess ? (
                  <p className="text-xs font-bold text-emerald-400 animate-bounce">🎉 MATCH SUCCESS! +100 XP</p>
                ) : (
                  <p className="text-[11px] text-[var(--color-text-muted)]">Form the gesture "{currentTarget}" in front of camera!</p>
                )}
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-black aspect-video flex items-center justify-center">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>AI MONITOR</span>
                </div>

                {detectedSign && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/80 border border-[var(--color-primary-500)]/40 text-center">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Seeing:</span>
                    <span className="text-xs font-bold text-[var(--color-primary-400)]">{detectedSign} ({liveConfidence}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function SignCard({ sign, onPractice, isFavorite, onFavoriteToggle }) {
  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' }

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
      className="card p-4 cursor-pointer group"
    >
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
  const [detectedSign, setDetectedSign] = useState('')
  const [liveConfidence, setLiveConfidence] = useState(0)
  const [webcamActive, setWebcamActive] = useState(true)
  const webcamRef = useRef(null)
  const wsRef = useRef(null)

  const targetSign = sign.word.toUpperCase()

  useEffect(() => {
    if (!webcamActive) return

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/recognize'
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.sign && data.sign !== 'UNKNOWN') {
          setDetectedSign(data.sign.toUpperCase())
          setLiveConfidence(data.confidence || 0)

          if (data.sign.toUpperCase() === targetSign && data.confidence >= 65) {
            setScore(data.confidence)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    const offscreen = document.createElement('canvas')
    offscreen.width = 240; offscreen.height = 180
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })

    const sendLoop = () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4 && ws.readyState === WebSocket.OPEN) {
        if (ws.bufferedAmount === 0) {
          offCtx.drawImage(webcamRef.current.video, 0, 0, 240, 180)
          const frameData = offscreen.toDataURL('image/jpeg', 0.35)
          ws.send(frameData)
        }
      }
    }

    const interval = setInterval(sendLoop, 120)
    return () => {
      clearInterval(interval)
      if (ws.readyState === WebSocket.OPEN) ws.close()
    }
  }, [webcamActive, targetSign])

  const scoreColor = score ? (score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444') : '#7c3aed'
  const scoreFeedback = score
    ? (score >= 80 ? 'Excellent posture! Match confirmed.' : score >= 60 ? 'Good attempt! Hold steady.' : 'Keep adjusting your fingers.')
    : ''

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="card w-full max-w-lg p-5 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white p-1"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: `${sign.color}20`, color: sign.color }}>
            {sign.word[0]}
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--color-text-primary)]">Practice "{sign.word}"</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Align your hand with the camera</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] mb-4">
          <p className="text-xs text-[var(--color-text-secondary)]">{sign.description}</p>
        </div>

        <div className="aspect-video rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] mb-4 flex items-center justify-center relative overflow-hidden">
          {webcamActive ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white font-mono flex items-center gap-1.5 border border-white/10">
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
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [favorites, setFavorites] = useState(['HELLO', 'THANK_YOU', 'PLEASE'])
  const { learningProgress, quizXP, quizHighScore, recognitionHistory } = useAppStore()

  const realUniqueSigns = new Set(recognitionHistory.map(item => item.sign)).size
  const realAvgAccuracy = recognitionHistory.length > 0
    ? Math.round(recognitionHistory.reduce((sum, item) => sum + (item.confidence || 85), 0) / recognitionHistory.length)
    : 85

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
      {/* Banner launch for Speed Quiz */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl p-5 border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.15)] flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(124,58,237,0.12) 100%)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="warning" className="flex items-center gap-1 font-bold">
              <Zap size={12} className="fill-amber-400" /> Speed Challenge
            </Badge>
            <Badge variant="primary" className="font-bold">
              ⚡ {quizXP || 0} XP
            </Badge>
          </div>
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">⚡ ASL Speed Sign Quiz</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Test your gesture memory under pressure! Match target signs before the timer runs out to earn combo multipliers.
          </p>
        </div>

        <Button
          variant="primary" size="md"
          icon={<Zap size={16} className="fill-amber-300 text-amber-300" />}
          onClick={() => setShowQuizModal(true)}
          className="shadow-lg border border-amber-400/40"
        >
          Launch Quiz Challenge
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Active Streak" value={`${learningProgress.streak} day${learningProgress.streak !== 1 ? 's' : ''}`} icon={<Flame size={18} />} color="#f59e0b" />
        <StatCard title="Signs Learned" value={realUniqueSigns} icon={<BookOpen size={18} />} color="#7c3aed" />
        <StatCard title="Avg Accuracy" value={`${realAvgAccuracy}%`} icon={<Trophy size={18} />} color="#10b981" />
        <StatCard title="Quiz High Score" value={`${quizHighScore || 0} pts`} icon={<Award size={18} />} color="#06b6d4" />
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

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuizModal && (
          <QuizChallengeModal onClose={() => setShowQuizModal(false)} />
        )}
      </AnimatePresence>

      {/* Practice modal */}
      <AnimatePresence>
        {practicingSign && (
          <PracticeModal sign={practicingSign} onClose={() => setPracticingSign(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
