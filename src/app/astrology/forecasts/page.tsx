'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import Link from 'next/link'
import { ArrowLeft, Calendar, Sparkles, RefreshCw } from 'lucide-react'

type Forecast = {
  period: 'weekly' | 'monthly'
  headline: string
  body: string
  themes: string[]
  dates?: string
}

const STATIC_WEEKLY_FORECAST: Forecast = {
  period: 'weekly',
  headline: 'Voice leads. Silence follows.',
  dates: 'This Week',
  themes: ['Expression', 'Alignment', 'Integration'],
  body: `This week activates your Gemini placements — Rising and Jupiter — which means your natural gifts around communication, curiosity, and connection are front and center. Speaking first and editing second is the move. Your Scorpio Sun and Mercury want to prepare perfectly before opening your mouth, but this week the invitation is different: start the conversation, start the pitch, start the collaboration. Your clarity emerges in the doing.

The Cancer Moon energy mid-week may bring a wave of emotional sensitivity — specifically around what you are building and whether it feels like enough. That is the not-self theme of your South Node Capricorn: measuring yourself by output. Pause and reorient to feeling-check. Does what you are building feel true to who you are becoming?

By end of week, Scorpio energy strengthens again — a good window for anything requiring deep focus, research, or truth-telling. Use it for the work that needs your full attention and emotional precision.`,
}

const STATIC_MONTHLY_FORECAST: Forecast = {
  period: 'monthly',
  headline: 'The season of precise action and quiet power.',
  dates: 'This Month',
  themes: ['Visibility', 'Depth', 'Receiving'],
  body: `This month is an unusual mix of Gemini-speed and Scorpio-depth — and you were built to navigate exactly that. The early part of the month favors output: ideas, communication, connections, and projects in motion. Your Jupiter in Gemini is activated. The things you put out into the world — words, work, vision — have more reach than usual.

Mid-month, a slower, more reflective window opens. Your Scorpio placements are more comfortable here than anyone around you. Use this time to go deeper rather than wider. The best work of your month may be done in quiet rooms with no audience. What are you creating that has real substance beneath the surface?

Late month activates your North Node direction: Cancer. Watch for moments where you are invited to receive — care, recognition, money, love. Notice if your instinct is to deflect or minimize. Practice saying thank you and letting it land. This is where your soul is growing.

One financial note: Saturn in Taurus energy is present this month as a quiet undercurrent. A decision about slow, stable wealth versus a quick but uncertain opportunity may surface. Trust the slower path.`,
}

export default function ForecastsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoaded, setAiLoaded] = useState(false)

  const loadForecast = async (target: 'weekly' | 'monthly', useAI = false) => {
    if (useAI) {
      setLoading(true)
      try {
        const res = await fetch(`/api/astrology/forecast?period=${target}`)
        if (res.ok) {
          const data = await res.json()
          setForecast(data)
          setAiLoaded(true)
          return
        }
      } catch { /* fallback */ }
      setLoading(false)
    }
    setForecast(target === 'weekly' ? STATIC_WEEKLY_FORECAST : STATIC_MONTHLY_FORECAST)
    setAiLoaded(false)
  }

  useEffect(() => {
    loadForecast(period)
  }, [period])

  const displayed = forecast ?? (period === 'weekly' ? STATIC_WEEKLY_FORECAST : STATIC_MONTHLY_FORECAST)

  return (
    <div className="min-h-screen bg-app">
      <AppLayout>
        <div className="flex items-center gap-3 mb-5 pt-2">
          <Link href="/astrology">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <ArrowLeft className="h-4 w-4" style={{ color: 'var(--text-3)' }} />
            </div>
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text-1)' }}>Forecasts</h1>
            <p className="text-xs" style={{ color: 'var(--text-4)' }}>Your personalized cosmic outlook</p>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 mb-5">
          {(['weekly','monthly'] as const).map(p => (
            <button key={p} onClick={() => { setPeriod(p); setAiLoaded(false) }}
              className="px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all"
              style={{
                background: period === p ? 'var(--violet)' : 'var(--surface)',
                color: period === p ? 'white' : 'var(--text-3)',
                border: `1px solid ${period === p ? 'var(--violet)' : 'var(--surface-border)'}`,
              }}>
              {p === 'weekly' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {/* AI refresh button */}
        <div className="flex justify-end mb-4">
          <button onClick={() => loadForecast(period, true)} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: aiLoaded ? 'rgba(90,140,120,0.15)' : 'var(--surface)',
              color: aiLoaded ? '#5A8A7A' : 'var(--text-3)',
              border: `1px solid ${aiLoaded ? 'rgba(90,140,120,0.3)' : 'var(--surface-border)'}`,
            }}>
            <Sparkles className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : aiLoaded ? 'AI · Regenerate' : 'Ask LUNA for today'}
          </button>
        </div>

        {/* Forecast card */}
        <div className="relative rounded-[22px] overflow-hidden mb-4"
          style={{ background: 'linear-gradient(145deg, #16133A 0%, #1F1848 60%, #16133A 100%)', border: '1px solid rgba(139,111,184,0.25)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139,111,184,0.2) 0%, transparent 60%)', filter: 'blur(24px)' }} />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" style={{ color: 'rgba(196,169,232,0.6)' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(196,169,232,0.5)' }}>
                {displayed.dates ?? (period === 'weekly' ? 'This Week' : 'This Month')}
              </p>
              {aiLoaded && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(90,140,120,0.2)', color: '#5A8A7A' }}>
                  AI · Live
                </span>
              )}
            </div>
            <p className="font-display text-xl font-bold text-white leading-tight mb-4">
              {displayed.headline}
            </p>
            {displayed.themes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {displayed.themes.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(139,111,184,0.2)', color: 'rgba(196,169,232,0.9)', border: '1px solid rgba(139,111,184,0.3)' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Forecast body */}
        <div className="rounded-[20px] p-5 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
          {displayed.body.split('\n\n').map((para, i) => (
            para.trim() ? (
              <p key={i} className={`text-sm leading-relaxed ${i > 0 ? 'mt-4' : ''}`} style={{ color: 'var(--text-1)' }}>
                {para.trim()}
              </p>
            ) : null
          ))}
        </div>

        {/* Chart context reminder */}
        <div className="rounded-[18px] p-4"
          style={{ background: 'rgba(139,111,184,0.08)', border: '1px solid rgba(139,111,184,0.15)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--violet)' }}>Your Reading Is Personalized To</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Sun', val: 'Scorpio 22°', emoji: '☀️' },
              { label: 'Moon', val: 'Cancer 4°', emoji: '🌙' },
              { label: 'Rising', val: 'Gemini 12°', emoji: '✨' },
              { label: 'Mercury', val: 'Scorpio', emoji: '☿' },
              { label: 'North Node', val: 'Cancer', emoji: '☊' },
              { label: 'Midheaven', val: 'Virgo', emoji: '⬆' },
            ].map(p => (
              <div key={p.label} className="text-center">
                <p className="text-sm mb-0.5">{p.emoji}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.label}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-2)' }}>{p.val}</p>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </div>
  )
}
