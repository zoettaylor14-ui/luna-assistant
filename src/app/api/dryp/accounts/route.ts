import { NextResponse } from 'next/server'
import { isConnected, getAccounts, getSummaryStats } from '@/lib/dryp-crm'

export async function GET() {
  if (!isConnected()) {
    return NextResponse.json({ connected: false, accounts: [], stats: null, error: 'DRYP_SUPABASE_URL and DRYP_SUPABASE_SERVICE_KEY not configured' })
  }
  try {
    const [accounts, stats] = await Promise.all([getAccounts(), getSummaryStats()])
    return NextResponse.json({ connected: true, accounts, stats })
  } catch (err) {
    console.error('DRYP accounts error:', err)
    return NextResponse.json({ connected: false, accounts: [], stats: null, error: String(err) }, { status: 500 })
  }
}
