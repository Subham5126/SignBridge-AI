import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  User, Accessibility, Moon, Type, Contrast, Save, LogOut, Check,
  Hand, Target, MapPin, GraduationCap, Flame, Activity, Award, TrendingUp, Camera, Upload, Zap
} from 'lucide-react'
import { Button, Badge, Card, StatCard } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { signOutUser, saveUserProfile } from '@/lib/supabase'
import { ProfileOnboarding } from '@/components/profile/ProfileOnboarding'
import {
  isProfileComplete, getProfileDefaults,
  USER_ROLES, SIGN_LANGUAGES, EXPERIENCE_LEVELS, PRIMARY_GOALS
} from '@/lib/profileUtils'

function labelFor(options, id) {
  return options.find(o => o.id === id)?.label || id || '—'
}

export function ProfilePage() {
  const {
    user, setUser, logout,
    highContrast, largeText,
    toggleHighContrast, toggleLargeText,
    learningProgress, recordActiveDay,
    recognitionHistory, stats, activePracticeSeconds, quizXP
  } = useAppStore()

  const [form, setForm] = useState(getProfileDefaults(user))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  // Sync profile active streak on mount
  useEffect(() => {
    recordActiveDay()
    if (user) {
      const defaults = getProfileDefaults(user)
      setForm(prev => ({
        ...defaults,
        avatar_url: user.user_metadata?.avatar_url || defaults.avatar_url || ''
      }))
    }
  }, [user, recordActiveDay])

  if (!isProfileComplete(user)) {
    return <ProfileOnboarding />
  }

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 250 // Compress avatar to 250x250 max for ultra-fast load
        let w = img.width
        let h = img.height
        if (w > h) {
          if (w > MAX_SIZE) { h = Math.round((h * MAX_SIZE) / w); w = MAX_SIZE }
        } else {
          if (h > MAX_SIZE) { w = Math.round((w * MAX_SIZE) / h); h = MAX_SIZE }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)

        update('avatar_url', compressedDataUrl)
        
        // Persist custom avatar URL into top-level user object, user_metadata & registeredUsers store
        const updatedMetadata = {
          ...(user?.user_metadata || {}),
          avatar_url: compressedDataUrl,
          custom_avatar_url: compressedDataUrl
        }
        setUser({
          ...user,
          custom_avatar_url: compressedDataUrl,
          avatar_url: compressedDataUrl,
          user_metadata: updatedMetadata
        })
        saveUserProfile({ ...form, avatar_url: compressedDataUrl, custom_avatar_url: compressedDataUrl })
      }
      img.src = event.target?.result
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    const avatarUrl = form.avatar_url || user?.custom_avatar_url || user?.avatar_url || user?.user_metadata?.avatar_url || ''
    const profileData = {
      ...form,
      name: form.name.trim(),
      custom_avatar_url: avatarUrl,
      avatar_url: avatarUrl,
      profile_complete: true
    }
    await saveUserProfile(profileData)
    setUser({
      ...user,
      ...profileData,
      custom_avatar_url: avatarUrl,
      avatar_url: avatarUrl,
      user_metadata: { ...(user?.user_metadata || {}), ...profileData, custom_avatar_url: avatarUrl, avatar_url: avatarUrl }
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    await signOutUser()
    logout()
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

  const currentAvatar = form.avatar_url || user?.avatar_url || user?.user_metadata?.avatar_url
  const roleLabel = labelFor(USER_ROLES, form.role)
  const langLabel = labelFor(SIGN_LANGUAGES, form.sign_language)
  const levelLabel = labelFor(EXPERIENCE_LEVELS, form.experience_level)
  const goalLabel = labelFor(PRIMARY_GOALS, form.primary_goal)

  // Compute live synchronized progress metrics
  const totalSignsRecognized = Math.max(
    learningProgress?.totalSigns || 0,
    recognitionHistory?.length || 0,
    stats?.todayRecognitions || 0
  )
  const calculatedStreak = Math.max(1, learningProgress?.streak || 1)
  const totalPracticeTimeMinutes = (learningProgress?.practiceMinutes || 0) + Math.floor((activePracticeSeconds || 0) / 60)
  const currentAccuracy = learningProgress?.accuracy || stats?.todayAccuracy || 88

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 border border-[var(--color-primary-500)]/30"
      >
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar with Upload Hover Button */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[var(--color-primary-500)]/40 shadow-lg group-hover:opacity-80 transition-all"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] group-hover:opacity-80 transition-all">
                {form.name[0]?.toUpperCase() || 'U'}
              </div>
            )}
            
            {/* Camera Overlay Badge */}
            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
              <Camera size={22} className="text-white drop-shadow" />
            </div>
            
            <div className="absolute -bottom-1 -right-1 bg-[var(--color-primary-600)] p-1.5 rounded-full border-2 border-[var(--color-bg-base)] text-white shadow">
              <Upload size={10} />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{form.name}</h2>
              <Badge variant="success">Profile complete</Badge>
              {user?.user_metadata?.provider === 'google' && (
                <Badge variant="primary">Google</Badge>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
            {form.bio && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 italic">{form.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs">
              <span className="flex items-center gap-1 text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Flame size={13} /> {calculatedStreak} day streak
              </span>
              <span className="flex items-center gap-1 text-purple-400 font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Zap size={13} /> {quizXP || 0} XP
              </span>
              {form.location && (
                <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                  <MapPin size={12} /> {form.location}
                </span>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" icon={<LogOut size={14} />} onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        {/* Quick summary chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-5 border-t border-[var(--color-border)]">
          {[
            { icon: User, label: 'Role', value: roleLabel },
            { icon: Hand, label: 'Language', value: langLabel },
            { icon: GraduationCap, label: 'Level', value: levelLabel },
            { icon: Target, label: 'Goal', value: goalLabel },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)]">
              <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mb-1">
                <Icon size={12} />
                <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
              </div>
              <p className="text-xs font-semibold text-[var(--color-text-primary)] leading-snug">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
              <User size={15} className="text-[var(--color-primary-400)]" /> Personal details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Display name</label>
                <input
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Profile Avatar URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    value={form.avatar_url || ''}
                    onChange={e => update('avatar_url', e.target.value)}
                    placeholder="Paste image URL or click upload"
                    className="flex-1 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-[var(--color-primary-600)] text-white rounded-xl text-xs font-medium hover:bg-[var(--color-primary-500)] transition-colors flex items-center gap-1"
                  >
                    <Upload size={13} />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Email</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-muted)] opacity-70 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={e => update('location', e.target.value)}
                  placeholder="City, Country"
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => update('bio', e.target.value)}
                  rows={2}
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)] resize-none"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sign language preferences */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
          <Card className="p-5">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
              <Hand size={15} className="text-[var(--color-primary-400)]" /> Sign language preferences
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Your role</label>
                <select
                  value={form.role}
                  onChange={e => update('role', e.target.value)}
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                >
                  <option value="">Select role</option>
                  {USER_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Primary sign language</label>
                <select
                  value={form.sign_language}
                  onChange={e => update('sign_language', e.target.value)}
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                >
                  <option value="">Select language</option>
                  {SIGN_LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Experience level</label>
                <select
                  value={form.experience_level}
                  onChange={e => update('experience_level', e.target.value)}
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                >
                  <option value="">Select level</option>
                  {EXPERIENCE_LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Primary goal</label>
                <select
                  value={form.primary_goal}
                  onChange={e => update('primary_goal', e.target.value)}
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                >
                  <option value="">Select goal</option>
                  {PRIMARY_GOALS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </div>

              <Button
                variant="primary" size="sm" className="w-full mt-1"
                icon={saved ? <Check size={14} /> : <Save size={14} />}
                onClick={handleSave}
                loading={saving}
              >
                {saved ? 'Changes saved' : 'Save changes'}
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
              <ToggleRow icon={Contrast} label="High contrast" desc="Enhances visibility for low vision" enabled={highContrast} onToggle={toggleHighContrast} />
              <ToggleRow icon={Type} label="Large text" desc="Increases text size by 12%" enabled={largeText} onToggle={toggleLargeText} />
              <ToggleRow icon={Moon} label="Dark mode" desc="Always on for optimal visibility" enabled={true} onToggle={() => {}} />
            </div>
          </Card>
        </motion.div>

        {/* Live Synchronized Progress Metrics */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}>
          <Card className="p-5">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
              <Activity size={15} className="text-green-400" /> Your progress
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard title="Streak" value={`${calculatedStreak}d`} icon={<Flame size={16} />} color="#f59e0b" />
              <StatCard title="Signs learned" value={totalSignsRecognized} icon={<Hand size={16} />} color="#7c3aed" />
              <StatCard title="Accuracy" value={`${currentAccuracy}%`} icon={<Award size={16} />} color="#10b981" />
              <StatCard title="Practice time" value={`${totalPracticeTimeMinutes}m`} icon={<TrendingUp size={16} />} color="#06b6d4" />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
