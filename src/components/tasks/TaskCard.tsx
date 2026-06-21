'use client'
import { Task } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatDate, URGENCY_COLORS, STATUS_COLORS, CATEGORY_COLORS, URGENCY_DOT, isOverdue } from '@/lib/utils'
import { Clock, DollarSign, Calendar, CheckCircle2, Circle, PlayCircle } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onStatusChange?: (id: string, status: Task['status']) => void
  compact?: boolean
}

export function TaskCard({ task, onStatusChange, compact = false }: TaskCardProps) {
  const done = task.status === 'done'

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all group',
      done && 'opacity-60',
      compact && 'py-3'
    )}>
      {/* Status toggle */}
      <button
        onClick={() => onStatusChange?.(task.id, done ? 'todo' : 'done')}
        className="mt-0.5 flex-shrink-0 text-slate-300 hover:text-violet-500 transition-colors"
      >
        {task.status === 'done' ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : task.status === 'in_progress' ? (
          <PlayCircle className="h-5 w-5 text-blue-500" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium text-slate-800 leading-snug', done && 'line-through text-slate-400')}>
            {task.title}
          </p>
          <span className="flex-shrink-0 text-xs font-bold text-slate-500">
            #{task.priority_score}
          </span>
        </div>

        {task.description && !compact && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Urgency dot */}
          <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', URGENCY_COLORS[task.urgency_level])}>
            <span className={cn('w-1.5 h-1.5 rounded-full', URGENCY_DOT[task.urgency_level])} />
            {task.urgency_level}
          </span>

          {/* Category */}
          <Badge className={cn('text-xs', CATEGORY_COLORS[task.category as string] || 'bg-slate-100 text-slate-600')}>
            {task.category}
          </Badge>

          {/* Status (not todo) */}
          {task.status !== 'todo' && (
            <Badge className={cn(STATUS_COLORS[task.status])}>
              {task.status.replace('_', ' ')}
            </Badge>
          )}

          {/* Due date */}
          {task.due_date && (
            <span className={cn(
              'inline-flex items-center gap-1 text-xs text-slate-500',
              isOverdue(task.due_date) && !done && 'text-red-500 font-medium'
            )}>
              <Calendar className="h-3 w-3" />
              {isOverdue(task.due_date) && !done ? 'Overdue · ' : ''}{formatDate(task.due_date)}
            </span>
          )}

          {/* Time estimate */}
          {task.estimated_minutes && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {task.estimated_minutes < 60
                ? `${task.estimated_minutes}m`
                : `${Math.round(task.estimated_minutes / 60)}h`}
            </span>
          )}

          {/* Money impact */}
          {task.money_impact > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
              <DollarSign className="h-3 w-3" />
              {task.money_impact}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
