'use client'
import { useState, useEffect } from 'react'
import { Search, Bell, Sun, Moon } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'

export function DesktopHeader() {
  const [time, setTime]   = useState('')
  const [date, setDate]   = useState('')
  const { theme, toggle } = useTheme()

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(format(now, 'h:mm aa'))
      setDate(format(now, 'EEEE, MMMM d'))
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-14 items-center px-6"
      style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--header-border)',
      }}>

      {/* Left — wordmark */}
      <Link href="/" className="w-48">
        <span className="font-display text-xl font-bold tracking-[0.18em]"
          style={{ color: 'var(--text-1)', letterSpacing: '0.18em' }}>
          LUNA
        </span>
      </Link>

      {/* Center — date ✦ time */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <span className="text-sm font-medium" style={{ color: 'var(--text-3)' }}>{date}</span>
        <span style={{ color: 'rgba(139,111,184,0.8)' }}>✦</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{time}</span>
      </div>

      {/* Right — search + theme toggle + bell + avatar */}
      <div className="w-60 flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
          <Search className="h-3.5 w-3.5" style={{ color: 'var(--text-3)' }} />
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>Search LUNA...</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md ml-1"
            style={{ background: 'var(--surface-border)', color: 'var(--text-3)' }}>⌘K</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun  className="h-4 w-4" style={{ color: '#C9A96E' }} strokeWidth={1.8} />
            : <Moon className="h-4 w-4" style={{ color: 'var(--violet)' }} strokeWidth={1.8} />
          }
        </button>

        <button className="relative">
          <Bell className="h-5 w-5" style={{ color: 'var(--text-2)' }} strokeWidth={1.5} />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: '#8B6FB8' }} />
        </button>

        <Link href="/profile">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8B6FB8, #6A4F9B)', border: '2px solid rgba(139,111,184,0.4)' }}>
            <span className="text-white text-xs font-bold">Z</span>
          </div>
        </Link>
      </div>
    </header>
  )
}
