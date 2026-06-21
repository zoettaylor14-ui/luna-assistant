'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { Compass, Sparkles, ChevronRight, Mic } from 'lucide-react'
import Link from 'next/link'

const CAREER_CONTAINERS = [
  { label: 'Client Work',        items: ['EHM Strategies', 'DRYP Studio', 'Babe Coffee Lounge', 'Flanagan\'s', 'Villa Residential'], color: 'var(--lunar)',  bg: 'rgba(168,196,218,0.12)' },
  { label: 'DRYP Growth',        items: ['DRYP Digital', 'DRYPHub CRM', 'Newsletter Studio', 'Social media'],                         color: 'var(--violet)', bg: 'rgba(139,111,184,0.1)'  },
  { label: 'Money Moves',        items: ['TikTok Shop', 'Dropshipping', 'Trading', 'Passive income'],                                  color: 'var(--golden)', bg: 'rgba(201,169,110,0.1)'  },
  { label: 'Creative Identity',  items: ['Content creation', 'Sewing + clothing brand', 'Painting', 'Dance', 'Tattoo art'],            color: 'var(--blush)',  bg: 'rgba(232,192,194,0.12)' },
  { label: 'Future Projects',    items: ['Nurturly', 'LINK\'d UP', 'Bikini brand', 'Books', '144-client prep'],                        color: 'var(--herb)',   bg: 'rgba(184,200,180,0.12)' },
  { label: 'Parked Ideas',       items: ['Wait for the right moment', 'Your ideas are safe here'],                                     color: 'var(--mist)',   bg: 'rgba(158,149,172,0.08)' },
]

const RECOGNITION_QUESTIONS = [
  'Am I being asked for this, or am I pushing my way in?',
  'Is this opening naturally, or am I forcing the door?',
  'Are people recognizing me for this specific work?',
  'Am I working from invitation or from fear of being unseen?',
  'Where is the energy coming toward me right now?',
]

interface CareerResult {
  career_energy?: string
  highest_use_work?: string[]
  recognition_check?: string
  voice_clarity_prompt?: string
  career_lesson?: string
  current_pattern?: string
  highest_self_action?: string
  career_message?: string
  chart_theme?: string
}

export default function CareerCompassScreen() {
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<CareerResult | null>(null)
  const [activeTab, setActiveTab] = useState<'today' | 'containers' | 'weekly'>('today')
  const [weekInput, setWeekInput] = useState('')
  const [weekResult, setWeekResult] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/career-compass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      setResult(await res.json())
    } catch {
      setResult({
        career_energy: 'Today is a day for Projector wisdom, not Projector grinding. Look at what is being invited and put your full attention there.',
        highest_use_work: ['Complete the client deliverable that is already in motion', 'Reply to the one email that unblocks progress', 'Do one DRYP thing that moves a system forward'],
        recognition_check: 'Check: Is this work I was invited to do, or am I trying to prove something?',
        voice_clarity_prompt: 'Talk through what you think you need to do today. What did you hear yourself say? That is the truth.',
        career_lesson: "Today's lesson connects to your Virgo Midheaven: turn scattered energy into one clean next step.",
        current_pattern: 'Trying to do all career lanes at once',
        highest_self_action: 'Choose the one container that creates the most relief or money today. Everything else stays safe.',
        career_message: 'Your work becomes powerful when you stop chasing and start choosing.',
        chart_theme: 'Virgo Midheaven — serve with precision, not scattered effort.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-sanctuary min-h-screen">
      <AppLayout noPad>
        <div className="px-5 pt-14 pb-nav">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(168,196,218,0.15)' }}>
              <Compass className="h-5 w-5" style={{ color: 'var(--lunar)' }} />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--lunar)' }}>Career Compass</p>
          </div>

          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--depth)' }}>
            Where is your energy best spent today?
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--mid)' }}>
            You are not here to do everything. You are here to see what matters.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['today', 'containers', 'weekly'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`tab-pill ${activeTab === t ? 'active' : ''}`}>
                {t === 'today' ? '🧭 Today' : t === 'containers' ? '📦 Lanes' : '📅 Week'}
              </button>
            ))}
          </div>

          {/* Today tab */}
          {activeTab === 'today' && (
            <div className="space-y-4 animate-fade-up">
              {!result ? (
                <button onClick={generate} disabled={loading}
                  className="w-full py-4 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, var(--lunar), #7BA8C8)' }}>
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  {loading ? 'Reading your career energy...' : 'Generate Career Compass'}
                </button>
              ) : (
                <>
                  {/* Career energy */}
                  <GlassCard>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--lunar)' }}>Career energy today</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--depth)' }}>{result.career_energy}</p>
                    {result.chart_theme && <p className="text-xs italic mt-2" style={{ color: 'var(--mist)' }}>{result.chart_theme}</p>}
                  </GlassCard>

                  {/* Highest use work */}
                  {result.highest_use_work && result.highest_use_work.length > 0 && (
                    <GlassCard soul>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--violet)' }}>Highest-use work today</p>
                      {result.highest_use_work.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: i < result.highest_use_work!.length - 1 ? '1px solid rgba(139,111,184,0.08)' : 'none' }}>
                          <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: 'var(--violet)' }}>0{i + 1}</span>
                          <p className="text-sm" style={{ color: 'var(--depth)' }}>{w}</p>
                        </div>
                      ))}
                    </GlassCard>
                  )}

                  {/* Recognition check */}
                  <GlassCard>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--golden)' }}>Recognition check</p>
                    <p className="text-sm italic" style={{ color: 'var(--depth)' }}>{result.recognition_check}</p>
                    <div className="mt-3 space-y-1.5">
                      {RECOGNITION_QUESTIONS.slice(0, 3).map((q, i) => (
                        <p key={i} className="text-xs" style={{ color: 'var(--mist)' }}>· {q}</p>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Voice clarity */}
                  {result.voice_clarity_prompt && (
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(139,111,184,0.06)', border: '1px solid rgba(139,111,184,0.1)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--violet)' }}>Voice clarity</p>
                      <p className="text-sm font-display italic" style={{ color: 'var(--depth)' }}>{result.voice_clarity_prompt}</p>
                      <Link href="/dictation">
                        <button className="mt-3 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--violet)' }}>
                          <Mic className="h-3.5 w-3.5" /> Speak it out →
                        </button>
                      </Link>
                    </div>
                  )}

                  {/* Pattern vs highest self */}
                  {result.current_pattern && (
                    <GlassCard>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--mist)' }}>Current pattern → Highest self</p>
                      <div className="space-y-2">
                        <div className="rounded-xl p-3" style={{ background: 'rgba(224,94,94,0.06)', border: '1px solid rgba(224,94,94,0.1)' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: '#E05E5E' }}>Pattern</p>
                          <p className="text-sm" style={{ color: 'var(--depth)' }}>{result.current_pattern}</p>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: 'rgba(90,138,90,0.06)', border: '1px solid rgba(90,138,90,0.1)' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: '#5A8A5A' }}>Highest self</p>
                          <p className="text-sm" style={{ color: 'var(--depth)' }}>{result.highest_self_action}</p>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {/* Career lesson */}
                  {result.career_lesson && (
                    <GlassCard>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--lunar)' }}>Today&apos;s career lesson</p>
                      <p className="text-sm" style={{ color: 'var(--mid)' }}>{result.career_lesson}</p>
                    </GlassCard>
                  )}

                  {/* Message */}
                  {result.career_message && (
                    <div className="text-center py-4">
                      <p className="font-display text-base italic" style={{ color: 'var(--mid)' }}>
                        &ldquo;{result.career_message}&rdquo;
                      </p>
                    </div>
                  )}

                  <button onClick={() => setResult(null)} className="w-full py-3 rounded-2xl text-sm font-medium"
                    style={{ color: 'var(--mist)', background: 'rgba(139,111,184,0.06)' }}>
                    Regenerate
                  </button>
                </>
              )}
            </div>
          )}

          {/* Containers tab */}
          {activeTab === 'containers' && (
            <div className="space-y-3 animate-fade-up">
              <p className="text-sm mb-2" style={{ color: 'var(--mid)' }}>
                Your career is multi-lane. These are your containers — your ideas are safe here.
              </p>
              {CAREER_CONTAINERS.map((c, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--depth)' }}>{c.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.items.map((item, j) => (
                      <span key={j} className="text-xs px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.color }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-xs text-center italic pt-2" style={{ color: 'var(--faint)' }}>
                One main priority. Everything else stays safe.
              </p>
            </div>
          )}

          {/* Weekly tab */}
          {activeTab === 'weekly' && (
            <div className="space-y-4 animate-fade-up">
              <p className="text-sm mb-2" style={{ color: 'var(--mid)' }}>
                Reflect on your week. What did it teach you?
              </p>
              <div className="glass-card p-4">
                <textarea
                  value={weekInput}
                  onChange={e => setWeekInput(e.target.value)}
                  placeholder="What work gave me energy? Where was I recognized? Where did I force? What did I finish?..."
                  rows={6}
                  className="w-full bg-transparent outline-none text-sm resize-none"
                  style={{ color: 'var(--depth)' }}
                />
              </div>
              <div className="space-y-2">
                {[
                  'What work gave me energy this week?',
                  'Where was I recognized?',
                  'Where did I force something?',
                  'What should become a system?',
                  'What should be parked?',
                  'What did this week teach me?',
                ].map((q, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--mist)' }}>
                    <span style={{ color: 'var(--violet)' }}>·</span> {q}
                  </div>
                ))}
              </div>
              <button
                className="w-full py-4 rounded-2xl font-semibold text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, var(--lunar), #7BA8C8)' }}>
                <Sparkles className="inline h-4 w-4 mr-2" />
                Reflect on my week
              </button>
            </div>
          )}

        </div>
      </AppLayout>
    </div>
  )
}
