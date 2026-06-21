'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sun, BriefcaseIcon, Sparkles, MoreHorizontal, Mic } from 'lucide-react'

const LEFT_TABS = [
  { href: '/',      label: 'Sanctuary', icon: Home },
  { href: '/today', label: 'Today',     icon: Sun  },
]

const RIGHT_TABS = [
  { href: '/work',   label: 'Work',   icon: BriefcaseIcon },
  { href: '/spirit', label: 'Spirit', icon: Sparkles },
  { href: '/more',   label: 'More',   icon: MoreHorizontal },
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
        background: 'rgba(253,248,243,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(139,111,184,0.1)',
      }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-1 relative">

        {LEFT_TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 flex-1 py-2">
              <Icon
                className="h-5 w-5 transition-all"
                style={{ color: active ? 'var(--violet)' : 'var(--mist)', strokeWidth: active ? 2.2 : 1.7 }}
              />
              <span className="text-[10px] font-medium transition-all"
                style={{ color: active ? 'var(--violet)' : 'var(--mist)' }}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* Center dictation button */}
        <div className="flex-1 flex justify-center">
          <Link
            href="/dictation"
            className="w-14 h-14 rounded-full flex items-center justify-center -mt-6 transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%)',
              boxShadow: 'var(--float-shadow)',
            }}
          >
            <Mic className="h-6 w-6 text-white" strokeWidth={1.8} />
          </Link>
        </div>

        {RIGHT_TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 flex-1 py-2">
              <Icon
                className="h-5 w-5 transition-all"
                style={{ color: active ? 'var(--violet)' : 'var(--mist)', strokeWidth: active ? 2.2 : 1.7 }}
              />
              <span className="text-[10px] font-medium transition-all"
                style={{ color: active ? 'var(--violet)' : 'var(--mist)' }}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
