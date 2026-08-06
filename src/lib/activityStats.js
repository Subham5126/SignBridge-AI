import { ISL_SIGNS } from '@/data/islSigns'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SIGN_CATEGORY_MAP = Object.fromEntries(
  ISL_SIGNS.flatMap(s => [
    [s.id.toUpperCase(), s.category],
    [s.word.toUpperCase(), s.category],
  ])
)

export function getSignCategory(sign) {
  if (!sign) return 'Other'
  return SIGN_CATEGORY_MAP[sign.toUpperCase()] || 'Other'
}

export function isCountableSign(sign) {
  if (!sign) return false
  const s = sign.toUpperCase()
  return !['NOTHING', 'DEL', 'SPACE', 'UNKNOWN'].includes(s)
}

function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function isSameDay(ts, ref = new Date()) {
  return startOfDay(new Date(ts)) === startOfDay(ref)
}

function avgConfidence(entries) {
  if (!entries.length) return 0
  return Math.round(entries.reduce((sum, e) => sum + (e.confidence || 0), 0) / entries.length)
}

function computeStreak(entries) {
  const daysWithActivity = new Set(entries.map(e => startOfDay(new Date(e.timestamp))))
  if (daysWithActivity.size === 0) return 0

  let streak = 0
  let day = startOfDay(new Date())

  if (!daysWithActivity.has(day)) {
    day -= 86400000
  }

  while (daysWithActivity.has(day)) {
    streak++
    day -= 86400000
  }

  return streak
}

function buildWeeklyChart(entries) {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayStart = startOfDay(d)
    const dayEnd = dayStart + 86400000
    const dayEntries = entries.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd)
    result.push({
      day: DAY_LABELS[d.getDay()],
      signs: dayEntries.length,
      accuracy: avgConfidence(dayEntries),
    })
  }
  return result
}

function buildCategoryStats(entries) {
  const byCategory = {}

  for (const entry of entries) {
    const category = entry.category || 'Other'
    if (!byCategory[category]) {
      byCategory[category] = { count: 0, confidenceSum: 0 }
    }
    byCategory[category].count++
    byCategory[category].confidenceSum += entry.confidence || 0
  }

  return Object.entries(byCategory)
    .map(([category, { count, confidenceSum }]) => ({
      category,
      count,
      accuracy: count ? Math.round(confidenceSum / count) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

function computeTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : undefined
  return Math.round(((current - previous) / previous) * 100)
}

export function computeActivityStats(activityLog = [], practiceSessions = []) {
  const countable = activityLog.filter(e => isCountableSign(e.sign))

  const todayEntries = countable.filter(e => isSameDay(e.timestamp))
  const weekEntries = countable.filter(e => e.timestamp >= Date.now() - 7 * 86400000)
  const lastWeekEntries = countable.filter(e => {
    const t = e.timestamp
    return t >= Date.now() - 14 * 86400000 && t < Date.now() - 7 * 86400000
  })

  const chartData = buildWeeklyChart(countable)
  const categoryStats = buildCategoryStats(countable)

  const practiceMinutes = Math.round(
    practiceSessions.reduce((sum, session) => {
      if (session.endedAt && session.startedAt) {
        return sum + (session.endedAt - session.startedAt) / 60000
      }
      return sum
    }, 0)
  )

  const signCounts = {}
  for (const entry of countable) {
    const key = entry.sign.toUpperCase()
    signCounts[key] = (signCounts[key] || 0) + 1
  }

  const favoriteSigns = Object.entries(signCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sign]) => sign)

  const weakCategories = [...categoryStats]
    .filter(c => c.count >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map(c => c.category)

  return {
    todaySigns: todayEntries.length,
    todayAccuracy: avgConfidence(todayEntries),
    weekSigns: weekEntries.length,
    totalSigns: countable.length,
    overallAccuracy: avgConfidence(countable),
    streak: computeStreak(countable),
    practiceMinutes,
    uniqueSigns: new Set(countable.map(e => e.sign.toUpperCase())).size,
    chartData,
    categoryStats,
    weeklyAccuracy: chartData.map(d => ({ day: d.day, accuracy: d.accuracy })),
    recentSigns: [...countable].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10),
    favoriteSigns,
    weakSigns: weakCategories,
    todayTrend: computeTrend(todayEntries.length, lastWeekEntries.filter(e => isSameDay(e.timestamp)).length),
    weekTrend: computeTrend(weekEntries.length, lastWeekEntries.length),
    accuracyTrend: computeTrend(avgConfidence(todayEntries), avgConfidence(lastWeekEntries)),
  }
}
