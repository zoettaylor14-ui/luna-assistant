'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { Briefcase, Mail, Clock, Sparkles, RefreshCw, ExternalLink, Check } from 'lucide-react'
import Link from 'next/link'

type WorkTab = 'overview' | 'tasks' | 'emails'

interface WorkItem {
  id: string
  title: string
  client?: string
  due?: string
  source: 'dryphub' | 'email' | 'calendar' | 'manual'
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  status: 'todo' | 'in_progress' | 'waiting' | 'done'
}

const MOCK_WORK: WorkItem[] = [
  { id: '1', title: 'Send updated EHM website plan', client: 'EHM Strategies', due: 'Today', source: 'email', priority: 'high', category: 'Client Websites', status: 'todo' },
  { id: '2', title: 'Review DRYP Hub CRM outreach tables', client: 'DRYP Digital', due: 'Today', source: 'dryphub', priority: 'high', category: 'DRYP Growth', status: 'todo' },
  { id: '3', title: 'USF assignment check', client: undefined, due: 'Tomorrow', source: 'manual', priority: 'medium', category: 'School', status: 'todo' },
  { id: '4', title: 'Follow up with Babe Coffee Lounge', client: 'Babe Coffee Lounge', due: 'This week', source: 'dryphub', priority: 'medium', category: 'Client', status: 'waiting' },
  { id: '5', title: 'Newsletter Studio content', client: 'DRYP Digital', due: 'This week', source: 'dryphub', priority: 'medium', category: 'Content', status: 'todo' },
]

const MOCK_EMAILS = [
  { id: 'e1', sender: 'EHM Team', subject: 'Can you send the updated website plan by Friday?', received: '2h ago', urgency: 'high' as const, needs_reply: true, client: 'EHM Strategies' },
  { id: 'e2', sender: 'Villa Residential', subject: 'SEO report follow-up', received: '5h ago', urgency: 'medium' as const, needs_reply: true, client: 'Villa Residential' },
  { id: 'e3', sender: 'DRYP Digital Team', subject: 'Approval on new feature', received: '1d ago', urgency: 'low' as const, needs_reply: false, client: 'DRYP Digital' },
]

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  dryphub: { label: 'DRYPHub', color: 'var(--violet)' },
  email:   { label: 'Email',   color: 'var(--lunar)' },
  calendar:{ label: 'Cal',     color: 'var(--golden)' },
  manual:  { label: 'Manual',  color: 'var(--mist)' },
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#E05E5E', high: '#E08B4A', medium: 'var(--violet)', low: 'var(--mist)',
}

export default function WorkScreen() {
  const [tab, setTab] = useState<WorkTab>('overview')
  const [done, setDone] = useState<Set<string>>(new Set())
  const [aiHelp, setAiHelp] = useState<string | null>(null)

  function toggleDone(id: string) {
    setDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const urgent    = MOCK_WORK.filter(w => w.priority === 'critical' || w.priority === 'high')
  const needsReply = MOCK_EMAILS.filter(e => e.needs_reply)

  return (
    <div className="bg-sanctuary min-h-screen">
      <AppLayout noPad>
        <div className="px-5 pt-14 pb-nav">

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(168,196,218,0.15)' }}>
                <Briefcase className="h-5 w-5" style={{ color: 'var(--lunar)' }} />
              </div>
              <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--lunar)' }}>Work</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mist)' }}>
              <RefreshCw className="h-3.5 w-3.5" /> Sync
            </button>
          </div>

          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--depth)' }}>
            Work reality.
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--mid)' }}>
            {urgent.length} items need attention · {needsReply.length} need a reply
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {(['overview','tasks','emails'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`tab-pill ${tab === t ? 'active' : ''}`}>
                {t === 'overview' ? '📋 Overview' : t === 'tasks' ? '⚡ Tasks' : '📬 Emails'}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-4 animate-fade-up">
              {/* Work brief */}
              <GlassCard soul>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--violet)' }}>Today&apos;s work reality</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--mid)' }}>
                  You have {urgent.length} high-priority items, {needsReply.length} emails needing replies, and {MOCK_WORK.length} total work items.
                  Start with the client deliverable that unlocks the most — then move to communication.
                </p>
              </GlassCard>

              {/* What needs reply */}
              {needsReply.length > 0 && (
                <GlassCard>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#E08B4A' }}>Needs reply</p>
                  {needsReply.map((e, i) => (
                    <div key={e.id} className="py-2.5" style={{ borderBottom: i < needsReply.length - 1 ? '1px solid rgba(139,111,184,0.07)' : 'none' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--depth)' }}>{e.subject}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--mist)' }}>{e.sender} · {e.received}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: PRIORITY_COLORS[e.urgency] }} />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setTab('emails')} className="text-xs font-medium mt-2" style={{ color: 'var(--lunar)' }}>
                    Go to emails →
                  </button>
                </GlassCard>
              )}

              {/* Top work tasks */}
              <GlassCard>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--lunar)' }}>DRYPHub tasks due</p>
                {MOCK_WORK.filter(w => w.source === 'dryphub').slice(0, 3).map((w, i, arr) => (
                  <div key={w.id} className="py-2.5 flex items-center gap-2" style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(139,111,184,0.07)' : 'none' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[w.priority] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--depth)' }}>{w.title}</p>
                      {w.client && <p className="text-xs" style={{ color: 'var(--mist)' }}>{w.client} · {w.due}</p>}
                    </div>
                  </div>
                ))}
              </GlassCard>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/email">
                  <div className="glass-card p-4 cursor-pointer active:scale-95 transition-transform">
                    <Mail className="h-5 w-5 mb-2" style={{ color: 'var(--lunar)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--depth)' }}>Full inbox</p>
                    <p className="text-xs" style={{ color: 'var(--mist)' }}>AI reply drafts</p>
                  </div>
                </Link>
                <Link href="/career">
                  <div className="glass-card p-4 cursor-pointer active:scale-95 transition-transform">
                    <Sparkles className="h-5 w-5 mb-2" style={{ color: 'var(--golden)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--depth)' }}>Career compass</p>
                    <p className="text-xs" style={{ color: 'var(--mist)' }}>Highest-use work</p>
                  </div>
                </Link>
              </div>

              <p className="text-xs italic text-center" style={{ color: 'var(--faint)' }}>
                &ldquo;The app should protect Zoe from treating every task like an emergency.&rdquo;
              </p>
            </div>
          )}

          {/* Tasks tab */}
          {tab === 'tasks' && (
            <div className="space-y-2.5 animate-fade-up">
              {MOCK_WORK.map(w => {
                const isDone = done.has(w.id)
                const src = SOURCE_LABELS[w.source]
                return (
                  <div key={w.id} className="glass-card p-4" style={{ opacity: isDone ? 0.5 : 1 }}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleDone(w.id)}
                        className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                        style={{
                          background: isDone ? 'var(--violet)' : 'transparent',
                          border: isDone ? 'none' : '1.5px solid rgba(139,111,184,0.25)',
                        }}>
                        {isDone && <Check className="h-3.5 w-3.5 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--depth)', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {w.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {w.client && <span className="text-xs" style={{ color: 'var(--mist)' }}>{w.client}</span>}
                          {w.due && <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--mist)' }}><Clock className="h-3 w-3" />{w.due}</span>}
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${src.color}15`, color: src.color }}>{src.label}</span>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: PRIORITY_COLORS[w.priority] }} />
                    </div>
                  </div>
                )
              })}
              <Link href="/tasks">
                <button className="w-full py-3.5 rounded-2xl text-sm font-medium" style={{ color: 'var(--violet)', background: 'rgba(139,111,184,0.06)' }}>
                  Manage all tasks →
                </button>
              </Link>
            </div>
          )}

          {/* Emails tab */}
          {tab === 'emails' && (
            <div className="space-y-3 animate-fade-up">
              {MOCK_EMAILS.map(email => (
                <div key={email.id} className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: PRIORITY_COLORS[email.urgency] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--depth)' }}>{email.subject}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--mist)' }}>{email.sender} · {email.received}</p>
                      {email.client && <p className="text-xs mt-0.5" style={{ color: 'var(--mist)' }}>{email.client}</p>}
                      {email.needs_reply && (
                        <Link href="/email">
                          <button className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl"
                            style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                            Draft reply →
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/email">
                <button className="w-full py-3.5 rounded-2xl text-sm font-medium" style={{ color: 'var(--lunar)', background: 'rgba(168,196,218,0.1)' }}>
                  Full inbox →
                </button>
              </Link>
            </div>
          )}

        </div>
      </AppLayout>
    </div>
  )
}
