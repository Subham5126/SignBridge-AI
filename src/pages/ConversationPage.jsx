import { motion } from 'framer-motion'
import { TwoWayConversation } from '@/components/features/TwoWayConversation'
import { Card, Badge } from '@/components/ui'
import { Users, Zap, Shield } from 'lucide-react'

export function ConversationPage() {
  return (
    <div className="space-y-4">
      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
      >
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Users size={13} className="text-[var(--color-primary-400)]" />
            Deaf user signs via webcam; hearing user types or speaks
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Zap size={13} className="text-[var(--color-accent-400)]" />
            AI corrects and formats all messages in real time
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Shield size={13} className="text-green-400" />
            End-to-end private session
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
        <TwoWayConversation />
      </motion.div>
    </div>
  )
}
