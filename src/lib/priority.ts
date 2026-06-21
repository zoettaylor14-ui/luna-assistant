import { Task } from '@/types'

export function calculatePriorityScore(task: Partial<Task>): number {
  const now = new Date()

  let urgency = 0
  switch (task.urgency_level) {
    case 'critical': urgency = 40; break
    case 'high': urgency = 30; break
    case 'medium': urgency = 15; break
    case 'low': urgency = 5; break
  }

  let deadlinePressure = 0
  if (task.due_date) {
    const due = new Date(task.due_date)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue < 0) deadlinePressure = 30
    else if (daysUntilDue === 0) deadlinePressure = 25
    else if (daysUntilDue === 1) deadlinePressure = 20
    else if (daysUntilDue <= 3) deadlinePressure = 15
    else if (daysUntilDue <= 7) deadlinePressure = 10
    else if (daysUntilDue <= 14) deadlinePressure = 5
  }

  const revenueImpact = Math.min((task.money_impact || 0) / 10, 20)

  let clientImportance = 0
  const highValueClients = ['EHM Strategies', 'DRYP Studio', 'Hoover Digital', 'Villa Residential']
  if (task.project && highValueClients.some(c => task.project?.includes(c))) {
    clientImportance = 15
  } else if (task.category === 'Money / Invoices') {
    clientImportance = 20
  } else if (task.category === 'Urgent Fixes') {
    clientImportance = 25
  }

  const blockerImpact = task.category === 'Urgent Fixes' ? 10 : 0

  let personalImportance = 0
  if (task.category === 'Health') personalImportance = 15
  if (task.category === 'School') personalImportance = 12
  if (task.emotional_weight && task.emotional_weight > 7) personalImportance += 5

  let effortPenalty = 0
  if (task.estimated_minutes) {
    if (task.estimated_minutes > 240) effortPenalty = 10
    else if (task.estimated_minutes > 120) effortPenalty = 5
    else if (task.estimated_minutes > 60) effortPenalty = 2
  }

  return urgency + deadlinePressure + revenueImpact + clientImportance + blockerImpact + personalImportance - effortPenalty
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.priority_score - a.priority_score)
}
