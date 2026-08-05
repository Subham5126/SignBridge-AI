import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar, TopBar } from '@/components/layout'
import { useAppStore } from '@/stores/useAppStore'
import { clsx } from 'clsx'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { highContrast, largeText } = useAppStore()

  return (
    <div className={clsx('min-h-screen', highContrast && 'high-contrast', largeText && 'large-text')}>
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
    </div>
  )
}
