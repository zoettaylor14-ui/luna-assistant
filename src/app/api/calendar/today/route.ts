import { NextResponse } from 'next/server'
import { getTodayEvents } from '@/lib/calendar'

export async function GET() {
  try {
    const events = await getTodayEvents()
    return NextResponse.json({ events, count: events.length })
  } catch (err) {
    console.error('Calendar today error:', err)
    return NextResponse.json({ error: 'calendar_failed', events: [] }, { status: 500 })
  }
}
