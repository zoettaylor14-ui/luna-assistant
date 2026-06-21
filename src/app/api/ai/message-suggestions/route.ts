import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, MESSAGE_HELPER_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { message, sender_name, context: relationship, activated_level } = await request.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const activationLabel = activated_level >= 5 ? 'REACTIVE (5/5)' : activated_level >= 4 ? 'Activated (4/5)' : activated_level >= 3 ? 'Stirred (3/5)' : activated_level >= 2 ? 'Mild (2/5)' : 'Calm (1/5)'
    const context = [
      sender_name ? `From: ${sender_name}.` : '',
      relationship ? `Relationship: ${relationship}.` : '',
      activated_level ? `Zoe's activation level: ${activationLabel} — ${activated_level >= 4 ? 'She needs maximum protection right now. Flag the reactive warning clearly.' : 'She is relatively calm.'}` : '',
      `\nMessage:\n${message}`,
    ].filter(Boolean).join('\n')
    const result = await callAI(MESSAGE_HELPER_PROMPT, context, 1500)
    const parsed = parseAIJson(result)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('message_suggestions').insert({
        user_id: user.id,
        original_message: message,
        sender_name,
        context: relationship,
        ...(parsed as object),
      })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Message suggestions error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
