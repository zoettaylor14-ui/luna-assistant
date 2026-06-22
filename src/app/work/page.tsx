'use client'
import { useEffect, useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Briefcase, Clock, ExternalLink, Check, RefreshCw, AlertCircle, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { DryphubTask } from '@/lib/dryp-crm'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dueDateLabel(dateStr?: string): { label: string; color: string; urgent: boolean } {
  if (!dateStr) return { label: '', color: 'rgba(255,255,255,0.3)', urgent: false }
  const d   = new Date(dateStr)
  const now = new Date()
  const dDay  = new Date(d);   dDay.setHours(0,0,0,0)
  const today = new Date(now); today.setHours(0,0,0,0)
  const diff  = Math.round((dDay.getTime() - today.getTime()) / 86_400_000)
  if (diff < 0)   return { label: `Overdue (${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})})`, color: '#E05E5E', urgent: true }
  if (diff === 0) return { label: 'Due today',    color: '#E08B4A', urgent: true }
  if (diff === 1) return { label: 'Due tomorrow', color: '#C9A96E', urgent: false }
  if (diff <= 7)  return { label: `Due ${d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}`, color: 'rgba(255,255,255,0.5)', urgent: false }
  return { label: d.toLocaleDateString('en-US',{month:'short',day:'numeric'}), color: 'rgba(255,255,255,0.3)', urgent: false }
}

const PO: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const sortPriority = (a: DryphubTask, b: DryphubTask) => (PO[a.priority ?? 'low'] ?? 3) - (PO[b.priority ?? 'low'] ?? 3)

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#E05E5E', high: '#E08B4A', medium: '#8B6FB8', low: 'rgba(255,255,255,0.2)',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started', todo: 'To-do', in_progress: 'In progress', waiting_client: 'Waiting on client',
}

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
}

type Tab = 'today' | 'all' | 'by-client'

// ─── Task card ────────────────────────────────────────────────────────────────
function TaskCard({ task, done, onToggle }: { task: DryphubTask; done: boolean; onToggle: () => void }) {
  const due    = dueDateLabel(task.due_date)
  const pColor = PRIORITY_COLORS[task.priority ?? 'low']

  return (
    <div style={{ ...GLASS, padding: '14px 16px', opacity: done ? 0.4 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button onClick={onToggle} style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: done ? '#8B6FB8' : 'transparent',
          border: done ? 'none' : '1.5px solid rgba(139,111,184,0.3)', cursor: 'pointer',
        }}>
          {done && <Check className="h-3.5 w-3.5" style={{ color: 'white' }} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'white', lineHeight: 1.4, textDecoration: done ? 'line-through' : 'none' }}>
            {task.title}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {task.account_name && (
              <span style={{ fontSize: 11, color: 'rgba(168,196,218,0.85)', fontWeight: 600 }}>{task.account_name}</span>
            )}
            {task.account_name && due.label && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>·</span>}
            {due.label && (
              <span style={{ fontSize: 11, color: due.color, fontWeight: due.urgent ? 700 : 400, display: 'flex', alignItems: 'center', gap: 3 }}>
                {due.urgent && <Clock className="h-3 w-3" />}{due.label}
              </span>
            )}
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{STATUS_LABELS[task.status] ?? task.status}</span>
          </div>
          {task.description && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 5, lineHeight: 1.5 }}>{task.description}</p>
          )}
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: pColor, flexShrink: 0, marginTop: 6 }} />
      </div>
    </div>
  )
}

function SectionLabel({ text, count, accent = 'rgba(255,255,255,0.3)' }: { text: string; count: number; accent?: string }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 8, marginTop: 4 }}>
      {text} — {count}
    </p>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkPage() {
  const [tasks,   setTasks]   = useState<DryphubTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [done,    setDone]    = useState<Set<string>>(new Set())
  const [tab,     setTab]     = useState<Tab>('today')
  const [stats,   setStats]   = useState<{ openTasks: number; dueToday: number; dueThisWeek: number; atRiskCount: number } | null>(null)

  const load = useCallback(() => {
    setLoading(true); setError(false)
    Promise.all([
      fetch('/api/dryp/tasks').then(r => r.json()),
      fetch('/api/dryp/stats').then(r => r.json()),
    ]).then(([t, s]) => {
      if (t.tasks) setTasks(t.tasks)
      if (s.connected) setStats(s)
    }).catch(() => setError(true))
    .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  function toggle(id: string) {
    setDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // Derived groupings
  const todayBoundary   = new Date(); todayBoundary.setHours(0,0,0,0)
  const weekBoundary    = new Date(todayBoundary.getTime() + 7 * 86_400_000)

  const todayTasks    = tasks.filter(t => { if (!t.due_date) return false; const d = new Date(t.due_date); d.setHours(0,0,0,0); return d <= todayBoundary })
  const upcomingTasks = tasks.filter(t => { if (!t.due_date) return false; const d = new Date(t.due_date); d.setHours(0,0,0,0); return d > todayBoundary && d <= weekBoundary })
  const laterTasks    = tasks.filter(t => { if (!t.due_date) return false; const d = new Date(t.due_date); d.setHours(0,0,0,0); return d > weekBoundary })
  const noDueTasks    = tasks.filter(t => !t.due_date)

  const byClient = tasks.reduce<Record<string, DryphubTask[]>>((acc, t) => {
    const key = t.account_name ?? '— No client'
    acc[key] = acc[key] ?? []; acc[key].push(t); return acc
  }, {})
  const clientsSorted = Object.entries(byClient).sort((a, b) => b[1].length - a[1].length)

  const allActive    = tasks.filter(t => !done.has(t.id))
  const highPriority = allActive.filter(t => t.priority === 'critical' || t.priority === 'high')

  return (
    <div className="min-h-screen bg-app overflow-x-hidden">
      <div className="fixed top-0 right-0 pointer-events-none z-0" style={{ width: 300, height: 300, background: 'radial-gradient(circle at 80% 10%, rgba(168,196,218,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      <AppLayout>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(168,196,218,0.12)', border: '1px solid rgba(168,196,218,0.2)' }}>
              <Briefcase className="h-5 w-5" style={{ color: 'var(--lunar)' }} strokeWidth={1.6} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Work</h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                {loading ? 'Syncing with DRYP CRM…' : error ? 'Couldn\'t reach DRYP CRM' : `${allActive.length} open · ${highPriority.length} high priority`}
              </p>
            </div>
          </div>
          <button onClick={load} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Sync
          </button>
        </div>

        {/* Stats row */}
        {stats && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Open',      value: stats.openTasks,   color: 'white' },
              { label: 'Today',     value: stats.dueToday,    color: stats.dueToday   > 0 ? '#E08B4A' : 'white' },
              { label: 'This week', value: stats.dueThisWeek, color: 'white' },
              { label: 'At-risk',   value: stats.atRiskCount, color: stats.atRiskCount > 0 ? '#E05E5E' : 'white' },
            ].map(s => (
              <div key={s.label} style={{ ...GLASS, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ ...GLASS, padding: '16px 18px', marginBottom: 20, display: 'flex', gap: 12, background: 'rgba(224,94,94,0.06)', border: '1px solid rgba(224,94,94,0.18)' }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#E05E5E' }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>DRYP CRM unavailable</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Open dryphub.com directly, or tap Sync to retry.</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ ...GLASS, height: 72, background: 'rgba(255,255,255,0.04)' }} />)}
          </div>
        )}

        {/* Content */}
        {!loading && !error && tasks.length > 0 && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['today','all','by-client'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: tab === t ? 'rgba(168,196,218,0.14)' : 'transparent',
                  border: tab === t ? '1px solid rgba(168,196,218,0.28)' : '1px solid rgba(255,255,255,0.07)',
                  color: tab === t ? 'var(--lunar)' : 'rgba(255,255,255,0.4)',
                }}>
                  {t === 'today' ? 'Today' : t === 'all' ? 'All Tasks' : 'By Client'}
                </button>
              ))}
            </div>

            {/* Today tab */}
            {tab === 'today' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todayTasks.length === 0 ? (
                  <div style={{ ...GLASS, padding: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Nothing overdue or due today 🎉</p>
                  </div>
                ) : (
                  <>
                    <SectionLabel text="Today & Overdue" count={todayTasks.length} accent="#E08B4A" />
                    {todayTasks.sort(sortPriority).map(t => <TaskCard key={t.id} task={t} done={done.has(t.id)} onToggle={() => toggle(t.id)} />)}
                  </>
                )}
                {upcomingTasks.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <SectionLabel text="Coming up this week" count={upcomingTasks.length} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {upcomingTasks.sort(sortPriority).map(t => <TaskCard key={t.id} task={t} done={done.has(t.id)} onToggle={() => toggle(t.id)} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All tab */}
            {tab === 'all' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Overdue & Today', tasks: todayTasks,    accent: '#E08B4A' },
                  { label: 'This week',       tasks: upcomingTasks, accent: '#C9A96E' },
                  { label: 'Later',           tasks: laterTasks,    accent: 'rgba(255,255,255,0.35)' },
                  { label: 'No due date',     tasks: noDueTasks,    accent: 'rgba(255,255,255,0.2)' },
                ].filter(g => g.tasks.length > 0).map(group => (
                  <div key={group.label}>
                    <SectionLabel text={group.label} count={group.tasks.length} accent={group.accent} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {group.tasks.sort(sortPriority).map(t => <TaskCard key={t.id} task={t} done={done.has(t.id)} onToggle={() => toggle(t.id)} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* By Client tab */}
            {tab === 'by-client' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {clientsSorted.map(([client, cTasks]) => (
                  <div key={client}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(168,196,218,0.85)', letterSpacing: '0.04em' }}>{client}</p>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{cTasks.filter(t => !done.has(t.id)).length} open</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {cTasks.sort(sortPriority).map(t => <TaskCard key={t.id} task={t} done={done.has(t.id)} onToggle={() => toggle(t.id)} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div style={{ ...GLASS, padding: '32px 20px', textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>All clear 🌙</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No open tasks assigned to you in DRYP CRM.</p>
          </div>
        )}

        {/* DRYP CRM quick links */}
        <div style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.13)', borderRadius: 16, padding: '12px 14px', marginTop: 20, marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.55)', marginBottom: 10 }}>Open in DRYP CRM</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'My Tasks',  href: 'https://dryphub.com/tasks' },
              { label: 'Clients',   href: 'https://dryphub.com/accounts' },
              { label: 'Outreach',  href: 'https://dryphub.com/outreach' },
              { label: 'Dashboard', href: 'https://dryphub.com' },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 10, background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.15)', color: 'rgba(201,169,110,0.8)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                {label} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>

        <Link href="/tasks" style={{ textDecoration: 'none' }}>
          <div style={{ ...GLASS, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>LUNA task manager</p>
            <ChevronRight className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
          </div>
        </Link>
      </AppLayout>
    </div>
  )
}
