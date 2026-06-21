'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, MessageCircle, Calendar, CheckSquare,
  Sparkles, BookOpen, Users, Settings
} from 'lucide-react'

const TABS = [
  { href: '/',               label: 'Home',     icon: Home,          badge: null, dateLabel: false },
  { href: '/messages',       label: 'Messages', icon: MessageCircle, badge: 4,    dateLabel: false },
  { href: '/calendar',       label: 'Calendar', icon: Calendar,      badge: null, dateLabel: true  },
  { href: '/tasks',          label: 'Tasks',    icon: CheckSquare,   badge: null, dateLabel: false },
  { href: '/spirit',         label: 'Spirit',   icon: Sparkles,      badge: null, dateLabel: false },
  { href: '/journal',        label: 'Journal',  icon: BookOpen,      badge: null, dateLabel: false },
  { href: '/relationships',  label: 'People',   icon: Users,         badge: null, dateLabel: false },
  { href: '/settings',       label: 'Settings', icon: Settings,      badge: null, dateLabel: false },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export function BottomNav() {
  const pathname = usePathname()
  const today = new Date().getDate()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        height: 'var(--nav-h)',
        background: 'rgba(253,248,243,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(139,111,184,0.1)',
      }}
    >
      <div className="flex items-center h-full max-w-lg mx-auto px-1">
        {TABS.map(({ href, label, icon: Icon, badge, dateLabel }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2"
            >
              <div className="relative">
                {dateLabel ? (
                  <div className="relative">
                    <Icon
                      className="h-[18px] w-[18px] transition-all"
                      style={{ color: active ? 'var(--violet)' : 'var(--mist)', strokeWidth: active ? 2.2 : 1.7 }}
                    />
                    <div
                      className="absolute -bottom-1 -right-2 text-xs font-bold"
                      style={{ color: active ? 'var(--violet)' : 'var(--mist)' }}
                    >{today}</div>
                  </div>
                ) : (
                  <>
                    <Icon
                      className="h-[18px] w-[18px] transition-all"
                      style={{ color: active ? 'var(--violet)' : 'var(--mist)', strokeWidth: active ? 2.2 : 1.7 }}
                    />
                    {badge && (
                      <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--violet)', border: '1.5px solid rgba(253,248,243,0.96)' }}>
                        <span className="text-white font-bold" style={{ fontSize: 8 }}>{badge}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <span
                className="text-xs font-medium transition-all leading-none"
                style={{ color: active ? 'var(--violet)' : 'var(--mist)' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
