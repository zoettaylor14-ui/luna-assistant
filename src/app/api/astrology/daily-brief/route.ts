import { NextRequest, NextResponse } from 'next/server'
import { callAI, parseAIJson } from '@/lib/ai'

const BRIEF_PROMPT = `You are LUNA, Zoe's deeply personal cosmic guide.

ZOE'S NATAL CHART (confirmed):
- Sun: Scorpio
- Moon: Cancer
- Rising: Cancer
- Mercury: Scorpio
- Venus: Capricorn
- Mars: Libra
- Human Design: Self-Projected Projector, Profile 4/6, Self-Projected Authority

TODAY'S SKY:
{SKY_DATA}

Generate Zoe's complete daily cosmic brief. Be specific to her chart, not generic. Use the current sky to make real interpretations about HER day.

Crystals: Give ALL crystals that genuinely resonate for today based on the moon sign, moon phase, and active transits. Do not limit the list. Include stones for emotions, protection, focus, amplification, and any themes active today.

Colors: Give specific colors (not vague) that work with today's sky for her chart.

Return ONLY valid JSON — no markdown, no explanation:
{
  "overall_vibe": "3-5 word title for today's energy",
  "tagline": "One sentence that captures the day's essence for Zoe",
  "energy": "2-3 sentences. What energy Zoe should embody today. Specific to her chart + today's sky.",
  "avoid": "2-3 sentences. What to avoid doing, thinking, or engaging with today. Be direct.",
  "focus": "2-3 sentences. What to keep her attention on. What matters most today.",
  "gifts": "2-3 sentences. Opportunities, blessings, or openings available to her specifically today.",
  "prepare": "2-3 sentences. How to prepare for any challenges or intensity in today's sky.",
  "mantra": "A short power phrase (5-10 words) she can repeat today.",
  "colors": ["color1", "color2", "color3", "color4"],
  "color_note": "One sentence on why these colors for today.",
  "crystals": ["crystal1", "crystal2", "crystal3", "...all that apply"],
  "crystal_notes": {
    "crystal1": "Why this one today",
    "crystal2": "Why this one today"
  }
}`

export async function GET(request: NextRequest) {
  const tz = request.nextUrl.searchParams.get('tz') || 'America/New_York'

  try {
    // Fetch current sky data from existing APIs in parallel
    const base = new URL(request.url)
    base.pathname = ''
    const origin = `${base.protocol}//${base.host}`

    const [moonRes, planetsRes, transitsRes] = await Promise.allSettled([
      fetch(`${origin}/api/astrology/moon?tz=${encodeURIComponent(tz)}`).then(r => r.json()),
      fetch(`${origin}/api/astrology/planets?tz=${encodeURIComponent(tz)}`).then(r => r.json()),
      fetch(`${origin}/api/astrology/transits`).then(r => r.json()),
    ])

    const moon     = moonRes.status === 'fulfilled'     ? moonRes.value     : null
    const planets  = planetsRes.status === 'fulfilled'  ? planetsRes.value  : null
    const transits = transitsRes.status === 'fulfilled' ? transitsRes.value : null

    const now = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: tz })

    const skyData = [
      `Date: ${now}`,
      moon ? [
        `Moon Phase: ${moon.phase?.name} (${moon.phase?.illumination}% illuminated)`,
        `Moon Sign: ${moon.sign?.name} at ${moon.sign?.formatted}`,
        `Moon Phase Keywords: ${moon.phase?.description || ''}`,
        `Moon Sign Keywords: ${moon.sign?.keywords || ''}`,
        moon.phase?.next_exact ? `Next moon phase: ${moon.phase.next_exact.name} in ${moon.phase.next_exact.time}` : '',
        moon.next_ingress ? `Moon moves to next sign: ${moon.next_ingress}` : '',
      ].filter(Boolean).join('\n') : 'Moon data unavailable',
      planets ? [
        `Planetary positions: ${planets.planets?.map((p: { name: string; sign: string; retrograde: boolean }) => `${p.name} in ${p.sign}${p.retrograde ? ' (retrograde)' : ''}`).join(', ')}`,
        planets.retrogrades?.length ? `Retrogrades active: ${planets.retrogrades.join(', ')}` : 'No retrogrades',
      ].join('\n') : 'Planet data unavailable',
      transits ? [
        transits.daily_theme ? `Today's cosmic theme: ${transits.daily_theme}` : '',
        transits.moon_house ? `Moon is in Zoe's ${transits.moon_house}th house — ${transits.moon_house_meaning}` : '',
        transits.major_aspects?.length ? `Active transits to her natal chart:\n${transits.major_aspects.map((a: { transiting: string; type: string; natal: string; interpretation: string }) => `- ${a.transiting} ${a.type} natal ${a.natal}: ${a.interpretation}`).join('\n')}` : '',
      ].filter(Boolean).join('\n') : 'Transit data unavailable',
    ].join('\n\n')

    const prompt = BRIEF_PROMPT.replace('{SKY_DATA}', skyData)

    const raw = await callAI(
      'You are LUNA, a precise cosmic guide. Return ONLY valid JSON. No markdown. No explanation outside the JSON.',
      prompt,
      2400
    )

    const brief = parseAIJson(raw)
    if (!brief) return NextResponse.json({ error: 'Failed to parse brief' }, { status: 500 })

    return NextResponse.json({
      ...brief,
      generated_at: new Date().toISOString(),
      sky: { moon, planets: planets?.planets, retrogrades: planets?.retrogrades, transits }
    }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' }
    })
  } catch (err) {
    console.error('Daily brief error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
