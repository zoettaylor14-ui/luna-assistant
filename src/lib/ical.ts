export interface ICalEvent {
  id:          string
  title:       string
  start:       string   // ISO string
  end:         string   // ISO string
  allDay:      boolean
  location?:   string
  description?: string
  status?:     string
}

// ─── Minimal iCal parser (no dependencies) ──────────────────────────────────

function unfoldLines(raw: string): string[] {
  return raw.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').split('\n')
}

function parseDate(value: string, params: string): { iso: string; allDay: boolean } {
  const isDate = params.includes('VALUE=DATE') || /^\d{8}$/.test(value)
  if (isDate) {
    const y = value.slice(0, 4), m = value.slice(4, 6), d = value.slice(6, 8)
    return { iso: `${y}-${m}-${d}T00:00:00.000Z`, allDay: true }
  }
  // Date-time: 20260622T143000Z  or  20260622T143000 (floating/TZID)
  const utc  = value.endsWith('Z')
  const y = value.slice(0, 4), mo = value.slice(4, 6), dy = value.slice(6, 8)
  const h = value.slice(9, 11), mi = value.slice(11, 13), s = value.slice(13, 15) || '00'
  const iso = `${y}-${mo}-${dy}T${h}:${mi}:${s}${utc ? 'Z' : ''}`
  return { iso, allDay: false }
}

export function parseIcal(raw: string): ICalEvent[] {
  const lines  = unfoldLines(raw)
  const events: ICalEvent[] = []
  let inEvent  = false
  let current: Record<string, string> = {}

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; current = {}; continue }
    if (line === 'END:VEVENT') {
      inEvent = false
      if (current.SUMMARY && current['DTSTART']) {
        const startRaw    = current['DTSTART'] ?? ''
        const startParams = current['DTSTART_PARAMS'] ?? ''
        const endRaw      = current['DTEND'] ?? current['DTSTART'] ?? ''
        const endParams   = current['DTEND_PARAMS']   ?? current['DTSTART_PARAMS'] ?? ''
        const { iso: startIso, allDay } = parseDate(startRaw, startParams)
        const { iso: endIso }           = parseDate(endRaw,   endParams)

        events.push({
          id:          current.UID     ?? `${startIso}-${current.SUMMARY}`,
          title:       current.SUMMARY ?? 'Untitled',
          start:       startIso,
          end:         endIso,
          allDay,
          location:    current.LOCATION    || undefined,
          description: current.DESCRIPTION || undefined,
          status:      current.STATUS      || undefined,
        })
      }
      continue
    }
    if (!inEvent) continue

    const colon = line.indexOf(':')
    if (colon === -1) continue
    const keyPart = line.slice(0, colon)
    const value   = line.slice(colon + 1).replace(/\\n/g, '\n').replace(/\\,/g, ',').trim()
    const semi    = keyPart.indexOf(';')
    const key     = semi === -1 ? keyPart : keyPart.slice(0, semi)
    const params  = semi === -1 ? ''      : keyPart.slice(semi + 1)

    if (key === 'DTSTART') { current['DTSTART'] = value; current['DTSTART_PARAMS'] = params }
    else if (key === 'DTEND')  { current['DTEND'] = value; current['DTEND_PARAMS'] = params }
    else current[key] = value
  }

  // Filter cancelled, sort by start
  return events
    .filter(e => e.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

// ─── Fetch + parse ────────────────────────────────────────────────────────────
export async function fetchCalendarFeed(url: string): Promise<ICalEvent[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LUNA/1.0 (calendar sync)' },
    next: { revalidate: 300 }, // cache 5 min
  })
  if (!res.ok) throw new Error(`iCal fetch failed: ${res.status}`)
  const text = await res.text()
  return parseIcal(text)
}
