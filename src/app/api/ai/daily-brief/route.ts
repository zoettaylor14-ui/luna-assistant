import { NextRequest, NextResponse } from 'next/server'
import { callAI, DAILY_BRIEF_PROMPT, parseAIJson } from '@/lib/ai'

const FALLBACK = {
  mantra: 'You are not behind. You are returning.',
  theme: 'Presence',
  focus_areas: ['Show up for what matters most today', 'Protect your energy', 'One clear next step'],
  tone_mode: 'Soft Start',
  reflection: 'Some days the most powerful thing is to begin quietly, without pressure.',
  affirmation: 'Your consistency builds legacy. Today counts.',
  one_move: 'Choose one task that moves the needle and give it your full attention first.',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkIn, tasks } = body

    let context = "Generate Zoe's morning daily brief."
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

    try {
      const result = await callAI(DAILY_BRIEF_PROMPT, context, 2000)
      const parsed = parseAIJson(result)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json(FALLBACK)
    }
  } catch (err) {
    console.error('Daily brief error:', err)
    return NextResponse.json(FALLBACK)
  }
}
