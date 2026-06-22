'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import Link from 'next/link'
import { Star, ArrowRight, Moon, Sparkles, BookOpen, Calendar, RotateCcw, Gem, Sun, Zap } from 'lucide-react'

type MoonData = {
  phase: { name: string; emoji: string; illumination: number; description: string; next_exact?: { name: string; time: string } }
  sign: { name: string; emoji: string; degree: number; minutes: number; formatted: string; keywords: string }
  next_ingress: string | null
}

type PlanetData = {
  planets: Array<{ name: string; sign: string; degree: number; minutes: number; retrograde: boolean; emoji: string }>
  retrogrades: string[]
}

type TransitData = {
  daily_theme: string
  major_aspects: Array<{ transiting: string; natal: string; type: string; emoji: string; interpretation: string; orb: number }>
  moon_house: number | null
  moon_house_meaning: string | null
}

function MoonSphere({ size = 80 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: [
        'radial-gradient(circle at 58% 22%, rgba(155,150,172,0.95) 0%, rgba(135,130,155,0.5) 8%, transparent 13%)',
        'radial-gradient(circle at 26% 64%, rgba(140,135,162,0.85) 0%, transparent 10%)',
        'radial-gradient(circle at 44% 78%, rgba(125,120,148,0.9) 0%, transparent 13%)',
        'radial-gradient(ellipse at 38% 35%, rgba(252,250,255,1) 0%, rgba(228,224,240,1) 15%, rgba(196,192,212,1) 32%, rgba(162,158,180,1) 52%, rgba(124,120,145,1) 70%, rgba(88,84,108,1) 88%)',
      ].join(', '),
      boxShadow: `inset ${size*0.13}px ${size*0.07}px ${size*0.22}px rgba(0,0,0,0.32), 0 0 ${size*0.3}px ${size*0.1}px rgba(180,160,240,0.28)`,
    }} />
  )
}

const SECTIONS = [
  { href: '/astrology/daily',       icon: Sun,        label: 'Daily Reading',  sub: 'Your horoscope, all life areas, HD guidance', color: '#C9A96E' },
  { href: '/astrology/birth-chart', icon: Star,       label: 'Birth Chart',    sub: 'Your natal planets, houses, and patterns', color: '#8B6FB8' },
  { href: '/astrology/moon',        icon: Moon,       label: 'Moon Portal',    sub: 'Phase, sign, house overlay, rituals',      color: '#A8C4DA' },
  { href: '/astrology/transits',    icon: Zap,        label: 'Daily Transits', sub: 'Current sky vs your natal chart',          color: '#C9A96E' },
  { href: '/astrology/deep-dives',  icon: BookOpen,   label: 'Deep Dives',     sub: 'Planets, houses, aspects explained',       color: '#B8C9B4' },
  { href: '/astrology/forecasts',   icon: Calendar,   label: 'Forecasts',      sub: 'Weekly and monthly astrology',             color: '#E8C0C2' },
  { href: '/astrology/retrogrades', icon: RotateCcw,  label: 'Retrogrades',    sub: 'What\'s RX and what it means for you',    color: '#C4A9E8' },
  { href: '/astrology/rituals',     icon: Sparkles,   label: 'Moon Rituals',   sub: 'New moon, full moon, personalized',        color: '#8B6FB8' },
  { href: '/astrology/crystals',    icon: Gem,        label: 'Crystal Match',  sub: 'Today\'s recommended crystals',           color: '#A8C4DA' },
]

export default function AstrologyPortal() {
  const [moon, setMoon] = useState<MoonData | null>(null)
  const [planets, setPlanets] = useState<PlanetData | null>(null)
  const [transits, setTransits] = useState<TransitData | null>(null)

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    fetch(`/api/astrology/moon?tz=${encodeURIComponent(tz)}`).then(r => r.json()).then(setMoon).catch(() => {})
    fetch(`/api/astrology/planets?tz=${encodeURIComponent(tz)}`).then(r => r.json()).then(setPlanets).catch(() => {})
    fetch(`/api/astrology/transits`).then(r => r.json()).then(setTransits).catch(() => {})
  }, [])

  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())

  return (
    <div className="min-h-screen bg-app">
      {/* Ambient orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at 75% 15%, rgba(139,111,184,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at 20% 85%, rgba(90,120,180,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }} />

      <AppLayout>
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6 pt-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(139,111,184,0.15)', border: '1px solid rgba(139,111,184,0.25)' }}>
            <Star className="h-5 w-5" style={{ color: 'var(--violet)' }} strokeWidth={1.6} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Astrology</h1>
            <p className="text-xs" style={{ color: 'var(--text-4)' }}>{today}</p>
          </div>
        </div>

        {/* Current sky hero */}
        <div className="relative rounded-[24px] overflow-hidden mb-5"
          style={{
            background: 'linear-gradient(145deg, #16133A 0%, #1F1848 50%, #16133A 100%)',
            border: '1px solid rgba(139,111,184,0.25)',
          }}>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
            <MoonSphere size={100} />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,111,184,0.2) 0%, transparent 70%)', filter: 'blur(16px)' }} />
          <div className="relative z-10 p-6 pr-36">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(196,169,232,0.6)' }}>Current Sky</p>
            {moon ? (
              <>
                <p className="font-display text-xl font-bold text-white leading-tight mb-1">
                  {moon.phase.emoji} {moon.phase.name}
                </p>
                <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Moon in {moon.sign.emoji} {moon.sign.name} · {moon.sign.formatted}
                </p>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  {moon.phase.illumination}% illuminated
                  {moon.next_ingress ? ` · ${moon.next_ingress}` : ''}
                </p>
                <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(196,169,232,0.75)' }}>
                  {moon.phase.description}
                </p>
                {moon.phase.next_exact && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(139,111,184,0.2)', border: '1px solid rgba(139,111,184,0.3)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'rgba(196,169,232,0.9)' }}>
                      Next: {moon.phase.next_exact.name} · {moon.phase.next_exact.time}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-4 rounded-lg shimmer" />)}
              </div>
            )}
          </div>
        </div>

        {/* Today's transit theme */}
        {transits?.daily_theme && (
          <div className="rounded-[20px] p-4 mb-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--violet)' }} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Today's Cosmic Theme</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{transits.daily_theme}</p>
            {transits.moon_house && transits.moon_house_meaning && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
                🌙 Moon in your {transits.moon_house}{['st','nd','rd'][transits.moon_house - 1] ?? 'th'} house — {transits.moon_house_meaning}
              </p>
            )}
          </div>
        )}

        {/* Retrograde alert */}
        {planets && planets.retrogrades.length > 0 && (
          <div className="rounded-[20px] p-4 mb-4 flex items-center gap-3"
            style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)' }}>
            <RotateCcw className="h-4 w-4 flex-shrink-0" style={{ color: '#C9A96E' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#C9A96E' }}>
                {planets.retrogrades.join(', ')} {planets.retrogrades.length === 1 ? 'is' : 'are'} retrograde
              </p>
              <Link href="/astrology/retrogrades">
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>What this means for you →</p>
              </Link>
            </div>
          </div>
        )}

        {/* Planet snapshot — horizontal scroll */}
        {planets && (
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-4)' }}>Sky Right Now</p>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {planets.planets.map(p => (
                <div key={p.name} className="flex-shrink-0 rounded-2xl px-3 py-2.5 text-center"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', minWidth: 80 }}>
                  <p className="text-base mb-0.5">{p.emoji}</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>{p.name}</p>
                  <p className="text-xs" style={{ color: 'var(--violet)' }}>{p.sign}</p>
                  <p style={{ fontSize: 9, color: 'var(--text-4)', marginTop: 1 }}>
                    {p.degree}°{p.retrograde ? ' ℞' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Major transits */}
        {transits?.major_aspects && transits.major_aspects.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-4)' }}>Active Transits to Your Chart</p>
            <div className="space-y-2">
              {transits.major_aspects.slice(0, 3).map((a, i) => (
                <Link key={i} href="/astrology/transits">
                  <div className="rounded-[18px] p-4 flex items-start gap-3"
                    style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                    <span className="text-xl flex-shrink-0 mt-0.5">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>
                        {a.transiting} {a.type} natal {a.natal}
                        <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-4)' }}>{a.orb}° orb</span>
                      </p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-3)' }}>{a.interpretation}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section grid */}
        <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-4)' }}>Explore</p>
        <div className="grid grid-cols-2 gap-3">
          {SECTIONS.map(s => (
            <Link key={s.href} href={s.href}>
              <div className="rounded-[20px] p-4 h-full transition-all hover:scale-[1.015]"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${s.color}16`, border: `1px solid ${s.color}24` }}>
                  <s.icon className="h-4.5 w-4.5" style={{ color: s.color }} strokeWidth={1.6} />
                </div>
                <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>{s.label}</p>
                <p className="text-xs leading-snug" style={{ color: 'var(--text-3)' }}>{s.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </AppLayout>
    </div>
  )
}
