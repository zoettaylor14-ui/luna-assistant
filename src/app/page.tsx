'use client'
import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { format } from 'date-fns'
import {
  Heart, Zap, Moon, BriefcaseIcon, Sparkles, Compass,
  Star, Calendar, ChevronRight, ArrowRight, Sun
} from 'lucide-react'
// Compass used in desktop layout only
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
  'Today asks you to move slowly before you move fast.',
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
  { name: 'New Moon',       emoji: '🌑', keyword: 'Intentions' },
  { name: 'Waxing Crescent',emoji: '🌒', keyword: 'Growth'     },
  { name: 'First Quarter',  emoji: '🌓', keyword: 'Action'     },
  { name: 'Waxing Gibbous', emoji: '🌔', keyword: 'Refine'     },
  { name: 'Full Moon',      emoji: '🌕', keyword: 'Release'    },
  { name: 'Waning Gibbous', emoji: '🌖', keyword: 'Gratitude'  },
  { name: 'Last Quarter',   emoji: '🌗', keyword: 'Let go'     },
  { name: 'Waning Crescent',emoji: '🌘', keyword: 'Rest'       },
]

function getTodayIndex<T>(arr: T[]) {
  return new Date().getDate() % arr.length
}

function getMoonPhase(): (typeof MOON_PHASES)[0] {
  const known = new Date('2024-01-11').getTime()
  const days = (Date.now() - known) / (1000 * 60 * 60 * 24)
  const phase = Math.floor(((days % 29.53) / 29.53) * 8)
  return MOON_PHASES[phase] ?? MOON_PHASES[0]
}

function getTimeGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Mini SVG Donut ─────────────────────────────────────────
function TaskDonut({ urgent, today, soon, later }: { urgent: number; today: number; soon: number; later: number }) {
  const total = urgent + today + soon + later || 1
  const r = 36
  const circ = 2 * Math.PI * r
  const segs = [
    { val: urgent, color: '#E05E5E' },
    { val: today,  color: '#8B6FB8' },
    { val: soon,   color: '#A8C4DA' },
    { val: later,  color: '#C4BECE' },
  ]
  let offset = 0
  const paths = segs.map(({ val, color }) => {
    const dash = (val / total) * circ
    const el = (
      <circle key={color} cx="44" cy="44" r={r}
        fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 44 44)"
      />
    )
    offset += dash
    return el
  })
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(139,111,184,0.08)" strokeWidth="10" />
      {paths}
      <text x="44" y="40" textAnchor="middle" className="font-bold" style={{ fontSize: 18, fill: 'var(--depth)', fontWeight: 700 }}>{total}</text>
      <text x="44" y="56" textAnchor="middle" style={{ fontSize: 10, fill: 'var(--mist)' }}>Tasks</text>
    </svg>
  )
}

// ─── Stat card ───────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl p-3 flex flex-col items-center gap-2"
      style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(139,111,184,0.08)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>{label}</p>
      <div className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: `${color}18`, border: `2px solid ${color}40` }}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold" style={{ color: 'var(--depth)' }}>{value}</p>
        {sub && <p className="text-[10px]" style={{ color: 'var(--mist)' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function SanctuaryPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const hour        = new Date().getHours()
  const today       = format(new Date(), 'EEEE, MMMM d')
  const greeting    = getTimeGreeting(hour)
  const affirmation = AFFIRMATIONS[getTodayIndex(AFFIRMATIONS)]
  const crystal     = CRYSTALS[getTodayIndex(CRYSTALS)]
  const spiritMsg   = SPIRIT_MESSAGES[getTodayIndex(SPIRIT_MESSAGES)]
  const moon        = getMoonPhase()

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #EDE8F5 0%, #F5F0FC 30%, #FDF8F3 70%)' }}>

      {/* Dreamy background orbs */}
      <div className="fixed -top-32 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,159,216,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed top-40 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,196,218,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <AppLayout noPad>
        {/* ══════════════════════════════════════════
            MOBILE / TABLET  (hidden on desktop)
        ══════════════════════════════════════════ */}
        <div className="lg:hidden px-4 pt-12 pb-nav space-y-3">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--mist)' }}>{today}</p>
              <h1 className="font-display text-[2rem] font-bold leading-tight" style={{ color: 'var(--depth)' }}>
                {greeting}, Zoe ✨
              </h1>
              <p className="text-sm mt-1 font-display italic" style={{ color: 'var(--violet)' }}>
                You are not behind. You are returning.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
              <div className="text-3xl opacity-80">🌕</div>
              <div className="w-10 h-10 rounded-full overflow-hidden"
                style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))', border: '2px solid white' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">Z</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4-stat row ── */}
          <div className="flex gap-2">
            <StatCard
              icon={<Heart className="h-4 w-4" style={{ color: '#8B6FB8' }} />}
              label="Mood" value="Calm" sub="7/10" color="#8B6FB8"
            />
            <StatCard
              icon={<Zap className="h-4 w-4" style={{ color: '#C9A96E' }} />}
              label="Energy" value="Steady" sub="6/10" color="#C9A96E"
            />
            <StatCard
              icon={<Moon className="h-4 w-4" style={{ color: '#6A4F9B' }} />}
              label="Sleep" value="Good" sub="7.5 hrs" color="#6A4F9B"
            />
            <StatCard
              icon={<span className="text-base">{moon.emoji}</span>}
              label="Moon" value={moon.name.split(' ').slice(-1)[0]} sub={moon.keyword} color="#A8C4DA"
            />
          </div>

          {/* ── Daily Affirmation ── */}
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 20px rgba(139,111,184,0.06)' }}>
            <span className="text-4xl flex-shrink-0">🔮</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--mist)' }}>Daily Affirmation</p>
              <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--depth)' }}>
                {affirmation}
              </p>
            </div>
            <Heart className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--faint)', strokeWidth: 1.5 }} />
          </div>

          {/* ── Next Meeting + Today's Priority ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Next Meeting */}
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 16px rgba(139,111,184,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>Next Meeting</p>
                <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--mist)' }} />
              </div>
              <p className="text-lg font-bold mb-0.5" style={{ color: 'var(--depth)' }}>11:00 AM</p>
              <p className="text-xs leading-snug mb-3" style={{ color: 'var(--mid)' }}>DRYP Digital Weekly Strategy Call</p>
              <Link href="/today">
                <div className="px-3 py-1.5 rounded-xl text-center text-xs font-semibold"
                  style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                  Prep Meeting
                </div>
              </Link>
            </div>

            {/* Today's Priority */}
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 16px rgba(139,111,184,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>Today&apos;s Priority</p>
                <Star className="h-3.5 w-3.5" style={{ color: '#C9A96E', strokeWidth: 1.5 }} />
              </div>
              <p className="text-sm font-bold leading-snug mb-1" style={{ color: 'var(--depth)' }}>
                Review client website plan + send feedback
              </p>
              <p className="text-[10px] mb-3" style={{ color: 'var(--mist)' }}>This unlocks everything else.</p>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(139,111,184,0.1)' }}>
                <div className="h-1.5 rounded-full w-0" style={{ background: 'var(--violet)' }} />
              </div>
              <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--mist)' }}>0/3</p>
            </div>
          </div>

          {/* ── Daily Work Brief ── */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 16px rgba(139,111,184,0.06)' }}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BriefcaseIcon className="h-4 w-4" style={{ color: 'var(--violet)' }} />
                  <p className="text-sm font-bold" style={{ color: 'var(--depth)' }}>Daily Work Brief</p>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--mid)' }}>
                  You have 3 meetings, 2 urgent emails, and 5 tasks that matter most.
                </p>
                <Link href="/today">
                  <div className="inline-flex px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                    View Brief
                  </div>
                </Link>
              </div>
              <div className="flex-shrink-0">
                <TaskDonut urgent={2} today={3} soon={4} later={6} />
                <div className="space-y-1 mt-1">
                  {[
                    { color: '#E05E5E', label: '2 Urgent'  },
                    { color: '#8B6FB8', label: '3 Today'   },
                    { color: '#A8C4DA', label: '4 Soon'    },
                    { color: '#C4BECE', label: '6 Later'   },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-[10px]" style={{ color: 'var(--mid)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── 3-col: Spirit · Crystal · Career ── */}
          <div className="grid grid-cols-3 gap-2">
            {/* Spirit Message */}
            <div className="rounded-2xl p-3"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.08)' }}>
              <div className="text-base mb-2">🪷</div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--mist)' }}>Spirit</p>
              <p className="text-[11px] leading-snug mb-3" style={{ color: 'var(--mid)' }}>{spiritMsg}</p>
              <Link href="/spirit">
                <p className="text-[11px] font-semibold" style={{ color: 'var(--violet)' }}>Read More →</p>
              </Link>
            </div>

            {/* Crystal */}
            <div className="rounded-2xl p-3 flex flex-col items-center text-center"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.08)' }}>
              <div className="text-base mb-2">🔮</div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--mist)' }}>Crystal</p>
              <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--depth)' }}>{crystal.name}</p>
              <p className="text-[10px] leading-snug" style={{ color: 'var(--mid)' }}>{crystal.tags}</p>
            </div>

            {/* Career Compass */}
            <div className="rounded-2xl p-3"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.08)' }}>
              <div className="text-base mb-2">🧭</div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--mist)' }}>Career</p>
              <p className="text-[11px] leading-snug mb-3" style={{ color: 'var(--mid)' }}>Align your work with recognition and highest use.</p>
              <Link href="/career">
                <p className="text-[11px] font-semibold" style={{ color: 'var(--violet)' }}>Open →</p>
              </Link>
            </div>
          </div>

          {/* ── Mode buttons ── */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/late-mode">
              <div className="rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.08)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,169,110,0.12)' }}>
                  <Sun className="h-5 w-5" style={{ color: '#C9A96E' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--depth)' }}>I Woke Up Late</p>
                  <p className="text-[10px]" style={{ color: 'var(--mist)' }}>Reset without guilt</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 ml-auto" style={{ color: 'var(--faint)' }} />
              </div>
            </Link>
            <Link href="/rush-mode">
              <div className="rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.08)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,111,184,0.1)' }}>
                  <Zap className="h-5 w-5" style={{ color: 'var(--violet)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--depth)' }}>I&apos;m Rushing</p>
                  <p className="text-[10px]" style={{ color: 'var(--mist)' }}>Sacred minimum mode</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 ml-auto" style={{ color: 'var(--faint)' }} />
              </div>
            </Link>
          </div>

          {/* ── Tonight's Protection sticky hint ── */}
          <Link href="/night">
            <div className="rounded-2xl px-4 py-3.5 flex items-center justify-between active:scale-[0.99] transition-transform"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(139,111,184,0.12)', boxShadow: '0 2px 16px rgba(139,111,184,0.08)' }}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🌙</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--violet)' }}>Tonight&apos;s Protection</p>
                  <p className="text-[11px]" style={{ color: 'var(--mist)' }}>Start wind-down by 9:30 PM</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: 'var(--violet)' }} />
            </div>
          </Link>

        </div>

        {/* ══════════════════════════════════════════
            DESKTOP  (hidden on mobile/tablet)
            Apple-style large organized tile grid
        ══════════════════════════════════════════ */}
        <div className="hidden lg:block pt-10 pb-12">

          {/* ── Desktop header ── */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--mist)' }}>{today}</p>
              <h1 className="font-display text-4xl font-bold" style={{ color: 'var(--depth)' }}>
                {greeting}, Zoe ✨
              </h1>
              <p className="text-base mt-1.5 font-display italic" style={{ color: 'var(--violet)' }}>
                You are not behind. You are returning.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-semibold" style={{ color: 'var(--mist)' }}>Moon Phase</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--depth)' }}>{moon.emoji} {moon.name}</p>
                <p className="text-xs" style={{ color: 'var(--mist)' }}>{moon.keyword}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))', border: '3px solid white', boxShadow: '0 4px 16px rgba(139,111,184,0.3)' }}>
                <span className="text-white text-lg font-bold">Z</span>
              </div>
            </div>
          </div>

          {/* ── Row 1: 4 stat tiles ── */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { icon: <Heart className="h-6 w-6" style={{ color: '#8B6FB8' }} />, label: 'Mood', value: 'Calm', sub: '7 / 10', color: '#8B6FB8', bg: 'rgba(139,111,184,0.08)' },
              { icon: <Zap className="h-6 w-6" style={{ color: '#C9A96E' }} />, label: 'Energy', value: 'Steady', sub: '6 / 10', color: '#C9A96E', bg: 'rgba(201,169,110,0.1)' },
              { icon: <Moon className="h-6 w-6" style={{ color: '#6A4F9B' }} />, label: 'Sleep', value: 'Good', sub: '7.5 hrs', color: '#6A4F9B', bg: 'rgba(106,79,155,0.08)' },
              { icon: <Sparkles className="h-6 w-6" style={{ color: '#A8C4DA' }} />, label: 'Spirit', value: 'Aligned', sub: 'Projector day', color: '#A8C4DA', bg: 'rgba(168,196,218,0.15)' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 20px rgba(139,111,184,0.06)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--mist)' }}>{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--depth)' }}>{s.value}</p>
                  <p className="text-sm" style={{ color: 'var(--mist)' }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Row 2: 3-column main grid ── */}
          <div className="grid grid-cols-3 gap-4 mb-4">

            {/* Col 1: Daily Brief + Affirmation */}
            <div className="space-y-4">
              {/* Daily Brief */}
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 20px rgba(139,111,184,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <BriefcaseIcon className="h-5 w-5" style={{ color: 'var(--violet)' }} />
                  <p className="text-sm font-bold" style={{ color: 'var(--depth)' }}>Daily Work Brief</p>
                </div>
                <div className="flex items-center gap-6">
                  <TaskDonut urgent={2} today={3} soon={4} later={6} />
                  <div className="space-y-2">
                    {[
                      { color: '#E05E5E', label: '2 Urgent'  },
                      { color: '#8B6FB8', label: '3 Today'   },
                      { color: '#A8C4DA', label: '4 Soon'    },
                      { color: '#C4BECE', label: '6 Later'   },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--mid)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--mid)' }}>
                  3 meetings · 2 urgent emails · 5 priority tasks
                </p>
                <Link href="/today">
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                    Open Today <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </div>

              {/* Affirmation */}
              <div className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(135deg, rgba(139,111,184,0.08) 0%, rgba(168,196,218,0.08) 100%)', border: '1px solid rgba(139,111,184,0.1)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--violet)' }}>Daily Affirmation</p>
                <p className="font-display text-lg italic leading-relaxed" style={{ color: 'var(--depth)' }}>
                  &ldquo;{affirmation}&rdquo;
                </p>
              </div>
            </div>

            {/* Col 2: Meeting + Priority + Quick actions */}
            <div className="space-y-4">
              {/* Next Meeting */}
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 20px rgba(139,111,184,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>Next Meeting</p>
                  <Calendar className="h-4 w-4" style={{ color: 'var(--mist)' }} />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: 'var(--depth)' }}>11:00 AM</p>
                <p className="text-sm mb-4" style={{ color: 'var(--mid)' }}>DRYP Digital Weekly Strategy Call</p>
                <Link href="/today">
                  <div className="px-4 py-2.5 rounded-xl text-center text-sm font-semibold"
                    style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                    Prep for Meeting →
                  </div>
                </Link>
              </div>

              {/* Priority */}
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 20px rgba(139,111,184,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>Today&apos;s Priority</p>
                  <Star className="h-4 w-4" style={{ color: '#C9A96E' }} />
                </div>
                <p className="text-base font-bold leading-snug mb-2" style={{ color: 'var(--depth)' }}>
                  Review client website plan + send feedback
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--mist)' }}>This unlocks everything else.</p>
                <div className="h-2 rounded-full mb-1" style={{ background: 'rgba(139,111,184,0.1)' }}>
                  <div className="h-2 rounded-full w-0" style={{ background: 'var(--violet)' }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--mist)' }}>0 / 3 steps</p>
              </div>

              {/* Mode buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/late-mode">
                  <div className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
                    style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(201,169,110,0.2)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(201,169,110,0.12)' }}>
                      <Sun className="h-5 w-5" style={{ color: '#C9A96E' }} />
                    </div>
                    <p className="text-xs font-bold" style={{ color: 'var(--depth)' }}>I Woke Up Late</p>
                    <p className="text-[10px]" style={{ color: 'var(--mist)' }}>Reset without guilt</p>
                  </div>
                </Link>
                <Link href="/rush-mode">
                  <div className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
                    style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(139,111,184,0.15)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(139,111,184,0.1)' }}>
                      <Zap className="h-5 w-5" style={{ color: 'var(--violet)' }} />
                    </div>
                    <p className="text-xs font-bold" style={{ color: 'var(--depth)' }}>I&apos;m Rushing</p>
                    <p className="text-[10px]" style={{ color: 'var(--mist)' }}>Sacred minimum</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Col 3: Spirit + Crystal + Career */}
            <div className="space-y-4">
              {/* Spirit Message */}
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 20px rgba(139,111,184,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🪷</span>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>Spirit Today</p>
                </div>
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--mid)' }}>{spiritMsg}</p>
                <Link href="/spirit">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                    Open Spirit <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </div>

              {/* Crystal */}
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 20px rgba(139,111,184,0.06)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🔮</span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>Crystal Today</p>
                    <p className="text-base font-bold" style={{ color: 'var(--depth)' }}>{crystal.name}</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--mid)' }}>{crystal.tags}</p>
              </div>

              {/* Career + Tonight */}
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(139,111,184,0.1)', boxShadow: '0 2px 20px rgba(139,111,184,0.06)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="h-5 w-5" style={{ color: 'var(--violet)' }} />
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>Career Compass</p>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--mid)' }}>Align your work with recognition and highest use.</p>
                <Link href="/career">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                    Open <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Row 3: Full-width tonight strip ── */}
          <Link href="/night">
            <div className="rounded-2xl px-6 py-5 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(139,111,184,0.12)', boxShadow: '0 2px 20px rgba(139,111,184,0.08)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(106,79,155,0.1)' }}>
                  <span className="text-xl">🌙</span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--violet)' }}>Tonight&apos;s Protection</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--mist)' }}>Start wind-down by 9:30 PM · Protect your sleep</p>
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--violet)' }}>
                <span className="text-sm font-semibold">Plan my night</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>

        </div>
      </AppLayout>
    </div>
  )
}
