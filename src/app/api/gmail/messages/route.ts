import { NextRequest, NextResponse } from 'next/server'
import { getGmailTokens, listGmailMessages } from '@/lib/gmail'

export async function GET(req: NextRequest) {
  const tokens = await getGmailTokens()
  if (!tokens) return NextResponse.json({ error: 'not_connected' }, { status: 401 })

  const q          = req.nextUrl.searchParams.get('q')          ?? 'in:inbox'
  const maxResults = parseInt(req.nextUrl.searchParams.get('max') ?? '30')

  try {
    const messages = await listGmailMessages(tokens.access_token, q, maxResults)
    return NextResponse.json({ messages, connected_email: tokens.connected_email })
  } catch (err) {
    console.error('Gmail messages error:', err)
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 })
  }
}
