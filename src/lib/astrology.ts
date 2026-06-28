/**
 * LUNA Astrology Engine
 * Real-time calculations via astronomy-engine (Swiss Ephemeris compatible).
 * Natal positions from Zoe's confirmed birth chart (Nov 14 2000, 7:04 PM, Sellersville PA).
 */
import * as Astronomy from 'astronomy-engine'

// ─── Types ───────────────────────────────────────────────────
export const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
] as const
export type ZodiacSign = typeof ZODIAC_SIGNS[number]

export type PlanetPosition = {
  name:       string
  lon:        number
  sign:       ZodiacSign
  degree:     number
  minutes:    number
  formatted:  string   // e.g. "22°55' Scorpio"
  retrograde: boolean
  emoji:      string
}

export type Aspect = {
  transiting: string
  natal:      string
  type:       string   // 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'
  angle:      number   // actual angle between them
  orb:        number   // degrees off exact
  applying:   boolean
  energy:     string   // keyword
  emoji:      string
}

// ─── Constants ───────────────────────────────────────────────
export const SIGN_EMOJIS: Record<ZodiacSign, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
}

export const SIGN_KEYWORDS: Record<ZodiacSign, string> = {
  Aries:       'Initiation · boldness · new energy',
  Taurus:      'Grounding · pleasure · stability · body',
  Gemini:      'Communication · curiosity · ideas · movement',
  Cancer:      'Emotion · nurturing · home · memory · safety',
  Leo:         'Creativity · confidence · heart · visibility',
  Virgo:       'Clarity · service · refinement · systems',
  Libra:       'Balance · beauty · relationships · peace',
  Scorpio:     'Depth · transformation · truth · power',
  Sagittarius: 'Expansion · truth · freedom · vision · fire',
  Capricorn:   'Ambition · structure · mastery · discipline',
  Aquarius:    'Innovation · community · liberation · future',
  Pisces:      'Intuition · compassion · dissolution · dreams',
}

export const PLANET_EMOJIS: Record<string, string> = {
  Sun:'☀️', Moon:'🌙', Mercury:'☿', Venus:'♀', Mars:'♂',
  Jupiter:'♃', Saturn:'♄', Uranus:'⛢', Neptune:'♆', Pluto:'♇',
  NNode:'☊', Chiron:'⚷', Lilith:'⚸', Midheaven:'MC', Rising:'ASC',
}

export const PLANET_KEYWORDS: Record<string, string> = {
  Sun:       'Identity · vitality · core self · life force',
  Moon:      'Emotions · instincts · safety needs · cycles',
  Mercury:   'Mind · communication · thought · learning',
  Venus:     'Love · beauty · values · pleasure · attraction',
  Mars:      'Drive · action · desire · anger · motivation',
  Jupiter:   'Expansion · abundance · wisdom · opportunity',
  Saturn:    'Discipline · limits · lessons · mastery · time',
  Uranus:    'Disruption · liberation · awakening · innovation',
  Neptune:   'Illusion · dreams · spirituality · dissolution',
  Pluto:     'Transformation · power · death/rebirth · shadow',
}

const ASPECT_CONFIG = [
  { name: 'conjunction', angle: 0,   orb: 8,  emoji: '☌', energy: 'intense fusion — both energies merge completely' },
  { name: 'sextile',     angle: 60,  orb: 4,  emoji: '⚹', energy: 'flowing opportunity — easy support and cooperation' },
  { name: 'square',      angle: 90,  orb: 8,  emoji: '□', energy: 'friction and growth — challenge creating action' },
  { name: 'trine',       angle: 120, orb: 8,  emoji: '△', energy: 'natural gift — effortless flow and harmony' },
  { name: 'opposition',  angle: 180, orb: 8,  emoji: '☍', energy: 'tension and awareness — polarities seeking balance' },
]

// ─── Core calculation utilities ───────────────────────────────

export function longitudeToSign(lon: number): { sign: ZodiacSign; degree: number; minutes: number; formatted: string } {
  const normalized = ((lon % 360) + 360) % 360
  const idx = Math.floor(normalized / 30)
  const degInSign = normalized - idx * 30
  const degree = Math.floor(degInSign)
  const minutes = Math.floor((degInSign - degree) * 60)
  const sign = ZODIAC_SIGNS[idx] ?? 'Aries'
  return { sign, degree, minutes, formatted: `${degree}°${String(minutes).padStart(2,'0')}' ${sign}` }
}

export function getPlanetLongitude(name: string, date: Date): number {
  if (name === 'Sun') {
    return ((Astronomy.SunPosition(date).elon % 360) + 360) % 360
  }
  if (name === 'Moon') {
    return ((Astronomy.EclipticGeoMoon(date).lon % 360) + 360) % 360
  }
  const body = name as Astronomy.Body
  const vec = Astronomy.GeoVector(body, date, true)
  return ((Astronomy.Ecliptic(vec).elon % 360) + 360) % 360
}

export function isRetrograde(name: string, date: Date): boolean {
  if (name === 'Sun' || name === 'Moon') return false
  const d1 = new Date(date.getTime() - 12 * 3600_000)
  const d2 = new Date(date.getTime() + 12 * 3600_000)
  let diff = getPlanetLongitude(name, d2) - getPlanetLongitude(name, d1)
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return diff < 0
}

function angleBetween(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360
  if (diff > 180) diff = 360 - diff
  return diff
}

export function getAspect(a: number, b: number): typeof ASPECT_CONFIG[number] | null {
  const angle = angleBetween(a, b)
  for (const cfg of ASPECT_CONFIG) {
    if (Math.abs(angle - cfg.angle) <= cfg.orb) return cfg
  }
  return null
}

// ─── Current sky ─────────────────────────────────────────────

const PLANET_NAMES = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']

export function getCurrentPlanets(date: Date): PlanetPosition[] {
  return PLANET_NAMES.map(name => {
    const lon = getPlanetLongitude(name, date)
    const { sign, degree, minutes, formatted } = longitudeToSign(lon)
    const retrograde = isRetrograde(name, date)
    return { name, lon, sign, degree, minutes, formatted, retrograde, emoji: PLANET_EMOJIS[name] ?? '●' }
  })
}

export function getRetrogradePlanets(date: Date): PlanetPosition[] {
  return getCurrentPlanets(date).filter(p => p.retrograde)
}

// ─── Zoe's natal chart ───────────────────────────────────────
// Born: November 14 2000, 7:04 PM EST (= UTC+0 00:04 Nov 15)
// Place: Sellersville PA (40.3382°N, 75.3077°W)
// Signs confirmed by Zoe. Computed degrees via astronomy-engine.
// Note: Venus computed at 272° (0°Capricorn cusp) — Zoe's chart confirms Sagittarius.
// This is a known cusp position; natal placements here use Zoe's stated signs.

export const ZOE_NATAL: Record<string, { sign: ZodiacSign; degree: number; minutes: number; lon: number; notes?: string }> = {
  Sun:       { sign:'Scorpio',      degree:22, minutes:56, lon:232.93, notes:'Core identity. Depth, truth, transformation, magnetism, emotional intensity.' },
  Moon:      { sign:'Cancer',       degree:4,  minutes:39, lon:94.65,  notes:'Emotional body. Safety, home, cyclical energy, nurturing, deep feeling memory.' },
  Mercury:   { sign:'Scorpio',      degree:3,  minutes:44, lon:213.73, notes:'Thinking mind. Depth-seeking, research-driven, precise, pattern-reading, truth-hungry.' },
  Venus:     { sign:'Sagittarius',  degree:29, minutes:55, lon:269.92, notes:'Love & style. Freedom-seeking, bold, expansive, adventurous, philosophy-lover. Cusp Capricorn.' },
  Mars:      { sign:'Libra',        degree:6,  minutes:42, lon:186.71, notes:'Drive & action. Beauty-motivated, conflict-careful, decisive through values, aesthetics as fuel.' },
  Jupiter:   { sign:'Gemini',       degree:7,  minutes:54, lon:67.90,  notes:'Expansion. Growth through communication, curiosity, ideas, learning, and many interests.' },
  Saturn:    { sign:'Taurus',       degree:27, minutes:51, lon:57.86,  notes:'Discipline. Slow wealth, body stability, patience, practical foundations, calm spending.' },
  Uranus:    { sign:'Aquarius',     degree:17, minutes:3,  lon:317.05, notes:'Awakening. Innovation, community, collective consciousness, futurist thinking.' },
  Neptune:   { sign:'Aquarius',     degree:4,  minutes:3,  lon:304.05, notes:'Dreams. Collective imagination, spiritual dissolution, idealism, mass consciousness.' },
  Pluto:     { sign:'Sagittarius',  degree:11, minutes:59, lon:251.99, notes:'Transformation. Generational power, belief system death/rebirth, philosophy as power.' },
  NNode:     { sign:'Cancer',       degree:17, minutes:0,  lon:107.00, notes:'Soul direction. Toward emotional intelligence, home, receiving, intuition, nurturing others.' },
  SNode:     { sign:'Capricorn',    degree:17, minutes:0,  lon:287.00, notes:'Past patterns. Releasing over-achievement, proving, rigid control, cold ambition.' },
  Chiron:    { sign:'Sagittarius',  degree:15, minutes:0,  lon:255.00, notes:'Wound & healing. Belief systems, freedom, teaching before being taught, philosophical pain.' },
  Lilith:    { sign:'Gemini',       degree:20, minutes:0,  lon:80.00,  notes:'Raw power. Wild mind, rebellion through voice, refusing to be silenced or simplified.' },
  Midheaven: { sign:'Virgo',        degree:12, minutes:0,  lon:162.00, notes:'Career & legacy. Analyst, helper, systems-builder, clarity-giver, service through craft.' },
  Rising:    { sign:'Gemini',       degree:12, minutes:0,  lon:72.00,  notes:'First impression. Quick, expressive, communicative, multi-faceted, youthful energy.' },
}

// ─── Transit-to-Natal aspects ────────────────────────────────

export type TransitAspect = Aspect & {
  natalSign:      ZodiacSign
  natalDegree:    number
  transitSign:    ZodiacSign
  transitDegree:  number
  interpretation: string
}

const TRANSIT_MEANINGS: Record<string, Record<string, string>> = {
  conjunction: {
    'Moon-Sun':      'Emotional needs and core identity aligned. Powerful self-expression day.',
    'Moon-Moon':     'Emotional clarity moment. Your feelings make total sense right now.',
    'Moon-Mercury':  'Thoughts and feelings in sync. Trust what you say in this window.',
    'Moon-Venus':    'Beauty, love, and pleasure are heightened. Creative or relational energy.',
    'Moon-Mars':     'Emotional drive is strong. Move the body. Act on what you feel.',
    'Moon-Saturn':   'Emotional seriousness. A boundary wants to be set or honored.',
    'Moon-NNode':    'A moment that feels fated. Emotional alignment with your soul path.',
    'Sun-Sun':       'Solar return window. The year turns. Set one big intention.',
    'Mars-Mercury':  'Direct communication energy. Say what you mean — clearly.',
    'Saturn-Sun':    'Discipline meets identity. A major lesson or responsibility arrives.',
  },
  square: {
    'Moon-Sun':      'Inner tension between what you feel and what you want. Pause before acting.',
    'Moon-Mercury':  'Mind and heart out of sync. Dictate before deciding.',
    'Moon-Saturn':   'Emotional heaviness or restriction. Your Cancer Moon needs safety first.',
    'Mars-Venus':    'Tension between what you want and what you love. Check impulse reactions.',
    'Saturn-Moon':   'Feeling burdened or emotionally flat. Rest is not failure — it is wisdom.',
  },
  trine: {
    'Moon-Venus':    'Soft and beautiful energy. Creative work, style, or pleasure flows naturally.',
    'Moon-Moon':     'Emotional ease and clarity. You know exactly what you feel.',
    'Sun-Jupiter':   'Expansion and confidence. A great day for visibility or outreach.',
    'Jupiter-NNode': 'Soul growth accelerated. Say yes to what genuinely excites you.',
    'Venus-Venus':   'Grace, attraction, and self-love. Something beautiful is available today.',
  },
  sextile: {
    'Moon-Mercury':  'Intuition and communication flowing together. Voice something important.',
    'Mercury-Venus': 'Beautiful words and ideas. Write, speak, create, connect.',
    'Sun-Moon':      'Inner and outer self in easy cooperation. A grounded, centered day.',
  },
  opposition: {
    'Moon-Saturn':   'You vs. structure or expectation. Something wants resolution.',
    'Sun-Moon':      'Full moon energy — what began six months ago reaches a turning point.',
    'Mars-Mars':     'Energy conflict. Do not force anything today — let the tension pass.',
  },
}

function getTransitInterpretation(aspect: string, transiting: string, natal: string): string {
  const key1 = `${transiting}-${natal}`
  const key2 = `${natal}-${transiting}`
  return TRANSIT_MEANINGS[aspect]?.[key1]
      || TRANSIT_MEANINGS[aspect]?.[key2]
      || `${transiting} is making a ${aspect} to the place in your chart where ${natal} lives. Pay attention to what comes up today around ${PLANET_KEYWORDS[natal] ?? natal.toLowerCase()}.`
}

export function getTransitsToNatal(date: Date): TransitAspect[] {
  const currentPlanets = getCurrentPlanets(date)
  const aspects: TransitAspect[] = []

  // Only transit fast + personal planets against major natal points
  const transitingPlanets = ['Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn']
  const natalPoints = ['Sun','Moon','Mercury','Venus','Mars','Saturn','NNode','Midheaven','Rising']

  for (const tp of currentPlanets.filter(p => transitingPlanets.includes(p.name))) {
    for (const np of natalPoints) {
      const natal = ZOE_NATAL[np]
      if (!natal) continue
      const aspCfg = getAspect(tp.lon, natal.lon)
      if (!aspCfg) continue

      const orb = Math.abs(angleBetween(tp.lon, natal.lon) - aspCfg.angle)
      // Applying = transit moving toward exact
      const futLon = getPlanetLongitude(tp.name, new Date(date.getTime() + 3600_000))
      const futOrb = Math.abs(angleBetween(futLon, natal.lon) - aspCfg.angle)
      const applying = futOrb < orb

      aspects.push({
        transiting:      tp.name,
        natal:           np,
        type:            aspCfg.name,
        angle:           aspCfg.angle,
        orb:             Math.round(orb * 10) / 10,
        applying,
        energy:          aspCfg.energy,
        emoji:           aspCfg.emoji,
        natalSign:       natal.sign,
        natalDegree:     natal.degree,
        transitSign:     tp.sign,
        transitDegree:   tp.degree,
        interpretation:  getTransitInterpretation(aspCfg.name, tp.name, np),
      })
    }
  }

  // Sort by orb (tightest first)
  return aspects.sort((a, b) => a.orb - b.orb).slice(0, 12)
}

// ─── Upcoming eclipses ────────────────────────────────────────
export function getUpcomingEclipses(date: Date): Array<{ type: string; date: Date; description: string }> {
  const eclipses: Array<{ type: string; date: Date; description: string }> = []
  try {
    const lunar = Astronomy.SearchLunarEclipse(date)
    eclipses.push({
      type: `Lunar Eclipse (${lunar.kind})`,
      date: lunar.peak.date,
      description: 'Eclipses accelerate what needs to change. Release, closure, and sudden clarity.',
    })
    const solar = Astronomy.SearchGlobalSolarEclipse(date)
    eclipses.push({
      type: `Solar Eclipse`,
      date: solar.peak.date,
      description: 'New chapter begins. What seeds are you planting in the dark?',
    })
  } catch {
    // Eclipse search can fail near certain dates — return empty gracefully
  }
  return eclipses.sort((a, b) => a.date.getTime() - b.date.getTime())
}

// ─── Moon rituals data ────────────────────────────────────────
export function getMoonRitualContext(phase: string, sign: ZodiacSign): {
  intention: string; ritual: string[]; release: string[]; avoid: string
} {
  const isNew = phase.includes('New')
  const intentions: Record<ZodiacSign, string> = {
    Aries: 'courage, bold new beginnings, launching something that scares you',
    Taurus: 'grounding, financial stability, body care, slow pleasure',
    Gemini: 'communication clarity, writing projects, new connections, learning',
    Cancer: 'emotional healing, home, family, self-nurturing, intuition',
    Leo: 'self-expression, creative projects, visibility, heart-led leadership',
    Virgo: 'health routines, systems, clarity, service, refinement',
    Libra: 'balance, beauty, relationships, peace, justice, aesthetic upgrades',
    Scorpio: 'transformation, shadow work, deep truth, releasing old wounds',
    Sagittarius: 'expansion, freedom, travel, publishing, spiritual growth, vision',
    Capricorn: 'career, discipline, long-term goals, legacy building, reputation',
    Aquarius: 'community, innovation, liberation, collective vision, friendships',
    Pisces: 'spiritual connection, dreams, art, compassion, letting go of control',
  }
  const rituals: Record<ZodiacSign, string[]> = {
    Aries:       ['Light a red candle','Write one brave action you commit to','Move your body intensely for 10 min'],
    Taurus:      ['Take a bath with salt + rose petals','Touch something that grounds you','Write your financial intention clearly'],
    Gemini:      ['Write three pages without stopping','Call someone who inspires you','Start the journal or essay you have been delaying'],
    Cancer:      ['Make yourself tea and sit in stillness','Write a letter to your younger self','Declutter one corner of your home'],
    Leo:         ['Dress in something that makes you feel powerful','Create something with your hands','Say the affirmation out loud to a mirror'],
    Virgo:       ['Clean your workspace completely','Write your ideal daily routine','Choose one habit to start today'],
    Libra:       ['Buy or arrange flowers','Write what you want your relationships to feel like','Balance your giving and receiving'],
    Scorpio:     ['Write what you are releasing on paper and burn it safely','Sit in darkness and breathe for five minutes','Name the shadow pattern you are working with'],
    Sagittarius: ['Read something that expands your mind','Plan one adventure — near or far','Write your biggest vision without editing'],
    Capricorn:   ['Write your five-year vision for your career','Take one practical step toward a long-term goal','Honor your discipline — even small consistency matters'],
    Aquarius:    ['Connect with a community you believe in','Write what freedom truly means to you','Innovate one thing in your daily system'],
    Pisces:      ['Meditate for at least 15 minutes','Write down your dreams','Create something without any goal or purpose'],
  }
  const releases: Record<ZodiacSign, string[]> = {
    Aries:       ['anger that is hurting you','impulsive decisions made from pride'],
    Taurus:      ['stubbornness that keeps you stuck','overspending from emotional emptiness'],
    Gemini:      ['scattered energy across too many projects','saying yes before thinking'],
    Cancer:      ['carrying others pain as if it is yours','hiding your needs to avoid conflict'],
    Leo:         ['performing for approval','dimming your light when others feel threatened'],
    Virgo:       ['perfectionism that becomes paralysis','criticism turned inward'],
    Libra:       ['people-pleasing at your own expense','avoiding hard decisions to keep peace'],
    Scorpio:     ['control as a defense mechanism','secrets that are taking up your energy'],
    Sagittarius: ['overcommitting before thinking','running from depth or commitment'],
    Capricorn:   ['working to prove your worth','equating success with safety'],
    Aquarius:    ['emotional detachment as protection','being different for the sake of it'],
    Pisces:      ['escaping through fantasy or numbing','taking on energy that is not yours'],
  }

  return {
    intention: intentions[sign] ?? 'clarity, growth, and alignment',
    ritual: rituals[sign] ?? [],
    release: isNew ? [] : (releases[sign] ?? []),
    avoid: isNew ? 'starting new things that are emotionally draining' : 'forcing things that naturally want to end',
  }
}

// ─── Crystal recommendations ─────────────────────────────────
const CRYSTAL_DB = [
  { name: 'Black Tourmaline', signs: ['Scorpio','Capricorn'], phases: ['New Moon','Waning Crescent'], moods: ['anxious','heavy','scattered'], properties: 'Protection, grounding, psychic shielding, releasing dark energy', color: '#2D2530' },
  { name: 'Moonstone',        signs: ['Cancer','Pisces','Gemini'], phases: ['Full Moon','Waxing Crescent'], moods: ['emotional','sensitive','creative'], properties: 'Intuition, feminine cycles, emotional clarity, new beginnings', color: '#C4D0E8' },
  { name: 'Labradorite',      signs: ['Scorpio','Aquarius','Gemini'], phases: ['Waxing Gibbous','First Quarter'], moods: ['clear','powerful','creative'], properties: 'Magic, transformation, intuition, protection during change', color: '#4A7FB8' },
  { name: 'Rose Quartz',      signs: ['Libra','Taurus','Cancer'], phases: ['Full Moon','Waxing Gibbous'], moods: ['tired','emotional','heavy'], properties: 'Self-love, healing, compassion, opening the heart', color: '#E8B4B8' },
  { name: 'Amethyst',         signs: ['Aquarius','Pisces','Sagittarius'], phases: ['Waning Gibbous','Last Quarter'], moods: ['anxious','spiraling','overwhelmed'], properties: 'Calm, clarity, spiritual protection, intuition enhancement', color: '#8B6FB8' },
  { name: 'Citrine',          signs: ['Leo','Sagittarius','Aries'], phases: ['New Moon','Waxing Crescent','First Quarter'], moods: ['tired','stuck','unmotivated'], properties: 'Abundance, confidence, solar energy, manifestation power', color: '#E8C97A' },
  { name: 'Selenite',         signs: ['Cancer','Virgo','Gemini'], phases: ['Full Moon','New Moon'], moods: ['scattered','unclear','heavy'], properties: 'Clarity, higher guidance, purification, peaceful energy', color: '#E8EEF5' },
  { name: 'Obsidian',         signs: ['Scorpio','Capricorn'], phases: ['New Moon','Waning Crescent'], moods: ['heavy','anxious','stuck'], properties: 'Shadow work, deep truth, psychic protection, cord cutting', color: '#1A1520' },
  { name: 'Lapis Lazuli',     signs: ['Sagittarius','Aquarius','Gemini'], phases: ['Waxing Gibbous','Full Moon'], moods: ['clear','powerful'], properties: 'Wisdom, truth-speaking, inner vision, royal confidence', color: '#1F3A7A' },
  { name: 'Green Aventurine', signs: ['Taurus','Virgo','Aries'], phases: ['New Moon','Waxing Crescent'], moods: ['tired','stuck'], properties: 'Luck, heart healing, new opportunities, optimism', color: '#4A8A5A' },
  { name: 'Carnelian',        signs: ['Aries','Leo','Scorpio'], phases: ['First Quarter','Waxing Gibbous'], moods: ['unmotivated','tired','stuck'], properties: 'Courage, motivation, creative fire, confidence in action', color: '#C06030' },
  { name: 'Clear Quartz',     signs: ['all'], phases: ['all'], moods: ['all'], properties: 'Amplifier of all intentions. The master healer and clarity stone.', color: '#E8F0F8' },
]

export function getCrystalRecommendations(moonSign: ZodiacSign, phase: string, mood: string = 'unclear'): typeof CRYSTAL_DB {
  return CRYSTAL_DB.filter(c =>
    (c.signs.includes(moonSign) || c.signs.includes('all')) ||
    (c.phases.some(p => phase.includes(p)) || c.phases.includes('all')) ||
    c.moods.includes(mood) || c.moods.includes('all')
  ).slice(0, 4)
}
