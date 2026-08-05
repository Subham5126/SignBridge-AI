import { useState } from 'react'
import { motion } from 'framer-motion'
import { Hand, Info, Zap, History, Download } from 'lucide-react'
import { SignRecognitionCamera } from '@/components/features/SignRecognitionCamera'
import { Card, Badge, Button } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { ISL_PHRASES } from '@/data/islSigns'

export function RecognizePage() {
  const { recognizedText, recognitionHistory } = useAppStore()
  const [aiCorrected, setAiCorrected] = useState('')
  const [correcting, setCorrecting] = useState(false)

  const correctSentence = async () => {
    if (!recognizedText) return
    setCorrecting(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/nlp/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: recognizedText })
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setAiCorrected(data.corrected_text)
    } catch (err) {
      console.error(err)
      setAiCorrected('[Error connecting to backend API]')
    } finally {
      setCorrecting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Camera + controls */}
      <div className="xl:col-span-2 space-y-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <SignRecognitionCamera />
        </motion.div>

        {/* AI Correction panel */}
        {recognizedText && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-[var(--color-primary-400)]" />
              <h3 className="font-semibold text-sm text-[var(--color-text-secondary)]">AI Sentence Correction</h3>
              <Badge variant="primary">GPT-4</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Raw Signs</p>
                <div className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] font-mono">
                  {recognizedText || '—'}
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Corrected Sentence</p>
                <div className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-primary-500)]/20 text-sm text-[var(--color-text-primary)]">
                  {aiCorrected || <span className="text-[var(--color-text-muted)]">Click correct to improve...</span>}
                </div>
              </div>
            </div>

            <Button
              variant="primary" size="sm" className="mt-3"
              icon={<Zap size={14} />}
              loading={correcting}
              onClick={correctSentence}
            >
              Improve with AI
            </Button>
          </motion.div>
        )}
      </div>

      {/* Sidebar: info + history */}
      <div className="space-y-4">
        {/* Info card */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={15} className="text-[var(--color-accent-500)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">How it works</h3>
          </div>
          <ol className="space-y-3">
            {[
              { n: '1', text: 'Allow webcam access when prompted' },
              { n: '2', text: 'Click "Start Recognition" to begin' },
              { n: '3', text: 'Perform ISL signs in front of the camera' },
              { n: '4', text: 'AI detects landmarks and classifies signs' },
              { n: '5', text: 'Use "AI Improve" for natural sentences' },
            ].map(step => (
              <li key={step.n} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--color-primary-600)]/20 border border-[var(--color-primary-500)]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[var(--color-primary-400)]">{step.n}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </Card>

        {/* System info */}
        <Card className="p-4">
          <div className="space-y-2">
            {[
              { label: 'AI Model', value: 'MediaPipe Hands v1' },
              { label: 'Language', value: 'Indian Sign Language (ISL)' },
              { label: 'Processing', value: 'Browser (Client-Side)' },
              { label: 'Latency', value: '<50ms' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-xs">
                <span className="text-[var(--color-text-muted)]">{item.label}</span>
                <span className="text-[var(--color-text-secondary)] font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recognition history */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History size={15} className="text-[var(--color-text-muted)]" />
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">History</h3>
            </div>
            <Badge variant="accent">{recognitionHistory.length}</Badge>
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {recognitionHistory.length > 0 ? recognitionHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--color-bg-surface-2)] transition-colors">
                <span className="text-sm text-[var(--color-text-primary)] font-medium">{item.sign}</span>
                <span className={`text-xs font-medium ${item.confidence >= 80 ? 'text-green-400' : item.confidence >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {item.confidence}%
                </span>
              </div>
            )) : (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No history yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
