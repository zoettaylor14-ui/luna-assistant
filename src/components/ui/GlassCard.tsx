import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  soul?: boolean
  onClick?: () => void
  as?: 'div' | 'button' | 'a'
}

export function GlassCard({ children, className, soul, onClick, as: Tag = 'div' }: GlassCardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(soul ? 'soul-card' : 'glass-card', 'p-5', className)}
    >
      {children}
    </Tag>
  )
}

export function SmallCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('glass-card-sm p-4', className)}>
      {children}
    </div>
  )
}
