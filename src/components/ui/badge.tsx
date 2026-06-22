import { cn } from '@/lib/utils'
import { CSSProperties } from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
  style?: CSSProperties
}

export function Badge({ children, className, variant = 'default', style }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium',
        variant === 'outline' && 'border border-current bg-transparent',
        className
      )}
      style={style}>
      {children}
    </span>
  )
}
