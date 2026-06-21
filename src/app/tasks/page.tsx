'use client'
import { useEffect, useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { LoadingPage, AIThinking } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'
import { Task, TaskCategory, TaskStatus } from '@/types'
import { Plus, Sparkles, Filter, X } from 'lucide-react'
import { CATEGORY_COLORS, cn } from '@/lib/utils'

const STATUS_FILTERS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'done', label: 'Done' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiRankings, setAiRankings] = useState<Array<{ id: string; reason: string }> | null>(null)
  const supabase = createClient()

  const loadTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('priority_score', { ascending: false })

    setTasks(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadTasks() }, [loadTasks])

  async function handleCreateTask(taskData: Partial<Task>) {
    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    })
    const { task } = await res.json()
    if (task) {
      setTasks(prev => [task, ...prev])
      setShowForm(false)
    }
  }

  async function handleStatusChange(id: string, status: Task['status']) {
    await fetch('/api/tasks/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  async function handleAIRank() {
    const activeTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled')
    if (activeTasks.length === 0) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/prioritize-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: activeTasks.slice(0, 15) }),
      })
      const data = await res.json()
      if (data.ranked_tasks) {
        setAiRankings(data.ranked_tasks)
        // Re-sort tasks by AI ranking
        const rankMap = new Map(data.ranked_tasks.map((t: { id: string }, i: number) => [t.id, i]))
        setTasks(prev => [...prev].sort((a, b) => {
          const ra = rankMap.get(a.id) ?? 999
          const rb = rankMap.get(b.id) ?? 999
          return (ra as number) - (rb as number)
        }))
      }
    } finally {
      setAiLoading(false)
    }
  }

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    return true
  })

  const categories = [...new Set(tasks.map(t => t.category))] as TaskCategory[]

  if (loading) return <AppLayout><LoadingPage /></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length} open · {tasks.filter(t => t.status === 'done').length} done
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIRank}
              loading={aiLoading}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              AI rank
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </div>
        </div>

        {/* Add task form */}
        {showForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New task</CardTitle>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* AI Rankings info */}
        {aiLoading && <AIThinking message="AI is ranking your tasks..." />}
        {aiRankings && !aiLoading && (
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-violet-700">AI ranked these tasks for you</p>
              <button onClick={() => setAiRankings(null)} className="text-xs text-violet-400 hover:text-violet-600">Clear</button>
            </div>
            <p className="text-xs text-violet-600">{aiRankings[0] && `Top priority: "${tasks.find(t => t.id === aiRankings[0].id)?.title}" — ${aiRankings[0].reason}`}</p>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  statusFilter === f.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          {categories.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  categoryFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                All categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat === categoryFilter ? 'all' : cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    categoryFilter === cat
                      ? cn(CATEGORY_COLORS[cat], 'ring-2 ring-offset-1 ring-current')
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tasks list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">No tasks match these filters.</p>
            <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add your first task
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task, i) => (
              <div key={task.id} className="flex gap-2 items-start">
                {aiRankings && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center mt-4">
                    {i + 1}
                  </span>
                )}
                <div className="flex-1">
                  <TaskCard task={task} onStatusChange={handleStatusChange} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
