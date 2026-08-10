import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Hand, BookOpen, TrendingUp, Flame,
  MessageSquare, Star, Clock, Zap, ArrowRight, Trophy, BarChart2, PieChart
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line
} from 'recharts'
import { StatCard, Card, Badge, ProgressRing, Button } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/lib/i18n'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs border border-[var(--color-border)] shadow-lg">
        <p className="font-semibold text-[var(--color-text-primary)] mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}{p.name === 'accuracy' ? '%' : ' signs'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardPage() {
  const { user, language, stats, savedPhrases, learningProgress, recognitionHistory, activePracticeSeconds } = useAppStore()
  const { t } = useTranslation(language)

  // Format active practice duration dynamically
  const formattedPracticeTime = useMemo(() => {
    const sec = activePracticeSeconds || 0
    if (sec < 60) return `${sec}s`
    const mins = Math.floor(sec / 60)
    const remSec = sec % 60
    if (mins < 60) {
      return remSec > 0 ? `${mins}m ${remSec}s` : `${mins}m`
    }
    const hours = Math.floor(mins / 60)
    const remMins = mins % 60
    return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`
  }, [activePracticeSeconds])

  // Real-time calculations from recognitionHistory
  const totalLiveSigns = recognitionHistory.length
  
  const liveAvgAccuracy = useMemo(() => {
    if (totalLiveSigns === 0) return learningProgress.accuracy || 85
    const totalConf = recognitionHistory.reduce((sum, item) => sum + (item.confidence || 85), 0)
    return Math.round(totalConf / totalLiveSigns)
  }, [recognitionHistory, totalLiveSigns, learningProgress.accuracy])

  const uniqueSignsCount = useMemo(() => {
    return new Set(recognitionHistory.map(item => item.sign)).size
  }, [recognitionHistory])

  // Frequency distribution of real signs detected
  const signFrequencyMap = useMemo(() => {
    const counts = {}
    recognitionHistory.forEach(item => {
      const s = item.sign
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [recognitionHistory])

  const topRecognizedSigns = useMemo(() => {
    return Object.entries(signFrequencyMap)
      .map(([sign, count]) => ({ sign, count, pct: Math.round((count / (totalLiveSigns || 1)) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [signFrequencyMap, totalLiveSigns])

  // Dynamic Weekly Activity Chart Data (Mon-Sun) — 100% Real Empirical Data
  const weeklyChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    const statsByDay = {
      'Mon': { count: 0, totalConf: 0 },
      'Tue': { count: 0, totalConf: 0 },
      'Wed': { count: 0, totalConf: 0 },
      'Thu': { count: 0, totalConf: 0 },
      'Fri': { count: 0, totalConf: 0 },
      'Sat': { count: 0, totalConf: 0 },
      'Sun': { count: 0, totalConf: 0 }
    }

    recognitionHistory.forEach(item => {
      const date = item.timestamp ? new Date(item.timestamp) : new Date()
      const dayName = days[date.getDay()]
      if (statsByDay[dayName]) {
        statsByDay[dayName].count += 1
        statsByDay[dayName].totalConf += (item.confidence || 85)
      }
    })

    return Object.entries(statsByDay).map(([day, val]) => ({
      day,
      signs: val.count,
      accuracy: val.count > 0 ? Math.round(val.totalConf / val.count) : 0
    }))
  }, [recognitionHistory])

  const userName = user?.user_metadata?.name || user?.name || 'Signer'

  return (
    <div className="space-y-6">
      {/* Welcome Section v2 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {t('goodEvening', 'Good evening')}, {userName}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {t('welcomeSubtitle', 'Continue your sign-language journey with real-time AI recognition & practice.')}
          </p>
        </div>

        <Link to="/app/recognize">
          <Button variant="primary" size="md" iconRight={<ArrowRight size={16} />}>
            {t('startSigning', 'Start Signing')}
          </Button>
        </Link>
      </motion.div>

      {/* Stats Cards (v2 Clean Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title={t('streak', 'Streak')}
          value={`${learningProgress.streak} ${t('days', 'Days')}`}
          subtitle="daily consistency"
          icon={<Flame size={18} />}
          color="#f59e0b"
        />
        <StatCard
          title={t('signsDetected', 'Signs Detected')}
          value={totalLiveSigns}
          subtitle="live captures"
          icon={<Hand size={18} />}
          color="#7c3aed"
        />
        <StatCard
          title={t('accuracy', 'Accuracy')}
          value={`${liveAvgAccuracy}%`}
          subtitle="average confidence"
          icon={<Activity size={18} />}
          color="#10b981"
        />
        <StatCard
          title={t('practiceTime', 'Practice Time')}
          value={formattedPracticeTime}
          subtitle="active camera session"
          icon={<Clock size={18} />}
          color="#06b6d4"
        />
      </div>

      {/* Quick Actions Grid (16px Border Radius Cards) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{t('quickActions', 'Quick Actions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/app/recognize" className="group">
            <Card hover className="p-5 border border-[var(--color-border)] h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-[var(--color-primary-600)]/15 border border-[var(--color-primary-500)]/30 text-[var(--color-primary-400)]">
                  <Hand size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-400)] transition-colors">{t('recognizeTitle', 'Recognize')}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">{t('recognizeSub', 'Start live camera')}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">{t('recognizeDesc', 'Real-time ASL hand gesture recognition via webcam.')}</p>
            </Card>
          </Link>

          <Link to="/app/learn" className="group">
            <Card hover className="p-5 border border-[var(--color-border)] h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-amber-400 transition-colors">{t('practiceTitle', 'Practice')}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">{t('practiceSub', 'Test your skills')}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">{t('practiceDesc', 'Interactive sign language flashcards & quizzes.')}</p>
            </Card>
          </Link>

          <Link to="/app/conversation" className="group">
            <Card hover className="p-5 border border-[var(--color-border)] h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-cyan-400 transition-colors">{t('chatTitle', 'Conversation')}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">{t('chatSub', 'Two-way chat')}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">{t('chatDesc', 'Bi-directional sign to text & speech translation.')}</p>
            </Card>
          </Link>

          <Link to="/app/speech" className="group">
            <Card hover className="p-5 border border-[var(--color-border)] h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-emerald-400 transition-colors">{t('speechTitle', 'Speech Mode')}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">{t('speechSub', 'Voice to sign')}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">{t('speechDesc', 'Convert spoken voice directly to ASL sign visuals.')}</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Real-time Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Recognition chart */}
        <Card className="p-5 border border-[var(--color-primary-500)]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">Weekly Signs Volume</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Live count per day of week</p>
            </div>
            <Badge variant="primary">Real Activity</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyChartData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
              <Bar dataKey="signs" name="signs" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Live Accuracy trend */}
        <Card className="p-5 border border-[var(--color-accent-500)]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">Confidence & Accuracy Trend</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Gesture match score trajectory</p>
            </div>
            <Badge variant="accent">Confidence %</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyChartData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="accuracy" name="accuracy" stroke="#10b981" fill="url(#areaGrad)" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row: Real Sign Frequency + History timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Real Sign Frequency Distribution */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[var(--color-text-primary)]">Top Signed Gestures</h3>
            <PieChart size={15} className="text-[var(--color-primary-400)]" />
          </div>
          
          {topRecognizedSigns.length > 0 ? (
            <div className="space-y-3 mt-3">
              {topRecognizedSigns.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--color-text-primary)]">Sign "{item.sign}"</span>
                    <span className="text-[var(--color-primary-300)]">{item.count} times ({item.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-bg-surface-3)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(10, item.pct)}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-400)] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--color-text-muted)] space-y-2">
              <Hand size={28} className="mx-auto opacity-30 text-[var(--color-primary-400)]" />
              <p>No gestures detected yet.</p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">Start the recognition camera to see your live gesture frequency!</p>
            </div>
          )}
        </Card>

        {/* Real-time Recognition Feed */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">Live Camera Activity Log</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Real-time signs captured during your session</p>
            </div>
            <Badge variant="primary" className="flex items-center gap-1">
              <Clock size={12} /> Live Timeline
            </Badge>
          </div>

          {recognitionHistory.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {recognitionHistory.slice(0, 8).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-bg-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary-500)]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-600)] text-white font-bold font-mono text-sm flex items-center justify-center shadow">
                      {item.sign}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">Recognized Gesture "{item.sign}"</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Just now'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                      {item.confidence}% match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-[var(--color-bg-surface-2)]/50 rounded-xl border border-dashed border-[var(--color-border)]">
              <Hand size={32} className="mx-auto mb-2 text-[var(--color-primary-400)] opacity-40 animate-pulse" />
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">Camera Feed History is Empty</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Open Sign Recognition to start detecting live ASL gestures!</p>
              <Link to="/app/recognize" className="mt-3 inline-block">
                <Button variant="primary" size="xs" iconRight={<ArrowRight size={12} />}>
                  Start Sign Recognition
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
