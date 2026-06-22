'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import Link from 'next/link'
import { ArrowLeft, Zap, Sparkles } from 'lucide-react'

type Aspect = {
  transiting: string
  natal: string
  type: string
  emoji: string
  orb: number
  applying: boolean
  interpretation: string
  natalSign: string
  natalDegree: number
  transitSign: string
  transitDegree: number
  energy: string
}

type TransitData = {
  aspects: Aspect[]
  major_aspects: Aspect[]
  supportive_aspects: Aspect[]
  daily_theme: string
  moon_house: number | null
  moon_house_meaning: string | null
  active_natal_points: string[]
}

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#8B6FB8',
  square:      '#C96B5A',
  opposition:  '#C9A96E',
  trine:       '#5A8A7A',
  sextile:     '#5A7A9A',
}

const ORDINALS: Record<number, string> = {
  1:'1st', 2:'2nd', 3:'3rd', 4:'4th', 5:'5th', 6:'6th',
  7:'7th', 8:'8th', 9:'9th', 10:'10th', 11:'11th', 12:'12th',
}

export default function TransitsPage() {
  const [data, setData] = useState<TransitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'major' | 'supportive'>('all')

  useEffect(() => {
    fetch('/api/astrology/transits')
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const displayed = !data ? [] : filter === 'all' ? data.aspects : filter === 'major' ? data.major_aspects : data.supportive_aspects

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
            <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text-1)' }}>Daily Transits</h1>
            <p className="text-xs" style={{ color: 'var(--text-4)' }}>Current sky to your natal chart</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 rounded-[20px] shimmer" />)}</div>
        ) : data ? (
          <>
            {/* Daily theme */}
            <div className="relative rounded-[22px] p-5 mb-4 overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #16133A 0%, #1F1848 60%, #16133A 100%)', border: '1px solid rgba(139,111,184,0.25)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139,111,184,0.2) 0%, transparent 60%)', filter: 'blur(16px)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4" style={{ color: 'rgba(196,169,232,0.7)' }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(196,169,232,0.6)' }}>Today's Theme</p>
                </div>
                <p className="text-sm leading-relaxed text-white">{data.daily_theme}</p>
                {data.moon_house && data.moon_house_meaning && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p className="text-sm" style={{ color: 'rgba(196,169,232,0.8)' }}>
                      🌙 Moon in your <strong className="text-white">{ORDINALS[data.moon_house]} house</strong>
                      {' '}— {data.moon_house_meaning}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Active natal points */}
            {data.active_natal_points.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-4">
                <p className="text-xs font-bold uppercase tracking-wider self-center mr-1" style={{ color: 'var(--text-4)' }}>Activated:</p>
                {data.active_natal_points.map(pt => (
                  <span key={pt} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(139,111,184,0.15)', color: 'var(--violet)', border: '1px solid rgba(139,111,184,0.25)' }}>
                    {pt}
                  </span>
                ))}
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
              {(['all','major','supportive'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: filter === f ? 'var(--violet)' : 'var(--surface)',
                    color: filter === f ? 'white' : 'var(--text-3)',
                    border: `1px solid ${filter === f ? 'var(--violet)' : 'var(--surface-border)'}`,
                  }}>
                  {f === 'all' ? `All (${data.aspects.length})` : f === 'major' ? `Tension (${data.major_aspects.length})` : `Flow (${data.supportive_aspects.length})`}
                </button>
              ))}
            </div>

            {/* Aspect cards */}
            {displayed.length === 0 ? (
              <div className="rounded-[20px] p-6 text-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>No {filter === 'major' ? 'tension' : 'flowing'} aspects active right now.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayed.map((a, i) => {
                  const color = ASPECT_COLORS[a.type] ?? 'var(--violet)'
                  return (
                    <div key={i} className="rounded-[20px] p-4"
                      style={{ background: 'var(--surface)', border: `1px solid ${color}22` }}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{a.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>
                              {a.transiting} {a.type} natal {a.natal}
                            </p>
                            <div className="flex gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ background: color + '20', color }}>
                                {a.orb}° orb
                              </span>
                              {a.applying && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                  style={{ background: 'rgba(90,140,120,0.2)', color: '#5A8A7A' }}>
                                  applying
                                </span>
                              )}
                            </div>
                          </div>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-4)', marginTop: 2 }}>
                            {a.transiting} in {a.transitDegree}° {a.transitSign} → natal {a.natal} in {a.natalDegree}° {a.natalSign}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{a.interpretation}</p>
                      <p className="text-xs mt-2 italic" style={{ color: 'var(--text-4)' }}>{a.energy}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* How to read transits callout */}
            <div className="mt-5 rounded-[18px] p-4"
              style={{ background: 'rgba(139,111,184,0.08)', border: '1px solid rgba(139,111,184,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--violet)' }}>How to Read This</p>
              <div className="space-y-1.5">
                {[
                  ['☌', 'Conjunction', 'Energy merging — intense activation'],
                  ['□', 'Square', 'Creative friction — tension asking for growth'],
                  ['☍', 'Opposition', 'Polarity — awareness and integration'],
                  ['△', 'Trine', 'Natural flow — gifts available'],
                  ['⚹', 'Sextile', 'Gentle support — opportunity if you act'],
                ].map(([sym, name, desc]) => (
                  <div key={name} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
                    <span className="font-bold w-4 text-center">{sym}</span>
                    <span className="font-bold w-20">{name}</span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[20px] p-6 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <p style={{ color: 'var(--text-3)' }}>Could not load transit data.</p>
          </div>
        )}
      </AppLayout>
    </div>
  )
}
