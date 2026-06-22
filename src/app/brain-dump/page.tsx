'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AIThinking } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Brain, Zap, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { cn, URGENCY_COLORS, CATEGORY_COLORS } from '@/lib/utils'

interface BrainDumpTask {
  title: string
  category: string
  project: string
  urgency_level: string
  estimated_minutes: number
  money_impact: number
  is_quick_win: boolean
  priority_score: number
}

interface BrainDumpResult {
  tasks: BrainDumpTask[]
  grouped: Record<string, BrainDumpTask[]>
  today_order: BrainDumpTask[]
  quick_wins: BrainDumpTask[]
  can_wait: BrainDumpTask[]
  ai_message: string
}

const EXAMPLE_DUMP = "Fix EHM emails, check DRYP studio update, make Linked Up flyer, respond to Mick about Flanagan's, finish USF assignment due Friday, book dentist appointment, post TikTok for Ad-Vantage, follow up on Villa Residential invoice, review Babe Coffee content calendar"

export default function BrainDumpPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BrainDumpResult | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const supabase = createClient()

  async function handleDump() {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function saveTask(task: BrainDumpTask) {
    const key = task.title
    setSaving(key)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          category: task.category || 'Personal',
          project: task.project || '',
          urgency_level: task.urgency_level || 'medium',
          estimated_minutes: task.estimated_minutes || 30,
          money_impact: task.money_impact || 0,
          priority_score: task.priority_score || 50,
          status: 'todo',
          source: 'brain_dump',
        }),
      })
      setSaved(prev => new Set(prev).add(key))
    } finally {
      setSaving(null)
    }
  }

  async function saveAllTasks() {
    if (!result) return
    for (const task of result.today_order.slice(0, 10)) {
      if (!saved.has(task.title)) {
        await saveTask(task)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Brain Dump</h1>
          <p className="text-slate-500 text-sm mt-0.5">Type everything on your mind. AI turns it into organized tasks.</p>
        </div>

        {/* Input */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-amber-500" />
              <CardTitle>What's on your mind?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Dump everything here. Doesn't need to be organized. Just type it all out..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={6}
            />
            {!text && (
              <button
                onClick={() => setText(EXAMPLE_DUMP)}
                className="text-xs text-violet-500 hover:underline"
              >
                Try an example →
              </button>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 rounded-xl px-3 py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleDump}
                disabled={!text.trim() || loading}
                loading={loading}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Sort it out
              </Button>
              {result && (
                <Button variant="outline" onClick={() => { setText(''); setResult(null); setSaved(new Set()) }}>
                  Start over
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading && <AIThinking message="Organizing your thoughts into tasks..." />}

        {result && (
          <div className="space-y-5">
            {/* AI message */}
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-violet-800">{result.ai_message}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">{result.tasks?.length || 0} tasks found</p>
              <Button size="sm" onClick={saveAllTasks} variant="outline" className="gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Save all to tasks
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Today's order */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <CardTitle>Do today</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-3">
                  {result.today_order?.map((task, i) => (
                    <TaskItem
                      key={task.title}
                      task={task}
                      rank={i + 1}
                      onSave={saveTask}
                      saving={saving === task.title}
                      saved={saved.has(task.title)}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Quick wins */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <CardTitle>Quick wins</CardTitle>
                      <Badge className="bg-green-50 text-green-600 ml-1">under 15 mins</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3">
                    {result.quick_wins?.length === 0 ? (
                      <p className="text-sm text-slate-400 px-2">No quick wins found</p>
                    ) : result.quick_wins?.map(task => (
                      <TaskItem
                        key={task.title}
                        task={task}
                        onSave={saveTask}
                        saving={saving === task.title}
                        saved={saved.has(task.title)}
                      />
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-slate-400">Can wait</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3">
                    {result.can_wait?.length === 0 ? (
                      <p className="text-sm text-slate-400 px-2">Everything needs attention</p>
                    ) : result.can_wait?.map(task => (
                      <TaskItem
                        key={task.title}
                        task={task}
                        onSave={saveTask}
                        saving={saving === task.title}
                        saved={saved.has(task.title)}
                        muted
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Grouped by project */}
            {Object.keys(result.grouped || {}).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Grouped by project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(result.grouped).map(([project, tasks]) => (
                    <div key={project}>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{project}</p>
                      <div className="space-y-1.5 pl-2">
                        {tasks.map(task => (
                          <div key={task.title} className="flex items-center gap-2">
                            <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', URGENCY_COLORS[task.urgency_level]?.includes('red') ? 'bg-red-400' : 'bg-gray-400')} />
                            <p className="text-sm text-slate-700">{task.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function TaskItem({
  task,
  rank,
  onSave,
  saving,
  saved,
  muted = false
}: {
  task: BrainDumpTask
  rank?: number
  onSave: (task: BrainDumpTask) => void
  saving: boolean
  saved: boolean
  muted?: boolean
}) {
  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-xl border transition-all',
      muted ? 'border-slate-50 bg-slate-50' : 'border-slate-100 bg-white hover:border-slate-200'
    )}>
      {rank && (
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center mt-0.5">
          {rank}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', muted ? 'text-slate-400' : 'text-slate-800')}>{task.title}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {task.urgency_level && (
            <Badge className={cn('text-xs', URGENCY_COLORS[task.urgency_level])}>
              {task.urgency_level}
            </Badge>
          )}
          {task.category && (
            <Badge className={cn('text-xs', CATEGORY_COLORS[task.category] || 'rounded-full')}>
              {task.category}
            </Badge>
          )}
          {task.estimated_minutes && (
            <span className="text-xs text-slate-400 flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {task.estimated_minutes < 60 ? `${task.estimated_minutes}m` : `${Math.round(task.estimated_minutes / 60)}h`}
            </span>
          )}
          {task.money_impact > 0 && (
            <span className="text-xs text-emerald-600 flex items-center gap-0.5 font-medium">
              <DollarSign className="h-3 w-3" />
            </span>
          )}
          {task.is_quick_win && (
            <Badge className="bg-green-50 text-green-600 text-xs">quick win</Badge>
          )}
        </div>
      </div>
      <button
        onClick={() => onSave(task)}
        disabled={saving || saved}
        className={cn(
          'flex-shrink-0 text-xs px-2 py-1 rounded-lg font-medium transition-all',
          saved
            ? 'bg-green-50 text-green-600 cursor-default'
            : 'bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50'
        )}
      >
        {saving ? '...' : saved ? '✓ Saved' : '+ Add'}
      </button>
    </div>
  )
}
