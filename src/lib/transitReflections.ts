'use client'
/**
 * Transit reflection storage — saves Zoe's notes on each active transit, by date.
 * Stored in localStorage, keyed by date+transit so she can reflect on each one.
 */

export type TransitReflection = {
  id:          string
  date:        string         // YYYY-MM-DD
  transit:     string         // e.g. "Sun opposition natal Venus"
  aspect:      string         // conjunction | square | trine | sextile | opposition
  planets:     string         // e.g. "Sun · Venus"
  reflection:  string         // Zoe's note
  question:    string         // the AI question that prompted this reflection
  ts:          number         // timestamp
}

export type CoachingResult = {
  did_well:        string
  improve:         string
  highest_self:    string
  next_time:       string
  affirmation:     string
  growth_score:    number     // 1-10
  theme:           string     // one word: e.g. "boundaries" "clarity" "receptivity"
}

export type DayCoaching = {
  date:     string
  coaching: CoachingResult
  ts:       number
}

const REFLECTIONS_KEY = 'luna_transit_reflections_v2'
const COACHING_KEY    = 'luna_day_coaching_v2'

function loadReflections(): TransitReflection[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(REFLECTIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveReflections(entries: TransitReflection[]): void {
  if (typeof window === 'undefined') return
  // Keep last 500 entries
  try { localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(entries.slice(-500))) } catch {}
}

export function saveTransitReflection(entry: Omit<TransitReflection, 'id' | 'ts'>): TransitReflection {
  const all = loadReflections()
  const id = Math.random().toString(36).slice(2)
  // Replace existing reflection for same date+transit
  const filtered = all.filter(r => !(r.date === entry.date && r.transit === entry.transit))
  const newEntry: TransitReflection = { ...entry, id, ts: Date.now() }
  saveReflections([...filtered, newEntry])
  return newEntry
}

export function getTransitReflectionsForDate(date: string): TransitReflection[] {
  return loadReflections().filter(r => r.date === date)
}

export function getTransitReflectionForTransit(date: string, transit: string): TransitReflection | undefined {
  return loadReflections().find(r => r.date === date && r.transit === transit)
}

export function getAllReflectionDates(): string[] {
  const all = loadReflections()
  return [...new Set(all.map(r => r.date))].sort((a, b) => b.localeCompare(a))
}

// ─── Day coaching storage ──────────────────────────────────────

function loadCoaching(): DayCoaching[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COACHING_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveDayCoaching(date: string, coaching: CoachingResult): void {
  const all = loadCoaching().filter(c => c.date !== date)
  try {
    localStorage.setItem(COACHING_KEY, JSON.stringify([...all, { date, coaching, ts: Date.now() }]))
  } catch {}
}

export function getDayCoaching(date: string): CoachingResult | null {
  return loadCoaching().find(c => c.date === date)?.coaching ?? null
}
