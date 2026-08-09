import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar, TopBar } from '@/components/layout'
import { AITutorDrawer } from '@/components/features/AITutorDrawer'
import { useAppStore } from '@/stores/useAppStore'
import { Bot, Sparkles, LayoutDashboard, Hand, MessageSquare, BookOpen, User } from 'lucide-react'
import { clsx } from 'clsx'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const { highContrast, largeText, displayMode } = useAppStore()

  const isMobileView = displayMode === 'mobile'

  return (
    <div
      className={clsx(
        'min-h-screen relative transition-colors app-layout',
        isMobileView ? 'mobile-mode bg-[#08080E]' : 'desktop-mode bg-[var(--color-bg-base)]',
        highContrast && 'high-contrast',
        largeText && 'large-text'
      )}
    >
      {/* Desktop Sidebar (Hidden when in Mobile mode) */}
      {!isMobileView && (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      )}

      {/* Top Navbar Header */}
      <TopBar sidebarCollapsed={isMobileView ? true : collapsed} isMobileView={isMobileView} />

      {/* Main Content Area */}
      <motion.main
        animate={{
          marginLeft: isMobileView ? 0 : (collapsed ? 64 : 240)
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={clsx('min-h-screen pt-14 main-content', isMobileView ? 'pb-24 px-3' : '')}
      >
        <div className={clsx('page-content', isMobileView ? 'p-2.5 w-full' : 'p-6 max-w-7xl mx-auto')}>
          <Outlet />
        </div>
      </motion.main>

      {/* Mobile Bottom Navigation Bar (Rendered when in Mobile displayMode) */}
      {isMobileView && (
        <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 h-16 bg-[#0E0F18]/95 backdrop-blur-2xl border-t border-white/10 z-50 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 text-[11px] font-semibold transition-all py-1 px-3 rounded-xl',
                isActive ? 'text-purple-400 bg-purple-500/15' : 'text-slate-400 hover:text-white'
              )
            }
          >
            <LayoutDashboard size={18} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/app/recognize"
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 text-[11px] font-semibold transition-all py-1 px-3 rounded-xl',
                isActive ? 'text-purple-400 bg-purple-500/15' : 'text-slate-400 hover:text-white'
              )
            }
          >
            <Hand size={18} />
            <span>Sign</span>
          </NavLink>

          <NavLink
            to="/app/conversation"
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 text-[11px] font-semibold transition-all py-1 px-3 rounded-xl',
                isActive ? 'text-purple-400 bg-purple-500/15' : 'text-slate-400 hover:text-white'
              )
            }
          >
            <MessageSquare size={18} />
            <span>Chat</span>
          </NavLink>

          <NavLink
            to="/app/learn"
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 text-[11px] font-semibold transition-all py-1 px-3 rounded-xl',
                isActive ? 'text-purple-400 bg-purple-500/15' : 'text-slate-400 hover:text-white'
              )
            }
          >
            <BookOpen size={18} />
            <span>Learn</span>
          </NavLink>

          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 text-[11px] font-semibold transition-all py-1 px-3 rounded-xl',
                isActive ? 'text-purple-400 bg-purple-500/15' : 'text-slate-400 hover:text-white'
              )
            }
          >
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        </nav>
      )}

      {/* Floating AI ASL Tutor Button */}
      <motion.button
        whileHover={{ scale: 1.06, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTutorOpen(true)}
        className={clsx(
          'fixed z-40 px-4 py-3 rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-accent-600)] text-white font-bold text-xs shadow-2xl border border-white/20 flex items-center gap-2 group',
          isMobileView ? 'bottom-20 right-4' : 'bottom-6 right-6'
        )}
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
