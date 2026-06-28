import { NextRequest, NextResponse } from 'next/server'
import { getCurrentPlanets, getRetrogradePlanets, getUpcomingEclipses } from '@/lib/astrology'

export async function GET(req: NextRequest) {
  try {
    const tz = new URL(req.url).searchParams.get('tz') || 'America/New_York'
    const now = new Date()

    const planets = getCurrentPlanets(now)
    const retrogrades = getRetrogradePlanets(now)
    const eclipses = getUpcomingEclipses(now)

    // Format dates in user's timezone
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })

    return NextResponse.json({
      planets,
      retrogrades: retrogrades.map(p => p.name),
      eclipses: eclipses.map(e => ({
        ...e,
        dateFormatted: fmt.format(e.date),
        date: e.date.toISOString(),
      })),
      calculated_at: now.toISOString(),
      timezone: tz,
    })
  } catch (err) {
    console.error('planets route error:', err)
    return NextResponse.json({ error: 'Calculation error' }, { status: 500 })
  }
}
