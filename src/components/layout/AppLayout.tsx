import { BottomNav } from './BottomNav'

interface AppLayoutProps {
  children: React.ReactNode
  noPad?: boolean
  className?: string
}

export function AppLayout({ children, noPad, className }: AppLayoutProps) {
  return (
    <div className="min-h-full bg-sanctuary">
      <main className={`max-w-lg mx-auto ${noPad ? '' : 'px-5'} pb-nav ${className ?? ''}`}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
