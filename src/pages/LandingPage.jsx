import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Hand, Mic, Type, MessageSquare, BookOpen, Zap, ArrowRight,
  Play, Shield, Globe, Users, ChevronRight, Star, Sparkles,
  Brain, Eye, Volume2, Activity
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'

const FEATURES = [
  { icon: Eye, title: 'Live Sign Recognition', desc: 'Real-time webcam-based ISL detection using MediaPipe AI with 90%+ accuracy', color: '#7c3aed', badge: 'AI Powered' },
  { icon: Type, title: 'Text to Sign', desc: 'Convert any text to animated ISL sign sequences instantly', color: '#06b6d4', badge: 'Instant' },
  { icon: Mic, title: 'Speech to Text', desc: 'Real-time voice captions in English, Hindi, and Marathi', color: '#10b981', badge: 'Multilingual' },
  { icon: MessageSquare, title: 'Two-Way Chat', desc: 'Seamless conversation mode between deaf and hearing individuals', color: '#f59e0b', badge: 'Real-time' },
  { icon: Brain, title: 'AI Correction', desc: 'LLM-powered grammar correction and sentence formation from signs', color: '#ec4899', badge: 'GPT-4' },
  { icon: BookOpen, title: 'Learning Mode', desc: 'Interactive ISL dictionary with gesture practice and AI feedback', color: '#8b5cf6', badge: 'Adaptive' },
]

const STATS = [
  { value: '500+', label: 'ISL Signs' },
  { value: '98%', label: 'Accuracy' },
  { value: '<50ms', label: 'Latency' },
  { value: '3', label: 'Languages' },
]

function FloatingSign({ sign, delay, x, y, size = 32 }) {
  return (
    <motion.div
      className="absolute font-black text-[var(--color-primary-400)] opacity-10 select-none pointer-events-none"
      style={{ left: x, top: y, fontSize: size }}
      animate={{ y: [0, -15, 0], opacity: [0.08, 0.15, 0.08] }}
      transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      {sign}
    </motion.div>
  )
}

function HeroHand() {
  const [frame, setFrame] = useState(0)
  const signs = ['Hello', 'ISL', 'AI', '🤝', 'Sign']

  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % signs.length), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer glow rings */}
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-[var(--color-primary-500)]"
          style={{ margin: -(i * 20) }}
          animate={{ opacity: [0.15, 0.05, 0.15], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}
        />
      ))}

      {/* Central orb */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] opacity-20 blur-2xl" />

      <div className="relative w-full h-full flex items-center justify-center">
        {/* Hand SVG */}
        <svg viewBox="0 0 200 220" className="w-48 h-48 drop-shadow-[0_0_30px_rgba(124,58,237,0.5)]">
          {/* Palm */}
          <ellipse cx="100" cy="170" rx="50" ry="35"
            fill="url(#handGrad)" stroke="#a78bfa" strokeWidth="1" />

          {/* Fingers animated */}
          {[
            { x: 50, heights: [80, 60, 45] },
            { x: 68, heights: [95, 70, 52] },
            { x: 86, heights: [100, 75, 56] },
            { x: 104, heights: [92, 68, 50] },
            { x: 122, heights: [75, 55, 42] },
          ].map((finger, fi) => {
            const animate = frame % 2 === 0
            return (
              <g key={fi}>
                <motion.line
                  x1={finger.x} y1={165}
                  x2={finger.x + (fi - 2) * 3}
                  y2={animate ? finger.heights[0] : finger.heights[1]}
                  stroke="#a78bfa"
                  strokeWidth={7}
                  strokeLinecap="round"
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                <motion.circle
                  cx={finger.x + (fi - 2) * 3}
                  cy={animate ? finger.heights[0] : finger.heights[1]}
                  r={4}
                  fill="#06b6d4"
                  transition={{ duration: 0.6 }}
                />
              </g>
            )
          })}

          {/* Thumb */}
          <motion.line
            x1="50" y1="158" x2="28" y2="130"
            stroke="#a78bfa" strokeWidth={7} strokeLinecap="round"
          />
          <circle cx="28" cy="130" r="4" fill="#06b6d4" />

          <defs>
            <linearGradient id="handGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated sign label */}
        <motion.div
          key={frame}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-bold gradient-text border border-[var(--color-primary-500)]/30"
        >
          {signs[frame]}
        </motion.div>
      </div>
    </div>
  )
}

export function LandingPage() {
  const floatingSigns = ['A', 'B', 'C', 'Hello', 'Yes', 'No', 'Good', 'Love', 'Help', 'Thank', 'I', 'You', 'We']

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] overflow-hidden">
      {/* Noise */}
      <div className="noise-overlay" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]/50 bg-[var(--color-bg-base)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <Hand size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg">SignBridge <span className="gradient-text">AI</span></span>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/app">
            <Button variant="primary" size="sm" iconRight={<ArrowRight size={14} />}>
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 grid-bg">
        {/* Background glow orbs */}
        <div className="glow-orb w-96 h-96 bg-[var(--color-primary-600)] left-0 top-1/4" />
        <div className="glow-orb w-80 h-80 bg-[var(--color-accent-500)] right-0 top-1/3" />

        {/* Floating signs */}
        {floatingSigns.map((sign, i) => (
          <FloatingSign key={i} sign={sign} delay={i * 0.3}
            x={`${5 + (i % 7) * 14}%`} y={`${10 + Math.floor(i / 7) * 40}%`}
            size={20 + Math.random() * 20}
          />
        ))}

        <div className="relative z-10 container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="primary" className="mb-4 inline-flex gap-1.5">
                <Sparkles size={10} />
                AI-Powered Accessibility Platform
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6"
            >
              Bridge the{' '}
              <span className="gradient-text-warm">Communication</span>{' '}
              Gap
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Real-time AI translation between Indian Sign Language, Speech, and Text.
              Empowering deaf, hard-of-hearing, and hearing individuals to communicate naturally.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-center gap-3 justify-center lg:justify-start flex-wrap"
            >
              <Link to="/app">
                <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
                  Launch App
                </Button>
              </Link>
              <Button variant="secondary" size="lg" icon={<Play size={16} />}>
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center gap-6 mt-10 justify-center lg:justify-start flex-wrap"
            >
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: animated hand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 flex justify-center"
          >
            <HeroHand />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-[var(--color-border)] flex items-start justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-[var(--color-primary-500)]" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="accent" className="mb-4">Core Features</Badge>
              <h2 className="text-4xl font-black text-[var(--color-text-primary)] mb-4">
                Everything you need to{' '}
                <span className="gradient-text">communicate</span>
              </h2>
              <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
                Powered by state-of-the-art AI, MediaPipe, and Large Language Models
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="card card-hover p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}25` }}>
                    <feature.icon size={20} style={{ color: feature.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{feature.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${feature.color}22`, color: feature.color }}>
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-[var(--color-bg-surface)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="primary" className="mb-4">System Flow</Badge>
            <h2 className="text-4xl font-black text-[var(--color-text-primary)]">
              How <span className="gradient-text">SignBridge AI</span> works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Capture', desc: 'Webcam captures your hand movements in real-time via WebRTC', icon: Eye, color: '#7c3aed' },
              { step: '02', title: 'Detect & Recognize', desc: 'MediaPipe detects landmarks, AI model classifies ISL gestures', icon: Brain, color: '#06b6d4' },
              { step: '03', title: 'Translate & Output', desc: 'LLM corrects grammar and forms natural sentences from recognized signs', icon: Zap, color: '#10b981' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative card p-6 text-center"
              >
                <div className="text-5xl font-black opacity-10 text-[var(--color-text-primary)] mb-4">{step.step}</div>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${step.color}20` }}>
                  <step.icon size={24} style={{ color: step.color }} />
                </div>
                <h3 className="font-bold text-[var(--color-text-primary)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{step.desc}</p>

                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="glow-orb w-96 h-96 bg-[var(--color-primary-600)] left-1/2 -translate-x-1/2 top-0 opacity-10" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-[var(--color-text-primary)] mb-4">
              Ready to <span className="gradient-text">break barriers?</span>
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8">
              Join thousands of users who are already communicating seamlessly with SignBridge AI.
            </p>
            <Link to="/app">
              <Button variant="primary" size="xl" iconRight={<ArrowRight size={20} />}>
                Start for Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-500)] flex items-center justify-center">
            <Hand size={12} className="text-white" />
          </div>
          <span className="font-bold text-sm gradient-text">SignBridge AI</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Built with ❤️ for accessibility · React · MediaPipe · FastAPI · OpenAI
        </p>
      </footer>
    </div>
  )
}
