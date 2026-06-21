import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, DICTATION_PROMPT, parseAIJson } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { text, type } = await request.json()
    if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const context = `Dictation type: ${type || 'journal'}\n\nZoe said:\n\n${text}`
    const result = await callAI(DICTATION_PROMPT, context)
    const parsed = parseAIJson(result)

    if (user) {
      await supabase.from('dictation_entries').insert({
        user_id: user.id,
        raw_text: text,
        entry_type: type || 'journal',
        ...(parsed as object),
      }).select().single()
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Dictation error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
