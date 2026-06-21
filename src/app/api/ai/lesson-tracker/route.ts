import { NextRequest, NextResponse } from 'next/server'
import { callAI, LESSON_TRACKER_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { entries } = await request.json()
    const context = `Zoe's weekly reflection:\n\n${Object.entries(entries || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}`
    const result = await callAI(LESSON_TRACKER_PROMPT, context, 1500)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Lesson tracker error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
