import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Play, Square, RefreshCw, CheckCircle, AlertCircle,
  Database, Award, Layers, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '@/components/ui'

const PHRASES = [
  { id: 'HELLO', label: 'HELLO', desc: 'Wave hand near face' },
  { id: 'THANK_YOU', label: 'THANK YOU', desc: 'Hand from chin forward' },
  { id: 'HOW_ARE_YOU', label: 'HOW ARE YOU', desc: 'Two hands rotate & point' },
  { id: 'I_NEED_HELP', label: 'I NEED HELP', desc: 'Thumbs up resting on palm' },
  { id: 'GOOD_MORNING', label: 'GOOD MORNING', desc: 'Chin to palm + sun rise motion' },
]

export function DatasetRecorderPage() {
  const [selectedPhrase, setSelectedPhrase] = useState('HELLO')
  const [countdown, setCountdown] = useState(null)
  const [recording, setRecording] = useState(false)
  const [recordedFrames, setRecordedFrames] = useState([])
  const [datasetStats, setDatasetStats] = useState({ total_sequences: 0, by_label: {} })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const isRecordingRef = useRef(false)
  const tempFramesRef = useRef([])

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  // Fetch current dataset counts
  const fetchStats = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/dataset/stats`)
      if (res.ok) {
        const data = await res.json()
        setDatasetStats(data)
      }
    } catch (e) {
      console.warn('Dataset stats fetch error:', e)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Setup webcam stream
  useEffect(() => {
    let stream = null
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: { ideal: 30 } }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      } catch (err) {
        setMessage({ text: 'Webcam access required for dataset recording.', type: 'error' })
      }
    }
    setupCamera()

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // Start Countdown -> Record 2.5 seconds
  const startCountdown = () => {
    setRecordedFrames([])
    tempFramesRef.current = []
    setMessage({ text: '', type: '' })
    setCountdown(3)

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer)
          startRecording()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const startRecording = () => {
    setRecording(true)
    isRecordingRef.current = true
    tempFramesRef.current = []

    const RECORD_DURATION_MS = 2500
    const startTime = Date.now()

    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 240
    const ctx = canvas.getContext('2d')

    const captureInterval = setInterval(async () => {
      const video = videoRef.current
      const now = Date.now()

      if (!isRecordingRef.current || now - startTime >= RECORD_DURATION_MS) {
        clearInterval(captureInterval)
        stopRecording()
        return
      }

      if (video && video.readyState === 4) {
        ctx.drawImage(video, 0, 0, 320, 240)
        const frameB64 = canvas.toDataURL('image/jpeg', 0.6)

        try {
          const res = await fetch(`${backendUrl}/api/v1/dataset/extract-frame-landmarks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_b64: frameB64 })
          })

          if (res.ok) {
            const data = await res.json()
            if (data.has_hand && data.landmarks) {
              tempFramesRef.current.push({ landmarks: data.landmarks })
              setRecordedFrames([...tempFramesRef.current])
            }
          }
        } catch (e) {
          console.warn('Frame landmark extract error:', e)
        }
      }
    }, 80) // Extract real hand landmarks at ~12 FPS (30 real frames per 2.5s sequence)
  }

  const stopRecording = () => {
    setRecording(false)
    isRecordingRef.current = false
    if (tempFramesRef.current.length < 10) {
      setMessage({ text: 'Recording too short or hand not detected properly. Please try again.', type: 'error' })
    } else {
      setMessage({ text: `Recorded ${tempFramesRef.current.length} frames successfully! Click "Save Sequence" to upload.`, type: 'success' })
    }
  }

  const handleSaveSequence = async () => {
    if (recordedFrames.length < 10) {
      setMessage({ text: 'No valid sequence to save.', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${backendUrl}/api/v1/dataset/save-sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: selectedPhrase,
          frames: recordedFrames
        })
      })

      if (res.ok) {
        const data = await res.json()
        setMessage({ text: `Successfully saved sequence for ${data.label}!`, type: 'success' })
        setRecordedFrames([])
        fetchStats()
      } else {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to save sequence')
      }
    } catch (e) {
      setMessage({ text: e.message || 'Error saving sequence to backend.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/app/recognize" className="p-1.5 rounded-lg bg-[var(--color-bg-surface-2)] text-[var(--color-text-muted)] hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Database size={20} className="text-purple-400" />
              Dynamic Phrase Dataset Collector
            </h1>
            <Badge variant="primary">Phase 1 Data Tool</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Record 2–3 second landmark sequences for multi-frame phrase gestures (HELLO, THANK YOU, etc.).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="accent">
            Total Saved: {datasetStats.total_sequences || 0} Sequences
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Phrase Selection & Recording Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers size={16} className="text-purple-400" />
              Select Target Phrase
            </h2>

            <div className="space-y-2">
              {PHRASES.map(p => {
                const count = datasetStats.by_label?.[p.id] || 0
                const selected = selectedPhrase === p.id

                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPhrase(p.id); setRecordedFrames([]); setMessage({ text: '', type: '' }); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selected
                        ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-sm'
                        : 'bg-[var(--color-bg-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{p.label}</p>
                      <p className="text-[10px] text-white/40">{p.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-purple-300">{count} / 50</span>
                      <p className="text-[9px] uppercase tracking-wider text-white/30">saved</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Controls */}
            <div className="pt-2 space-y-2">
              {!recording && countdown === null && (
                <button
                  onClick={startCountdown}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Play size={16} />
                  <span>Start Recording "{selectedPhrase}"</span>
                </button>
              )}

              {recording && (
                <button
                  onClick={stopRecording}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                >
                  <Square size={16} />
                  <span>Stop Recording Early</span>
                </button>
              )}

              {recordedFrames.length > 0 && !recording && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={startCountdown}
                    className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>Retake</span>
                  </button>

                  <button
                    onClick={handleSaveSequence}
                    disabled={saving}
                    className="py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <CheckCircle size={14} />
                    <span>{saving ? 'Saving...' : 'Save Sequence'}</span>
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Webcam & Recording Preview */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px] bg-black/60">
            {/* Video Viewport */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover transform -scale-x-100"
                muted
                playsInline
              />

              {/* Countdown Overlay */}
              <AnimatePresence>
                {countdown !== null && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                  >
                    <span className="text-7xl font-black text-amber-400 drop-shadow-lg animate-bounce">
                      {countdown}
                    </span>
                    <p className="text-xs font-semibold text-white/70 mt-2">Get ready to sign "{selectedPhrase}"</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recording Indicator Badge */}
              {recording && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>RECORDING ({recordedFrames.length} frames)</span>
                </div>
              )}
            </div>

            {/* Recording Progress Bar */}
            {recording && (
              <div className="w-full mt-3 space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-purple-300">
                  <span>Frame Capture: {recordedFrames.length} / 60</span>
                  <span>{Math.min(100, Math.round((recordedFrames.length / 60) * 100))}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-75"
                    style={{ width: `${Math.min(100, (recordedFrames.length / 60) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status Feedback Message */}
            {message.text && (
              <div className={`w-full mt-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'error'
                  ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                  : 'bg-green-500/15 border border-green-500/30 text-green-300'
              }`}>
                {message.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
                <span>{message.text}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
