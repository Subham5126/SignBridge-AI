import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Hand, Type, Mic, MessageSquare, BookOpen,
  Settings, LogOut, ChevronLeft, ChevronRight, Zap, Menu, X,
  Bell, Search, Moon, Sun, Accessibility, Globe
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { isProfileComplete } from '@/lib/profileUtils'
import { Button } from '@/components/ui'

const NAV_ITEMS = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/recognize', label: 'Sign Recognition', icon: Hand },
  { path: '/app/text-to-sign', label: 'Text to Sign', icon: Type },
  { path: '/app/speech', label: 'Speech Mode', icon: Mic },
  { path: '/app/conversation', label: 'Conversation', icon: MessageSquare },
  { path: '/app/learn', label: 'Learning Mode', icon: BookOpen },
]

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { user, logout } = useAppStore()
  const profileDone = isProfileComplete(user)

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] z-40 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--color-border)] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(124,58,237,0.4)]">
          <Hand size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-bold text-sm text-[var(--color-text-primary)] whitespace-nowrap"
            >
              SignBridge <span className="gradient-text">AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          const disabled = !profileDone

          if (disabled) {
            return (
              <div
                key={path}
                className="sidebar-item opacity-40 cursor-not-allowed"
                title="Complete your profile first"
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap text-sm">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          return (
            <Link key={path} to={path}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`sidebar-item ${active ? 'active' : ''}`}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap text-sm"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <motion.div
                    layoutId="active-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary-400)]"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: profile + settings */}
      <div className="px-2 py-4 border-t border-[var(--color-border)] space-y-0.5 shrink-0">
        <Link to="/app/profile">
          <div className="sidebar-item" title={collapsed ? 'Profile' : undefined}>
            <Settings size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap text-sm">
                  Profile & Settings
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
        <div
          onClick={logout}
          className="sidebar-item hover:text-red-400 cursor-pointer"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap text-sm">
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse button */}
        <button
          onClick={onToggle}
          className="sidebar-item w-full mt-2"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs whitespace-nowrap">
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}

export function TopBar({ sidebarCollapsed }) {
  const location = useLocation()
  const { user, highContrast, largeText, toggleHighContrast, toggleLargeText, language, setLanguage } = useAppStore()
  const [showSearch, setShowSearch] = useState(false)
  const profileDone = isProfileComplete(user)

  const getPageTitle = () => {
    if (location.pathname === '/app/profile' && !profileDone) {
      return 'Complete Your Profile'
    }
    const map = {
      '/app': 'Dashboard',
      '/app/recognize': 'Live Sign Recognition',
      '/app/text-to-sign': 'Text to Sign',
      '/app/speech': 'Speech Mode',
      '/app/conversation': 'Two-Way Conversation',
      '/app/learn': 'Learning Mode',
      '/app/profile': 'Profile & Settings',
    }
    return map[location.pathname] || 'SignBridge AI'
  }

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-4 gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/80 backdrop-blur-xl z-30 transition-all duration-300"
      style={{ left: sidebarCollapsed ? 64 : 240 }}
    >
      <h1 className="text-sm font-semibold text-[var(--color-text-primary)]">{getPageTitle()}</h1>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language selector */}
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="text-xs bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-[var(--color-text-muted)] cursor-pointer"
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="mr">मराठी</option>
        </select>

        {/* Accessibility toggles */}
        <button
          onClick={toggleHighContrast}
          className={`p-1.5 rounded-lg transition-colors ${highContrast ? 'bg-yellow-500/20 text-yellow-400' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)]'}`}
          aria-label="Toggle high contrast"
          title="High contrast"
        >
          <Accessibility size={15} />
        </button>

        <button
          onClick={toggleLargeText}
          className={`p-1.5 rounded-lg transition-colors text-xs font-bold ${largeText ? 'bg-[var(--color-primary-600)]/20 text-[var(--color-primary-400)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)]'}`}
          aria-label="Toggle large text"
          title="Large text"
        >
          A+
        </button>

        {/* Notification bell */}
        <button className="relative p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)]">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-500)]" />
        </button>

        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center text-xs font-bold text-white cursor-pointer overflow-hidden">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            (user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()
          )}
        </div>
      </div>
    </header>
  )
}

export function MobileHeader({ onMenuToggle, menuOpen }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/90 backdrop-blur-xl z-50 md:hidden">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center">
          <Hand size={14} className="text-white" />
        </div>
        <span className="font-bold text-sm gradient-text">SignBridge AI</span>
      </div>
      <button onClick={onMenuToggle} className="p-2 rounded-lg text-[var(--color-text-muted)]">
        {menuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
    </header>
  )
}
