import { NextRequest, NextResponse } from 'next/server'
import { callAI, MIDDAY_CHECKIN_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { energy, checks, note } = await request.json()
    const context = `Midday check-in:
- Current energy: ${energy || 'not specified'}
- Body checks: water=${checks?.water ? 'yes' : 'no'}, food=${checks?.food ? 'yes' : 'no'}, air=${checks?.air ? 'yes' : 'no'}
${note ? `- Reflection note: ${note}` : ''}`
    const result = await callAI(MIDDAY_CHECKIN_PROMPT, context, 1000)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Midday checkin error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
