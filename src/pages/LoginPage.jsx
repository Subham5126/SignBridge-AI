import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Hand, Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react'
import { Button, Divider } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { signUpUser, signInUser, signInWithGoogle } from '@/lib/supabase'
import { getPostLoginPath } from '@/lib/profileUtils'

export function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { setUser } = useAppStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (mode === 'signup') {
        const { user, error } = await signUpUser(email, password, name)
        if (error) throw new Error(error)
        setUser(user)
        navigate(getPostLoginPath(user))
      } else {
        const { user, error } = await signInUser(email, password)
        if (error) throw new Error(error)
        setUser(user)
        navigate(getPostLoginPath(user))
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { user: googleUser, error, redirecting } = await signInWithGoogle()
      if (error) throw new Error(error)
      if (redirecting) return
      if (googleUser) {
        setUser(googleUser)
        navigate(getPostLoginPath(googleUser))
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google Auth failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="glow-orb w-80 h-80 bg-[var(--color-primary-600)] left-0 top-0" />
      <div className="glow-orb w-64 h-64 bg-[var(--color-accent-500)] right-0 bottom-0" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.4)]">
              <Hand size={28} className="text-white" />
            </div>
            <span className="text-2xl font-black">
              SignBridge <span className="gradient-text">AI</span>
            </span>
          </Link>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            {mode === 'login' ? 'Sign in to access your platform' : 'Create your account to get started'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 border border-[var(--color-primary-500)]/30">
          {/* Tab switch */}
          <div className="flex bg-[var(--color-bg-surface-2)] rounded-xl p-1 mb-6">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize cursor-pointer ${
                  mode === m
                    ? 'bg-[var(--color-primary-600)] text-white shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full mb-4 py-2.5 px-4 rounded-xl bg-white text-slate-800 font-semibold text-sm flex items-center justify-center gap-2.5 shadow hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loading ? 'Connecting...' : 'Continue with Google Account'}</span>
          </button>

          <Divider label="or email authentication" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === 'signup' && (
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-500)]"
                  required={mode === 'signup'}
                  aria-label="Full name"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-500)]"
                required
                aria-label="Email address"
              />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-10 py-2.5 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-500)]"
                required
                minLength={6}
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
            )}

            <Button
              type="submit"
              variant="primary" size="md" className="w-full mt-2"
              loading={loading}
              iconRight={<ArrowRight size={16} />}
            >
              {mode === 'login' ? 'Sign In to App' : 'Create Full Profile & Enter'}
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
            {mode === 'login' ? "First time visiting? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMsg(''); }}
              className="text-[var(--color-primary-400)] hover:underline font-medium cursor-pointer"
            >
              {mode === 'login' ? 'Create a Profile' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
