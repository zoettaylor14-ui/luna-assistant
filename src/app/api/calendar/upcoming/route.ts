import { NextRequest, NextResponse } from 'next/server'
import { getUpcomingEvents } from '@/lib/calendar'

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '14')
  try {
    const events = await getUpcomingEvents(days)
    return NextResponse.json({ events, count: events.length })
  } catch (err) {
    console.error('Calendar upcoming error:', err)
    return NextResponse.json({ error: 'calendar_failed', events: [] }, { status: 500 })
  }
}
