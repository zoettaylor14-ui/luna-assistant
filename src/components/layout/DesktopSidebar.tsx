'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Sun, Moon, Clock, BriefcaseIcon, CheckSquare, FolderOpen,
  Mail, Zap, Sparkles, Mic, MessageSquare, BookOpen, Compass,
  Eye, GraduationCap, DollarSign, User, Settings, BarChart3,
} from 'lucide-react'

const NAV = [
  {
    group: 'Daily',
    items: [
      { href: '/',        label: 'Sanctuary', icon: Home     },
      { href: '/today',   label: 'Today',     icon: Sun      },
      { href: '/morning', label: 'Morning',   icon: Sparkles },
      { href: '/midday',  label: 'Midday',    icon: Clock    },
      { href: '/night',   label: 'Night',     icon: Moon     },
    ],
  },
  {
    group: 'Work',
    items: [
      { href: '/work',       label: 'Work',       icon: BriefcaseIcon },
      { href: '/tasks',      label: 'Tasks',      icon: CheckSquare   },
      { href: '/projects',   label: 'Projects',   icon: FolderOpen    },
      { href: '/email',      label: 'Email',      icon: Mail          },
      { href: '/brain-dump', label: 'Brain Dump', icon: Zap           },
    ],
  },
  {
    group: 'Spirit',
    items: [
      { href: '/spirit',    label: 'Spirit',      icon: Sparkles      },
      { href: '/dictation', label: 'Dictation',   icon: Mic           },
      { href: '/messages',  label: 'Coach',       icon: MessageSquare },
      { href: '/vault',     label: 'Vault',       icon: BookOpen      },
    ],
  },
  {
    group: 'Growth',
    items: [
      { href: '/career',       label: 'Career',       icon: Compass       },
      { href: '/highest-self', label: 'Highest Self', icon: Eye           },
      { href: '/lessons',      label: 'Lessons',      icon: GraduationCap },
      { href: '/money',        label: 'Money',        icon: DollarSign    },
      { href: '/weekly',       label: 'Weekly Reset', icon: BarChart3     },
    ],
  },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 z-40 overflow-y-auto"
      style={{
        background: 'rgba(248,244,255,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(139,111,184,0.1)',
      }}
    >
      {/* Wordmark */}
      <div className="px-5 pt-7 pb-5">
        <p className="font-display text-2xl font-bold tracking-[0.12em]" style={{ color: 'var(--violet-deep)' }}>
          LUNA
        </p>
        <p className="text-xs tracking-wider mt-0.5" style={{ color: 'var(--mist)' }}>
          YOUR SANCTUARY
        </p>
      </div>

      {/* Dictation CTA */}
      <div className="px-3 mb-4">
        <Link href="/dictation"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%)',
            boxShadow: '0 4px 20px rgba(139,111,184,0.3)',
          }}>
          <Mic className="h-4 w-4 text-white" strokeWidth={1.8} />
          <span className="text-sm font-semibold text-white">Dictate to LUNA</span>
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 space-y-4 pb-4">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--faint)' }}>
              {group}
            </p>
            {items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: active ? 'rgba(139,111,184,0.12)' : 'transparent',
                    color: active ? 'var(--violet-deep)' : 'var(--mid)',
                  }}>
                  <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={active ? 2.2 : 1.7} />
                  <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--violet)' }} />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: profile + settings */}
      <div className="px-2 pb-6 pt-3" style={{ borderTop: '1px solid rgba(139,111,184,0.08)' }}>
        <Link href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
          style={{ color: isActive(pathname, '/profile') ? 'var(--violet-deep)' : 'var(--mid)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))' }}>
            <span className="text-white text-xs font-bold">Z</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold" style={{ color: 'var(--depth)' }}>Zoe Taylor</p>
            <p className="text-xs" style={{ color: 'var(--mist)' }}>Scorpio · Projector 4/6</p>
          </div>
        </Link>
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl mt-1 transition-all"
          style={{ color: isActive(pathname, '/settings') ? 'var(--violet-deep)' : 'var(--mist)' }}>
          <Settings className="h-4 w-4" strokeWidth={1.7} />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  )
}
