import { BottomNav } from './BottomNav'
import { DesktopSidebar } from './DesktopSidebar'

interface AppLayoutProps {
  children: React.ReactNode
  noPad?: boolean
  className?: string
}

export function AppLayout({ children, noPad, className }: AppLayoutProps) {
  return (
    <div className="min-h-full bg-sanctuary">
      {/* Desktop sidebar — hidden on mobile/tablet */}
      <DesktopSidebar />

      {/* Main content
          Mobile/tablet: centered single column, max-w-lg
          Desktop: offset by sidebar width, full remaining width */}
      <main className={[
        // Mobile: centered narrow column
        'max-w-lg mx-auto',
        // Desktop: shift right of sidebar, use full remaining space
        'lg:ml-56 lg:max-w-none',
        // Padding
        noPad ? '' : 'px-5 lg:px-8',
        // Bottom spacing: nav height on mobile, normal padding on desktop
        'pb-nav lg:pb-12',
        className ?? '',
      ].join(' ')}>
        {children}
      </main>

      {/* Bottom nav — mobile/tablet only */}
      <BottomNav />
    </div>
  )
}
