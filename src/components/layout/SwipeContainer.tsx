'use client'
import { useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const TAB_ROUTES = ['/', '/messages', '/calendar', '/tasks', '/spirit', '/atelier', '/night', '/memory', '/settings']

interface SwipeContainerProps {
  children: React.ReactNode
  className?: string
}

export function SwipeContainer({ children, className }: SwipeContainerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const tx = useRef(0)
  const ty = useRef(0)

  function onTouchStart(e: React.TouchEvent) {
    tx.current = e.touches[0].clientX
    ty.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - tx.current
    const dy = e.changedTouches[0].clientY - ty.current
    // Require a clear horizontal swipe that isn't a scroll
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    const idx = TAB_ROUTES.findIndex(r => r === '/' ? pathname === '/' : pathname.startsWith(r))
    if (idx === -1) return
    if (dx < 0 && idx < TAB_ROUTES.length - 1) router.push(TAB_ROUTES[idx + 1])
    else if (dx > 0 && idx > 0) router.push(TAB_ROUTES[idx - 1])
  }

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className={className}>
      {children}
    </div>
  )
}
