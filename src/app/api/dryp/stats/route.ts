import { NextResponse } from 'next/server'
import { getSummaryStats, isConnected } from '@/lib/dryp-crm'

export async function GET() {
  if (!isConnected()) return NextResponse.json({ connected: false })
  try {
    const stats = await getSummaryStats()
    return NextResponse.json({ connected: true, ...stats })
  } catch (err) {
    return NextResponse.json({ connected: false, error: String(err) }, { status: 500 })
  }
}
