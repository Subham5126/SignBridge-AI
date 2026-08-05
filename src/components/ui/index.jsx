import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    ghost: 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)]',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  }

  const sizes = {
    xs: 'px-2.5 py-1 text-xs rounded-md gap-1',
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
    xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={clsx(
        'inline-flex items-center justify-center font-medium cursor-pointer select-none transition-all',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  )
}

export function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span className={clsx('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  )
}

export function Card({ children, className = '', hover = false, glow = false, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2 } : {}}
      className={clsx(
        'card',
        hover && 'card-hover cursor-pointer',
        glow && 'shadow-[0_0_30px_rgba(124,58,237,0.1)]',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <svg className={clsx('animate-spin text-[var(--color-primary-500)]', sizes[size])} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function SkeletonBlock({ className = '' }) {
  return <div className={clsx('skeleton rounded-lg', className)} />
}

export function ProgressRing({ value, size = 80, strokeWidth = 6, color = '#7c3aed', label }) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-bg-surface-3)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {label && (
        <div className="absolute flex flex-col items-center">
          <span className="text-lg font-bold text-[var(--color-text-primary)]">{value}%</span>
          {typeof label === 'string' && <span className="text-[10px] text-[var(--color-text-muted)]">{label}</span>}
        </div>
      )}
    </div>
  )
}

export function StatCard({ title, value, subtitle, icon, color = '#7c3aed', trend }) {
  return (
    <Card className="p-5 flex items-start gap-4" hover>
      <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: `${color}22`, border: `1px solid ${color}33` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
        {trend !== undefined && (
          <span className={clsx('text-xs font-medium mt-1 inline-block', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </Card>
  )
}

export function ConfidenceBar({ value }) {
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[var(--color-text-muted)]">Confidence</span>
        <span className="text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-bg-surface-3)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function GlowDot({ active = false, color = '#10b981' }) {
  return (
    <motion.div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color, boxShadow: active ? `0 0 8px ${color}` : 'none' }}
      animate={active ? { opacity: [1, 0.4, 1], scale: [1, 0.85, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  )
}

export function Divider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      {label && <span className="text-xs text-[var(--color-text-muted)] shrink-0">{label}</span>}
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  )
}
