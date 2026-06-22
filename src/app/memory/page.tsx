'use client'
import { useEffect, useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { format, parseISO } from 'date-fns'
import { BookHeart, Sun, Moon, Sunset, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface CheckIn {
  id: string
  type: 'morning' | 'midday' | 'night'
  date: string
  created_at: string
  sleep_rating: number | null
  energy_rating: number | null
  mood_rating: number | null
  feeling: string | null
  on_mind: string | null
  support_need: string | null
  pride_goal: string | null
  ai_response: {
    greeting?: string
    affirmation?: string
    first_step?: string
    spiritual_message?: string
    ai_message?: string
    self_care_action?: string
  } | null
}

const TYPE_CONFIG = {
  morning: { label: 'Morning', emoji: '🌅', color: '#A8C4DA' },
  midday:  { label: 'Midday',  emoji: '☀️', color: '#C9A96E' },
  night:   { label: 'Night',   emoji: '🌙', color: '#B89FD8' },
}

function RatingDots({ value, max = 10 }: { value: number | null; max?: number }) {
  if (!value) return null
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full"
          style={{ background: i < value ? 'var(--violet)' : 'var(--surface-border)' }} />
      ))}
    </div>
  )
}

function CheckInCard({ checkIn }: { checkIn: CheckIn }) {
  const [open, setOpen] = useState(false)
  const cfg = TYPE_CONFIG[checkIn.type]
  const createdAt = parseISO(checkIn.created_at)

  return (
    <div className="rounded-2xl overflow-hidden dark-card">
      <button className="w-full text-left px-5 py-4 flex items-center gap-3"
        onClick={() => setOpen(o => !o)}>
        <span className="text-xl flex-shrink-0">{cfg.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wider"
              style={{ color: cfg.color }}>{cfg.label}</span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>
              {format(createdAt, 'MMM d · h:mm a')}
            </span>
          </div>
          {checkIn.feeling && (
            <p className="text-sm truncate" style={{ color: 'var(--text-2)' }}>
              {checkIn.feeling}
            </p>
          )}
          {checkIn.ai_response?.affirmation && !checkIn.feeling && (
            <p className="text-sm italic truncate" style={{ color: 'var(--text-3)' }}>
              &ldquo;{checkIn.ai_response.affirmation}&rdquo;
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {checkIn.mood_rating && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
              {checkIn.mood_rating}/10
            </span>
          )}
          {open
            ? <ChevronUp className="h-4 w-4" style={{ color: 'var(--text-4)' }} />
            : <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-4)' }} />
          }
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4"
          style={{ borderTop: '1px solid var(--surface-border)' }}>

          {/* Ratings */}
          {(checkIn.sleep_rating || checkIn.energy_rating || checkIn.mood_rating) && (
            <div className="grid grid-cols-3 gap-3 pt-4">
              {checkIn.sleep_rating && (
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>Sleep</p>
                  <RatingDots value={checkIn.sleep_rating} />
                </div>
              )}
              {checkIn.energy_rating && (
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>Energy</p>
                  <RatingDots value={checkIn.energy_rating} />
                </div>
              )}
              {checkIn.mood_rating && (
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>Mood</p>
                  <RatingDots value={checkIn.mood_rating} />
                </div>
              )}
            </div>
          )}

          {/* Feeling / On mind */}
          {checkIn.feeling && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>How you felt</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{checkIn.feeling}</p>
            </div>
          )}
          {checkIn.on_mind && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>On your mind</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{checkIn.on_mind}</p>
            </div>
          )}
          {checkIn.pride_goal && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>Proud of / working toward</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{checkIn.pride_goal}</p>
            </div>
          )}

          {/* AI response */}
          {checkIn.ai_response && (
            <div className="rounded-2xl p-4 space-y-2"
              style={{ background: 'rgba(139,111,184,0.06)', border: '1px solid rgba(139,111,184,0.12)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--violet)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--violet)' }}>LUNA said</span>
              </div>
              {checkIn.ai_response.affirmation && (
                <p className="text-sm italic" style={{ color: 'var(--text-1)' }}>
                  &ldquo;{checkIn.ai_response.affirmation}&rdquo;
                </p>
              )}
              {checkIn.ai_response.first_step && (
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>{checkIn.ai_response.first_step}</p>
              )}
              {checkIn.ai_response.ai_message && (
                <p className="text-sm italic" style={{ color: 'var(--text-3)' }}>{checkIn.ai_response.ai_message}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MemoryPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'morning' | 'midday' | 'night'>('all')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/check-ins?limit=50')
      const data = await res.json()
      setCheckIns(data.checkIns || [])
    } catch {
      setCheckIns([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'all' ? checkIns : checkIns.filter(c => c.type === filter)

  const avgMood = checkIns.length
    ? Math.round(checkIns.filter(c => c.mood_rating).reduce((s, c) => s + (c.mood_rating || 0), 0) /
        checkIns.filter(c => c.mood_rating).length * 10) / 10
    : null

  return (
    <AppLayout>
      <div className="space-y-5 pt-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookHeart className="h-5 w-5" style={{ color: 'var(--violet)' }} />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Memory</h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              Your check-ins, reflections, and patterns.
            </p>
          </div>
        </div>

        {/* Stats */}
        {checkIns.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 text-center dark-card">
              <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{checkIns.length}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Total check-ins</p>
            </div>
            <div className="rounded-2xl p-4 text-center dark-card">
              <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
                {avgMood ? `${avgMood}/10` : '—'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Avg mood</p>
            </div>
            <div className="rounded-2xl p-4 text-center dark-card">
              <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
                {new Set(checkIns.map(c => c.date)).size}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Days tracked</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'morning', 'midday', 'night'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize"
              style={{
                background: filter === f ? 'var(--violet)' : 'var(--surface)',
                color:      filter === f ? '#fff' : 'var(--text-2)',
                border:     filter === f ? 'none' : '1px solid var(--surface-border)',
              }}>
              {f === 'morning' ? '🌅' : f === 'midday' ? '☀️' : f === 'night' ? '🌙' : ''}{' '}{f}
            </button>
          ))}
        </div>

        {/* Check-ins list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🌙</span>
            <p className="text-base font-semibold mb-2" style={{ color: 'var(--text-2)' }}>
              No check-ins yet.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              Complete your first check-in to start building your memory.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => <CheckInCard key={c.id} checkIn={c} />)}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
