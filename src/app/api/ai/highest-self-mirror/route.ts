import { NextRequest, NextResponse } from 'next/server'
import { callAI, HIGHEST_SELF_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { situation } = await request.json()
    if (!situation?.trim()) return NextResponse.json({ error: 'Situation required' }, { status: 400 })
    const context = `Zoe's current situation or pattern:\n\n${situation}`
    const result = await callAI(HIGHEST_SELF_PROMPT, context, 1800)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Highest self error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
