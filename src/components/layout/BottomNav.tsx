'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Sparkles, BriefcaseIcon, MessageCircle,
  Star, Scissors, Archive, Moon
} from 'lucide-react'

const TABS = [
  { href: '/',          label: 'Home',      icon: Home          },
  { href: '/morning',   label: 'Morning',   icon: Sparkles      },
  { href: '/work',      label: 'Work',      icon: BriefcaseIcon },
  { href: '/messages',  label: 'Messages',  icon: MessageCircle, badge: 4 },
  { href: '/astrology', label: 'Astrology', icon: Star          },
  { href: '/atelier',   label: 'Atelier',   icon: Scissors      },
  { href: '/vault',     label: 'Vault',     icon: Archive       },
  { href: '/night',     label: 'Night',     icon: Moon          },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        height: 'var(--nav-h)',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--nav-border)',
      }}>
      <div className="flex items-center h-full max-w-xl mx-auto px-1">
        {TABS.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(pathname, href)
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center justify-center flex-1 py-1 relative"
              style={{ minHeight: 56 }}>
              {active && (
                <div className="absolute inset-x-1 inset-y-1 rounded-2xl"
                  style={{
                    background: 'rgba(139,111,184,0.15)',
                    border: '1px solid rgba(139,111,184,0.20)',
                  }} />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="relative">
                  <Icon className="h-5 w-5"
                    style={{
                      color: active ? 'var(--violet)' : 'var(--tab-inactive-text)',
                      strokeWidth: active ? 2.2 : 1.6,
                    }} />
                  {badge && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--violet)', border: '1.5px solid var(--nav-bg)' }}>
                      <span className="text-white font-bold" style={{ fontSize: 8 }}>{badge}</span>
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: 9,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--violet)' : 'var(--tab-inactive-text)',
                  lineHeight: 1,
                }}>
                  {label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
