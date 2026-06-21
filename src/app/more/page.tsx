'use client'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Mic, Archive, DollarSign, Moon, Compass, Settings,
  MessageSquare, Heart, ArrowRight, ChevronRight,
  Zap, BookOpen, Sun, RefreshCw, User
} from 'lucide-react'
import Link from 'next/link'

const SECTIONS = [
  {
    title: 'Daily',
    items: [
      { href: '/morning', icon: Heart,        label: 'Morning Check-In',    sub: 'Start the day softly',              color: '#E07B7B',        bg: 'rgba(224,123,123,0.1)' },
      { href: '/midday',  icon: Sun,          label: 'Midday Reset',        sub: 'Come back to yourself',             color: 'var(--golden)',  bg: 'rgba(201,169,110,0.12)' },
      { href: '/night',   icon: Moon,         label: 'Night Mode',          sub: 'Protect your morning',              color: '#6B5DB8',        bg: 'rgba(107,93,184,0.1)' },
      { href: '/weekly',  icon: RefreshCw,    label: 'Weekly Reset',        sub: 'Sunday sanctuary ritual',           color: 'var(--violet)',  bg: 'rgba(139,111,184,0.1)' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { href: '/dictation', icon: Mic,        label: 'Dictation',           sub: 'Speak & capture anything',          color: 'var(--violet)',  bg: 'rgba(139,111,184,0.1)' },
      { href: '/messages',  icon: MessageSquare, label: 'Communication Coach', sub: 'Respond from wisdom, not wound', color: '#C87B7B',        bg: 'rgba(200,123,123,0.12)' },
      { href: '/vault',     icon: Archive,    label: 'The Vault',           sub: 'Safe space for all your ideas',     color: 'var(--golden)',  bg: 'rgba(201,169,110,0.1)' },
      { href: '/money',     icon: DollarSign, label: 'Money',               sub: 'Spending, saving, trading',         color: '#5A8A5A',        bg: 'rgba(90,138,90,0.1)' },
    ]
  },
  {
    title: 'Growth',
    items: [
      { href: '/career',       icon: Compass,   label: 'Career Compass',      sub: 'Highest-use work today',           color: 'var(--lunar)',   bg: 'rgba(168,196,218,0.15)' },
      { href: '/highest-self', icon: Zap,       label: 'Highest Self Mirror',  sub: 'Current vs highest self',          color: 'var(--golden)',  bg: 'rgba(201,169,110,0.1)' },
      { href: '/lessons',      icon: BookOpen,  label: 'Lesson Tracker',       sub: 'Weekly reflection & growth',       color: 'var(--herb)',    bg: 'rgba(184,200,180,0.15)' },
    ]
  },
  {
    title: 'Profile & Settings',
    items: [
      { href: '/profile',   icon: User,     label: 'My Profile',           sub: 'How LUNA knows you',               color: 'var(--violet)',  bg: 'rgba(139,111,184,0.1)' },
      { href: '/settings',  icon: Settings, label: 'Settings',             sub: 'Connected accounts, preferences',  color: 'var(--mist)',    bg: 'rgba(158,149,172,0.1)' },
    ]
  },
]

export default function MoreScreen() {
  return (
    <div className="bg-sanctuary min-h-screen">
      <AppLayout noPad>
        <div className="px-5 pt-14 pb-nav">

          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--depth)' }}>
            More
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--mid)' }}>
            Everything LUNA holds for you.
          </p>

          <div className="space-y-6">
            {SECTIONS.map(section => (
              <div key={section.title}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--mist)' }}>
                  {section.title}
                </p>
                <div className="space-y-2">
                  {section.items.map(item => (
                    <Link key={item.href} href={item.href}>
                      <div className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                          <item.icon className="h-5 w-5" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: 'var(--depth)' }}>{item.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--mist)' }}>{item.sub}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--faint)' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center space-y-1">
            <p className="font-display text-lg font-semibold tracking-widest" style={{ color: 'var(--violet)', letterSpacing: '0.2em' }}>LUNA</p>
            <p className="font-display text-sm italic" style={{ color: 'var(--mist)' }}>
              &ldquo;You are not behind. You are returning.&rdquo;
            </p>
          </div>

        </div>
      </AppLayout>
    </div>
  )
}
