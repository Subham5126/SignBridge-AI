import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import { useAppStore } from '@/stores/useAppStore'

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
  // For demo purposes: allow access without auth
  return children
}

export default function App() {
  return (
    <BrowserRouter>
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
          <Route index element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
          <Route path="recognize" element={<AnimatedPage><RecognizePage /></AnimatedPage>} />
          <Route path="text-to-sign" element={<AnimatedPage><TextToSignPage /></AnimatedPage>} />
          <Route path="speech" element={<AnimatedPage><SpeechPage /></AnimatedPage>} />
          <Route path="conversation" element={<AnimatedPage><ConversationPage /></AnimatedPage>} />
          <Route path="learn" element={<AnimatedPage><LearnPage /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
