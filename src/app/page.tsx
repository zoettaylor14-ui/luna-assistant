'use client'
import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { format } from 'date-fns'
import {
  Heart, Zap, Moon, BriefcaseIcon, Sparkles, Compass,
  Star, Calendar, ChevronRight, ArrowRight, Sun, Plus,
  MessageCircle, MoreHorizontal, MapPin, Clock, CheckCircle2, Circle
} from 'lucide-react'
import Link from 'next/link'

// ─── Static data ────────────────────────────────────────────
const AFFIRMATIONS = [
  'I move with grace. I do not chase the day — I guide it.',
  'My ideas are safe. My energy is sacred. I choose what matters.',
  'I am not here to do everything. I am here to do what is mine.',
  'I trust my own voice. Clarity comes when I speak my truth.',
  'I am becoming the woman I see in my future.',
  'Rest is productive. Peace is power. Softness is strength.',
  'I lead with recognition, not reaction.',
]

const SPIRIT_MESSAGES = [
  'Rest is not a reward. It is part of the work.',
  'You are most powerful when you pause before you speak.',
  'Not everything that calls your name deserves your energy.',
  'Your intuition already knows. Give it space to be heard.',
  'What you tend to quietly will grow the loudest.',
  'Receive before you give. Fill before you pour.',
]

const CRYSTALS = [
  { name: 'Amethyst',        tags: 'Calm · Clarity · Protection',      color: '#8B6FB8', emoji: '🔮' },
  { name: 'Labradorite',     tags: 'Intuition · Magic · Vision',        color: '#4A7FB8', emoji: '✨' },
  { name: 'Rose Quartz',     tags: 'Self-love · Healing · Softness',    color: '#E8B4B8', emoji: '💗' },
  { name: 'Citrine',         tags: 'Abundance · Motivation · Clarity',  color: '#E8C97A', emoji: '⭐' },
  { name: 'Black Tourmaline',tags: 'Protection · Grounding · Safety',   color: '#3D3547', emoji: '🖤' },
  { name: 'Selenite',        tags: 'Clarity · Higher guidance · Peace', color: '#B8C4D8', emoji: '🌙' },
  { name: 'Moonstone',       tags: 'Intuition · Cycles · Feminine flow',color: '#C4D0E8', emoji: '🌕' },
]

const MOON_PHASES = [
  { name: 'New Moon',        emoji: '🌑', keyword: 'Intentions' },
  { name: 'Waxing Crescent', emoji: '🌒', keyword: 'Growth'     },
  { name: 'First Quarter',   emoji: '🌓', keyword: 'Action'     },
  { name: 'Waxing Gibbous',  emoji: '🌔', keyword: 'Refine'     },
  { name: 'Full Moon',       emoji: '🌕', keyword: 'Release'    },
  { name: 'Waning Gibbous',  emoji: '🌖', keyword: 'Gratitude'  },
  { name: 'Last Quarter',    emoji: '🌗', keyword: 'Let go'     },
  { name: 'Waning Crescent', emoji: '🌘', keyword: 'Rest'       },
]

function getTodayIndex<T>(arr: T[]) { return new Date().getDate() % arr.length }

function getMoonPhase(): (typeof MOON_PHASES)[0] {
  const known = new Date('2024-01-11').getTime()
  const days = (Date.now() - known) / (1000 * 60 * 60 * 24)
  return MOON_PHASES[Math.floor(((days % 29.53) / 29.53) * 8)] ?? MOON_PHASES[0]
}

function getTimeGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Realistic CSS moon ─────────────────────────────────────
function MoonSphere({ size = 128, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      background: [
        'radial-gradient(circle at 58% 22%, rgba(155,150,172,0.95) 0%, rgba(135,130,155,0.5) 8%, transparent 13%)',
        'radial-gradient(circle at 26% 64%, rgba(140,135,162,0.85) 0%, transparent 10%)',
        'radial-gradient(circle at 73% 60%, rgba(150,145,168,0.75) 0%, transparent 9%)',
        'radial-gradient(circle at 44% 78%, rgba(125,120,148,0.9) 0%, transparent 13%)',
        'radial-gradient(circle at 18% 38%, rgba(170,165,190,0.65) 0%, transparent 8%)',
        'radial-gradient(circle at 84% 42%, rgba(160,155,180,0.55) 0%, transparent 7%)',
        'radial-gradient(circle at 36% 46%, rgba(180,175,198,0.4) 0%, transparent 18%)',
        'radial-gradient(circle at 62% 72%, rgba(148,143,168,0.5) 0%, transparent 11%)',
        'radial-gradient(ellipse at 38% 35%, rgba(252,250,255,1) 0%, rgba(228,224,240,1) 15%, rgba(196,192,212,1) 32%, rgba(162,158,180,1) 52%, rgba(124,120,145,1) 70%, rgba(88,84,108,1) 88%)',
      ].join(', '),
      boxShadow: [
        `inset ${size * 0.13}px ${size * 0.07}px ${size * 0.22}px rgba(0,0,0,0.32)`,
        glow ? `0 0 ${size * 0.3}px ${size * 0.1}px rgba(180,160,240,0.28)` : '',
      ].filter(Boolean).join(', '),
    }} />
  )
}

// ─── Donut ring ──────────────────────────────────────────────
function Ring({ pct, size = 64, stroke = 6, color = '#8B6FB8', label }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      {label && (
        <>
          <text x={size/2} y={size/2 - 4} textAnchor="middle" fill="white" style={{ fontSize: size*0.22, fontWeight: 700 }}>{pct}%</text>
          <text x={size/2} y={size/2 + size*0.17} textAnchor="middle" fill="rgba(255,255,255,0.5)" style={{ fontSize: size*0.13 }}>{label}</text>
        </>
      )}
    </svg>
  )
}

// ─── Sparkline ──────────────────────────────────────────────
function Sparkline({ values, color = '#8B6FB8' }: { values: number[]; color?: string }) {
  const w = 120, h = 36
  const max = Math.max(...values), min = Math.min(...values)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h * 0.8 - h * 0.1
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Mobile stat card ────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl p-3 flex flex-col items-center gap-2"
      style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{label}</p>
      <div className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: `${color}18`, border: `2px solid ${color}40` }}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{value}</p>
        {sub && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Dark card wrapper ───────────────────────────────────────
function DCard({ children, className = '', style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
  return (
    <div className={`dark-card p-5 ${className}`} style={style}>
      {children}
    </div>
  )
}

// ─── Dark card label ─────────────────────────────────────────
function DLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)', fontSize: '0.72rem', letterSpacing: '0.12em' }}>{children}</p>
}

export default function SanctuaryPage() {
  const [mounted, setMounted] = useState(false)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Finalize client proposal', sub: 'High impact', done: true  },
    { id: 2, title: 'Workout & movement',        sub: 'Build energy', done: true  },
    { id: 3, title: 'Deep work block',           sub: '90 minutes',  done: false },
  ])

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const hour        = new Date().getHours()
  const today       = format(new Date(), 'EEEE, MMMM d')
  const greeting    = getTimeGreeting(hour)
  const affirmation = AFFIRMATIONS[getTodayIndex(AFFIRMATIONS)]
  const crystal     = CRYSTALS[getTodayIndex(CRYSTALS)]
  const spiritMsg   = SPIRIT_MESSAGES[getTodayIndex(SPIRIT_MESSAGES)]
  const moon        = getMoonPhase()

  const toggleTask = (id: number) =>
    setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task))

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          MOBILE / TABLET  — light cream sanctuary theme
      ══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen relative overflow-hidden bg-app">

        {/* Background orbs */}
        <div className="fixed -top-32 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(184,159,216,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="fixed top-40 -left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,196,218,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <AppLayout noPad>
          <div className="px-4 pt-12 pb-nav space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-3)' }}>{today}</p>
                <h1 className="font-display text-[2rem] font-bold leading-tight" style={{ color: 'var(--text-1)' }}>
                  {greeting}, Zoe ✨
                </h1>
                <p className="text-sm mt-1 font-display italic" style={{ color: 'var(--violet)' }}>
                  You are not behind. You are returning.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                <div className="text-3xl opacity-80">{moon.emoji}</div>
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))', border: '2px solid white' }}>
                  <span className="text-white text-sm font-bold">Z</span>
                </div>
              </div>
            </div>

            {/* 4-stat row */}
            <div className="flex gap-2">
              <StatCard icon={<Heart className="h-4 w-4" style={{ color: '#8B6FB8' }} />} label="Mood" value="Calm" sub="7/10" color="#8B6FB8" />
              <StatCard icon={<Zap className="h-4 w-4" style={{ color: '#C9A96E' }} />} label="Energy" value="Steady" sub="6/10" color="#C9A96E" />
              <StatCard icon={<Moon className="h-4 w-4" style={{ color: '#6A4F9B' }} />} label="Sleep" value="Good" sub="7.5 hrs" color="#6A4F9B" />
              <StatCard icon={<span className="text-base">{moon.emoji}</span>} label="Moon" value={moon.keyword} sub={moon.name.split(' ').slice(-1)[0]} color="#A8C4DA" />
            </div>

            {/* Quick Actions — horizontal scroll */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-4)' }}>Quick Actions</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[
                  { href: '/morning',      emoji: '✨', label: 'Check In',   color: 'rgba(139,111,184,0.18)' },
                  { href: '/brain-dump',   emoji: '🧠', label: 'Brain Dump', color: 'rgba(201,169,110,0.18)' },
                  { href: '/dictation',    emoji: '🎙', label: 'Dictate',    color: 'rgba(139,111,184,0.14)' },
                  { href: '/spirit',       emoji: '🔮', label: 'Spirit',     color: 'rgba(184,159,216,0.16)' },
                  { href: '/night',        emoji: '🌙', label: 'Night',      color: 'rgba(60,40,100,0.25)'   },
                  { href: '/rush-mode',    emoji: '⚡', label: 'Rush Mode',  color: 'rgba(200,100,60,0.18)'  },
                  { href: '/more',         emoji: '···', label: 'All',       color: 'rgba(139,111,184,0.10)' },
                ].map(a => (
                  <Link key={a.href} href={a.href} className="flex-shrink-0">
                    <div className="action-pill" style={{ background: a.color, border: '1px solid rgba(139,111,184,0.15)' }}>
                      <span className="text-2xl leading-none">{a.emoji}</span>
                      <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-1)' }}>{a.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Affirmation */}
            <div className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <span className="text-4xl flex-shrink-0">🔮</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>Daily Affirmation</p>
                <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-1)' }}>{affirmation}</p>
              </div>
            </div>

            {/* Next Meeting + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Next Meeting</p>
                  <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--text-3)' }} />
                </div>
                <p className="text-lg font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>11:00 AM</p>
                <p className="text-xs leading-snug mb-3" style={{ color: 'var(--text-2)' }}>DRYP Weekly Strategy</p>
                <Link href="/today">
                  <div className="px-3 py-1.5 rounded-xl text-center text-xs font-semibold"
                    style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>Prep</div>
                </Link>
              </div>
              <div className="rounded-2xl p-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Priority</p>
                  <Star className="h-3.5 w-3.5" style={{ color: '#C9A96E' }} />
                </div>
                <p className="text-sm font-bold leading-snug mb-1" style={{ color: 'var(--text-1)' }}>Review client website plan</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>This unlocks everything.</p>
              </div>
            </div>

            {/* Spirit + Crystal + Career */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl p-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="text-base mb-2">🪷</div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Spirit</p>
                <p className="text-sm leading-snug mb-2" style={{ color: 'var(--text-2)' }}>{spiritMsg}</p>
                <Link href="/spirit"><p className="text-sm font-semibold" style={{ color: 'var(--violet)' }}>Read →</p></Link>
              </div>
              <div className="rounded-2xl p-3 flex flex-col items-center text-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="text-base mb-2">🔮</div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Crystal</p>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-1)' }}>{crystal.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-2)' }}>{crystal.tags}</p>
              </div>
              <div className="rounded-2xl p-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="text-base mb-2">🧭</div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Career</p>
                <p className="text-sm leading-snug mb-2" style={{ color: 'var(--text-2)' }}>Align work with recognition.</p>
                <Link href="/career"><p className="text-sm font-semibold" style={{ color: 'var(--violet)' }}>Open →</p></Link>
              </div>
            </div>

            {/* Mode buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/late-mode">
                <div className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(201,169,110,0.2)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)' }}>
                    <Sun className="h-5 w-5" style={{ color: '#C9A96E' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>I Woke Up Late</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>Reset without guilt</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" style={{ color: 'var(--faint)' }} />
                </div>
              </Link>
              <Link href="/rush-mode">
                <div className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,111,184,0.1)' }}>
                    <Zap className="h-5 w-5" style={{ color: 'var(--violet)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>I&apos;m Rushing</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>Sacred minimum</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" style={{ color: 'var(--faint)' }} />
                </div>
              </Link>
            </div>

            {/* Tonight strip */}
            <Link href="/night">
              <div className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                style={{ background: 'var(--surface-strong)', border: '1px solid var(--surface-border)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌙</span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--violet)' }}>Tonight&apos;s Protection</p>
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>Start wind-down by 9:30 PM</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" style={{ color: 'var(--violet)' }} />
              </div>
            </Link>
          </div>
        </AppLayout>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP — CarPlay × Apple Home Screen
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block min-h-screen bg-app">

        {/* Ambient orbs — fixed, behind everything */}
        <div className="fixed top-0 right-0 w-[700px] h-[700px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle at 75% 15%, rgba(139,111,184,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle at 25% 85%, rgba(90,120,180,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }} />

        <AppLayout noPad>
          <div className="pt-16 pb-[110px] max-w-[1400px] mx-auto px-8">

            {/* ── HERO CARD — always dark, emotional center ── */}
            <div className="relative rounded-[28px] overflow-hidden mb-6 transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg, #16133A 0%, #1F1848 40%, #16133A 100%)',
                border: '1px solid rgba(139,111,184,0.22)',
                minHeight: 188,
              }}>
              {/* Moon sphere — right side */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                <MoonSphere size={160} glow={true} />
              </div>
              {/* Floating stars */}
              {[[12,40,3],[68,55,2],[22,62,2],[48,68,3],[35,44,1.5],[58,30,2]].map(([t,r,s],i) => (
                <div key={i} className="absolute rounded-full"
                  style={{ top:`${t}%`, right:`${r}%`, width:s, height:s, background:'rgba(255,255,255,0.75)' }} />
              ))}
              {/* Soft glow under moon */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,111,184,0.18) 0%, transparent 70%)', filter: 'blur(24px)' }} />

              <div className="relative z-10 px-10 py-9 pr-64">
                <p className="text-sm font-medium mb-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{today}</p>
                <h1 className="font-display text-4xl font-bold mb-2 leading-tight" style={{ color: 'white' }}>
                  {greeting}, Zoe ✦
                </h1>
                <p className="text-base mb-6 max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
                  {affirmation}
                </p>
                <Link href="/morning">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      color: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(12px)',
                    }}>
                    <Sparkles className="h-4 w-4" />
                    Begin Morning Check-In
                  </button>
                </Link>
              </div>
            </div>

            {/* ── APP TILE GRID — bento layout ── */}
            <div className="grid grid-cols-12 gap-4 mb-4">

              {/* Morning Wake — large (col 4) */}
              <Link href="/morning" className="col-span-4 group">
                <div className="relative rounded-[24px] p-6 h-full min-h-[200px] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-30"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(201,169,110,0.4) 0%, transparent 60%)' }} />
                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.2)' }}>
                      <span className="text-2xl">☀️</span>
                    </div>
                    <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Morning Wake</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>How did your soul sleep?</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-semibold" style={{ color: '#C9A96E' }}>Start ritual</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: '#C9A96E' }} />
                  </div>
                </div>
              </Link>

              {/* Work Brief — large (col 4) */}
              <Link href="/work" className="col-span-4 group">
                <div className="relative rounded-[24px] p-6 h-full min-h-[200px] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-20"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139,111,184,0.6) 0%, transparent 60%)' }} />
                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(139,111,184,0.12)', border: '1px solid rgba(139,111,184,0.2)' }}>
                      <BriefcaseIcon className="h-6 w-6" style={{ color: 'var(--violet)' }} strokeWidth={1.6} />
                    </div>
                    <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Work Brief</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
                      {tasks.filter(t => !t.done).length} tasks · 1 meeting · Q2 Launch on track
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>Progress</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--violet)' }}>72%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--surface-subtle)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: '72%', background: 'var(--violet)' }} />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Messages — large (col 4) */}
              <Link href="/messages" className="col-span-4 group">
                <div className="relative rounded-[24px] p-6 h-full min-h-[200px] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-20"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(168,196,218,0.5) 0%, transparent 60%)' }} />
                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 relative"
                      style={{ background: 'rgba(168,196,218,0.12)', border: '1px solid rgba(168,196,218,0.2)' }}>
                      <MessageCircle className="h-6 w-6" style={{ color: 'var(--lunar)' }} strokeWidth={1.6} />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: 'var(--violet)', fontSize: 10 }}>4</div>
                    </div>
                    <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Messages</p>
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>Communication Coach ready</p>
                  </div>
                  <div className="space-y-2 mt-2">
                    {[
                      { name: 'Mom', msg: 'Proud of you. Thinking of you.' },
                      { name: 'Jasmine', msg: "Can't wait to see the deck!" },
                    ].map(m => (
                      <div key={m.name} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
                          style={{ background: 'rgba(139,111,184,0.3)', fontSize: 10 }}>{m.name[0]}</div>
                        <p className="text-xs truncate flex-1" style={{ color: 'var(--text-2)' }}>
                          <span className="font-semibold">{m.name}</span> — {m.msg}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </div>

            {/* ── ROW 2: 4 medium tiles + LUNA Now ── */}
            <div className="grid grid-cols-12 gap-4 mb-4">

              {/* Calendar (col 3) */}
              <Link href="/calendar" className="col-span-3 group">
                <div className="rounded-[24px] p-5 h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(232,192,194,0.15)', border: '1px solid rgba(232,192,194,0.2)' }}>
                    <Calendar className="h-5 w-5" style={{ color: 'var(--blush)' }} strokeWidth={1.7} />
                  </div>
                  <p className="font-bold text-base mb-1" style={{ color: 'var(--text-1)' }}>Calendar</p>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--blush)' }}>11:00 AM</p>
                  <p className="text-sm" style={{ color: 'var(--text-2)' }}>DRYP Weekly Sync</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>45 min · Google Meet</p>
                </div>
              </Link>

              {/* Spirit (col 3) */}
              <Link href="/spirit" className="col-span-3 group">
                <div className="relative rounded-[24px] p-5 h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30,20,60,0.95) 0%, rgba(45,28,75,0.95) 100%)',
                    border: '1px solid rgba(180,140,240,0.2)',
                  }}>
                  <div className="absolute right-3 top-3 text-4xl opacity-40">🪷</div>
                  <div className="absolute top-2 right-2 w-20 h-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(180,140,240,0.25) 0%, transparent 70%)', filter: 'blur(8px)' }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(180,140,240,0.15)', border: '1px solid rgba(180,140,240,0.2)' }}>
                    <Sparkles className="h-5 w-5" style={{ color: '#C4A9E8' }} strokeWidth={1.7} />
                  </div>
                  <p className="font-bold text-base mb-1 text-white">Spirit</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Moon guidance + crystal for today
                  </p>
                  <p className="text-xs mt-3 font-semibold" style={{ color: 'rgba(196,169,232,0.8)' }}>
                    {moon.emoji} {moon.name}
                  </p>
                </div>
              </Link>

              {/* Atelier (col 3) */}
              <Link href="/atelier" className="col-span-3 group">
                <div className="relative rounded-[24px] p-5 h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(232,192,194,0.6) 0%, transparent 60%)' }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(232,192,194,0.12)', border: '1px solid rgba(232,192,194,0.2)' }}>
                    <span className="text-xl">✂️</span>
                  </div>
                  <p className="font-bold text-base mb-1" style={{ color: 'var(--text-1)' }}>Atelier</p>
                  <p className="text-sm" style={{ color: 'var(--text-3)' }}>Today&apos;s style energy</p>
                  <div className="mt-3 px-2 py-1.5 rounded-xl inline-block"
                    style={{ background: 'rgba(139,111,184,0.1)', border: '1px solid rgba(139,111,184,0.15)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--violet)' }}>✨ LUNA Street Fairy</p>
                  </div>
                </div>
              </Link>

              {/* Night Protection (col 3) */}
              <Link href="/night" className="col-span-3 group">
                <div className="relative rounded-[24px] p-5 h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(139,111,184,0.12)', border: '1px solid rgba(139,111,184,0.15)' }}>
                    <Moon className="h-5 w-5" style={{ color: 'var(--violet)' }} strokeWidth={1.7} />
                  </div>
                  <p className="font-bold text-base mb-1" style={{ color: 'var(--text-1)' }}>Night Protection</p>
                  <p className="text-sm" style={{ color: 'var(--text-3)' }}>Wind down by 9:30 PM</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#B8C9B4' }} />
                    <p className="text-xs" style={{ color: '#B8C9B4' }}>Evening ritual ready</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* ── ROW 3: Priorities + LUNA Now + Wellness ── */}
            <div className="grid grid-cols-12 gap-4">

              {/* Today's Priorities (col 4) */}
              <div className="col-span-4">
                <div className="rounded-[24px] p-6 h-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--violet)' }} strokeWidth={2} />
                      <span className="font-bold text-base" style={{ color: 'var(--text-1)' }}>Today&apos;s Priorities</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(139,111,184,0.15)', color: 'var(--violet)' }}>
                      {tasks.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {tasks.map(task => (
                      <button key={task.id} onClick={() => toggleTask(task.id)}
                        className="w-full flex items-start gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.01]"
                        style={{ background: 'var(--surface-subtle)', border: '1px solid var(--surface-border)' }}>
                        {task.done
                          ? <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--violet)' }} />
                          : <Circle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-3)' }} />
                        }
                        <div className="min-w-0">
                          <p className="text-sm font-semibold" style={{ color: task.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: task.done ? 'line-through' : 'none' }}>
                            {task.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{task.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className="flex items-center gap-2 mt-4 text-sm"
                    style={{ color: 'var(--text-3)' }}>
                    <Plus className="h-4 w-4" /> Add a priority
                  </button>
                </div>
              </div>

              {/* LUNA Now — dynamic guidance card (col 4) */}
              <div className="col-span-4">
                <div className="relative rounded-[24px] p-6 h-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(160deg, rgba(26,21,53,0.97) 0%, rgba(36,28,72,0.97) 100%)',
                    border: '1px solid rgba(139,111,184,0.25)',
                  }}>
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(139,111,184,0.15) 0%, transparent 60%)' }} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(139,111,184,0.2)', border: '1px solid rgba(139,111,184,0.3)' }}>
                        <Sparkles className="h-4 w-4" style={{ color: '#C4A9E8' }} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">LUNA Now</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Your best next move</p>
                      </div>
                    </div>

                    <p className="font-display text-xl font-bold text-white leading-snug mb-3">
                      Start with water, mood check, and one priority.
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {spiritMsg}
                    </p>

                    <div className="space-y-2">
                      {[
                        { emoji: '💧', text: 'Drink water first' },
                        { emoji: '🧠', text: 'Check your energy level' },
                        { emoji: '✦', text: 'Pick one thing that matters most' },
                      ].map(step => (
                        <div key={step.text} className="flex items-center gap-3 rounded-xl px-3 py-2"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <span>{step.emoji}</span>
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{step.text}</p>
                        </div>
                      ))}
                    </div>

                    <Link href="/morning">
                      <button className="mt-5 w-full py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(139,111,184,0.25)', border: '1px solid rgba(139,111,184,0.3)', color: 'rgba(255,255,255,0.9)' }}>
                        Begin Check-In ✦
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Wellness (col 4) */}
              <div className="col-span-4">
                <div className="rounded-[24px] p-6 h-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="font-bold text-base mb-4" style={{ color: 'var(--text-1)' }}>Wellness Today</p>
                  <div className="space-y-4 mb-5">
                    {[
                      { icon: Moon,  label: 'Sleep',       value: '7h 32m', color: '#8B6FB8', pct: 74 },
                      { icon: Zap,   label: 'Movement',    value: '45 min', color: '#C9A96E', pct: 60 },
                      { icon: Heart, label: 'Mindfulness', value: '12 min', color: '#B8C9B4', pct: 40 },
                    ].map(({ icon: Icon, label, value, color, pct }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                              <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.8} />
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{label}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{value}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--surface-subtle)' }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-3"
                    style={{ borderTop: '1px solid var(--surface-border)' }}>
                    <div className="flex-1">
                      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-3)' }}>ENERGY TREND</p>
                      <Sparkline values={[60,65,70,62,75,78,74,80]} color="var(--violet)" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold" style={{ color: 'var(--text-1)' }}>78%</p>
                      <p className="text-xs font-semibold" style={{ color: '#B8C9B4' }}>Steady ↑</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </AppLayout>
      </div>
    </>
  )
}
