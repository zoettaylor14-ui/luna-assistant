'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { Archive, Plus, Check } from 'lucide-react'

const VAULT_CATEGORIES = [
  {
    label: 'Business',
    emoji: '💼',
    color: 'var(--lunar)',
    items: [
      { name: 'DRYP Studio', status: 'active',  note: 'Creative studio brand expansion' },
      { name: 'EHM Systems', status: 'active',  note: 'CRM + intake forms + mortgage tools' },
      { name: 'LINK\'d UP',  status: 'parked',  note: 'Events company — next season' },
      { name: 'Nurturly',    status: 'parked',  note: 'Full site launch ready — timing TBD' },
      { name: 'TikTok Shop', status: 'parked',  note: 'When ready to launch products' },
      { name: 'Dropshipping',status: 'parked',  note: 'Research phase — parked safely' },
      { name: '144 Clients', status: 'future',  note: 'The big goal — building toward it' },
    ]
  },
  {
    label: 'Money',
    emoji: '💰',
    color: 'var(--golden)',
    items: [
      { name: 'Trading',     status: 'active',  note: 'Rule-based only — no emotional trades' },
      { name: 'Passive income platforms', status: 'parked', note: 'Building slowly' },
      { name: 'Books / digital products', status: 'future', note: 'When voice and audience are ready' },
    ]
  },
  {
    label: 'Creative',
    emoji: '🎨',
    color: 'var(--blush)',
    items: [
      { name: 'Clothing brand', status: 'parked', note: 'Designs sketched, waiting for time' },
      { name: 'Bikini brand',   status: 'future', note: 'Vision in mind, not yet started' },
      { name: 'Sewing projects',status: 'active', note: 'Ongoing — when energy allows' },
      { name: 'Painting',       status: 'active', note: 'For joy and creative expansion' },
      { name: 'Tattooing',      status: 'parked', note: 'Learning — no rush' },
      { name: 'Dance',          status: 'active', note: 'Keep this — it fuels everything' },
      { name: 'Content creation',status:'active', note: 'Ongoing' },
    ]
  },
  {
    label: 'Personal',
    emoji: '🌱',
    color: 'var(--herb)',
    items: [
      { name: 'Journaling habit',  status: 'active', note: 'Daily, even 5 minutes counts' },
      { name: 'Fitness routine',   status: 'parked', note: 'Not the moment — return when ready' },
      { name: 'Home reset',        status: 'parked', note: 'When energy and space align' },
      { name: 'Communication growth', status: 'active', note: 'Active — use messages helper' },
    ]
  },
]

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: 'Active',  bg: 'rgba(90,138,90,0.1)',     color: '#5A8A5A' },
  parked: { label: 'Parked',  bg: 'rgba(158,149,172,0.1)',   color: 'var(--mist)' },
  future: { label: 'Future',  bg: 'rgba(201,169,110,0.1)',   color: 'var(--golden)' },
}

export default function VaultScreen() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="bg-sanctuary min-h-screen">
      <AppLayout noPad>
        <div className="px-5 pt-14 pb-nav">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)' }}>
              <Archive className="h-5 w-5" style={{ color: 'var(--golden)' }} />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--golden)' }}>The Vault</p>
          </div>

          <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--depth)' }}>
            Your ideas are safe here.
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--mid)' }}>
            You do not have to carry them all today. They live here, waiting for the right moment.
          </p>

          {/* Weekly selection reminder */}
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(139,111,184,0.06)', border: '1px solid rgba(139,111,184,0.1)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--violet)' }}>Weekly selection</p>
            <p className="text-sm" style={{ color: 'var(--mid)' }}>
              Each week, choose one from each lane: work · creative · money · personal. Everything else rests.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            {VAULT_CATEGORIES.map(cat => (
              <div key={cat.label}>
                <button
                  onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                  className="w-full glass-card p-4 flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.emoji}</span>
                    <p className="font-semibold" style={{ color: 'var(--depth)' }}>{cat.label}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--mist)' }}>
                      {cat.items.length}
                    </span>
                  </div>
                  <span style={{ color: 'var(--mist)', transform: activeCategory === cat.label ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                </button>

                {activeCategory === cat.label && (
                  <div className="mt-2 space-y-2 animate-fade-up">
                    {cat.items.map((item, i) => {
                      const s = STATUS_STYLES[item.status]
                      return (
                        <div key={i} className="glass-card-sm p-4 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: 'var(--depth)' }}>{item.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--mist)' }}>{item.note}</p>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0 font-medium" style={{ background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new */}
          <div className="mt-6">
            <button className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all"
              style={{ border: '1.5px dashed rgba(139,111,184,0.2)', color: 'var(--mist)' }}>
              <Plus className="h-4 w-4" />
              Add to vault
            </button>
          </div>

          <p className="text-xs text-center italic mt-6" style={{ color: 'var(--faint)' }}>
            &ldquo;Everything has its season. Not now is not never.&rdquo;
          </p>

        </div>
      </AppLayout>
    </div>
  )
}
