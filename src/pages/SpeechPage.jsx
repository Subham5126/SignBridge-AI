import { motion } from 'framer-motion'
import { Mic, Info, Globe } from 'lucide-react'
import { SpeechMode } from '@/components/features/SpeechMode'
import { Card, Badge } from '@/components/ui'

export function SpeechPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <SpeechMode />
        </motion.div>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={15} className="text-[var(--color-accent-500)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Language Support</h3>
          </div>
          <div className="space-y-2">
            {[
              { lang: 'English (US)', code: 'en-US', support: '99%' },
              { lang: 'Hindi', code: 'hi-IN', support: '95%' },
              { lang: 'Marathi', code: 'mr-IN', support: '90%' },
            ].map(item => (
              <div key={item.code} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)]">
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{item.lang}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{item.code}</p>
                </div>
                <Badge variant="success">{item.support}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={15} className="text-[var(--color-text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Browser Support</h3>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { browser: 'Chrome', support: '✅ Full support' },
              { browser: 'Edge', support: '✅ Full support' },
              { browser: 'Firefox', support: '⚠️ Limited' },
              { browser: 'Safari', support: '⚠️ Limited' },
            ].map(b => (
              <div key={b.browser} className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">{b.browser}</span>
                <span className="text-[var(--color-text-secondary)]">{b.support}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
            Uses the Web Speech API built into modern browsers. No additional installation required.
          </p>
        </Card>
      </div>
    </div>
  )
}
