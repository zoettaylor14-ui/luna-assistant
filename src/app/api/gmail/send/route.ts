import { NextRequest, NextResponse } from 'next/server'
import { getGmailTokens, sendGmailMessage } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const tokens = await getGmailTokens()
  if (!tokens) return NextResponse.json({ error: 'not_connected' }, { status: 401 })

  const { to, subject, body, threadId, replyToMessageId } = await req.json()
  if (!to || !subject || !body) return NextResponse.json({ error: 'missing_fields' }, { status: 400 })

  try {
    const result = await sendGmailMessage(tokens.access_token, { to, subject, body, threadId, replyToMessageId })
    return NextResponse.json({ success: true, messageId: result.id })
  } catch (err) {
    console.error('Gmail send error:', err)
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }
}
