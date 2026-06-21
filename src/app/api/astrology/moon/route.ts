import { NextRequest, NextResponse } from 'next/server'
import * as Astronomy from 'astronomy-engine'

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

const SIGN_EMOJIS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
}

const SIGN_KEYWORDS: Record<string, string> = {
  Aries: 'Initiation, boldness, energy',
  Taurus: 'Grounding, pleasure, stability',
  Gemini: 'Communication, curiosity, movement',
  Cancer: 'Emotion, nurturing, home, memory',
  Leo: 'Creativity, confidence, visibility',
  Virgo: 'Clarity, service, refinement, detail',
  Libra: 'Balance, beauty, relationships, peace',
  Scorpio: 'Depth, transformation, truth, power',
  Sagittarius: 'Expansion, truth, freedom, vision',
  Capricorn: 'Ambition, structure, mastery, time',
  Aquarius: 'Innovation, community, liberation',
  Pisces: 'Intuition, compassion, dissolution, dreams'
}

const PHASE_NAMES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
]

function getMoonZodiacSign(date: Date): { sign: string; degree: number; minutes: number; nextSignDate: Date | null } {
  const ecliptic = Astronomy.EclipticGeoMoon(date)
  const longitude = ((ecliptic.lon % 360) + 360) % 360
  const signIndex = Math.floor(longitude / 30)
  const degreeInSign = longitude % 30
  const degree = Math.floor(degreeInSign)
  const minutes = Math.floor((degreeInSign - degree) * 60)

  // Calculate when moon enters next sign
  const degreesToNextSign = 30 - degreeInSign
  // Moon moves ~0.5498° per hour on average
  const hoursToNextSign = degreesToNextSign / 0.5498
  const nextSignDate = new Date(date.getTime() + hoursToNextSign * 60 * 60 * 1000)

  return {
    sign: ZODIAC_SIGNS[signIndex] ?? 'Unknown',
    degree,
    minutes,
    nextSignDate: hoursToNextSign < 48 ? nextSignDate : null,
  }
}

function getMoonPhaseInfo(date: Date): { phaseName: string; illumination: number; phaseAngle: number } {
  const moonPhase = Astronomy.MoonPhase(date)
  // moonPhase returns 0-360 (ecliptic longitude difference between moon and sun)
  const phaseAngle = ((moonPhase % 360) + 360) % 360
  const phaseIndex = Math.floor(phaseAngle / 45)
  const illumination = Math.round((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2 * 100)

  return {
    phaseName: PHASE_NAMES[phaseIndex] ?? 'Unknown',
    illumination,
    phaseAngle: Math.round(phaseAngle),
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tz = url.searchParams.get('tz') || 'America/New_York'

    const now = new Date()

    const moonSign = getMoonZodiacSign(now)
    const phaseInfo = getMoonPhaseInfo(now)

    // Format next sign ingress time in user's timezone
    let nextSignIngress: string | null = null
    if (moonSign.nextSignDate) {
      const nextSign = getMoonZodiacSign(moonSign.nextSignDate)
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
      })
      nextSignIngress = `${nextSign.sign} at ${formatter.format(moonSign.nextSignDate)}`
    }

    const sign = moonSign.sign

    return NextResponse.json({
      // Moon Phase (how full the moon appears)
      phase: {
        name: phaseInfo.phaseName,
        illumination: phaseInfo.illumination,
        angle: phaseInfo.phaseAngle,
      },
      // Moon Sign (which zodiac sign the moon is in)
      sign: {
        name: sign,
        emoji: SIGN_EMOJIS[sign] ?? '🌙',
        degree: moonSign.degree,
        minutes: moonSign.minutes,
        formatted: `${moonSign.degree}°${String(moonSign.minutes).padStart(2, '0')}' ${sign}`,
        keywords: SIGN_KEYWORDS[sign] ?? '',
      },
      // When the moon enters the next sign (if within 48h)
      next_ingress: nextSignIngress,
      // Source
      source: 'astronomy-engine (Swiss Ephemeris compatible)',
      calculated_at: now.toISOString(),
    })
  } catch (err) {
    console.error('Moon calculation error:', err)
    return NextResponse.json({ error: 'Calculation error' }, { status: 500 })
  }
}
