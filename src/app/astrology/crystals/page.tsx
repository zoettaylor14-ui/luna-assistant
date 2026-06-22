'use client'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import Link from 'next/link'
import { ArrowLeft, Gem, ChevronDown, ChevronRight } from 'lucide-react'

type MoonData = {
  phase: { name: string; emoji: string }
  sign: { name: string; emoji: string }
}

const CRYSTAL_LIBRARY = [
  {
    name: 'Black Tourmaline',
    color: '#2D2530',
    lightColor: '#6B5A72',
    emoji: '🖤',
    sign: ['Scorpio','Capricorn'],
    phase: ['New Moon','Waning Crescent'],
    mood: ['anxious','heavy','scattered'],
    properties: 'Protection · grounding · psychic shielding · energy cleansing',
    howToUse: 'Place at the four corners of your bed or workspace. Hold during meditation. Carry in your left pocket to block incoming negativity. Place near electronics.',
    affirmation: 'I am protected. My energy is mine. I release what does not belong to me.',
    chakra: 'Root · Earth Star',
    luna: 'This is your most powerful protection crystal. With your Scorpio Sun sensing everything around you, Black Tourmaline keeps your psychic field clean and your energy grounded.',
  },
  {
    name: 'Moonstone',
    color: '#C4D0E8',
    lightColor: '#8A9FC4',
    emoji: '🌙',
    sign: ['Cancer','Pisces','Gemini'],
    phase: ['Full Moon','Waxing Crescent','New Moon'],
    mood: ['emotional','sensitive','creative'],
    properties: 'Intuition · feminine cycles · emotional clarity · new beginnings · goddess energy',
    howToUse: 'Charge on a full moon windowsill overnight. Hold during emotional processing. Wear as jewelry especially near full moons. Meditate with it at your third eye or heart.',
    affirmation: 'My intuition is trustworthy. My cycles are sacred. I move with the rhythm of life.',
    chakra: 'Third Eye · Crown · Sacral',
    luna: 'Moonstone is your personal talisman — Cancer Moon + Gemini Rising makes this stone deeply aligned with your emotional intelligence and communicative intuition. Charge yours monthly.',
  },
  {
    name: 'Labradorite',
    color: '#4A7FB8',
    lightColor: '#6A9FD8',
    emoji: '✨',
    sign: ['Scorpio','Aquarius','Gemini'],
    phase: ['Waxing Gibbous','First Quarter','Full Moon'],
    mood: ['clear','powerful','creative','transforming'],
    properties: 'Magic · transformation · intuition protection · reveals hidden truths · awakening',
    howToUse: 'Hold while journaling or working with ideas. Carry during presentations or important conversations. Place on your desk while creating. Meditate with it at your third eye.',
    affirmation: 'I trust in the magic of my own perception. I see what others cannot. I am protected as I transform.',
    chakra: 'Third Eye · Throat',
    luna: 'Labradorite is the stone of the mystic — perfect for your Scorpio Sun and Mercury. It amplifies your natural ability to see beneath surfaces and protects you during periods of deep change.',
  },
  {
    name: 'Rose Quartz',
    color: '#E8B4B8',
    lightColor: '#D4848A',
    emoji: '🌸',
    sign: ['Libra','Taurus','Cancer'],
    phase: ['Full Moon','Waxing Gibbous'],
    mood: ['tired','emotional','heavy','lonely'],
    properties: 'Self-love · heart healing · compassion · opening to receive · gentle nurturing',
    howToUse: 'Place over your heart during rest. Keep beside your bed. Hold when experiencing emotional difficulty. Write love letters to yourself while holding it.',
    affirmation: 'I am worthy of deep love. I receive as freely as I give. My heart is safe to open.',
    chakra: 'Heart',
    luna: 'With your Cancer Moon, you carry a lot for others. Rose Quartz reminds you that your heart deserves the same gentleness you offer the people you love. Use it to practice receiving.',
  },
  {
    name: 'Amethyst',
    color: '#8B6FB8',
    lightColor: '#A88FD8',
    emoji: '💜',
    sign: ['Aquarius','Pisces','Sagittarius'],
    phase: ['Waning Gibbous','Last Quarter','New Moon'],
    mood: ['anxious','spiraling','overwhelmed','scattered'],
    properties: 'Calm · clarity · spiritual protection · intuition · peace of mind · sleep',
    howToUse: 'Place under your pillow for better dreams. Hold during meditation or breathwork. Keep at your workspace to reduce anxiety. Use in a grid around your bed for peaceful sleep.',
    affirmation: 'I am calm. My mind settles easily. Clarity comes to me in stillness.',
    chakra: 'Third Eye · Crown',
    luna: 'Your Scorpio Mercury runs deep and can spiral. Amethyst is your mind-calming companion — it slows the obsessive thinking loop and brings in clarity and spiritual perspective.',
  },
  {
    name: 'Citrine',
    color: '#E8C97A',
    lightColor: '#C8A95A',
    emoji: '🌟',
    sign: ['Leo','Sagittarius','Aries','Gemini'],
    phase: ['New Moon','Waxing Crescent','First Quarter'],
    mood: ['tired','stuck','unmotivated','flat'],
    properties: 'Abundance · confidence · solar energy · manifestation · creativity · joy',
    howToUse: 'Place in your workspace or near your front door. Carry when making financial decisions. Hold while setting intentions. Use in the morning to set a confident tone for the day.',
    affirmation: 'I am magnetic to abundance. My energy creates value. Good things come easily to me.',
    chakra: 'Solar Plexus · Sacral',
    luna: 'Jupiter in Gemini is your abundance portal — Citrine amplifies that energy. Use it when launching anything new, writing proposals, or when your energy needs a solar recharge.',
  },
  {
    name: 'Selenite',
    color: '#E8EEF5',
    lightColor: '#B8C4D5',
    emoji: '🤍',
    sign: ['Cancer','Virgo','Gemini'],
    phase: ['Full Moon','New Moon'],
    mood: ['scattered','unclear','heavy','foggy'],
    properties: 'Clarity · purification · higher guidance · clearing spaces · peaceful energy · divine light',
    howToUse: 'Run along your body from head to foot to cleanse your aura. Place at your workspace for clarity. Use to cleanse other crystals (do not get wet). Hold during prayer or channeling.',
    affirmation: 'I am clear. My channel to higher wisdom is open. I receive guidance with ease.',
    chakra: 'Crown · Higher Crown',
    luna: 'Selenite is how you clear the psychic residue your Scorpio Sun picks up from others. Use it after difficult conversations, heavy days, or when you feel like you\'re carrying energy that isn\'t yours.',
  },
  {
    name: 'Obsidian',
    color: '#1A1520',
    lightColor: '#4A3A52',
    emoji: '⚫',
    sign: ['Scorpio','Capricorn'],
    phase: ['New Moon','Waning Crescent'],
    mood: ['heavy','anxious','stuck'],
    properties: 'Shadow work · psychic protection · cord cutting · truth mirror · deep clearing',
    howToUse: 'Use during shadow journaling. Gaze into it for scrying. Place at your root chakra during meditation. Use in cord-cutting rituals. Handle gently — it absorbs heavy energy.',
    affirmation: 'I face my shadow with courage. I release what no longer serves me. I am whole.',
    chakra: 'Root · Earth Star',
    luna: 'Obsidian is your shadow work companion. Your Scorpio Sun is built for depth — Obsidian takes you there and reflects your truths back without flinching. Cleanse it often under running water.',
  },
  {
    name: 'Lapis Lazuli',
    color: '#1F3A7A',
    lightColor: '#4A6AB8',
    emoji: '💙',
    sign: ['Sagittarius','Aquarius','Gemini'],
    phase: ['Waxing Gibbous','Full Moon'],
    mood: ['clear','powerful','inspired'],
    properties: 'Wisdom · truth-speaking · inner vision · royal confidence · intellectual power',
    howToUse: 'Wear at your throat for truth-speaking. Hold before important conversations or presentations. Meditate with at your third eye for inner vision. Use when writing or creating.',
    affirmation: 'I speak my truth with confidence and ease. My words carry wisdom and weight.',
    chakra: 'Throat · Third Eye',
    luna: 'Lapis Lazuli is the stone of your voice — and your voice (Gemini Rising, Scorpio Mercury, 4/6 HD) is your most powerful tool. Use it before any speaking, presenting, or creation.',
  },
  {
    name: 'Carnelian',
    color: '#C06030',
    lightColor: '#E08050',
    emoji: '🔥',
    sign: ['Aries','Leo','Scorpio'],
    phase: ['First Quarter','Waxing Gibbous'],
    mood: ['unmotivated','tired','stuck','flat'],
    properties: 'Courage · creative fire · confidence in action · motivation · vitality · passion',
    howToUse: 'Carry in your right pocket to activate outward-moving energy. Hold before taking action. Place at your sacral chakra during creativity rituals. Use when you need to act despite fear.',
    affirmation: 'I move. I create. My energy is alive and directed. I act from my core.',
    chakra: 'Sacral · Root',
    luna: 'When your Mars in Libra hesitates, Carnelian activates. It bridges the gap between intention and action. Use it on days when you know what to do but cannot seem to move.',
  },
  {
    name: 'Clear Quartz',
    color: '#E8F0F8',
    lightColor: '#A8B8D8',
    emoji: '💎',
    sign: ['all signs'],
    phase: ['any phase'],
    mood: ['any mood'],
    properties: 'Master amplifier · clarity · intention setting · programming · universal healing',
    howToUse: 'Program with any specific intention by holding it and speaking your desired outcome clearly. Use to amplify other crystals by placing nearby. Meditate with for clarity on any question.',
    affirmation: 'My intention is clear. I am focused. What I direct my energy toward grows and amplifies.',
    chakra: 'All chakras',
    luna: 'The master crystal. When you are uncertain which stone to use, Clear Quartz is always right. It amplifies your own clarity and intention — and it amplifies whatever crystal it sits beside.',
  },
]

function CrystalCard({ c, expanded, onToggle }: {
  c: typeof CRYSTAL_LIBRARY[0]
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button onClick={onToggle} className="w-full rounded-[20px] p-4 text-left"
      style={{ background: 'var(--surface)', border: `1px solid ${expanded ? c.color + '44' : 'var(--surface-border)'}` }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: c.color + '22', border: `1px solid ${c.color}33` }}>
          {c.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>{c.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-4)' }}>{c.properties}</p>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-4)' }} />
                  : <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-4)' }} />}
      </div>

      {expanded && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[...c.sign, ...c.phase].slice(0, 4).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: c.color + '18', color: c.lightColor, border: `1px solid ${c.color}25` }}>
                {tag}
              </span>
            ))}
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,111,184,0.15)', color: 'var(--violet)', border: '1px solid rgba(139,111,184,0.2)' }}>
              {c.chakra}
            </span>
          </div>

          {/* LUNA note */}
          <div className="rounded-[14px] p-3 mb-3"
            style={{ background: 'rgba(139,111,184,0.1)', border: '1px solid rgba(139,111,184,0.2)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--violet)' }}>LUNA</p>
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-1)' }}>{c.luna}</p>
          </div>

          {/* How to use */}
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>How to Use</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{c.howToUse}</p>
          </div>

          {/* Affirmation */}
          <div className="rounded-[14px] p-3"
            style={{ background: c.color + '10', border: `1px solid ${c.color}20` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: c.lightColor }}>Affirmation</p>
            <p className="text-sm italic" style={{ color: 'var(--text-1)' }}>{c.affirmation}</p>
          </div>
        </div>
      )}
    </button>
  )
}

export default function CrystalsPage() {
  const [moon, setMoon] = useState<MoonData | null>(null)
  const [filter, setFilter] = useState<'today' | 'all'>('today')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    fetch(`/api/astrology/moon?tz=${encodeURIComponent(tz)}`)
      .then(r => r.json()).then(setMoon).catch(() => {})
  }, [])

  const sign = moon?.sign?.name
  const phase = moon?.phase?.name

  const todaysCrystals = CRYSTAL_LIBRARY.filter(c =>
    (sign && (c.sign.includes(sign) || c.sign.includes('all signs'))) ||
    (phase && c.phase.some(p => phase.includes(p) || p === 'any phase'))
  )

  const displayed = filter === 'today' ? todaysCrystals : CRYSTAL_LIBRARY

  return (
    <div className="min-h-screen bg-app">
      <AppLayout>
        <div className="flex items-center gap-3 mb-5 pt-2">
          <Link href="/astrology">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <ArrowLeft className="h-4 w-4" style={{ color: 'var(--text-3)' }} />
            </div>
          </Link>
          <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text-1)' }}>Crystal Match</h1>
        </div>

        {/* Moon context */}
        {moon && (
          <div className="rounded-[20px] p-4 mb-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Gem className="h-4 w-4" style={{ color: 'var(--violet)' }} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Crystal Recommendation Today</p>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-1)' }}>
              Based on {moon.phase.emoji} {moon.phase.name} in {moon.sign.emoji} {moon.sign.name}
            </p>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {(['today','all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f ? 'var(--violet)' : 'var(--surface)',
                color: filter === f ? 'white' : 'var(--text-3)',
                border: `1px solid ${filter === f ? 'var(--violet)' : 'var(--surface-border)'}`,
              }}>
              {f === 'today' ? `Today (${todaysCrystals.length})` : `Full Library (${CRYSTAL_LIBRARY.length})`}
            </button>
          ))}
        </div>

        {/* Crystal cards */}
        <div className="space-y-2">
          {displayed.map(c => (
            <CrystalCard key={c.name} c={c}
              expanded={expanded === c.name}
              onToggle={() => setExpanded(expanded === c.name ? null : c.name)} />
          ))}
        </div>
      </AppLayout>
    </div>
  )
}
