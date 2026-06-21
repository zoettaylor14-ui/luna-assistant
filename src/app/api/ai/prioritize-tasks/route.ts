import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, TASK_PRIORITY_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tasks } = await request.json()
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'Tasks array required' }, { status: 400 })
    }

    const tasksText = tasks.map((t: { id: string; title: string; category: string; due_date?: string; urgency_level: string; money_impact: number; estimated_minutes?: number; project?: string }) =>
      `ID: ${t.id} | "${t.title}" | Category: ${t.category} | Due: ${t.due_date || 'none'} | Urgency: ${t.urgency_level} | Money impact: ${t.money_impact} | Est: ${t.estimated_minutes || 'unknown'} mins | Project: ${t.project || 'none'}`
    ).join('\n')

    const result = await callAI(TASK_PRIORITY_PROMPT, `Here are Zoe's open tasks:\n\n${tasksText}`)
    const parsed = parseAIJson<{ ranked_tasks: Array<{ id: string; title: string; priority_score: number; reason: string }> }>(result)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('AI prioritize error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
