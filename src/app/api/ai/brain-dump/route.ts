import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, BRAIN_DUMP_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 })
    }

    const result = await callAI(BRAIN_DUMP_PROMPT, `Here's Zoe's brain dump:\n\n${text}`)
    const parsed = parseAIJson<{
      tasks: Array<{
        title: string
        category: string
        project: string
        urgency_level: string
        estimated_minutes: number
        money_impact: number
        is_quick_win: boolean
        priority_score: number
      }>
      grouped: Record<string, Array<{ title: string }>>
      today_order: Array<{ title: string }>
      quick_wins: Array<{ title: string }>
      can_wait: Array<{ title: string }>
      ai_message: string
    }>(result)

    // Save brain dump to DB
    await supabase.from('brain_dumps').insert({
      user_id: user.id,
      raw_text: text,
      ai_summary: parsed.ai_message,
      created_tasks: parsed.tasks,
    })

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Brain dump error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
