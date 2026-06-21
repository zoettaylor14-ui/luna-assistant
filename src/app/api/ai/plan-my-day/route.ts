import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, DAILY_PLAN_PROMPT, parseAIJson } from '@/lib/ai'
import { calculatePriorityScore } from '@/lib/priority'
import { Task } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .not('status', 'in', '("done","cancelled")')

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks to plan' }, { status: 400 })
    }

    const scored = (tasks as Task[]).map(t => ({
      ...t,
      priority_score: calculatePriorityScore(t),
    })).sort((a, b) => b.priority_score - a.priority_score)

    const tasksText = scored.slice(0, 20).map(t =>
      `"${t.title}" | ${t.category} | Due: ${t.due_date || 'none'} | Urgency: ${t.urgency_level} | ~${t.estimated_minutes || '?'}mins | Score: ${t.priority_score}`
    ).join('\n')

    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    const result = await callAI(DAILY_PLAN_PROMPT, `Today is ${todayDate}. Here are Zoe's open tasks:\n\n${tasksText}`)
    const parsed = parseAIJson(result)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Plan my day error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
