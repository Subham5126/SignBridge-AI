import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RecognizePage } from '@/pages/RecognizePage'
import { TextToSignPage } from '@/pages/TextToSignPage'
import { SpeechPage } from '@/pages/SpeechPage'
import { ConversationPage } from '@/pages/ConversationPage'
import { LearnPage } from '@/pages/LearnPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { InkCursor } from '@/components/ui/InkCursor'
import { useAppStore } from '@/stores/useAppStore'
import { restoreAuthSession, onAuthStateChange } from '@/lib/supabase'
import { isProfileComplete, getPostLoginPath } from '@/lib/profileUtils'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
}

const pageTransition = {
  duration: 0.2,
  ease: 'easeInOut',
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAppStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function ProfileGate() {
  const { user } = useAppStore()
  const location = useLocation()

  if (user && !isProfileComplete(user) && location.pathname !== '/app/profile') {
    return <Navigate to="/app/profile" replace />
  }

  return <Outlet />
}

function AuthBootstrap() {
  const { setUser } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    restoreAuthSession().then(({ user }) => {
      if (user) {
        setUser(user)
        if (window.location.pathname === '/login') {
          navigate(getPostLoginPath(user), { replace: true })
        }
      }
    })

    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser(user)
        if (window.location.pathname === '/login') {
          navigate(getPostLoginPath(user), { replace: true })
        }
      }
    })

    return unsubscribe
  }, [setUser, navigate])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Liquid Ink Splatter Cursor */}
      <InkCursor />

      <AuthBootstrap />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* App routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route element={<ProfileGate />}>
            <Route index element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
            <Route path="recognize" element={<AnimatedPage><RecognizePage /></AnimatedPage>} />
            <Route path="text-to-sign" element={<AnimatedPage><TextToSignPage /></AnimatedPage>} />
            <Route path="speech" element={<AnimatedPage><SpeechPage /></AnimatedPage>} />
            <Route path="conversation" element={<AnimatedPage><ConversationPage /></AnimatedPage>} />
            <Route path="learn" element={<AnimatedPage><LearnPage /></AnimatedPage>} />
            <Route path="profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
