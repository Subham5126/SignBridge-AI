import { motion } from 'framer-motion'
import { Type, Info } from 'lucide-react'
import { TextToSign } from '@/components/features/TextToSign'
import { Card, Badge } from '@/components/ui'

export function TextToSignPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <TextToSign />
        </motion.div>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={15} className="text-[var(--color-accent-500)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Tips</h3>
          </div>
          <ul className="space-y-2 text-xs text-[var(--color-text-muted)]">
            <li className="flex gap-2"><span className="text-[var(--color-primary-400)]">•</span>Use AI Correct to improve grammar before animating</li>
            <li className="flex gap-2"><span className="text-[var(--color-primary-400)]">•</span>Adjust playback speed for comfortable viewing</li>
            <li className="flex gap-2"><span className="text-[var(--color-primary-400)]">•</span>Each word is matched to the ISL sign dictionary</li>
            <li className="flex gap-2"><span className="text-[var(--color-primary-400)]">•</span>Unmapped words show finger-spelling fallback</li>
            <li className="flex gap-2"><span className="text-[var(--color-primary-400)]">•</span>Use the Quick Phrases panel for common sentences</li>
          </ul>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Supported Languages</p>
          <div className="space-y-2">
            {[
              { lang: 'English', sign: 'ISL', status: 'Full support' },
              { lang: 'Hindi', sign: 'ISL', status: 'Basic support' },
              { lang: 'Marathi', sign: 'ISL', status: 'Coming soon' },
            ].map(item => (
              <div key={item.lang} className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{item.lang} → {item.sign}</span>
                <Badge variant={item.status.includes('Full') ? 'success' : item.status.includes('soon') ? 'warning' : 'accent'}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
