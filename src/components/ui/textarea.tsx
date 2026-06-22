import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, style, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-semibold" style={{ color: 'var(--text-2)' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-2xl text-sm transition-all resize-none',
            'focus:outline-none focus:ring-2 focus:ring-violet-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'ring-2 ring-red-400',
            className
          )}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-1)',
            ...style,
          }}
          {...props}
        />
        {error && <p className="text-sm" style={{ color: '#E88080' }}>{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
