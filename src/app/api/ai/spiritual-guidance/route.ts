import { NextRequest, NextResponse } from 'next/server'
import { callAI, SPIRITUAL_GUIDANCE_PROMPT, parseAIJson } from '@/lib/ai'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const context = `Generate spiritual guidance for Zoe. Today is ${format(new Date(), 'EEEE, MMMM d, yyyy')}.`
    const result = await callAI(SPIRITUAL_GUIDANCE_PROMPT, context, 1500)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Spiritual guidance error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
