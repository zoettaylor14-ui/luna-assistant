'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { Zap, Sparkles } from 'lucide-react'
import { SmartInput } from '@/components/ui/SmartInput'

const STATIC_MIRRORS = [
  {
    pattern: 'I woke up late, so I feel like the day is ruined.',
    highest: 'One late start does not define me. I recalibrate, choose one priority, and begin from here.',
    bridge: 'Open Late Mode and choose just one clear step.',
    chart: 'Cancer Moon reminder: your emotional safety is not dependent on a perfect morning.',
  },
  {
    pattern: 'I have too many ideas and want to start all of them at once.',
    highest: 'My ideas are safe in the Vault. I choose what supports work, money, peace, or growth today.',
    bridge: 'Go to the Vault. Park everything except today\'s one priority.',
    chart: 'Gemini Rising collects fast. Virgo Midheaven builds slow systems. Both are you.',
  },
  {
    pattern: 'I carry client tasks in my head instead of writing them down.',
    highest: 'If it is not written down, it does not exist. DRYPHub and LUNA hold it — not me.',
    bridge: 'Dictate everything right now. Get it out of your head.',
    chart: 'Scorpio Mercury can hold everything — but it was not designed to carry it all alone.',
  },
  {
    pattern: 'I overthink messages and react from emotion.',
    highest: 'I dictate the feeling first. Then I send the message from clarity.',
    bridge: 'Go to Messages. Use the "Send from wisdom" tool before responding.',
    chart: 'Mars in Libra needs balance before action. Speak it first, then send.',
  },
  {
    pattern: 'I work late and lose my peaceful morning.',
    highest: 'I protect tomorrow by closing tonight. My morning starts at bedtime.',
    bridge: 'Open Night Mode and calculate your stop-work time.',
    chart: 'Saturn in Taurus teaches: slow, steady, and protected is more powerful than urgent and burned out.',
  },
  {
    pattern: 'I try to prove I can do everything.',
    highest: 'I choose the work where my guidance is most valuable. I do not need to prove anything.',
    bridge: 'Ask: Is this invited, or am I forcing it? If it is forced, let it rest.',
    chart: 'Projector reminder: recognition cannot be forced. Your power is in being seen, not proving.',
  },
]

interface MirrorResult {
  reflection: string
  current_pattern: string
  current_description: string
  highest_self_action: string
  bridge_step: string
  chart_connection: string
  affirmation: string
  closing: string
}

export default function HighestSelfScreen() {
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<MirrorResult | null>(null)

  async function reflect() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/highest-self-mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: input }),
      })
      setResult(await res.json())
    } catch {
      const m = STATIC_MIRRORS[Math.floor(Math.random() * STATIC_MIRRORS.length)]
      setResult({
        reflection: 'I see you. You are not stuck — you are in a moment. Your highest self is not harsher. She is calmer, clearer, and more selective.',
        current_pattern: m.pattern,
        current_description: 'This pattern makes sense. It comes from somewhere real.',
        highest_self_action: m.highest,
        bridge_step: m.bridge,
        chart_connection: m.chart,
        affirmation: 'I am becoming the woman I see in my future — through softness, not force.',
        closing: 'One small move toward your highest self. That is all today asks.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-sanctuary min-h-screen">
      <AppLayout noPad className="pt-16">
        <div className="px-6 pb-nav">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)' }}>
              <Zap className="h-5 w-5" style={{ color: 'var(--golden)' }} />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--golden)' }}>Highest Self Mirror</p>
          </div>

          <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--depth)' }}>
            Current you → Highest you.
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--mid)' }}>
            No shame here. Only recognition. Your highest self is not harsher — she is calmer, clearer, and more selective.
          </p>

          {/* Input */}
          {!result ? (
            <>
              <div className="glass-card p-5 mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--golden)' }}>
                  What pattern are you in right now?
                </p>
                <SmartInput
                  context="what pattern am I in — what I keep doing, what I feel stuck in, what my shadow is showing me"
                  placeholder="I keep doing X... I feel like I always... I am struggling with..."
                  value={input}
                  onChange={setInput}
                  patternType="highest_self"
                  rows={4}
                />
              </div>

              <button onClick={reflect} disabled={!input.trim() || loading}
                className="w-full py-4 rounded-2xl font-semibold text-white mb-6 transition-all active:scale-95 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--golden), #A88040)' }}>
                <Sparkles className="inline h-4 w-4 mr-2" />
                {loading ? 'Reflecting...' : 'Show me my highest self'}
              </button>

              {/* Static examples */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--mist)' }}>
                Common patterns
              </p>
              <div className="space-y-3">
                {STATIC_MIRRORS.slice(0, 4).map((m, i) => (
                  <button key={i} onClick={() => setInput(m.pattern)} className="w-full text-left glass-card p-4 active:scale-[0.98] transition-transform">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#E05E5E' }}>Pattern</p>
                    <p className="text-sm" style={{ color: 'var(--depth)' }}>{m.pattern}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-fade-up">
              {/* Reflection */}
              <GlassCard soul>
                <p className="text-sm leading-relaxed font-display italic" style={{ color: 'var(--depth)' }}>
                  &ldquo;{result.reflection}&rdquo;
                </p>
              </GlassCard>

              {/* Pattern vs highest self */}
              <div className="space-y-3">
                <div className="rounded-2xl p-4" style={{ background: 'rgba(224,94,94,0.06)', border: '1px solid rgba(224,94,94,0.1)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#E05E5E' }}>Current pattern</p>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--depth)' }}>{result.current_pattern}</p>
                  <p className="text-sm" style={{ color: 'var(--mid)' }}>{result.current_description}</p>
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'rgba(90,138,90,0.06)', border: '1px solid rgba(90,138,90,0.1)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5A8A5A' }}>Highest self action</p>
                  <p className="text-sm" style={{ color: 'var(--depth)' }}>{result.highest_self_action}</p>
                </div>
              </div>

              {/* Bridge */}
              <GlassCard>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--golden)' }}>Bridge step</p>
                <p className="text-sm font-medium" style={{ color: 'var(--depth)' }}>{result.bridge_step}</p>
              </GlassCard>

              {/* Chart */}
              <GlassCard>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--violet)' }}>Design + chart insight</p>
                <p className="text-sm" style={{ color: 'var(--mid)' }}>{result.chart_connection}</p>
              </GlassCard>

              {/* Affirmation */}
              <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.1)' }}>
                <p className="font-display text-base italic" style={{ color: 'var(--depth)' }}>
                  &ldquo;{result.affirmation}&rdquo;
                </p>
              </div>

              <p className="text-sm text-center italic" style={{ color: 'var(--mist)' }}>{result.closing}</p>

              <button onClick={() => { setResult(null); setInput('') }}
                className="w-full py-3.5 rounded-2xl font-semibold"
                style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--golden)' }}>
                Reflect again
              </button>
            </div>
          )}

        </div>
      </AppLayout>
    </div>
  )
}
