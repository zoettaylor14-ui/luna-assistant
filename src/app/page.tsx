'use client'
import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { format } from 'date-fns'
import {
  Heart, Zap, Moon, BriefcaseIcon, Sparkles, Star,
  Calendar, ChevronRight, ArrowRight, Sun, Plus,
  MessageCircle, CheckCircle2, Circle, DollarSign, Scissors
} from 'lucide-react'
import Link from 'next/link'

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
  { name: 'Amethyst',         tags: 'Calm · Clarity · Protection',       color: '#8B6FB8', emoji: '🔮' },
  { name: 'Labradorite',      tags: 'Intuition · Magic · Vision',         color: '#4A7FB8', emoji: '✨' },
  { name: 'Rose Quartz',      tags: 'Self-love · Healing · Softness',     color: '#E8B4B8', emoji: '💗' },
  { name: 'Citrine',          tags: 'Abundance · Motivation · Clarity',   color: '#E8C97A', emoji: '⭐' },
  { name: 'Black Tourmaline', tags: 'Protection · Grounding · Safety',    color: '#3D3547', emoji: '🖤' },
  { name: 'Selenite',         tags: 'Clarity · Higher guidance · Peace',  color: '#B8C4D8', emoji: '🌙' },
  { name: 'Moonstone',        tags: 'Intuition · Cycles · Feminine flow', color: '#C4D0E8', emoji: '🌕' },
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

function MoonSphere({ size = 128, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: [
        'radial-gradient(circle at 58% 22%, rgba(155,150,172,0.95) 0%, rgba(135,130,155,0.5) 8%, transparent 13%)',
        'radial-gradient(circle at 26% 64%, rgba(140,135,162,0.85) 0%, transparent 10%)',
        'radial-gradient(circle at 73% 60%, rgba(150,145,168,0.75) 0%, transparent 9%)',
        'radial-gradient(circle at 44% 78%, rgba(125,120,148,0.9) 0%, transparent 13%)',
        'radial-gradient(ellipse at 38% 35%, rgba(252,250,255,1) 0%, rgba(228,224,240,1) 15%, rgba(196,192,212,1) 32%, rgba(162,158,180,1) 52%, rgba(124,120,145,1) 70%, rgba(88,84,108,1) 88%)',
      ].join(', '),
      boxShadow: [
        `inset ${size * 0.13}px ${size * 0.07}px ${size * 0.22}px rgba(0,0,0,0.32)`,
        glow ? `0 0 ${size * 0.3}px ${size * 0.1}px rgba(180,160,240,0.28)` : '',
      ].filter(Boolean).join(', '),
    }} />
  )
}

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

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review client website plan',   done: false },
    { id: 2, title: 'DRYP newsletter content',       done: false },
    { id: 3, title: 'USF assignment check',          done: true  },
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
      {/* ══════════ MOBILE ══════════ */}
      <div className="lg:hidden min-h-screen relative overflow-hidden bg-app">
        <div className="fixed -top-32 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(184,159,216,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="fixed top-40 -left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,196,218,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <AppLayout noPad>
          <div className="px-4 pt-12 pb-nav space-y-4">

            {/* Hero Greeting */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-3)' }}>{today}</p>
                <h1 className="font-display text-[2rem] font-bold leading-tight" style={{ color: 'var(--text-1)' }}>
                  {greeting}, Zoe ✦
                </h1>
                <p className="text-sm mt-1 font-display italic" style={{ color: 'var(--violet)' }}>
                  {affirmation}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                <div className="text-2xl opacity-80">{moon.emoji}</div>
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))', border: '2px solid white' }}>
                  <span className="text-white text-sm font-bold">Z</span>
                </div>
              </div>
            </div>

            {/* LUNA Now */}
            <div className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(26,21,53,0.97) 0%, rgba(36,28,72,0.97) 100%)',
                border: '1px solid rgba(139,111,184,0.25)',
              }}>
              <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139,111,184,0.2) 0%, transparent 70%)' }} />
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5" style={{ color: '#C4A9E8' }} />
                <p className="text-xs font-bold" style={{ color: '#C4A9E8' }}>LUNA Now</p>
              </div>
              <p className="text-base font-semibold text-white leading-snug mb-1">
                Start with water, mood check, and one priority.
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{spiritMsg}</p>
              <Link href="/luna">
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: 'rgba(196,169,232,0.8)' }}>
                  Open LUNA <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </div>

            {/* Today's Top 3 */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Today&apos;s Top 3</p>
                <Link href="/work">
                  <span className="text-xs" style={{ color: 'var(--violet)' }}>All tasks →</span>
                </Link>
              </div>
              <div className="space-y-2">
                {tasks.map((task, i) => (
                  <button key={task.id} onClick={() => toggleTask(task.id)}
                    className="w-full flex items-center gap-3 text-left">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: task.done ? 'rgba(139,111,184,0.3)' : 'rgba(139,111,184,0.1)',
                        color: 'var(--violet)',
                        textDecoration: task.done ? 'line-through' : 'none',
                      }}>
                      {task.done ? '✓' : i + 1}
                    </span>
                    <p className="text-sm" style={{
                      color: task.done ? 'var(--text-3)' : 'var(--text-1)',
                      textDecoration: task.done ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Next Event */}
            <Link href="/work">
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(232,192,194,0.12)', border: '1px solid rgba(232,192,194,0.2)' }}>
                  <Calendar className="h-5 w-5" style={{ color: 'var(--blush)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-3)' }}>Next Event</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>11:00 AM · DRYP Weekly Sync</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>45 min · Google Meet</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-3)' }} />
              </div>
            </Link>

            {/* 2×2 Preview Grid */}
            <div className="grid grid-cols-2 gap-3">

              {/* Astrology Preview */}
              <Link href="/astrology">
                <div className="rounded-2xl p-4 h-full relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30,20,60,0.95), rgba(45,28,75,0.95))',
                    border: '1px solid rgba(180,140,240,0.2)',
                  }}>
                  <div className="text-2xl mb-2">{moon.emoji}</div>
                  <p className="text-xs font-bold mb-1" style={{ color: '#C4A9E8' }}>Astrology</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{moon.name}</p>
                  <p className="text-xs mt-0.5 font-semibold" style={{ color: '#A8C4DA' }}>{crystal.name} ✦</p>
                </div>
              </Link>

              {/* Style Preview */}
              <Link href="/atelier">
                <div className="rounded-2xl p-4 h-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <Scissors className="h-5 w-5 mb-2" style={{ color: 'var(--blush)' }} />
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-1)' }}>Atelier</p>
                  <p className="text-xs" style={{ color: 'var(--violet)' }}>✨ LUNA Street Fairy</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Style Oracle ready</p>
                </div>
              </Link>

              {/* Money Preview */}
              <Link href="/work">
                <div className="rounded-2xl p-4 h-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <DollarSign className="h-5 w-5 mb-2" style={{ color: '#B8C9B4' }} />
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-1)' }}>Money</p>
                  <p className="text-xs" style={{ color: '#B8C9B4' }}>No bills due today</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Invoice pending ✦</p>
                </div>
              </Link>

              {/* Night Preview */}
              <Link href="/luna">
                <div className="rounded-2xl p-4 h-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <Moon className="h-5 w-5 mb-2" style={{ color: 'var(--violet)' }} />
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-1)' }}>Tonight</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>Wind down by 9:30 PM</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--violet)' }}>Evening ritual ready</p>
                </div>
              </Link>

            </div>
          </div>
        </AppLayout>
      </div>

      {/* ══════════ DESKTOP ══════════ */}
      <div className="hidden lg:block min-h-screen bg-app">
        <div className="fixed top-0 right-0 w-[700px] h-[700px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle at 75% 15%, rgba(139,111,184,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle at 25% 85%, rgba(90,120,180,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }} />

        <AppLayout noPad>
          <div className="pt-4 pb-[110px] px-8">

            {/* Hero */}
            <div className="relative rounded-[28px] overflow-hidden mb-6"
              style={{
                background: 'linear-gradient(135deg, #16133A 0%, #1F1848 40%, #16133A 100%)',
                border: '1px solid rgba(139,111,184,0.22)',
                minHeight: 188,
              }}>
              <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                <MoonSphere size={160} glow={true} />
              </div>
              {[[12,40,3],[68,55,2],[22,62,2],[48,68,3],[35,44,1.5],[58,30,2]].map(([t,r,s],i) => (
                <div key={i} className="absolute rounded-full"
                  style={{ top:`${t}%`, right:`${r}%`, width:s, height:s, background:'rgba(255,255,255,0.75)' }} />
              ))}
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
                <Link href="/luna">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      color: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(12px)',
                    }}>
                    <Sparkles className="h-4 w-4" />
                    Open LUNA
                  </button>
                </Link>
              </div>
            </div>

            {/* Row 1 — LUNA Now + Top 3 + Next Event */}
            <div className="grid grid-cols-12 gap-4 mb-4">

              {/* LUNA Now */}
              <div className="col-span-5">
                <div className="relative rounded-[24px] p-6 h-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(160deg, rgba(26,21,53,0.97) 0%, rgba(36,28,72,0.97) 100%)',
                    border: '1px solid rgba(139,111,184,0.25)',
                  }}>
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(139,111,184,0.15) 0%, transparent 60%)' }} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
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
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>{spiritMsg}</p>
                    <Link href="/luna">
                      <button className="w-full py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(139,111,184,0.25)', border: '1px solid rgba(139,111,184,0.3)', color: 'rgba(255,255,255,0.9)' }}>
                        Open LUNA ✦
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Top 3 */}
              <div className="col-span-4">
                <div className="rounded-[24px] p-6 h-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-base" style={{ color: 'var(--text-1)' }}>Today&apos;s Top 3</span>
                    <Link href="/work">
                      <span className="text-xs" style={{ color: 'var(--violet)' }}>All tasks →</span>
                    </Link>
                  </div>
                  <div className="space-y-2.5">
                    {tasks.map((task, i) => (
                      <button key={task.id} onClick={() => toggleTask(task.id)}
                        className="w-full flex items-start gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.01]"
                        style={{ background: 'var(--surface-subtle)', border: '1px solid var(--surface-border)' }}>
                        {task.done
                          ? <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--violet)' }} />
                          : <Circle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-3)' }} />
                        }
                        <p className="text-sm font-semibold" style={{ color: task.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: task.done ? 'line-through' : 'none' }}>
                          {task.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Event */}
              <div className="col-span-3">
                <div className="rounded-[24px] p-6 h-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4" style={{ color: 'var(--blush)' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Next Event</span>
                  </div>
                  <p className="text-2xl font-bold mb-1" style={{ color: 'var(--blush)' }}>11:00 AM</p>
                  <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>DRYP Weekly Sync</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-3)' }}>45 min · Google Meet</p>
                  <Link href="/work">
                    <div className="px-4 py-2 rounded-xl text-center text-sm font-semibold"
                      style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>Prep notes →</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Row 2 — Previews */}
            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  href: '/astrology',
                  dark: true,
                  emoji: moon.emoji,
                  title: 'Astrology',
                  sub: `${moon.name} · ${moon.keyword}`,
                  sub2: `${crystal.name} ✦`,
                },
                {
                  href: '/atelier',
                  dark: false,
                  emoji: '✂️',
                  title: 'Atelier',
                  sub: '✨ LUNA Street Fairy',
                  sub2: 'Style Oracle ready',
                },
                {
                  href: '/work',
                  dark: false,
                  emoji: '💵',
                  title: 'Money',
                  sub: 'No bills due today',
                  sub2: 'Invoice pending ✦',
                },
                {
                  href: '/luna',
                  dark: false,
                  emoji: '🌙',
                  title: 'Tonight',
                  sub: 'Wind down by 9:30 PM',
                  sub2: 'Evening ritual ready',
                },
              ].map(card => (
                <Link key={card.href} href={card.href} className="group">
                  <div className="rounded-[24px] p-5 h-full transition-all duration-300 hover:scale-[1.02]"
                    style={card.dark
                      ? { background: 'linear-gradient(135deg, rgba(30,20,60,0.95), rgba(45,28,75,0.95))', border: '1px solid rgba(180,140,240,0.2)' }
                      : { background: 'var(--surface)', border: '1px solid var(--surface-border)' }
                    }>
                    <div className="text-2xl mb-3">{card.emoji}</div>
                    <p className="font-bold text-base mb-1" style={{ color: card.dark ? '#C4A9E8' : 'var(--text-1)' }}>{card.title}</p>
                    <p className="text-sm mb-0.5" style={{ color: card.dark ? 'rgba(255,255,255,0.55)' : 'var(--text-2)' }}>{card.sub}</p>
                    <p className="text-sm" style={{ color: card.dark ? '#A8C4DA' : 'var(--text-3)' }}>{card.sub2}</p>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </AppLayout>
      </div>
    </>
  )
}
