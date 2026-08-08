import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar, TopBar } from '@/components/layout'
import { AITutorDrawer } from '@/components/features/AITutorDrawer'
import { useAppStore } from '@/stores/useAppStore'
import { Bot, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const { highContrast, largeText } = useAppStore()

  return (
    <div className={clsx('min-h-screen relative', highContrast && 'high-contrast', largeText && 'large-text')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <TopBar sidebarCollapsed={collapsed} />
      <motion.main
        animate={{ marginLeft: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="min-h-screen pt-14"
      >
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>

      {/* Floating AI ASL Tutor Button */}
      <motion.button
        whileHover={{ scale: 1.06, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTutorOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-accent-600)] text-white font-bold text-xs shadow-2xl border border-white/20 flex items-center gap-2 group"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Bot size={14} className="group-hover:rotate-12 transition-transform" />
        </div>
        <span>AI ASL Tutor</span>
        <Sparkles size={13} className="text-amber-300 animate-pulse" />
      </motion.button>

      {/* AI Tutor Drawer */}
      <AITutorDrawer isOpen={tutorOpen} onClose={() => setTutorOpen(false)} />
    </div>
  )
}
