'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AIThinking } from '@/components/ui/loading'
import { Sparkles, Zap, Clock, Sun, Coffee, Briefcase, Heart, ChevronRight, AlertCircle } from 'lucide-react'
import { cn, URGENCY_COLORS } from '@/lib/utils'

interface ScheduleBlock {
  time: string
  task: string
  duration_minutes: number
  type: 'work' | 'admin' | 'creative' | 'personal' | 'break'
}

interface TaskRef {
  title: string
  category?: string
  urgency_level?: string
  estimated_minutes?: number
  project?: string
}

interface DailyPlan {
  must_do: TaskRef[]
  quick_wins: TaskRef[]
  admin_tasks: TaskRef[]
  creative_tasks: TaskRef[]
  client_follow_ups: TaskRef[]
  personal_tasks: TaskRef[]
  schedule_blocks: ScheduleBlock[]
  can_wait: TaskRef[]
  ai_message: string
}

const BLOCK_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  work: { icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
  admin: { icon: Coffee, color: 'text-amber-600 bg-amber-50' },
  creative: { icon: Sun, color: 'text-orange-600 bg-orange-50' },
  personal: { icon: Heart, color: 'text-pink-600 bg-pink-50' },
  break: { icon: Coffee, color: 'text-green-600 bg-green-50' },
}

const SECTIONS = [
  { key: 'must_do', label: 'Must do today', icon: '🔥', color: 'border-red-200 bg-red-50' },
  { key: 'quick_wins', label: 'Quick wins', icon: '⚡', color: 'border-green-200 bg-green-50' },
  { key: 'client_follow_ups', label: 'Client follow-ups', icon: '📨', color: 'border-blue-200 bg-blue-50' },
  { key: 'admin_tasks', label: 'Admin', icon: '📋', color: 'border-amber-200 bg-amber-50' },
  { key: 'creative_tasks', label: 'Creative', icon: '🎨', color: 'border-purple-200 bg-purple-50' },
  { key: 'personal_tasks', label: 'Personal', icon: '💛', color: 'border-pink-200 bg-pink-50' },
  { key: 'can_wait', label: 'Can wait', icon: '⏳', color: 'border-slate-200 bg-slate-50' },
] as const

export default function PlanMyDayPage() {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [error, setError] = useState('')

  async function generatePlan() {
    setLoading(true)
    setError('')
    setPlan(null)
    try {
      const res = await fetch('/api/ai/plan-my-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlan(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Plan My Day</h1>
            <p className="text-slate-500 text-sm mt-0.5">{today}</p>
          </div>
          <Button
            onClick={generatePlan}
            loading={loading}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {plan ? 'Regenerate' : 'Generate plan'}
          </Button>
        </div>

        {!plan && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Ready to plan your day?</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
              AI will look at all your open tasks and build a realistic, prioritized plan for today.
            </p>
            <Button onClick={generatePlan} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Plan my day
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <AIThinking message="Looking at your tasks and building today's plan..." />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {plan && (
          <div className="space-y-5">
            {/* AI message */}
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-violet-800">{plan.ai_message}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Schedule */}
              {plan.schedule_blocks?.length > 0 && (
                <Card className="lg:row-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-violet-500" />
                      <CardTitle>Today's schedule</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {plan.schedule_blocks.map((block, i) => {
                      const meta = BLOCK_ICONS[block.type] || BLOCK_ICONS.work
                      const Icon = meta.icon
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', meta.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-500">{block.time}</span>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-xs text-slate-400">
                                {block.duration_minutes < 60 ? `${block.duration_minutes}m` : `${Math.round(block.duration_minutes / 60)}h`}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800 font-medium mt-0.5">{block.task}</p>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Task sections */}
              <div className="space-y-4">
                {SECTIONS.map(({ key, label, icon, color }) => {
                  const sectionTasks = plan[key as keyof DailyPlan] as TaskRef[]
                  if (!sectionTasks || sectionTasks.length === 0) return null
                  return (
                    <Card key={key}>
                      <CardHeader className="py-3">
                        <div className="flex items-center gap-2">
                          <span>{icon}</span>
                          <CardTitle className="text-sm">{label}</CardTitle>
                          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
  style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--surface-border)' }}>
  {sectionTasks.length}
</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 space-y-1.5">
                        {sectionTasks.map((task, i) => (
                          <div key={i} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border', color)}>
                            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
                            <p className="text-sm text-slate-800 flex-1">{task.title}</p>
                            {task.estimated_minutes && (
                              <span className="text-xs text-slate-400 flex-shrink-0">
                                {task.estimated_minutes < 60 ? `${task.estimated_minutes}m` : `${Math.round(task.estimated_minutes / 60)}h`}
                              </span>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
