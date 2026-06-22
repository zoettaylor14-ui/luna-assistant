import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { webhook_type, webhook_code } = body

    // Respond 200 immediately — Plaid requires fast response
    // Fire-and-forget the sync
    if (
      webhook_type === 'TRANSACTIONS' &&
      (webhook_code === 'SYNC_UPDATES_AVAILABLE' || webhook_code === 'DEFAULT_UPDATE')
    ) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      fetch(`${baseUrl}/api/plaid/transactions/sync`, { method: 'POST' })
        .catch(err => console.error('[Plaid webhook] sync trigger error:', err))
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ received: true })
  }
}
