'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type AstroPage = 'cosmic' | 'moon' | 'transits' | 'chart' | 'spirit' | 'crystals' | 'love' | 'forecast' | 'deep'

const PAGES: { id: AstroPage; label: string; emoji: string }[] = [
  { id: 'cosmic',   label: 'Cosmic',    emoji: '✨' },
  { id: 'moon',     label: 'Moon',      emoji: '🌙' },
  { id: 'transits', label: 'Transits',  emoji: '🪐' },
  { id: 'chart',    label: 'Chart',     emoji: '⭕' },
  { id: 'spirit',   label: 'Spirit',    emoji: '🪷' },
  { id: 'crystals', label: 'Crystals',  emoji: '🔮' },
  { id: 'love',     label: 'Love',      emoji: '💗' },
  { id: 'forecast', label: 'Forecast',  emoji: '📅' },
  { id: 'deep',     label: 'Deep Dive', emoji: '🌌' },
]

const MOON_PHASES = [
  { name: 'New Moon',        emoji: '🌑', keyword: 'Intentions', ritual: 'Set one intention. Write it. Light a candle.' },
  { name: 'Waxing Crescent', emoji: '🌒', keyword: 'Growth',     ritual: 'Take one step toward something you started.' },
  { name: 'First Quarter',   emoji: '🌓', keyword: 'Action',     ritual: 'Push through resistance. Keep going.' },
  { name: 'Waxing Gibbous',  emoji: '🌔', keyword: 'Refine',     ritual: 'Adjust. What needs to shift before the full moon?' },
  { name: 'Full Moon',       emoji: '🌕', keyword: 'Release',    ritual: 'Write what you are releasing. Burn it or tear it up.' },
  { name: 'Waning Gibbous',  emoji: '🌖', keyword: 'Gratitude',  ritual: 'List 3 things the last cycle brought you.' },
  { name: 'Last Quarter',    emoji: '🌗', keyword: 'Let go',     ritual: 'Clear one thing — physical or emotional.' },
  { name: 'Waning Crescent', emoji: '🌘', keyword: 'Rest',       ritual: 'Do less. Restore. Prepare for the new cycle.' },
]

const CRYSTALS = [
  { name: 'Amethyst',         tags: 'Calm · Clarity · Protection',       color: '#8B6FB8', emoji: '🔮', use: 'Hold during meditation or place on your crown.' },
  { name: 'Labradorite',      tags: 'Intuition · Magic · Vision',         color: '#4A7FB8', emoji: '✨', use: 'Carry when you need to trust your gut.' },
  { name: 'Rose Quartz',      tags: 'Self-love · Healing · Softness',     color: '#E8B4B8', emoji: '💗', use: 'Place on your heart center when you feel closed off.' },
  { name: 'Citrine',          tags: 'Abundance · Motivation · Clarity',   color: '#E8C97A', emoji: '⭐', use: 'Keep near your workspace for creative flow.' },
  { name: 'Black Tourmaline', tags: 'Protection · Grounding · Safety',    color: '#3D3547', emoji: '🖤', use: 'Place at your front door or hold when anxious.' },
  { name: 'Selenite',         tags: 'Clarity · Higher guidance · Peace',  color: '#B8C4D8', emoji: '🌙', use: 'Use to clear other crystals. Never get it wet.' },
  { name: 'Moonstone',        tags: 'Intuition · Cycles · Feminine flow', color: '#C4D0E8', emoji: '🌕', use: 'Wear during new or full moon rituals.' },
]

const AFFIRMATIONS = [
  'I move with grace. I do not chase the day — I guide it.',
  'My ideas are safe. My energy is sacred. I choose what matters.',
  'I am not here to do everything. I am here to do what is mine.',
  'I trust my own voice. Clarity comes when I speak my truth.',
  'I am becoming the woman I see in my future.',
  'Rest is productive. Peace is power. Softness is strength.',
]

const SHADOW_QUESTIONS = [
  'What do I keep attracting that I haven\'t fully looked at yet?',
  'What emotion am I most uncomfortable sitting with?',
  'Where am I still performing instead of being real?',
  'What would I stop tolerating if I truly believed I deserved better?',
  'Who am I when no one is watching?',
]

function getTodayIndex<T>(arr: T[]) { return new Date().getDate() % arr.length }

function getMoonPhase(): (typeof MOON_PHASES)[0] {
  const known = new Date('2024-01-11').getTime()
  const days = (Date.now() - known) / (1000 * 60 * 60 * 24)
  return MOON_PHASES[Math.floor(((days % 29.53) / 29.53) * 8)] ?? MOON_PHASES[0]
}

const ZOE_PLACEMENTS = [
  { planet: 'Sun',     sign: 'Scorpio',     house: '6th', keyword: 'Intensity · Depth · Transformation' },
  { planet: 'Moon',    sign: 'Cancer',      house: '2nd', keyword: 'Nurture · Safety · Home' },
  { planet: 'Rising',  sign: 'Gemini',      house: '1st', keyword: 'Curiosity · Movement · Duality' },
  { planet: 'Mercury', sign: 'Scorpio',     house: '6th', keyword: 'Deep truth · Investigation' },
  { planet: 'Venus',   sign: 'Sagittarius', house: '7th', keyword: 'Freedom · Adventure · Honesty in love' },
  { planet: 'Mars',    sign: 'Libra',       house: '5th', keyword: 'Action through harmony · Decisive but fair' },
  { planet: 'Saturn',  sign: 'Taurus',      house: '12th', keyword: 'Hidden lessons around worth + security' },
]

const TODAYS_TRANSITS = [
  { planet: 'Moon', aspect: 'conjunct', target: 'Jupiter', sign: 'Cancer', effect: 'Emotional expansion. Generosity. Open heart energy.', type: 'supportive' },
  { planet: 'Saturn', aspect: 'opposite', target: 'Mars', sign: 'Libra', effect: 'Tension between what you want and what\'s allowed. Patience required.', type: 'challenging' },
  { planet: 'Venus', aspect: 'sextile', target: 'Neptune', sign: 'Pisces', effect: 'Romantic, dreamy, intuitive. Good for creative work and connection.', type: 'supportive' },
]

const LOVE_PATTERNS = [
  { pattern: 'Chasing clarity from silence', aligned: 'State your need once, clearly. Then let it land.' },
  { pattern: 'Sending messages from hurt',   aligned: 'Pause. Ground first. Write it — then decide.' },
  { pattern: 'Shrinking to keep the peace',  aligned: 'Your needs do not end the relationship. Express them.' },
  { pattern: 'Reading into everything',      aligned: 'Ask directly. Assume the kindest explanation first.' },
]

export default function AstrologyPage() {
  const [page, setPage] = useState<AstroPage>('cosmic')

  const moon    = getMoonPhase()
  const crystal = CRYSTALS[getTodayIndex(CRYSTALS)]
  const affirmation = AFFIRMATIONS[getTodayIndex(AFFIRMATIONS)]
  const shadowQ = SHADOW_QUESTIONS[getTodayIndex(SHADOW_QUESTIONS)]

  return (
    <div className="bg-app min-h-screen">
      <AppLayout noPad>
        <div className="lg:max-w-3xl lg:mx-auto lg:pt-20 lg:pb-[110px]">
        <div className="pt-12 pb-nav">

          {/* Header */}
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">⭐</span>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--violet)' }}>Astrology</p>
            </div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
              Your cosmic weather.
            </h1>
          </div>

          {/* Sub-page tabs */}
          <div className="px-4 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {PAGES.map(p => (
                <button key={p.id} onClick={() => setPage(p.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                  style={page === p.id
                    ? { background: 'var(--violet)', color: 'white' }
                    : { background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--surface-border)' }
                  }>
                  <span>{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page content */}
          <div className="px-4 space-y-4">

            {/* ── Cosmic Weather ── */}
            {page === 'cosmic' && (
              <>
                <div className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(26,21,53,0.97), rgba(36,28,72,0.97))',
                    border: '1px solid rgba(139,111,184,0.25)',
                  }}>
                  <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139,111,184,0.2) 0%, transparent 70%)' }} />
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C4A9E8' }}>Today&apos;s Cosmic Weather</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{moon.emoji}</span>
                    <div>
                      <p className="text-base font-bold text-white">{moon.name}</p>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Theme: {moon.keyword}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    The moon is in its {moon.name.toLowerCase()} phase. Energy is aligned with {moon.keyword.toLowerCase()}.
                    Use today&apos;s energy intentionally.
                  </p>
                  <p className="text-xs font-semibold" style={{ color: '#A8C4DA' }}>Crystal today: {crystal.name} — {crystal.tags}</p>
                </div>

                <div className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Personal Activation</p>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-1)' }}>
                    <strong>Scorpio Sun</strong> — your depth and intensity are your power today. Don&apos;t shrink them.
                  </p>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-1)' }}>
                    <strong>Cancer Moon</strong> — pay attention to what feels emotionally off. Your gut is accurate.
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-1)' }}>
                    <strong>Gemini Rising</strong> — you&apos;re communicating quickly today. Be intentional with your words.
                  </p>
                </div>

                <div className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>Highest Self Move Today</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>
                    Lead with clarity, not reaction. Before you respond to anything today, take one breath and ask: is this from fear or from truth?
                  </p>
                </div>
              </>
            )}

            {/* ── Moon Portal ── */}
            {page === 'moon' && (
              <>
                <div className="rounded-2xl p-5 text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(160deg, rgba(20,16,48,0.98), rgba(32,24,64,0.98))',
                    border: '1px solid rgba(139,111,184,0.2)',
                  }}>
                  <div className="text-6xl mb-3">{moon.emoji}</div>
                  <p className="text-xl font-bold text-white mb-1">{moon.name}</p>
                  <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>Theme: {moon.keyword}</p>
                  <div className="rounded-xl p-3 mx-4"
                    style={{ background: 'rgba(139,111,184,0.12)', border: '1px solid rgba(139,111,184,0.15)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: '#C4A9E8' }}>Ritual for this phase</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{moon.ritual}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {MOON_PHASES.map(p => (
                    <div key={p.name} className="rounded-xl p-3 text-center"
                      style={{
                        background: p.name === moon.name ? 'rgba(139,111,184,0.15)' : 'var(--surface)',
                        border: `1px solid ${p.name === moon.name ? 'rgba(139,111,184,0.3)' : 'var(--surface-border)'}`,
                      }}>
                      <div className="text-xl mb-1">{p.emoji}</div>
                      <p className="text-xs font-semibold" style={{ color: p.name === moon.name ? 'var(--violet)' : 'var(--text-3)', fontSize: 9 }}>
                        {p.keyword}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Moon Journal</p>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>
                    What are you releasing or calling in with this {moon.name.toLowerCase()}?
                  </p>
                  <textarea rows={4} placeholder="Write here..."
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                    style={{ background: 'var(--surface-subtle)', color: 'var(--text-1)', border: '1px solid var(--surface-border)' }}
                  />
                </div>
              </>
            )}

            {/* ── Transits ── */}
            {page === 'transits' && (
              <>
                <div className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Today&apos;s Sky → Your Chart</p>
                  <div className="space-y-3">
                    {TODAYS_TRANSITS.map((t, i) => (
                      <div key={i} className="rounded-xl p-3"
                        style={{
                          background: t.type === 'supportive' ? 'rgba(184,201,180,0.08)' : 'rgba(224,170,94,0.08)',
                          border: `1px solid ${t.type === 'supportive' ? 'rgba(184,201,180,0.15)' : 'rgba(224,170,94,0.15)'}`,
                        }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold" style={{ color: t.type === 'supportive' ? '#B8C9B4' : '#E0AA5E' }}>
                            {t.planet} {t.aspect} {t.target}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              background: t.type === 'supportive' ? 'rgba(184,201,180,0.15)' : 'rgba(224,170,94,0.15)',
                              color: t.type === 'supportive' ? '#B8C9B4' : '#E0AA5E',
                              fontSize: 9,
                            }}>
                            {t.type}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-2)' }}>{t.effect}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>Major Active Transits</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>2026 · Personal to your chart</p>
                  {[
                    { transit: 'Jupiter conjunct Cancer Moon', active: 'Final pass April 2026', desc: 'Most emotionally supported window. Open heart. Ready to receive.' },
                    { transit: 'Saturn opposite Mars in Libra', active: 'Active now – late 2026', desc: 'Relationship structures under pressure. Act from clarity, not fear.' },
                    { transit: 'Mercury Rx in Cancer', active: 'June 29 – July 23, 2026', desc: 'Old feelings resurface. Communication through tone and timing is loaded.' },
                  ].map((t, i) => (
                    <div key={i} className="py-3" style={{ borderBottom: i < 2 ? '1px solid var(--surface-border)' : 'none' }}>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-1)' }}>{t.transit}</p>
                      <p className="text-xs mb-1" style={{ color: 'var(--violet)' }}>{t.active}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{t.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Birth Chart ── */}
            {page === 'chart' && (
              <>
                <div className="rounded-2xl p-4 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(26,21,53,0.97), rgba(36,28,72,0.97))',
                    border: '1px solid rgba(139,111,184,0.2)',
                  }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#C4A9E8' }}>Zoe Taylor</p>
                  <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>November 14, 2000 · 7:04 PM · Sellersville, PA</p>
                  <div className="flex gap-4 mb-3">
                    {[['☀️', 'Scorpio', 'Sun'], ['🌙', 'Cancer', 'Moon'], ['⬆️', 'Gemini', 'Rising']].map(([e, sign, label]) => (
                      <div key={label} className="text-center">
                        <div className="text-2xl mb-0.5">{e}</div>
                        <p className="text-xs font-bold text-white">{sign}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Human Design · Self-Projected Projector 4/6</p>
                </div>

                <div className="space-y-2">
                  {ZOE_PLACEMENTS.map(p => (
                    <div key={p.planet} className="rounded-2xl p-4 flex items-center gap-3"
                      style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                      <div className="w-16 flex-shrink-0">
                        <p className="text-xs font-bold" style={{ color: 'var(--violet)' }}>{p.planet}</p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>House {p.house}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-1)' }}>{p.sign}</p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>{p.keyword}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Spirit + Rituals ── */}
            {page === 'spirit' && (
              <>
                <div className="rounded-2xl p-5"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>Daily Affirmation</p>
                  <p className="font-display text-base italic leading-relaxed" style={{ color: 'var(--text-1)' }}>
                    &ldquo;{affirmation}&rdquo;
                  </p>
                </div>

                <div className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>Shadow Question</p>
                  <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-1)' }}>
                    &ldquo;{shadowQ}&rdquo;
                  </p>
                </div>

                <div className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Today&apos;s Ritual</p>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>{moon.ritual}</p>
                  <div className="space-y-2">
                    {[
                      '5 minutes of silence before your phone',
                      'One thing you are grateful for — say it out loud',
                      'One thing you are releasing — write it down',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'rgba(139,111,184,0.15)', color: 'var(--violet)' }}>{i + 1}</span>
                        <p className="text-sm" style={{ color: 'var(--text-1)' }}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href="/spirit">
                  <button className="w-full py-3 rounded-2xl text-sm font-semibold"
                    style={{ background: 'rgba(139,111,184,0.08)', color: 'var(--violet)' }}>
                    Full Spirit Guide →
                  </button>
                </Link>
              </>
            )}

            {/* ── Crystals ── */}
            {page === 'crystals' && (
              <>
                <div className="rounded-2xl p-5 text-center"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Crystal of the Day</p>
                  <div className="text-5xl mb-3">{crystal.emoji}</div>
                  <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>{crystal.name}</p>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-3)' }}>{crystal.tags}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{crystal.use}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {CRYSTALS.filter(c => c.name !== crystal.name).map(c => (
                    <div key={c.name} className="rounded-2xl p-4"
                      style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                      <div className="text-2xl mb-2">{c.emoji}</div>
                      <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-1)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{c.tags}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Love ── */}
            {page === 'love' && (
              <>
                <div className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(26,21,53,0.97), rgba(36,28,72,0.97))',
                    border: '1px solid rgba(184,139,184,0.2)',
                  }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C4A9E8' }}>Zoe + Kaleb · Synastry</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                      { label: 'Emotional', score: '8/10', color: '#B8C9B4' },
                      { label: 'Long-term', score: '8.5/10', color: '#C4A9E8' },
                      { label: 'Chemistry', score: '9/10', color: '#E8B4B8' },
                      { label: 'Communication', score: '5→8/10', color: '#A8C4DA' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3"
                        style={{ background: 'rgba(139,111,184,0.1)', border: '1px solid rgba(139,111,184,0.15)' }}>
                        <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
                        <p className="text-base font-bold" style={{ color: s.color }}>{s.score}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Cancer Moon (Zoe) + Taurus Moon (Kaleb) — one of the most emotionally compatible Moon pairings. Both want safety, loyalty, comfort, and consistency.
                  </p>
                </div>

                <div className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Your Patterns</p>
                  <div className="space-y-3">
                    {LOVE_PATTERNS.map((p, i) => (
                      <div key={i} className="rounded-xl p-3"
                        style={{ background: 'var(--surface-subtle)', border: '1px solid var(--surface-border)' }}>
                        <p className="text-xs mb-1" style={{ color: '#E0AA5E' }}>Pattern: {p.pattern}</p>
                        <p className="text-xs" style={{ color: 'var(--text-1)' }}>→ {p.aligned}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href="/relationships">
                  <button className="w-full py-3 rounded-2xl text-sm font-semibold"
                    style={{ background: 'rgba(139,111,184,0.08)', color: 'var(--violet)' }}>
                    Full Relationship Guide →
                  </button>
                </Link>
              </>
            )}

            {/* ── Forecast ── */}
            {page === 'forecast' && (
              <div className="space-y-3">
                {[
                  { period: 'Now – July 2026', theme: 'Emotional conversations + nervous system testing', detail: 'Mercury Rx in Cancer June 29 – July 23. Old feelings, attachment fears, communication loaded with tone and timing.' },
                  { period: 'August 2026', theme: 'Romance gets easier', detail: 'Venus in Libra hits Kaleb\'s Venus + Zoe\'s Mars. Chemistry feels natural, flirty, sweet. Best window for dates and honest-but-gentle talks.' },
                  { period: 'Oct – Nov 2026', theme: 'Major relationship review', detail: 'Venus retrograde Scorpio → Libra. Venus retrograde + Mercury retrograde both active. Truth has to come out.' },
                  { period: 'Spring 2027', theme: 'Commitment energy strengthens', detail: 'Jupiter trine Saturn April 2027. Growth + structure alignment. "Make it real" energy.' },
                  { period: '2028', theme: 'The serious long-term test', detail: 'Saturn enters Taurus (Kaleb\'s Moon). Commitment, security, emotional safety — all come into clear focus.' },
                ].map((f, i) => (
                  <div key={i} className="rounded-2xl p-4"
                    style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                    <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--violet)' }}>{f.period}</p>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>{f.theme}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Deep Dives ── */}
            {page === 'deep' && (
              <div className="space-y-3">
                {[
                  { title: 'Scorpio Sun — Full Read', sub: 'Depth, intensity, transformation, loyalty, shadow work' },
                  { title: 'Cancer Moon — Full Read', sub: 'Emotional safety, nurturing, home, attachment patterns' },
                  { title: 'Gemini Rising — Full Read', sub: 'First impression, communication style, social energy' },
                  { title: 'North Node in Cancer', sub: 'Soul direction: build home, safety, deep emotional roots' },
                  { title: 'Chiron in Sagittarius', sub: 'Wound around freedom, belief, being too much or too free' },
                  { title: 'Self-Projected Projector 4/6', sub: 'Human Design: speak to hear yourself, network is destiny' },
                  { title: 'Venus in Sagittarius', sub: 'Love needs freedom, honesty, adventure, space to roam' },
                  { title: 'Saturn in Taurus (12th)', sub: 'Hidden lessons around worth, security, the body, money' },
                ].map((d, i) => (
                  <div key={i} className="rounded-2xl p-4 flex items-center justify-between"
                    style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-1)' }}>{d.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{d.sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-3)' }} />
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
        </div>
      </AppLayout>
    </div>
  )
}
