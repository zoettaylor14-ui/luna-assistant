import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, MESSAGE_HELPER_PROMPT, parseAIJson } from '@/lib/ai'

function messageFallback(senderName: string, activatedLevel: number) {
  const isReactive = activatedLevel >= 4
  return {
    what_they_mean: 'Take a moment to read beneath the words — what does this person actually need from you right now?',
    summary: 'Message received. Breathe before responding.',
    urgency: isReactive ? 'high' : 'medium',
    emotional_tone: 'neutral',
    reactive_warning: isReactive ? 'yes' : 'no',
    reactive_reason: isReactive ? 'Your activation is high right now. Wait at least 10 minutes before responding. Sending from this place will cost you more than waiting.' : undefined,
    what_not_to_say: 'Avoid over-explaining, defending yourself in detail, or sending anything while still in the feeling. Your Scorpio Mercury will want to say everything — say less.',
    wound_reply: `(Awareness only — do not send) "I can't believe you would say that. After everything I've done, this is really disappointing."`,
    soft_reply: `Thank you for reaching out${senderName ? `, ${senderName}` : ''}. I want to make sure I respond thoughtfully — let me get back to you with clarity shortly.`,
    direct_reply: `I'll look into this and follow up soon.`,
    confident_reply: `I hear you. I'll respond when I have full clarity on my end.`,
    wisdom_reply: `Thank you for this. I'm going to sit with it and respond with intention — you'll hear from me soon.`,
    reflection: 'Am I responding from my wound or from my wisdom right now? What would my highest self actually say?',
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, sender_name, context: relationship, activated_level } = await request.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const activationLabel = activated_level >= 5 ? 'REACTIVE (5/5)' : activated_level >= 4 ? 'Activated (4/5)' : activated_level >= 3 ? 'Stirred (3/5)' : activated_level >= 2 ? 'Mild (2/5)' : 'Calm (1/5)'
    const context = [
      sender_name ? `From: ${sender_name}.` : '',
      relationship ? `Relationship: ${relationship}.` : '',
      activated_level ? `Zoe's activation: ${activationLabel} — ${activated_level >= 4 ? 'She needs maximum protection. Flag the reactive warning clearly.' : 'She is relatively calm.'}` : '',
      `\nMessage:\n${message}`,
    ].filter(Boolean).join('\n')

    let parsed: ReturnType<typeof messageFallback>
    try {
      const result = await callAI(MESSAGE_HELPER_PROMPT, context, 1500)
      parsed = parseAIJson(result)
    } catch {
      parsed = messageFallback(sender_name ?? '', activated_level ?? 1)
    }

    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('message_suggestions').insert({
          user_id: user.id, original_message: message, sender_name, context: relationship, ...(parsed as object),
        })
      }
    } catch { /* non-fatal */ }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Message suggestions error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
