import { NextRequest, NextResponse } from 'next/server'
import { isConnected, getRecentChanges, getNewAccounts } from '@/lib/dryp-crm'

export async function GET(req: NextRequest) {
  if (!isConnected()) {
    return NextResponse.json({ connected: false, updatedAccounts: [], newNotes: [], newAccounts: [] })
  }

  const hours = parseInt(req.nextUrl.searchParams.get('hours') ?? '24')
  const since = req.nextUrl.searchParams.get('since') ?? new Date(Date.now() - hours * 3_600_000).toISOString()

  try {
    const [changes, newAccounts] = await Promise.all([
      getRecentChanges(hours),
      getNewAccounts(since),
    ])
    return NextResponse.json({
      connected: true,
      ...changes,
      newAccounts,
      checkedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('DRYP changes error:', err)
    return NextResponse.json({ connected: false, error: String(err), updatedAccounts: [], newNotes: [], newAccounts: [] }, { status: 500 })
  }
}
