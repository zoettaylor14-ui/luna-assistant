import { BottomNav } from './BottomNav'
import { DesktopHeader } from './DesktopHeader'
import { DesktopTabBar } from './DesktopTabBar'
import { SwipeContainer } from './SwipeContainer'

interface AppLayoutProps {
  children: React.ReactNode
  noPad?: boolean
  className?: string
  darkDesktop?: boolean
}

export function AppLayout({ children, noPad, className, darkDesktop }: AppLayoutProps) {
  return (
    <SwipeContainer className="min-h-full bg-app">
      {/* Desktop top header — hidden on mobile/tablet */}
      <DesktopHeader />

      {/* Main content */}
      <main className={[
        // Always centered with a readable max-width
        'mx-auto w-full',
        'max-w-xl',           // Mobile: 576px — breathing room without feeling cramped
        'lg:max-w-3xl',       // Desktop: 768px — comfortable reading width, not wall-to-wall
        'lg:pt-16',
        // Padding — horizontal breathing room
        noPad ? '' : 'px-6 lg:px-10',
        // Bottom spacing
        'pb-nav lg:pb-[100px]',
        className ?? '',
      ].join(' ')}>
        <div className="animate-page-enter content-enter">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
      {/* Desktop bottom tab bar */}
      <DesktopTabBar />
    </SwipeContainer>
  )
}
