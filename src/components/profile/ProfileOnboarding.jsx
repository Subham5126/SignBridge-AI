import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Hand, Target, MapPin, ArrowRight, ArrowLeft, Check,
  Sparkles, GraduationCap
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { saveUserProfile } from '@/lib/supabase'
import {
  USER_ROLES, SIGN_LANGUAGES, EXPERIENCE_LEVELS, PRIMARY_GOALS, getProfileDefaults
} from '@/lib/profileUtils'

const STEPS = [
  { id: 1, label: 'About you', icon: User },
  { id: 2, label: 'Your role', icon: Hand },
  { id: 3, label: 'Experience', icon: GraduationCap },
  { id: 4, label: 'Your goals', icon: Target },
]

function OptionCard({ selected, onClick, label, desc, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
        selected
          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-600)]/10 ring-1 ring-[var(--color-primary-500)]/40'
          : 'border-[var(--color-border)] bg-[var(--color-bg-surface-2)] hover:border-[var(--color-primary-500)]/40'
      }`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg shrink-0 ${selected ? 'bg-[var(--color-primary-600)]/20 text-[var(--color-primary-400)]' : 'bg-[var(--color-bg-surface-3)] text-[var(--color-text-muted)]'}`}>
            <Icon size={16} />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
          {desc && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>}
        </div>
        {selected && <Check size={16} className="ml-auto text-[var(--color-primary-400)] shrink-0 mt-0.5" />}
      </div>
    </button>
  )
}

export function ProfileOnboarding() {
  const { user, setUser } = useAppStore()
  const navigate = useNavigate()
  const defaults = getProfileDefaults(user)

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(defaults)

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const canProceed = () => {
    if (step === 1) return form.name.trim().length >= 2
    if (step === 2) return Boolean(form.role)
    if (step === 3) return Boolean(form.sign_language && form.experience_level)
    if (step === 4) return Boolean(form.primary_goal)
    return false
  }

  const handleComplete = async () => {
    if (!canProceed()) return
    setSaving(true)
    setError('')

    const profileData = {
      ...form,
      name: form.name.trim(),
      profile_complete: true,
      avatar_url: form.avatar_url || user?.user_metadata?.avatar_url || '',
      provider: user?.user_metadata?.provider || 'email',
    }

    try {
      await saveUserProfile(profileData)
      setUser({
        ...user,
        user_metadata: { ...user.user_metadata, ...profileData },
      })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const avatarUrl = form.avatar_url || user?.user_metadata?.avatar_url

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Badge variant="accent" className="mb-3">
          <Sparkles size={12} className="inline mr-1" /> Welcome to SignBridge AI
        </Badge>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Let's set up your profile
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">
          Tell us a bit about yourself so we can personalize your learning path and communication tools.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map(({ id, label, icon: Icon }) => (
          <div key={id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              step === id
                ? 'bg-[var(--color-primary-600)] text-white'
                : step > id
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-[var(--color-bg-surface-2)] text-[var(--color-text-muted)]'
            }`}>
              {step > id ? <Check size={12} /> : <Icon size={12} />}
              <span className="hidden sm:inline">{label}</span>
            </div>
            {id < STEPS.length && (
              <div className={`w-6 h-px ${step > id ? 'bg-green-500/40' : 'bg-[var(--color-border)]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 border border-[var(--color-primary-500)]/30">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center text-xl font-bold text-white">
                    {(form.name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Signed in as</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{user?.email}</p>
                  {user?.user_metadata?.provider === 'google' && (
                    <p className="text-[11px] text-green-400 mt-0.5">Google account verified</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                  Display name <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                  Location <span className="text-[var(--color-text-muted)]">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    value={form.location}
                    onChange={e => update('location', e.target.value)}
                    placeholder="City, Country — helps us suggest local sign variants"
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Which best describes you? This helps us tailor the app experience.
              </p>
              {USER_ROLES.map(role => (
                <OptionCard
                  key={role.id}
                  selected={form.role === role.id}
                  onClick={() => update('role', role.id)}
                  label={role.label}
                  desc={role.desc}
                  icon={User}
                />
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  Primary sign language <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SIGN_LANGUAGES.map(lang => (
                    <OptionCard
                      key={lang.id}
                      selected={form.sign_language === lang.id}
                      onClick={() => update('sign_language', lang.id)}
                      label={lang.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  Experience level <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map(level => (
                    <OptionCard
                      key={level.id}
                      selected={form.experience_level === level.id}
                      onClick={() => update('experience_level', level.id)}
                      label={level.label}
                      desc={level.desc}
                      icon={GraduationCap}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  What brings you to SignBridge? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {PRIMARY_GOALS.map(goal => (
                    <OptionCard
                      key={goal.id}
                      selected={form.primary_goal === goal.id}
                      onClick={() => update('primary_goal', goal.id)}
                      label={goal.label}
                      desc={goal.desc}
                      icon={Target}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                  Short bio <span className="text-[var(--color-text-muted)]">(optional)</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={e => update('bio', e.target.value)}
                  rows={3}
                  placeholder="e.g. Learning ASL to communicate with my deaf cousin..."
                  className="w-full bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)] resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-xs text-red-400 mt-4">{error}</p>}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--color-border)]">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={14} />}
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            Back
          </Button>

          {step < 4 ? (
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight size={14} />}
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              iconRight={<Check size={14} />}
              onClick={handleComplete}
              loading={saving}
              disabled={!canProceed()}
            >
              Complete profile & enter app
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
