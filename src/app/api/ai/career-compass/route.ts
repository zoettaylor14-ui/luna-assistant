import { NextRequest, NextResponse } from 'next/server'
import { callAI, CAREER_COMPASS_PROMPT, parseAIJson } from '@/lib/ai'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const context = `Generate Career Compass for Zoe. Today is ${format(new Date(), 'EEEE, MMMM d')}.${body.mood ? ` Current mood: ${body.mood}.` : ''}${body.tasks?.length ? ` Open tasks: ${body.tasks.map((t: { title: string }) => t.title).join(', ')}.` : ''}`
    const result = await callAI(CAREER_COMPASS_PROMPT, context, 2000)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Career compass error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
