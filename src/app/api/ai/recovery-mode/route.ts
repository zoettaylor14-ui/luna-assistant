import { NextRequest, NextResponse } from 'next/server'
import { callAI, RECOVERY_MODE_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const context = `Zoe woke up late. ${body.context || 'Help her recover without shame.'}`
    const result = await callAI(RECOVERY_MODE_PROMPT, context, 1000)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Recovery mode error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
