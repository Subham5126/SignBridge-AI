import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Hand, Type, Mic, MessageSquare, BookOpen,
  Settings, LogOut, ChevronLeft, ChevronRight, Zap, Menu, X,
  Bell, Search, Moon, Sun, Accessibility, Globe, Smartphone, Monitor
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { isProfileComplete } from '@/lib/profileUtils'
import { Button } from '@/components/ui'
import { useTranslation } from '@/lib/i18n'

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { user, language, logout } = useAppStore()
  const { t } = useTranslation(language)
  const profileDone = isProfileComplete(user)

  const navItems = [
    { path: '/app', label: t('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { path: '/app/recognize', label: t('signRecognition', 'Sign Recognition'), icon: Hand },
    { path: '/app/text-to-sign', label: t('textToSign', 'Text to Sign'), icon: Type },
    { path: '/app/speech', label: t('speechMode', 'Speech Mode'), icon: Mic },
    { path: '/app/conversation', label: t('conversation', 'Conversation'), icon: MessageSquare },
    { path: '/app/learn', label: t('learningMode', 'Learning Mode'), icon: BookOpen },
  ]

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
        {navItems.map(({ path, label, icon: Icon }) => {
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
                    className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-400)] ml-auto shrink-0 shadow-[0_0_8px_#a78bfa]"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Profile & Settings Link at Bottom */}
      <div className="p-2 border-t border-[var(--color-border)] shrink-0">
        <Link to="/app/profile">
          <div className={`sidebar-item ${location.pathname === '/app/profile' ? 'active' : ''}`}>
            <Settings size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap text-sm">
                  {t('profileSettings', 'Profile & Settings')}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-[var(--color-border)] flex items-center justify-end shrink-0">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)] transition-colors cursor-pointer w-full flex items-center justify-center gap-2 text-xs"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}

export function TopBar({ sidebarCollapsed, isMobileView }) {
  const location = useLocation()
  const { user, theme, toggleTheme, highContrast, largeText, toggleHighContrast, toggleLargeText, language, setLanguage, displayMode, toggleDisplayMode } = useAppStore()
  const { t } = useTranslation(language)
  const [showSearch, setShowSearch] = useState(false)
  const profileDone = isProfileComplete(user)

  const getPageTitle = () => {
    if (location.pathname === '/app/profile' && !profileDone) {
      return t('completeProfile', 'Complete Your Profile')
    }
    const map = {
      '/app': t('dashboard', 'Dashboard'),
      '/app/recognize': t('signRecognition', 'Live Sign Recognition'),
      '/app/text-to-sign': t('textToSign', 'Text to Sign'),
      '/app/speech': t('speechMode', 'Speech Mode'),
      '/app/conversation': t('conversation', 'Two-Way Conversation'),
      '/app/learn': t('learningMode', 'Learning Mode'),
      '/app/profile': t('profileSettings', 'Profile & Settings'),
    }
    return map[location.pathname] || 'SignBridge AI'
  }

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-4 gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/80 backdrop-blur-xl z-30 transition-all duration-300"
      style={{ left: isMobileView ? 0 : (sidebarCollapsed ? 64 : 240) }}
    >
      <h1 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{getPageTitle()}</h1>

      <div className="flex items-center gap-2 ml-auto">
        {/* Compact Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)]/50 transition-all cursor-pointer shadow-sm shrink-0"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Moon size={14} className="text-purple-400" />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun size={14} className="text-amber-500" />
              <span>Light</span>
            </>
          )}
        </button>

        {/* Desktop ↔ Mobile Display Mode Toggle Button */}
        <button
          onClick={toggleDisplayMode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)]/50 transition-all cursor-pointer shadow-sm shrink-0"
          title={`Switch to ${displayMode === 'desktop' ? 'Mobile' : 'Desktop'} View`}
        >
          {displayMode === 'desktop' ? (
            <>
              <Smartphone size={14} className="text-purple-400" />
              <span className="hidden sm:inline">Mobile View</span>
            </>
          ) : (
            <>
              <Monitor size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Desktop View</span>
            </>
          )}
        </button>

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
