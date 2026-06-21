import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, DAILY_BRIEF_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkIn, tasks } = body

    let context = 'Generate Zoe\'s morning daily brief.'
    if (checkIn) {
      context += `\n\nMorning check-in data:
- Wake time: ${checkIn.wakeTime || 'unknown'}
- Sleep rating: ${checkIn.sleepRating}/10
- Energy rating: ${checkIn.energyRating}/10
- Mood rating: ${checkIn.moodRating}/10
- Had dream: ${checkIn.hadDream ? 'yes' : 'no'}
${checkIn.dreamText ? `- Dream: ${checkIn.dreamText}` : ''}
- Feeling: ${checkIn.feeling || 'not shared'}
- On mind: ${checkIn.onMind || 'not shared'}
- Support need: ${checkIn.supportNeed || 'general guidance'}
- Pride goal: ${checkIn.prideGoal || 'not set'}`
    }
    if (tasks?.length) {
      context += `\n\nOpen tasks: ${tasks.slice(0, 5).map((t: { title: string }) => t.title).join(', ')}`
    }

    const result = await callAI(DAILY_BRIEF_PROMPT, context, 2000)
    const parsed = parseAIJson(result)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Daily brief error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
