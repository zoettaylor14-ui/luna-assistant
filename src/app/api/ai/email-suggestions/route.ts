import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, EMAIL_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email_body, sender, subject, context } = await request.json()

    if (!email_body) {
      return NextResponse.json({ error: 'email_body required' }, { status: 400 })
    }

    const emailText = [
      sender ? `From: ${sender}` : '',
      subject ? `Subject: ${subject}` : '',
      context ? `Context: ${context}` : '',
      `\nEmail body:\n${email_body}`,
    ].filter(Boolean).join('\n')

    const result = await callAI(EMAIL_PROMPT, emailText)
    const parsed = parseAIJson<{
      summary: string
      urgency: string
      sender_intent: string
      suggested_action: string
      replies: { short: string; professional: string; warm: string }
    }>(result)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('AI email error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
