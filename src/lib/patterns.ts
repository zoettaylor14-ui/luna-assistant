/**
 * Pattern tracking — saves everything Zoe selects or says,
 * then surfaces trends, recurring themes, and growth insights.
 * Primary store: localStorage (instant). Supabase write queued separately.
 */

export type PatternEntry = {
  id:        string
  ts:        number           // Unix ms
  type:      string           // 'morning' | 'journal' | 'mood' | 'energy' | 'brain_dump' | 'dictation' | 'night' | 'check_in' | etc.
  context:   string           // the question/field label
  value:     string           // what was selected or typed
  source:    'suggestion' | 'voice' | 'typed'
  metadata?: Record<string, unknown>
}

const STORAGE_KEY = 'luna_patterns_v2'
const MAX_ENTRIES = 500

function load(): PatternEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(entries: PatternEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)))
  } catch {}
}

export function addPattern(entry: Omit<PatternEntry, 'id' | 'ts'>): void {
  const entries = load()
  entries.push({ ...entry, id: Math.random().toString(36).slice(2), ts: Date.now() })
  save(entries)
}

export function getPatterns(days = 30): PatternEntry[] {
  const cutoff = Date.now() - days * 86400_000
  return load().filter(e => e.ts >= cutoff)
}

export function getRecentByType(type: string, limit = 5): PatternEntry[] {
  return load().filter(e => e.type === type).slice(-limit)
}

// ─── Insight engine ───────────────────────────────────────────
export type PatternInsights = {
  topMoods:       string[]
  topThemes:      string[]
  energyAvg:      number | null
  moodTrend:      Array<{ date: string; mood: string; energy: number | null }>
  recurringNeeds: string[]
  wins:           string[]
  streakDays:     number
  totalEntries:   number
  sourceBreakdown: { suggestion: number; voice: number; typed: number }
  weeklyMoodMap:  Record<string, string[]>  // day-of-week -> moods
}

export function getInsights(days = 14): PatternInsights {
  const entries = getPatterns(days)

  // Mood entries
  const moodEntries = entries.filter(e => e.context.toLowerCase().includes('mood') || e.context.toLowerCase().includes('feel') || e.context.toLowerCase().includes('emotion'))
  const topMoods = topN(moodEntries.map(e => e.value), 5)

  // All text content for theme extraction
  const allText = entries.map(e => e.value).join(' ').toLowerCase()
  const THEME_KEYWORDS: Record<string, string[]> = {
    'overwhelmed':   ['overwhelm','too much','heavy','a lot','stressed','burden'],
    'creative':      ['creat','idea','design','build','make','art','write'],
    'aligned':       ['align','right','clear','good','flow','ease','yes'],
    'tired':         ['tired','exhaust','drain','sleep','rest','low energy'],
    'anxious':       ['anxious','anxiety','worry','nervous','fear','spin'],
    'motivated':     ['motivat','driven','excited','ready','fire','let\'s go'],
    'disconnected':  ['disconn','off','not myself','foggy','numb','lost'],
    'grateful':      ['grateful','gratitude','thank','appreciate','bless'],
    'relationship':  ['people','client','partner','friend','family','mother','sister'],
    'money':         ['money','finance','income','invoice','paid','revenue','broke'],
    'clarity':       ['clarity','clear','understand','know','get it','focus','see'],
    'growth':        ['grow','learn','better','improve','progress','evolve'],
  }
  const themeCounts: Record<string, number> = {}
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    themeCounts[theme] = keywords.reduce((acc, kw) => acc + (allText.split(kw).length - 1), 0)
  }
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 0)
    .slice(0, 4)
    .map(([theme]) => theme)

  // Energy average
  const energyEntries = entries.filter(e => e.context.toLowerCase().includes('energy') && !isNaN(Number(e.value)))
  const energyAvg = energyEntries.length ? Math.round(energyEntries.reduce((s, e) => s + Number(e.value), 0) / energyEntries.length * 10) / 10 : null

  // Mood trend (last 7 days)
  const moodTrend: PatternInsights['moodTrend'] = []
  for (let d = 6; d >= 0; d--) {
    const dayStart = Date.now() - d * 86400_000
    const dayEnd = dayStart + 86400_000
    const dayEntries = entries.filter(e => e.ts >= dayStart && e.ts < dayEnd)
    const mood = dayEntries.find(e => e.context.toLowerCase().includes('mood') || e.context.toLowerCase().includes('feel'))?.value ?? ''
    const energyEntry = dayEntries.find(e => e.context.toLowerCase().includes('energy') && !isNaN(Number(e.value)))
    const date = new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
    if (mood || energyEntry) {
      moodTrend.push({ date, mood, energy: energyEntry ? Number(energyEntry.value) : null })
    }
  }

  // Recurring needs
  const needsEntries = entries.filter(e => e.context.toLowerCase().includes('need') || e.context.toLowerCase().includes('support') || e.context.toLowerCase().includes('want'))
  const recurringNeeds = topN(needsEntries.map(e => e.value), 3)

  // Wins / pride moments
  const winsEntries = entries.filter(e => e.context.toLowerCase().includes('proud') || e.context.toLowerCase().includes('win') || e.context.toLowerCase().includes('achieve'))
  const wins = winsEntries.slice(-3).map(e => e.value)

  // Streak (consecutive days with at least 1 entry)
  let streakDays = 0
  for (let d = 0; d < 30; d++) {
    const dayStart = Date.now() - d * 86400_000
    const dayEnd = dayStart + 86400_000
    if (entries.some(e => e.ts >= dayStart && e.ts < dayEnd)) streakDays++
    else break
  }

  // Source breakdown
  const sourceBreakdown = { suggestion: 0, voice: 0, typed: 0 }
  entries.forEach(e => { if (e.source in sourceBreakdown) sourceBreakdown[e.source as keyof typeof sourceBreakdown]++ })

  // Weekly mood map
  const weeklyMoodMap: Record<string, string[]> = { Sun:[], Mon:[], Tue:[], Wed:[], Thu:[], Fri:[], Sat:[] }
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  moodEntries.forEach(e => {
    const day = dayNames[new Date(e.ts).getDay()]
    if (day && e.value) weeklyMoodMap[day].push(e.value)
  })

  return { topMoods, topThemes, energyAvg, moodTrend, recurringNeeds, wins, streakDays, totalEntries: entries.length, sourceBreakdown, weeklyMoodMap }
}

function topN(arr: string[], n: number): string[] {
  const counts: Record<string, number> = {}
  arr.forEach(v => { if (v) counts[v] = (counts[v] ?? 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([v]) => v)
}

export function clearPatterns(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
}
