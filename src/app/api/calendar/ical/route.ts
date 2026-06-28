import { NextResponse } from 'next/server'
import { fetchCalendarFeed } from '@/lib/ical'

// Public iCal feeds — no auth required
const ICAL_URLS = [
  process.env.CALENDAR_ICAL_URL_1 ?? 'https://calendar.google.com/calendar/ical/zoe%40drypdigital.com/public/full.ics',
  process.env.CALENDAR_ICAL_URL_2 ?? 'https://calendar.google.com/calendar/ical/info%40drypdigital.com/public/full.ics',
  process.env.CALENDAR_ICAL_URL_3 ?? '',
].filter(Boolean)

export async function GET() {
  if (!ICAL_URLS.length) {
    return NextResponse.json({ events: [], connected: false })
  }

  try {
    const results = await Promise.allSettled(ICAL_URLS.map(url => fetchCalendarFeed(url)))

    const allEvents = results
      .flatMap((r, i) => {
        if (r.status === 'fulfilled') return r.value
        console.error(`iCal fetch failed for feed ${i}:`, r.reason)
        return []
      })
      // Deduplicate by id
      .filter((e, idx, arr) => arr.findIndex(x => x.id === e.id) === idx)
      // Sort by start
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    return NextResponse.json({
      connected: true,
      count: allEvents.length,
      events: allEvents,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('iCal route error:', err)
    return NextResponse.json({ connected: false, events: [], error: String(err) }, { status: 500 })
  }
}
