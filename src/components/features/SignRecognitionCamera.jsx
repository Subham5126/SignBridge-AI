import { useRef, useEffect, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, Pause, Play, RotateCcw, Copy, Mic, AlertCircle, Volume2, Sparkles, CornerDownLeft, Delete } from 'lucide-react'
import { Button, ConfidenceBar, Badge, GlowDot } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { ISL_SIGNS } from '@/data/islSigns'
import { getWordSuggestions } from '@/data/commonWords'

// WebSocket logic connects to the real MediaPipe backend

export function SignRecognitionCamera() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const frameCountRef = useRef(0)
  const lastSignRef = useRef('')

  const {
    recognitionActive, recognitionPaused,
    startRecognition, pauseRecognition, stopRecognition,
    resetRecognition, addRecognizedSign, setRecognizedText,
    recognizedText, confidence, currentSign, incrementPracticeSeconds
  } = useAppStore()

  // Track active practice seconds in real time
  useEffect(() => {
    if (!recognitionActive || recognitionPaused) return
    const timer = setInterval(() => {
      incrementPracticeSeconds(1)
    }, 1000)
    return () => clearInterval(timer)
  }, [recognitionActive, recognitionPaused, incrementPracticeSeconds])

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [fps, setFps] = useState(0)
  const fpsCounterRef = useRef({ frames: 0, last: Date.now() })

  const suggestions = getWordSuggestions(recognizedText)

  const handleSpeak = () => {
    if (!recognizedText || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(recognizedText)
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const wsRef = useRef(null)
  const serverLandmarksRef = useRef([])

  // Setup WebSocket connection
  // ── Sign Confirmation Logic ──────────────────────────────────────────
  // A sign must be held consistently for CONFIRM_MS before being committed.
  // After committing, a COOLDOWN_MS pause is required before the next sign.
  // This prevents the text box being flooded with every frame's prediction.
  const CONFIRM_MS   = 400    // ms a sign must be held to be accepted (fast response!)
  const COOLDOWN_MS  = 600    // ms pause after a sign is committed before accepting next sign
  const candidateRef    = useRef('')      // sign currently being held
  const candidateStartRef = useRef(0)    // when holding started
  const lastCommitTimeRef = useRef(0)    // when last sign was committed
  const resetTimerRef    = useRef(null)

  useEffect(() => {
    if (!recognitionActive || recognitionPaused) {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      candidateRef.current = ''
      candidateStartRef.current = 0
      return
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/recognize'
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Update canvas landmarks regardless
        if (data.landmarks) {
          serverLandmarksRef.current = data.landmarks
        }

        const now = Date.now()

        // Still in post-commit cooldown — ignore everything
        if (now - lastCommitTimeRef.current < COOLDOWN_MS) return

        if (data.sign && data.sign !== 'UNKNOWN' && data.confidence >= 70) {
          if (data.sign === candidateRef.current) {
            // Same sign — check if held long enough to commit
            if (now - candidateStartRef.current >= CONFIRM_MS) {
              // ✅ COMMIT: sign held long enough!
              lastSignRef.current = data.sign
              lastCommitTimeRef.current = now
              candidateRef.current = ''       // reset so it can re-appear later
              candidateStartRef.current = 0
              addRecognizedSign(data.sign, data.confidence)
            }
            // else: still holding, not long enough yet — do nothing
          } else {
            // New candidate sign — start the hold timer
            candidateRef.current = data.sign
            candidateStartRef.current = now
          }
        } else {
          // No clear sign — reset the candidate
          candidateRef.current = ''
          candidateStartRef.current = 0
        }
      } catch (e) {
        console.error('WS parse error', e)
      }
    }

    return () => {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [recognitionActive, recognitionPaused, addRecognizedSign])

  // Draw hand skeleton overlay on canvas
  const drawOverlay = useCallback((ctx, w, h, active) => {
    ctx.clearRect(0, 0, w, h)
    if (!active) return

    // Corner brackets
    const len = 24, thick = 2
    ctx.strokeStyle = '#a78bfa'
    ctx.lineWidth = thick
    const corners = [[0,0],[w,0],[0,h],[w,h]]
    corners.forEach(([cx,cy]) => {
      const sx = cx === 0 ? 1 : -1
      const sy = cy === 0 ? 1 : -1
      ctx.beginPath()
      ctx.moveTo(cx + sx*len, cy)
      ctx.lineTo(cx, cy)
      ctx.lineTo(cx, cy + sy*len)
      ctx.stroke()
    })

    // Draw real landmarks from server
    if (recognitionActive && !recognitionPaused && serverLandmarksRef.current.length > 0) {
      const landmarks = serverLandmarksRef.current
      
      // Connections for hand skeleton
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [5, 9], [9, 10], [10, 11], [11, 12], // Middle
        [9, 13], [13, 14], [14, 15], [15, 16], // Ring
        [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [0, 17] // Palm base
      ]

      ctx.strokeStyle = 'rgba(167,139,250,0.8)'
      ctx.lineWidth = 2

      connections.forEach(([i, j]) => {
        if (!landmarks[i] || !landmarks[j]) return
        ctx.beginPath()
        ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h)
        ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h)
        ctx.stroke()
      })

      ctx.fillStyle = 'rgba(124,58,237,0.9)'
      landmarks.forEach(lm => {
        ctx.beginPath()
        ctx.arc(lm.x * w, lm.y * h, 3, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  }, [recognitionActive, recognitionPaused])

  // Main recognition loop
  useEffect(() => {
    if (!recognitionActive || recognitionPaused) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    // Create a single offscreen canvas for resizing frames before sending
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = 320
    offscreenCanvas.height = 240
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true })

    const loop = () => {
      frameCountRef.current++
      const canvas = canvasRef.current
      const webcam = webcamRef.current
      
      if (canvas && webcam?.video && webcam.video.readyState === 4) {
        // Optimize: Only get the context once, it's not strictly necessary to get it every frame but it's cheap
        const ctx = canvas.getContext('2d', { alpha: false })
        
        // Only set width/height if it changes to avoid heavy canvas resets
        if (canvas.width !== webcam.video.videoWidth) {
           canvas.width = webcam.video.videoWidth || 640
           canvas.height = webcam.video.videoHeight || 480
        }
        
        drawOverlay(ctx, canvas.width, canvas.height, true)

        // Send frame to websocket only if network buffer is clear (eliminates network lag!)
        if (frameCountRef.current % 4 === 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          if (wsRef.current.bufferedAmount === 0) {
            // Extremely fast downscaled capture (320x240 @ 0.45 quality)
            offscreenCtx.drawImage(webcam.video, 0, 0, 320, 240)
            const frame = offscreenCanvas.toDataURL('image/jpeg', 0.45)
            wsRef.current.send(frame)
          }
        }
      }

      // FPS counter
      const fpsC = fpsCounterRef.current
      fpsC.frames++
      const now = Date.now()
      if (now - fpsC.last >= 1000) {
        setFps(fpsC.frames)
        fpsC.frames = 0
        fpsC.last = now
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [recognitionActive, recognitionPaused, drawOverlay])

  // Idle overlay
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || recognitionActive) return
    const ctx = canvas.getContext('2d')
    canvas.width = 640; canvas.height = 480
    drawOverlay(ctx, 640, 480, false)
  }, [recognitionActive, drawOverlay])

  const handleCopy = () => {
    if (recognizedText) {
      navigator.clipboard.writeText(recognizedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Camera container */}
      <div className="relative rounded-2xl overflow-hidden bg-[var(--color-bg-surface-2)] aspect-video max-h-[480px] border border-[var(--color-border)]">
        {!cameraError ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              className="w-full h-full object-cover"
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={() => setCameraError(true)}
              videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full scale-x-[-1]"
              style={{ mixBlendMode: 'normal' }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <CameraOff size={40} className="text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)]">Camera access denied</p>
            <p className="text-xs text-[var(--color-text-muted)]">Please allow camera permissions</p>
          </div>
        )}

        {/* Status overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <GlowDot active={recognitionActive && !recognitionPaused} color="#10b981" />
          <span className="text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {recognitionActive && !recognitionPaused ? 'LIVE' : recognitionPaused ? 'PAUSED' : 'READY'}
          </span>
        </div>

        {/* FPS indicator */}
        {recognitionActive && (
          <div className="absolute top-3 right-3 text-xs font-mono text-[var(--color-primary-400)] bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {fps} FPS
          </div>
        )}

        {/* Current sign display */}
        <AnimatePresence>
          {currentSign && recognitionActive && (
            <motion.div
              key={currentSign}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-2 rounded-full border border-[var(--color-primary-500)]/40"
            >
              <span className="text-xl font-bold gradient-text">{currentSign}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle message */}
        {!recognitionActive && cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera size={32} className="mx-auto mb-2 text-[var(--color-primary-400)]" />
              <p className="text-sm text-[var(--color-text-muted)]">Press Start to begin recognition</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {!recognitionActive ? (
          <Button variant="primary" size="md" icon={<Camera size={16} />} onClick={startRecognition} disabled={cameraError}>
            Start Recognition
          </Button>
        ) : (
          <Button
            variant={recognitionPaused ? 'accent' : 'secondary'}
            size="md"
            icon={recognitionPaused ? <Play size={16} /> : <Pause size={16} />}
            onClick={pauseRecognition}
          >
            {recognitionPaused ? 'Resume' : 'Pause'}
          </Button>
        )}

        {recognitionActive && (
          <Button variant="secondary" size="md" icon={<CameraOff size={16} />} onClick={stopRecognition}>
            Stop
          </Button>
        )}

        <Button variant="ghost" size="md" icon={<RotateCcw size={16} />} onClick={resetRecognition}>
          Reset
        </Button>

        <Button
          variant="ghost" size="md"
          icon={<Copy size={16} />}
          onClick={handleCopy}
          disabled={!recognizedText}
        >
          {copied ? 'Copied!' : 'Copy Text'}
        </Button>

        <Button
          variant="ghost" size="md"
          icon={<Volume2 size={16} className={speaking ? 'animate-bounce text-[var(--color-primary-400)]' : ''} />}
          onClick={handleSpeak}
          disabled={!recognizedText}
        >
          {speaking ? 'Speaking...' : 'Speak'}
        </Button>
      </div>

      {/* Confidence */}
      {recognitionActive && <ConfidenceBar value={confidence} />}

      {/* Real-Time Word Autocomplete Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-primary-500)]/30 flex-wrap"
        >
          <div className="flex items-center gap-1 text-xs text-[var(--color-primary-400)] font-medium shrink-0">
            <Sparkles size={13} />
            <span>Autocomplete:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setRecognizedText(item.replacementText)}
                className="text-xs px-3 py-1 rounded-lg bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/40 text-[var(--color-primary-300)] font-semibold hover:bg-[var(--color-primary-500)]/30 hover:border-[var(--color-primary-400)] transition-all flex items-center gap-1 group"
              >
                <span>{item.word}</span>
                <CornerDownLeft size={11} className="opacity-60 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recognized text area */}
      <div className="card p-4 min-h-[110px] relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Recognized Text</span>
          <div className="flex items-center gap-2">
            <Badge variant="accent">ASL Alphabet → Text</Badge>
          </div>
        </div>

        {recognizedText ? (
          <div className="space-y-3">
            <p className="text-lg font-medium text-[var(--color-text-primary)] leading-relaxed font-mono tracking-wide">
              {recognizedText}
              {recognitionActive && !recognitionPaused && <span className="typing-cursor" />}
            </p>

            {/* Quick helper controls */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]/50">
              <button
                onClick={() => setRecognizedText(recognizedText.trimEnd() + ' ')}
                className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-bg-surface-3)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                + Space
              </button>
              <button
                onClick={() => setRecognizedText(recognizedText.slice(0, -1))}
                className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-bg-surface-3)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white transition-colors flex items-center gap-1"
              >
                <Delete size={12} />
                <span>Backspace</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[var(--color-text-muted)] text-sm">
            Start the camera and perform signs — recognized letters will automatically combine into words here.
          </p>
        )}
      </div>
    </div>
  )
}
