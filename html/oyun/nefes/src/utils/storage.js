const STORAGE_KEY = 'nefes-stats-v1'

function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function emptyStats() {
  return {
    totalSessions: 0,
    totalMinutes: 0,
    lastActiveDate: null,
    streak: 0,
    dailyMinutes: {},
  }
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStats()
    return { ...emptyStats(), ...JSON.parse(raw) }
  } catch {
    return emptyStats()
  }
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000
  const da = new Date(`${a}T00:00:00`)
  const db = new Date(`${b}T00:00:00`)
  return Math.round((db - da) / ms)
}

export function recordSession(minutes) {
  const stats = loadStats()
  const today = todayKey()
  const prev = stats.lastActiveDate

  if (prev === today) {
    // same day — keep streak
  } else if (prev && daysBetween(prev, today) === 1) {
    stats.streak = (stats.streak || 0) + 1
  } else {
    stats.streak = 1
  }

  stats.lastActiveDate = today
  stats.totalSessions = (stats.totalSessions || 0) + 1
  stats.totalMinutes = Math.round(((stats.totalMinutes || 0) + minutes) * 10) / 10
  stats.dailyMinutes = { ...(stats.dailyMinutes || {}) }
  stats.dailyMinutes[today] = Math.round(((stats.dailyMinutes[today] || 0) + minutes) * 10) / 10

  saveStats(stats)
  return stats
}

export function getLast7Days(stats) {
  const result = []
  const now = new Date()

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const key = `${y}-${m}-${day}`
    const label = d.toLocaleDateString('tr-TR', { weekday: 'short' })
    result.push({
      key,
      label: label.replace('.', ''),
      minutes: stats.dailyMinutes?.[key] || 0,
    })
  }

  return result
}

export function loadSoundPreference() {
  try {
    const v = localStorage.getItem('nefes-sound')
    return v === null ? true : v === 'true'
  } catch {
    return true
  }
}

export function saveSoundPreference(enabled) {
  localStorage.setItem('nefes-sound', String(enabled))
}
