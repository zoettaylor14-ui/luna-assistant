import { NextRequest, NextResponse } from 'next/server'
import { isConnected, findAccountByName, getAccountNotesToday } from '@/lib/dryp-crm'

// Called after a meeting ends. Checks if notes were added today for that client.
// Body: { meeting_title: string, client_name?: string, ended_at: string }
export async function POST(req: NextRequest) {
  if (!isConnected()) {
    return NextResponse.json({ connected: false, needsNotes: false })
  }

  try {
    const body = await req.json()
    const clientName = body.client_name ?? body.meeting_title

    if (!clientName) {
      return NextResponse.json({ connected: true, needsNotes: false, reason: 'no_client_name' })
    }

    const account = await findAccountByName(clientName)
    if (!account) {
      return NextResponse.json({ connected: true, needsNotes: false, reason: 'client_not_found', searched: clientName })
    }

    const notesToday = await getAccountNotesToday(account.id)
    const needsNotes = notesToday.length === 0

    return NextResponse.json({
      connected: true,
      needsNotes,
      account: { id: account.id, name: account.business_name },
      notesCount: notesToday.length,
      dryphubUrl: `https://www.dryphub.com/accounts/${account.id}`,
    })
  } catch (err) {
    console.error('DRYP meeting check error:', err)
    return NextResponse.json({ connected: false, needsNotes: false, error: String(err) }, { status: 500 })
  }
}
