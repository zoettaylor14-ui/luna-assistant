'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sparkles, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [message, setMessage]   = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #EDE5F5 60%, #E8E0F5 100%)' }}>

      {/* Decorative orbs */}
      <div className="fixed -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,159,216,0.3), transparent)', filter: 'blur(60px)' }} />
      <div className="fixed bottom-0 -left-20 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,196,218,0.25), transparent)', filter: 'blur(50px)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-breathe"
            style={{
              background: 'linear-gradient(135deg, #8B6FB8, #6A4F9B)',
              boxShadow: '0 8px 32px rgba(139,111,184,0.4)',
            }}
          >
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-wide mb-1" style={{ color: 'var(--depth)', letterSpacing: '0.08em' }}>
            LUNA
          </h1>
          <p className="text-sm font-display italic mb-1" style={{ color: 'var(--violet)' }}>
            Your personal sanctuary
          </p>
          <p className="text-sm" style={{ color: 'var(--mid)' }}>
            {mode === 'login' ? 'Welcome back, Zoe.' : 'Your sanctuary awaits.'}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: 'var(--violet)' }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--mist)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: '1.5px solid rgba(139,111,184,0.15)',
                  color: 'var(--depth)',
                }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--mist)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-12"
                  style={{
                    background: 'rgba(255,255,255,0.6)',
                    border: '1.5px solid rgba(139,111,184,0.15)',
                    color: 'var(--depth)',
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--mist)' }}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-xl" style={{ background: 'rgba(224,94,94,0.08)', color: '#E05E5E' }}>{error}</p>
            )}
            {message && (
              <p className="text-sm px-3 py-2 rounded-xl" style={{ background: 'rgba(90,138,90,0.08)', color: '#5A8A5A' }}>{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))', boxShadow: '0 4px 24px rgba(139,111,184,0.3)' }}
            >
              {loading ? 'One moment...' : mode === 'login' ? 'Enter your sanctuary' : 'Create your sanctuary'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--mist)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button
              onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
              className="font-semibold underline" style={{ color: 'var(--violet)' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs mt-8 font-display italic" style={{ color: 'var(--faint)' }}>
          &ldquo;You are not behind. You are returning.&rdquo;
        </p>
      </div>
    </div>
  )
}
