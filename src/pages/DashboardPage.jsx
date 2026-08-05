import { motion } from 'framer-motion'
import {
  Activity, Hand, BookOpen, TrendingUp, Flame,
  MessageSquare, Star, Clock, Zap, ArrowRight, Trophy
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line
} from 'recharts'
import { StatCard, Card, Badge, ProgressRing, Button } from '@/components/ui'
import { useAppStore } from '@/stores/useAppStore'
import { Link } from 'react-router-dom'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs border border-[var(--color-border)]">
        <p className="font-semibold text-[var(--color-text-primary)] mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'accuracy' ? '%' : ''}</p>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardPage() {
  const { stats, savedPhrases, learningProgress, recognitionHistory } = useAppStore()

  const weeklyAccuracy = learningProgress.weeklyData.map((v, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    accuracy: v
  }))

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-[var(--color-primary-500)]/20"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.05) 100%)' }}
      >
        <div className="glow-orb w-40 h-40 bg-[var(--color-primary-600)] right-0 top-0" />
        <div className="relative z-10">
          <Badge variant="primary" className="mb-2">
            <Flame size={10} /> {learningProgress.streak} day streak
          </Badge>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Welcome back! 👋</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            You've practiced {learningProgress.totalSigns} signs with {learningProgress.accuracy}% accuracy this week.
          </p>
          <Link to="/app/recognize" className="mt-4 inline-block">
            <Button variant="primary" size="sm" iconRight={<ArrowRight size={14} />}>
              Start Session
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Today's Signs" value={stats.todayRecognitions} subtitle="recognized today" icon={<Hand size={18} />} color="#7c3aed" trend={12} />
        <StatCard title="Accuracy" value={`${stats.todayAccuracy}%`} subtitle="avg this session" icon={<Activity size={18} />} color="#06b6d4" trend={5} />
        <StatCard title="This Week" value={stats.weekRecognitions} subtitle="signs recognized" icon={<TrendingUp size={18} />} color="#10b981" trend={-3} />
        <StatCard title="Total Signs" value={stats.monthRecognitions} subtitle="all time" icon={<Trophy size={18} />} color="#f59e0b" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recognition chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)]">Weekly Recognition</h3>
            <Badge variant="primary">Last 7 days</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,58,0.5)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
              <Bar dataKey="signs" name="signs" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Accuracy trend */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)]">Accuracy Trend</h3>
            <Badge variant="accent">This week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyAccuracy}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,58,0.5)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="accuracy" name="accuracy" stroke="#06b6d4" fill="url(#areaGrad)" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Learning progress */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-4">Learning Progress</h3>
          <div className="flex items-center gap-4">
            <ProgressRing value={learningProgress.accuracy} size={80} color="#7c3aed" label="Accuracy" />
            <div className="space-y-2 flex-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-muted)]">Greetings</span>
                  <span className="text-[var(--color-text-secondary)]">92%</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--color-bg-surface-3)]">
                  <div className="h-1 rounded-full bg-[var(--color-primary-500)]" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-muted)]">Numbers</span>
                  <span className="text-[var(--color-text-secondary)]">65%</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--color-bg-surface-3)]">
                  <div className="h-1 rounded-full bg-amber-500" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-muted)]">Emotions</span>
                  <span className="text-[var(--color-text-secondary)]">78%</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--color-bg-surface-3)]">
                  <div className="h-1 rounded-full bg-[var(--color-accent-500)]" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Saved phrases */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)]">Saved Phrases</h3>
            <Star size={14} className="text-yellow-400" />
          </div>
          <div className="space-y-2">
            {savedPhrases.slice(0, 4).map(phrase => (
              <div key={phrase.id} className="p-2 rounded-lg bg-[var(--color-bg-surface-2)] border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-primary)] truncate">{phrase.text}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{phrase.category}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent recognition */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-[var(--color-text-secondary)]">Recent Signs</h3>
            <Clock size={14} className="text-[var(--color-text-muted)]" />
          </div>
          {recognitionHistory.length > 0 ? (
            <div className="space-y-1.5">
              {recognitionHistory.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-surface-2)] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-500)]" />
                    <span className="text-sm text-[var(--color-text-primary)] font-medium">{item.sign}</span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{item.confidence}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Hand size={24} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-40" />
              <p className="text-xs text-[var(--color-text-muted)]">No signs recognized yet</p>
              <Link to="/app/recognize" className="mt-2 inline-block">
                <Button variant="ghost" size="xs" iconRight={<ArrowRight size={12} />}>Start</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
