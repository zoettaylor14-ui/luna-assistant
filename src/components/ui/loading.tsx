import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function LoadingSpinner({ className, size = 'md' }: LoadingProps) {
  return (
    <svg
      className={cn('animate-spin text-violet-600', {
        'h-4 w-4': size === 'sm',
        'h-6 w-6': size === 'md',
        'h-8 w-8': size === 'lg',
      }, className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function LoadingPage({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

export function AIThinking({ message = 'Thinking...' }: LoadingProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
      <LoadingSpinner size="sm" />
      <p className="text-sm text-violet-700 font-medium">{message}</p>
    </div>
  )
}
