'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { MessageSquare, Sparkles, Copy, Check, AlertTriangle, Shield, ChevronDown, ChevronUp } from 'lucide-react'

const ACTIVATED_LEVELS = [
  { value: 1, label: 'Calm',      emoji: '😌' },
  { value: 2, label: 'Mild',      emoji: '🌀' },
  { value: 3, label: 'Stirred',   emoji: '😤' },
  { value: 4, label: 'Activated', emoji: '🔥' },
  { value: 5, label: 'Reactive',  emoji: '⚡' },
]

const RELATIONSHIP_TYPES = [
  '💼 Client', '🤝 Business partner', '👨‍👩‍👧 Family', '💕 Partner / romantic',
  '👯 Friend', '👥 Team member', '🙍 Acquaintance',
]

interface CoachResult {
  what_they_mean?: string
  summary?: string
  urgency?: string
  emotional_tone?: string
  reactive_warning?: 'yes' | 'no'
  reactive_reason?: string
  what_not_to_say?: string
  wound_reply?: string
  soft_reply?: string
  direct_reply?: string
  confident_reply?: string
  wisdom_reply?: string
  reflection?: string
}

function ReplyCard({ label, text, id, highlight, accent }: {
  label: string; text: string; id: string; highlight?: boolean; accent?: string
}) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="rounded-2xl p-4" style={{
      background: highlight ? `${accent ?? 'rgba(139,111,184'}0.06)` : 'rgba(255,255,255,0.65)',
      border: `1.5px solid ${highlight ? (accent ?? 'rgba(139,111,184,0.2)') : 'rgba(255,255,255,0.5)'}`,
    }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: highlight ? 'var(--violet)' : 'var(--mist)' }}>
          {label}
        </p>
        <button onClick={copy} className="flex items-center gap-1 text-xs" style={{ color: 'var(--mist)' }}>
          {copied ? <Check className="h-3.5 w-3.5" style={{ color: '#5A8A5A' }} /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--depth)' }}>{text}</p>
    </div>
  )
}

export default function CommunicationCoach() {
  const [message, setMessage]       = useState('')
  const [sender, setSender]         = useState('')
  const [relationship, setRelationship] = useState('')
  const [activated, setActivated]   = useState(1)
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<CoachResult | null>(null)
  const [showWound, setShowWound]   = useState(false)
  const [showNotSay, setShowNotSay] = useState(false)

  async function analyze() {
    if (!message.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai/message-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sender_name: sender,
          context: relationship,
          activated_level: activated,
        }),
      })
      setResult(await res.json())
    } catch {
      setResult({
        what_they_mean: 'I could not fully read this message right now, but take a breath before responding.',
        summary: 'Message received.',
        reactive_warning: activated >= 3 ? 'yes' : 'no',
        reactive_reason: activated >= 3 ? 'Your activation level is high. Wait before sending.' : undefined,
        soft_reply: 'Thank you for reaching out. I want to make sure I respond thoughtfully — let me get back to you with clarity.',
        direct_reply: "I'll look into this and follow up shortly.",
        confident_reply: 'I hear you. I will respond when I am ready.',
        wisdom_reply: 'I appreciate your message. Give me a moment to respond with intention.',
        reflection: 'Am I responding from my wound or from my wisdom right now?',
      })
    } finally {
      setLoading(false)
    }
  }

  const isReactive = result?.reactive_warning === 'yes' || activated >= 4

  return (
    <div className="bg-sanctuary min-h-screen">
      <AppLayout noPad>
        <div className="px-5 pt-14 pb-nav">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(232,192,194,0.2)' }}>
              <MessageSquare className="h-5 w-5" style={{ color: '#C87B7B' }} />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider" style={{ color: '#C87B7B' }}>Communication Coach</p>
              <p className="text-xs" style={{ color: 'var(--mist)' }}>Respond from wisdom, not wound.</p>
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--depth)' }}>
            Before you respond.
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--mid)' }}>
            Paste the message. LUNA will read it, tell you what they actually mean, and help you reply like your highest self.
          </p>

          {!result ? (
            <div className="space-y-4">
              {/* Who sent it */}
              <div className="glass-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--mist)' }}>Who sent this?</p>
                <input type="text" value={sender} onChange={e => setSender(e.target.value)}
                  placeholder="Kaleb, a client, mom, team member..."
                  className="w-full bg-transparent outline-none text-sm" style={{ color: 'var(--depth)' }} />
              </div>

              {/* Relationship */}
              <div className="glass-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--mist)' }}>Relationship</p>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIP_TYPES.map(r => (
                    <button key={r} onClick={() => setRelationship(relationship === r ? '' : r)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: relationship === r ? 'var(--violet)' : 'rgba(139,111,184,0.08)',
                        color: relationship === r ? 'white' : 'var(--mid)',
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* How activated */}
              <div className="glass-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--mist)' }}>
                  How activated are you right now?
                </p>
                <div className="flex gap-2">
                  {ACTIVATED_LEVELS.map(l => (
                    <button key={l.value} onClick={() => setActivated(l.value)}
                      className="flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all"
                      style={{
                        background: activated === l.value
                          ? (l.value >= 4 ? '#E05E5E18' : l.value === 3 ? 'rgba(201,169,110,0.15)' : 'rgba(139,111,184,0.12)')
                          : 'rgba(139,111,184,0.04)',
                        border: `1.5px solid ${activated === l.value
                          ? (l.value >= 4 ? '#E05E5E40' : l.value === 3 ? 'rgba(201,169,110,0.3)' : 'rgba(139,111,184,0.2)')
                          : 'transparent'}`,
                      }}>
                      <span className="text-base">{l.emoji}</span>
                      <span className="text-[9px] font-semibold" style={{
                        color: activated === l.value ? (l.value >= 4 ? '#E05E5E' : 'var(--violet)') : 'var(--mist)'
                      }}>{l.label}</span>
                    </button>
                  ))}
                </div>
                {activated >= 4 && (
                  <div className="mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
                    style={{ background: 'rgba(224,94,94,0.06)', border: '1px solid rgba(224,94,94,0.12)' }}>
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#E05E5E' }} />
                    <p className="text-xs" style={{ color: '#E05E5E' }}>
                      You are activated. LUNA will add extra protection in your replies.
                    </p>
                  </div>
                )}
              </div>

              {/* The message */}
              <div className="glass-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--mist)' }}>Paste the message</p>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Paste or type the message here..."
                  rows={5} className="w-full bg-transparent outline-none text-sm resize-none" style={{ color: 'var(--depth)' }} />
              </div>

              <button onClick={analyze} disabled={!message.trim() || loading}
                className="w-full py-4 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))' }}>
                <Sparkles className="inline h-4 w-4 mr-2" />
                {loading ? 'Reading between the lines...' : 'Help me respond from wisdom'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-up">

              {/* ── REACTIVE WARNING ── */}
              {isReactive && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(224,94,94,0.06)', border: '2px solid rgba(224,94,94,0.2)' }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#E05E5E' }} />
                    <div>
                      <p className="text-sm font-bold mb-1" style={{ color: '#E05E5E' }}>
                        Pause before sending.
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: '#C87070' }}>
                        {result.reactive_reason ?? 'Your energy is activated. The replies below are written from your highest self — not from where you are right now. Breathe first.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── REFLECTION question ── */}
              {result.reflection && (
                <div className="rounded-2xl p-4 text-center"
                  style={{ background: 'rgba(139,111,184,0.06)', border: '1px solid rgba(139,111,184,0.1)' }}>
                  <p className="font-display text-base italic leading-relaxed" style={{ color: 'var(--depth)' }}>
                    &ldquo;{result.reflection}&rdquo;
                  </p>
                </div>
              )}

              {/* ── What they actually mean ── */}
              {result.what_they_mean && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,111,184,0.1)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--violet)' }}>
                    What they actually mean
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--depth)' }}>{result.what_they_mean}</p>
                  {result.emotional_tone && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full capitalize"
                      style={{ background: 'rgba(139,111,184,0.08)', color: 'var(--violet)' }}>
                      {result.emotional_tone}
                    </span>
                  )}
                </div>
              )}

              {/* ── Do not say this ── */}
              {result.what_not_to_say && (
                <div>
                  <button onClick={() => setShowNotSay(!showNotSay)}
                    className="flex items-center gap-2 text-xs font-medium mb-2"
                    style={{ color: 'var(--mist)' }}>
                    <Shield className="h-3.5 w-3.5" />
                    {showNotSay ? 'Hide' : 'Show'} what not to say
                    {showNotSay ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {showNotSay && (
                    <div className="rounded-2xl p-4 mb-1"
                      style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#C9A96E' }}>
                        Do not say this right now
                      </p>
                      <p className="text-sm" style={{ color: 'var(--mid)' }}>{result.what_not_to_say}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── WISDOM reply (highlighted) ── */}
              {result.wisdom_reply && (
                <ReplyCard label="✨ Wisdom reply — send this one" text={result.wisdom_reply} id="wisdom" highlight />
              )}

              {/* ── 3 reply types ── */}
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>
                Or choose your tone
              </p>
              <div className="space-y-3">
                {result.soft_reply      && <ReplyCard label="🌸 Soft + Warm"       text={result.soft_reply}      id="soft" />}
                {result.direct_reply    && <ReplyCard label="🎯 Direct + Clear"     text={result.direct_reply}    id="direct" />}
                {result.confident_reply && <ReplyCard label="🛡 Confident + Calm"   text={result.confident_reply} id="confident" />}
              </div>

              {/* ── Wound reply (awareness only) ── */}
              {result.wound_reply && (
                <div>
                  <button onClick={() => setShowWound(!showWound)}
                    className="flex items-center gap-2 text-xs font-medium"
                    style={{ color: 'var(--mist)' }}>
                    {showWound ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {showWound ? 'Hide' : 'See'} wound reply (awareness only — do not send this)
                  </button>
                  {showWound && (
                    <div className="mt-2 rounded-2xl p-4"
                      style={{ background: 'rgba(224,94,94,0.04)', border: '1px solid rgba(224,94,94,0.1)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#E05E5E' }}>
                        Wound reply — do not send
                      </p>
                      <p className="text-sm italic" style={{ color: 'var(--mid)' }}>{result.wound_reply}</p>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => { setResult(null); setMessage(''); setSender(''); setActivated(1) }}
                className="w-full py-3.5 rounded-2xl font-semibold"
                style={{ background: 'rgba(139,111,184,0.08)', color: 'var(--violet)' }}>
                New message
              </button>

            </div>
          )}

        </div>
      </AppLayout>
    </div>
  )
}
