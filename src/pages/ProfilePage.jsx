import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Settings, Bell, Shield, Globe, Accessibility,
  Moon, Sun, Type, Contrast, Hand, Save, Camera, Award,
  Activity, Flame, BookOpen, TrendingUp
} from 'lucide-react'
import { Button, Badge, Card, ProgressRing, StatCard } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'

export function ProfilePage() {
  const {
    user, isAuthenticated,
    highContrast, largeText, language,
    toggleHighContrast, toggleLargeText, setLanguage,
    learningProgress
  } = useAppStore()

  const [name, setName] = useState('Alex Kumar')
  const [email, setEmail] = useState('alex@example.com')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const ToggleRow = ({ icon: Icon, label, desc, enabled, onToggle }) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-bg-surface-2)] transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-[var(--color-bg-surface-3)]">
          <Icon size={15} className="text-[var(--color-text-muted)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
          {desc && <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>}
        </div>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative w-10 h-5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] ${enabled ? 'bg-[var(--color-primary-600)]' : 'bg-[var(--color-bg-surface-3)]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              {name[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
              <Camera size={12} />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{name}</h2>
              <Badge variant="primary">Pro</Badge>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Flame size={12} /> {learningProgress.streak} day streak
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">·</span>
              <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <Award size={12} /> Level 4
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account settings */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
          <Card className="p-5">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
              <User size={15} className="text-[var(--color-primary-400)]" /> Account
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Display Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]/50"
                  aria-label="Display name"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Email Address</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]/50"
                  aria-label="Email address"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Interface Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
                  aria-label="Language"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
              <Button
                variant="primary" size="sm" className="w-full mt-2"
                icon={<Save size={14} />}
                onClick={handleSave}
              >
                {saved ? '✓ Saved!' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Accessibility */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
          <Card className="p-5">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
              <Accessibility size={15} className="text-[var(--color-accent-400)]" /> Accessibility
            </h3>
            <div className="space-y-1">
              <ToggleRow
                icon={Contrast}
                label="High Contrast"
                desc="Enhances visibility for low vision"
                enabled={highContrast}
                onToggle={toggleHighContrast}
              />
              <ToggleRow
                icon={Type}
                label="Large Text"
                desc="Increases text size by 12%"
                enabled={largeText}
                onToggle={toggleLargeText}
              />
              <ToggleRow
                icon={Moon}
                label="Dark Mode"
                desc="Always on for optimal visibility"
                enabled={true}
                onToggle={() => {}}
              />
              <ToggleRow
                icon={Bell}
                label="Notifications"
                desc="Practice reminders and updates"
                enabled={true}
                onToggle={() => {}}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Learning Stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}>
        <Card className="p-5">
          <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
            <Activity size={15} className="text-green-400" /> Learning Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Streak" value={`${learningProgress.streak}d`} icon={<Flame size={16} />} color="#f59e0b" />
            <StatCard title="Total Signs" value={learningProgress.totalSigns} icon={<Hand size={16} />} color="#7c3aed" />
            <StatCard title="Accuracy" value={`${learningProgress.accuracy}%`} icon={<Award size={16} />} color="#10b981" />
            <StatCard title="Minutes" value={learningProgress.practiceMinutes} icon={<TrendingUp size={16} />} color="#06b6d4" />
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Favorite Signs</p>
            <div className="flex flex-wrap gap-1.5">
              {learningProgress.favoriteSigns.map(sign => (
                <span key={sign} className="px-2.5 py-1 rounded-full text-xs bg-[var(--color-primary-600)]/15 text-[var(--color-primary-400)] border border-[var(--color-primary-500)]/20">
                  {sign}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Needs Practice</p>
            <div className="flex flex-wrap gap-1.5">
              {learningProgress.weakSigns.map(sign => (
                <span key={sign} className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {sign}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
