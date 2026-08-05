import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Hand, Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react'
import { Button, Divider } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'

export function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setUser } = useAppStore()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setUser({ name: name || email.split('@')[0], email, id: Date.now() })
      navigate('/app')
    }, 1200)
  }

  const handleGoogleAuth = () => {
    setLoading(true)
    setTimeout(() => {
      setUser({ name: 'Google User', email: 'user@gmail.com', id: Date.now() })
      navigate('/app')
    }, 1000)
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
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          {/* Tab switch */}
          <div className="flex bg-[var(--color-bg-surface-2)] rounded-xl p-1 mb-6">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  mode === m
                    ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Google */}
          <Button
            variant="secondary" size="md" className="w-full mb-4"
            icon={<Globe size={16} className="text-[#4285F4]" />}
            onClick={handleGoogleAuth}
            loading={loading}
          >
            Continue with Google
          </Button>

          <Divider label="or" />

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
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-500)]/60"
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
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-500)]/60"
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
                className="w-full pl-9 pr-10 py-2.5 bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-500)]/60"
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

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-[var(--color-primary-400)] hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary" size="md" className="w-full mt-2"
              loading={loading}
              iconRight={<ArrowRight size={16} />}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[var(--color-primary-400)] hover:underline font-medium">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  )
}
