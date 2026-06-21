import { NextRequest, NextResponse } from 'next/server'
import { callAI, WEEKLY_RESET_PROMPT, parseAIJson } from '@/lib/ai'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const { reflections, checklist_pct } = await request.json()
    const context = `Zoe's Sunday weekly reset. Week ending ${format(new Date(), 'MMMM d, yyyy')}.
Checklist completion: ${checklist_pct ?? 0}%

Weekly reflection:
${Object.entries(reflections || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`
    const result = await callAI(WEEKLY_RESET_PROMPT, context, 1500)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Weekly reset error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
