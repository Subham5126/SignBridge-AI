import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, X } from 'lucide-react'
import { LiquidBackground } from '@/components/ui/LiquidBackground'
import { useAppStore } from '@/stores/useAppStore'
import { signUpUser, signInUser, signInWithGoogle } from '@/lib/supabase'
import { getPostLoginPath } from '@/lib/profileUtils'

export function LoginPage() {
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0]
        const { user, error } = await signUpUser(email, password, fullName)
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
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* 60 FPS Iridescent Liquid Wallpaper & Ambient Light Overlay */}
      <LiquidBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Refractive Liquid Glassmorphic Card */}
        <div className="liquid-glass-card relative rounded-[36px] p-7 md:p-8 overflow-hidden">
          
          {/* Subtle Refractive Inner Highlights */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close (X) Circular Glass Button */}
          <Link
            to="/"
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all shadow-sm"
            aria-label="Close auth modal"
          >
            <X size={16} />
          </Link>

          {/* Segmented Tab Control (Sign up | Sign in) */}
          <div className="flex bg-[#0A0B12]/80 p-1 rounded-full border border-white/10 w-44 mb-6 relative backdrop-blur-md">
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer relative z-10 ${
                mode === 'signup'
                  ? 'bg-white/20 text-white shadow-sm border border-white/10'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer relative z-10 ${
                mode === 'login'
                  ? 'bg-white/20 text-white shadow-sm border border-white/10'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Sign in
            </button>
          </div>

          {/* Header Title */}
          <h1 className="text-2xl font-bold text-white tracking-tight mb-5">
            {mode === 'signup' ? 'Create an account' : 'Welcome back'}
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="liquid-input w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
                      required={mode === 'signup'}
                      aria-label="First name"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="liquid-input w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
                      aria-label="Last name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address Input */}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="liquid-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
                required
                aria-label="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                className="liquid-input w-full pl-4 pr-11 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
                required
                minLength={6}
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-xs text-red-400 font-medium px-1 pt-1">{errorMsg}</p>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-white via-slate-100 to-slate-200 text-slate-900 font-bold text-sm hover:brightness-110 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.2)] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create an account' : 'Sign in to account'}</span>
                  <ArrowRight size={16} className="text-slate-900" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-[10px] uppercase font-semibold text-white/40 tracking-widest font-mono shrink-0">
              OR SIGN IN WITH
            </span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Social Auth Button (Google Only) */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="liquid-input w-full py-3 px-4 rounded-2xl hover:bg-white/15 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            title="Sign in with Google"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-sm font-semibold text-white/90">Google Account</span>
          </button>

          {/* Footer Terms */}
          <p className="text-center text-[11px] text-white/35 mt-6 font-medium">
            By creating an account, you agree to our{' '}
            <Link to="#" className="text-white/60 hover:text-white underline transition-colors">
              Terms & Service
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
