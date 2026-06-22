'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import Link from 'next/link'
import { Star, ArrowRight, Moon, Sparkles, BookOpen, Calendar, RotateCcw, Gem, Sun, Zap, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Brief = {
  overall_vibe: string
  tagline: string
  energy: string
  avoid: string
  focus: string
  gifts: string
  prepare: string
  mantra: string
  colors: string[]
  color_note: string
  crystals: string[]
  crystal_notes: Record<string, string>
  generated_at: string
}

type MoonData = {
  phase: { name: string; emoji: string; illumination: number; description: string; next_exact?: { name: string; time: string } }
  sign: { name: string; emoji: string; degree: number; minutes: number; formatted: string; keywords: string }
  next_ingress: string | null
}

type PlanetData = {
  planets: Array<{ name: string; sign: string; degree: number; minutes: number; retrograde: boolean; emoji: string }>
  retrogrades: string[]
}

// ─── Design ───────────────────────────────────────────────────────────────────
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
}

const SECTIONS = [
  { href: '/astrology/daily',       icon: Sun,        label: 'Daily Reading',  sub: 'Horoscope + all life areas',       color: '#C9A96E' },
  { href: '/astrology/birth-chart', icon: Star,       label: 'Birth Chart',    sub: 'Natal planets, houses, patterns',  color: '#8B6FB8' },
  { href: '/astrology/moon',        icon: Moon,       label: 'Moon Portal',    sub: 'Phase, sign, rituals',             color: '#A8C4DA' },
  { href: '/astrology/transits',    icon: Zap,        label: 'Daily Transits', sub: 'Current sky vs your natal chart',  color: '#C9A96E' },
  { href: '/astrology/deep-dives',  icon: BookOpen,   label: 'Deep Dives',     sub: 'Planets, houses, aspects',         color: '#B8C9B4' },
  { href: '/astrology/forecasts',   icon: Calendar,   label: 'Forecasts',      sub: 'Weekly and monthly astrology',     color: '#E8C0C2' },
  { href: '/astrology/retrogrades', icon: RotateCcw,  label: 'Retrogrades',    sub: 'What\'s RX and what it means',    color: '#C4A9E8' },
  { href: '/astrology/rituals',     icon: Sparkles,   label: 'Moon Rituals',   sub: 'New moon, full moon, personalized', color: '#8B6FB8' },
  { href: '/astrology/crystals',    icon: Gem,        label: 'Crystal Match',  sub: 'Today\'s recommended crystals',   color: '#A8C4DA' },
]

// ─── Brief section card ───────────────────────────────────────────────────────
function BriefSection({ label, icon, text, accent }: { label: string; icon: string; text: string; accent: string }) {
  return (
    <div style={{ ...GLASS, padding: '14px 16px', borderLeft: `3px solid ${accent}` }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>
        {icon} {label}
      </p>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 1.65 }}>{text}</p>
    </div>
  )
}

// ─── Shimmer card ─────────────────────────────────────────────────────────────
function Shimmer({ h = 80 }: { h?: number }) {
  return <div style={{ ...GLASS, height: h, background: 'rgba(255,255,255,0.04)' }} />
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AstrologyPortal() {
  const [brief,        setBrief]        = useState<Brief | null>(null)
  const [briefLoading, setBriefLoading] = useState(true)
  const [briefError,   setBriefError]   = useState(false)
  const [moon,         setMoon]         = useState<MoonData | null>(null)
  const [planets,      setPlanets]      = useState<PlanetData | null>(null)
  const [showSky,      setShowSky]      = useState(false)

  const tz = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/New_York'
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())

  function loadBrief() {
    setBriefLoading(true); setBriefError(false)
    fetch(`/api/astrology/daily-brief?tz=${encodeURIComponent(tz)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setBriefError(true); return }
        setBrief(d)
        if (d.sky?.moon)      setMoon(d.sky.moon)
        if (d.sky?.planets)   setPlanets({ planets: d.sky.planets, retrogrades: d.sky.retrogrades ?? [] })
      })
      .catch(() => setBriefError(true))
      .finally(() => setBriefLoading(false))
  }

  useEffect(() => {
    loadBrief()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-app overflow-x-hidden">
      <div className="fixed top-0 right-0 pointer-events-none z-0"
        style={{ width: 300, height: 300, background: 'radial-gradient(circle at 75% 15%, rgba(139,111,184,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      <div className="fixed bottom-0 left-0 pointer-events-none z-0"
        style={{ width: 250, height: 250, background: 'radial-gradient(circle at 20% 85%, rgba(90,120,180,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }} />

      <AppLayout>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,111,184,0.15)', border: '1px solid rgba(139,111,184,0.25)' }}>
              <Star className="h-5 w-5" style={{ color: 'var(--violet)' }} strokeWidth={1.6} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Astrology</h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{today}</p>
            </div>
          </div>
          <button onClick={loadBrief} disabled={briefLoading} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw className={`h-3 w-3 ${briefLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* ── DAILY COSMIC BRIEF ──────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>

          {/* Hero vibe card */}
          <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 12, position: 'relative', background: 'linear-gradient(145deg, #16133A 0%, #221850 55%, #16133A 100%)', border: '1px solid rgba(139,111,184,0.3)' }}>
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,111,184,0.25) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(90,120,200,0.15) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, padding: '22px 20px 20px' }}>
              {briefLoading ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Sparkles className="h-4 w-4 animate-pulse" style={{ color: 'rgba(196,169,232,0.6)' }} />
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(196,169,232,0.5)' }}>Reading the sky for you…</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[180, 120, 100].map((w, i) => (
                      <div key={i} style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.07)', width: `${w}px`, maxWidth: '100%' }} />
                    ))}
                  </div>
                </div>
              ) : briefError ? (
                <div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Couldn't load today's brief.</p>
                  <button onClick={loadBrief} style={{ fontSize: 12, color: '#8B6FB8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Try again →</button>
                </div>
              ) : brief ? (
                <>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(196,169,232,0.55)', marginBottom: 6 }}>
                    Today's Cosmic Brief
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 8 }}>
                    {brief.overall_vibe}
                  </h2>
                  <p style={{ fontSize: 14, color: 'rgba(196,169,232,0.85)', lineHeight: 1.6, marginBottom: 16 }}>
                    {brief.tagline}
                  </p>

                  {/* Mantra pill */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: 'rgba(139,111,184,0.2)', border: '1px solid rgba(139,111,184,0.35)' }}>
                    <span style={{ fontSize: 13 }}>✨</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(220,200,255,0.95)', fontStyle: 'italic' }}>{brief.mantra}</p>
                  </div>

                  {/* Moon summary inline */}
                  {moon && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'rgba(168,196,218,0.7)', background: 'rgba(168,196,218,0.08)', border: '1px solid rgba(168,196,218,0.15)', padding: '4px 10px', borderRadius: 10, fontWeight: 600 }}>
                        {moon.phase.emoji} {moon.phase.name} · {moon.phase.illumination}%
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(168,196,218,0.7)', background: 'rgba(168,196,218,0.08)', border: '1px solid rgba(168,196,218,0.15)', padding: '4px 10px', borderRadius: 10, fontWeight: 600 }}>
                        Moon in {moon.sign.emoji} {moon.sign.name}
                      </span>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Brief sections grid */}
          {brief && !briefLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BriefSection label="Energy to embody"       icon="🔥" text={brief.energy}  accent="rgba(139,111,184,0.9)" />
              <BriefSection label="What to avoid"          icon="🚫" text={brief.avoid}   accent="rgba(224,94,94,0.8)" />
              <BriefSection label="Stay focused on"        icon="🎯" text={brief.focus}   accent="rgba(201,169,110,0.9)" />
              <BriefSection label="Gifts available today"  icon="🎁" text={brief.gifts}   accent="rgba(90,180,140,0.8)" />
              <BriefSection label="How to prepare"         icon="🛡️" text={brief.prepare} accent="rgba(168,196,218,0.8)" />

              {/* Colors */}
              <div style={{ ...GLASS, padding: '14px 16px', borderLeft: '3px solid rgba(220,160,220,0.7)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(220,160,220,0.8)', marginBottom: 10 }}>
                  🎨 Wear today
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {brief.colors.map(c => (
                    <span key={c} style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 13, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>
                      {c}
                    </span>
                  ))}
                </div>
                {brief.color_note && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{brief.color_note}</p>}
              </div>

              {/* Crystals — full list */}
              <div style={{ ...GLASS, padding: '16px 16px', borderLeft: '3px solid rgba(168,196,218,0.7)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(168,196,218,0.8)', marginBottom: 12 }}>
                  💎 Crystals for today
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {brief.crystals.map(c => (
                    <span key={c} style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(168,196,218,0.09)', border: '1px solid rgba(168,196,218,0.2)', fontSize: 13, fontWeight: 700, color: 'rgba(168,196,218,0.95)', textTransform: 'capitalize' }}>
                      {c}
                    </span>
                  ))}
                </div>
                {brief.crystal_notes && Object.entries(brief.crystal_notes).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {Object.entries(brief.crystal_notes).map(([crystal, note]) => (
                      <div key={crystal} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(168,196,218,0.8)', minWidth: 90, flexShrink: 0, textTransform: 'capitalize', paddingTop: 1 }}>{crystal}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading skeletons for sections */}
          {briefLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[80, 80, 80, 80, 80, 100, 180].map((h, i) => <Shimmer key={i} h={h} />)}
            </div>
          )}
        </div>

        {/* ── CURRENT SKY (collapsible) ──────────────────────────── */}
        <button onClick={() => setShowSky(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Current Sky Snapshot</span>
          {showSky ? <ChevronUp className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.3)' }} />}
        </button>

        {showSky && (
          <div style={{ marginBottom: 16 }}>
            {/* Moon card */}
            {moon && (
              <div style={{ ...GLASS, padding: '16px 18px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                  <MoonSphere size={70} />
                </div>
                <div style={{ paddingRight: 90 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(168,196,218,0.5)', marginBottom: 6 }}>Moon</p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 3 }}>{moon.phase.emoji} {moon.phase.name}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Moon Sign: {moon.sign.emoji} {moon.sign.name} · {moon.sign.formatted}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{moon.phase.illumination}% illuminated{moon.next_ingress ? ` · ${moon.next_ingress}` : ''}</p>
                </div>
              </div>
            )}

            {/* Planets horizontal scroll */}
            {planets && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                  {planets.planets.map(p => (
                    <div key={p.name} style={{ flexShrink: 0, ...GLASS, borderRadius: 16, padding: '10px 12px', textAlign: 'center', minWidth: 72 }}>
                      <p style={{ fontSize: 15, marginBottom: 2 }}>{p.emoji}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: '#8B6FB8' }}>{p.sign}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{p.degree}°{p.retrograde ? ' ℞' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Retrogrades */}
            {planets && planets.retrogrades.length > 0 && (
              <div style={{ ...GLASS, padding: '12px 14px', marginBottom: 10, background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <RotateCcw className="h-4 w-4 flex-shrink-0" style={{ color: '#C9A96E' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#C9A96E' }}>
                  {planets.retrogrades.join(', ')} {planets.retrogrades.length === 1 ? 'is' : 'are'} retrograde
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── EXPLORE ───────────────────────────────────────────── */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Explore</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 32 }}>
          {SECTIONS.map(s => (
            <Link key={s.href} href={s.href}>
              <div style={{ ...GLASS, padding: 16, height: '100%' }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, background: `${s.color}18`, border: `1px solid ${s.color}28` }}>
                  <s.icon className="h-4 w-4" style={{ color: s.color }} strokeWidth={1.6} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{s.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Open full daily reading */}
        <Link href="/astrology/daily">
          <div style={{ ...GLASS, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(139,111,184,0.1)', border: '1px solid rgba(139,111,184,0.25)', borderRadius: 18, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Full Daily Reading</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>All life areas · HD guidance · Extended transits</p>
            </div>
            <ArrowRight className="h-5 w-5 flex-shrink-0" style={{ color: '#8B6FB8' }} />
          </div>
        </Link>
      </AppLayout>
    </div>
  )
}
