'use client'
import { useEffect, useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { LoadingPage } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types'
import { Plus, X, ChevronRight, Clock, AlertCircle, CheckCircle, PauseCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_PROJECTS = [
  { name: 'EHM Strategies', description: 'CRM, automation, email, client management', priority_level: 'high' as const },
  { name: 'DRYP Studio', description: 'Video studio, content production, social media', priority_level: 'high' as const },
  { name: 'DRYP Digital', description: 'Digital marketing, SEO, AEO, strategy', priority_level: 'high' as const },
  { name: 'Ad-Vantage', description: 'Agency operations, client onboarding, growth', priority_level: 'high' as const },
  { name: 'Hoover Digital', description: 'Website, SEO, digital presence', priority_level: 'medium' as const },
  { name: 'Babe Coffee Lounge', description: 'Social media, events, content', priority_level: 'medium' as const },
  { name: "Flanagan's Irish Pub", description: 'Website, social media, events', priority_level: 'medium' as const },
  { name: 'Villa Residential', description: 'Real estate marketing, website, CRM', priority_level: 'medium' as const },
  { name: 'Linked Up', description: 'Events, flyers, promotions, social', priority_level: 'medium' as const },
  { name: 'School (USF)', description: 'Coursework, assignments, deadlines', priority_level: 'high' as const },
  { name: 'Personal', description: 'Health, appointments, personal goals', priority_level: 'medium' as const },
]

const STATUS_ICONS: Record<string, React.ElementType> = {
  active: CheckCircle,
  paused: PauseCircle,
  on_hold: Clock,
  completed: CheckCircle,
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-600',
  paused: 'text-amber-500',
  on_hold: 'text-slate-400',
  completed: 'text-blue-500',
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active' as Project['status'],
    priority_level: 'medium' as Project['priority_level'],
    next_action: '',
    deadline: '',
    waiting_on: '',
  })
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: projs }, { data: tasks }] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', user.id).order('priority_level'),
      supabase.from('tasks').select('project, status').eq('user_id', user.id).not('status', 'in', '("done","cancelled")'),
    ])

    if (!projs || projs.length === 0) {
      // Seed default projects
      const seeds = DEFAULT_PROJECTS.map(p => ({ ...p, user_id: user.id, status: 'active' as const }))
      const { data: created } = await supabase.from('projects').insert(seeds).select()
      setProjects(created || [])
    } else {
      setProjects(projs)
    }

    // Count open tasks per project
    const counts: Record<string, number> = {}
    tasks?.forEach((t: { project?: string | null; status: string }) => {
      if (t.project) counts[t.project] = (counts[t.project] || 0) + 1
    })
    setTaskCounts(counts)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !newProject.name.trim()) return

    const { data } = await supabase
      .from('projects')
      .insert({ ...newProject, user_id: user.id })
      .select()
      .single()

    if (data) {
      setProjects(prev => [data, ...prev])
      setShowForm(false)
      setNewProject({ name: '', description: '', status: 'active', priority_level: 'medium', next_action: '', deadline: '', waiting_on: '' })
    }
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    await supabase.from('projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  if (loading) return <AppLayout><LoadingPage /></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm mt-0.5">{projects.filter(p => p.status === 'active').length} active projects</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add project
          </Button>
        </div>

        {/* New project form */}
        {showForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New project</CardTitle>
                <button onClick={() => setShowForm(false)} className="" style={{ color: 'var(--text-3)' }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-3">
                <Input label="Project name *" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} required />
                <Textarea label="Description" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Status" value={newProject.status} onChange={e => setNewProject(p => ({ ...p, status: e.target.value as Project['status'] }))} options={[
                    { value: 'active', label: 'Active' },
                    { value: 'paused', label: 'Paused' },
                    { value: 'on_hold', label: 'On hold' },
                    { value: 'completed', label: 'Completed' },
                  ]} />
                  <Select label="Priority" value={newProject.priority_level} onChange={e => setNewProject(p => ({ ...p, priority_level: e.target.value as Project['priority_level'] }))} options={[
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ]} />
                </div>
                <Input label="Next action" value={newProject.next_action} onChange={e => setNewProject(p => ({ ...p, next_action: e.target.value }))} />
                <div className="flex gap-2">
                  <Button type="submit">Create project</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const StatusIcon = STATUS_ICONS[project.status] || CheckCircle
            const openTasks = taskCounts[project.name] || 0
            const isExpanded = expanded === project.id

            return (
              <div key={project.id} className="rounded-2xl dark-card transition-all hover:shadow-lg">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs mt-0.5 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <StatusIcon className={cn('h-4 w-4 flex-shrink-0 ml-2 mt-0.5', STATUS_COLORS[project.status])} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge className={cn(PRIORITY_COLORS[project.priority_level])}>
                      {project.priority_level}
                    </Badge>
                    {openTasks > 0 && (
                      <Badge className="bg-violet-50 text-violet-600">
                        {openTasks} task{openTasks !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {project.next_action && (
                    <div className="flex items-start gap-2 mb-3">
                      <ChevronRight className="h-3.5 w-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs">{project.next_action}</p>
                    </div>
                  )}

                  {project.deadline && (
                    <p className="text-xs mb-2">
                      <span className="font-medium">Due:</span> {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  )}

                  {project.waiting_on && (
                    <div className="flex items-start gap-1.5 mb-2">
                      <Clock className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600">Waiting on: {project.waiting_on}</p>
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="px-4 pb-3 flex gap-1.5">
                  <Select
                    value={project.status}
                    onChange={e => updateProject(project.id, { status: e.target.value as Project['status'] })}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'paused', label: 'Paused' },
                      { value: 'on_hold', label: 'On hold' },
                      { value: 'completed', label: 'Completed' },
                    ]}
                    className="text-xs py-1.5 h-8"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
