import { NextRequest, NextResponse } from 'next/server'
import { callAI, TAROT_PROMPT, parseAIJson } from '@/lib/ai'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const { card, theme } = await request.json()
    const context = `Today is ${format(new Date(), 'EEEE, MMMM d, yyyy')}. Zoe pulled: ${card} (${theme}).`
    const result = await callAI(TAROT_PROMPT, context, 1000)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Tarot error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
