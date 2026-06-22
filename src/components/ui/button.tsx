'use client'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'default'     && 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm',
          variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm':   size === 'md',
            'px-6 py-3 text-base': size === 'lg',
            'p-2 w-9 h-9':         size === 'icon',
          },
          className
        )}
        style={
          variant === 'outline'   ? { background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--text-1)' } :
          variant === 'ghost'     ? { background: 'transparent', color: 'var(--text-2)' } :
          variant === 'secondary' ? { background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--surface-border)' } :
          undefined
        }
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
