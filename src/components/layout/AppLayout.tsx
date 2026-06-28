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
    <SwipeContainer className="min-h-screen bg-app">
      {/* Desktop top header — hidden on mobile/tablet */}
      <DesktopHeader />

      {/* Main content */}
      <main className={[
        'mx-auto w-full',
        'max-w-[860px]',          // Mobile/tablet: 860px feels right
        'lg:max-w-[1200px]',      // Desktop: 1200px — proper bento grid, side margins on 1440p+
        'lg:pt-16',
        noPad ? '' : 'px-5 lg:px-12',
        'pb-nav lg:pb-[120px]',
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
