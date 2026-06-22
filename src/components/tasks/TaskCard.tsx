'use client'
import { Task } from '@/types'
import { Badge } from '@/components/ui/badge'
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
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl transition-all dark-card',
        done && 'opacity-60',
        compact && 'py-3'
      )}>
      {/* Status toggle */}
      <button
        onClick={() => onStatusChange?.(task.id, done ? 'todo' : 'done')}
        className="mt-0.5 flex-shrink-0 transition-colors"
        style={{ color: done ? 'var(--violet)' : 'var(--text-3)' }}
      >
        {task.status === 'done' ? (
          <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--violet)' }} />
        ) : task.status === 'in_progress' ? (
          <PlayCircle className="h-5 w-5" style={{ color: '#7BAFD4' }} />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-semibold leading-snug"
            style={{
              color: done ? 'var(--text-3)' : 'var(--text-1)',
              textDecoration: done ? 'line-through' : 'none',
            }}>
            {task.title}
          </p>
          {task.priority_score > 0 && (
            <span className="flex-shrink-0 text-sm font-bold" style={{ color: 'var(--text-3)' }}>
              #{task.priority_score}
            </span>
          )}
        </div>

        {task.description && !compact && (
          <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-2)' }}>
            {task.description}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {/* Urgency */}
          <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold', URGENCY_COLORS[task.urgency_level])}>
            <span className={cn('w-1.5 h-1.5 rounded-full', URGENCY_DOT[task.urgency_level])} />
            {task.urgency_level}
          </span>

          {/* Category */}
          {CATEGORY_COLORS[task.category as string] ? (
            <Badge className={cn('text-xs', CATEGORY_COLORS[task.category as string])}>
              {task.category}
            </Badge>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'var(--surface-subtle)', color: 'var(--text-2)', border: '1px solid var(--surface-border)' }}>
              {task.category}
            </span>
          )}

          {/* Status */}
          {task.status !== 'todo' && (
            <Badge className={cn(STATUS_COLORS[task.status])}>
              {task.status.replace('_', ' ')}
            </Badge>
          )}

          {/* Due date */}
          {task.due_date && (
            <span className={cn(
              'inline-flex items-center gap-1 text-sm',
              isOverdue(task.due_date) && !done ? 'font-semibold' : ''
            )}
            style={{ color: isOverdue(task.due_date) && !done ? '#E88080' : 'var(--text-3)' }}>
              <Calendar className="h-3.5 w-3.5" />
              {isOverdue(task.due_date) && !done ? 'Overdue · ' : ''}{formatDate(task.due_date)}
            </span>
          )}

          {/* Time estimate */}
          {task.estimated_minutes && (
            <span className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--text-3)' }}>
              <Clock className="h-3.5 w-3.5" />
              {task.estimated_minutes < 60
                ? `${task.estimated_minutes}m`
                : `${Math.round(task.estimated_minutes / 60)}h`}
            </span>
          )}

          {/* Money impact */}
          {task.money_impact > 0 && (
            <span className="inline-flex items-center gap-0.5 text-sm font-semibold" style={{ color: '#7BAF8A' }}>
              <DollarSign className="h-3.5 w-3.5" />
              {task.money_impact}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
