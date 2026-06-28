import { NextRequest, NextResponse } from 'next/server'
import { callAI, CAREER_COMPASS_PROMPT, parseAIJson } from '@/lib/ai'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const taskList    = body.tasks?.map((t: { title: string; priority?: string; account_name?: string; due_date?: string }) =>
      `${t.title}${t.account_name ? ` (${t.account_name})` : ''}${t.priority ? ` [${t.priority}]` : ''}${t.due_date ? ` due ${t.due_date.slice(0,10)}` : ''}`
    ).join(', ') ?? ''
    const clientList  = body.accounts?.map((a: { business_name: string; health_status?: string; client_pipeline_stage?: string; monthly_retainer?: number }) =>
      `${a.business_name} (${a.health_status ?? 'unknown'}, stage: ${a.client_pipeline_stage ?? 'n/a'}${a.monthly_retainer ? `, $${a.monthly_retainer}/mo` : ''})`
    ).join('; ') ?? ''
    const context = [
      `Generate Career Compass for Zoe. Today is ${format(new Date(), 'EEEE, MMMM d')}.`,
      body.mood ? `Current mood: ${body.mood}.` : '',
      taskList  ? `Her open tasks in DRYP CRM: ${taskList}.` : '',
      clientList ? `Active clients in DRYP CRM: ${clientList}.` : '',
    ].filter(Boolean).join(' ')
    const result = await callAI(CAREER_COMPASS_PROMPT, context, 2000)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('Career compass error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
