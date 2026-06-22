'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, MessageCircle, Calendar, CheckSquare,
  Sparkles, BookOpen, Users, Scissors
} from 'lucide-react'

const TABS = [
  { href: '/',         label: 'Home',     icon: Home,          badge: null, dateLabel: false },
  { href: '/messages', label: 'Messages', icon: MessageCircle, badge: 4,    dateLabel: false },
  { href: '/calendar', label: 'Calendar', icon: Calendar,      badge: null, dateLabel: true  },
  { href: '/tasks',    label: 'Tasks',    icon: CheckSquare,   badge: null, dateLabel: false },
  { href: '/spirit',   label: 'Spirit',   icon: Sparkles,      badge: null, dateLabel: false },
  { href: '/atelier',  label: 'Atelier',  icon: Scissors,      badge: null, dateLabel: false },
  { href: '/journal',  label: 'Journal',  icon: BookOpen,      badge: null, dateLabel: false },
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
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--nav-border)',
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
                      className="h-5 w-5 transition-all"
                      style={{ color: active ? 'var(--violet)' : 'var(--tab-inactive-text)', strokeWidth: active ? 2.2 : 1.7 }}
                    />
                    <div
                      className="absolute -bottom-1 -right-2 text-xs font-bold"
                      style={{ color: active ? 'var(--violet)' : 'var(--tab-inactive-text)' }}
                    >{today}</div>
                  </div>
                ) : (
                  <>
                    <Icon
                      className="h-5 w-5 transition-all"
                      style={{ color: active ? 'var(--violet)' : 'var(--tab-inactive-text)', strokeWidth: active ? 2.2 : 1.7 }}
                    />
                    {badge && (
                      <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--violet)', border: '1.5px solid var(--nav-bg)' }}>
                        <span className="text-white font-bold" style={{ fontSize: 8 }}>{badge}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <span
                className="text-xs font-medium transition-all leading-none"
                style={{ color: active ? 'var(--violet)' : 'var(--tab-inactive-text)' }}
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
