import { motion } from 'framer-motion'
import { LearningMode } from '@/components/features/LearningMode'

export function LearnPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <LearningMode />
    </motion.div>
  )
}
