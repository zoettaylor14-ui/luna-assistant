import { DrawnCard } from './tarot-deck'

export interface TarotHistoryEntry {
  id: string
  date: string
  spread_key: string
  spread_name: string
  cards: DrawnCard[]
  reading_summary: string
  resonance: 1 | 2 | 3 | null
}

const STORAGE_KEY = 'luna_tarot_history'

export function saveTarotReading(reading: TarotHistoryEntry): void {
  if (typeof window === 'undefined') return
  const history = getTarotHistory()
  const existing = history.findIndex(r => r.id === reading.id)
  if (existing >= 0) {
    history[existing] = reading
  } else {
    history.unshift(reading)
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)))
  } catch {
    // localStorage quota exceeded — trim and retry
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)))
    } catch {
      // silent fail
    }
  }
}

export function getTarotHistory(): TarotHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as TarotHistoryEntry[]
  } catch {
    return []
  }
}

export function getTarotStats(): {
  total: number
  resonance_avg: number
  accuracy_pct: number
  by_spread: Record<string, number>
} {
  const history = getTarotHistory()
  const total = history.length
  const rated = history.filter(r => r.resonance !== null)
  const resonance_avg =
    rated.length > 0
      ? rated.reduce((sum, r) => sum + (r.resonance ?? 0), 0) / rated.length
      : 0
  const accuracy_pct =
    rated.length > 0
      ? (rated.filter(r => (r.resonance ?? 0) >= 2).length / rated.length) * 100
      : 0
  const by_spread: Record<string, number> = {}
  for (const r of history) {
    by_spread[r.spread_name] = (by_spread[r.spread_name] ?? 0) + 1
  }
  return { total, resonance_avg, accuracy_pct, by_spread }
}
