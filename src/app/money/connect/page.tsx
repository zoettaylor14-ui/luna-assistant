'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Building2, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'

const BG = 'linear-gradient(180deg, #1A1240 0%, #100C30 35%, #0A0820 65%, #060418 100%)'
const GOLDEN = '#C9A96E'
const GREEN  = '#5A8A6A'

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: 18,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  padding: 20,
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function ConnectBankPage() {
  const router = useRouter()
  const [status, setStatus]   = useState<'idle' | 'connecting' | 'importing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [imported, setImported] = useState(0)

  async function handleConnect() {
    setStatus('connecting')
    setMessage('Opening bank connection…')
    try {
      // 1. Create a Financial Connections session server-side
      const res = await fetch('/api/stripe/create-session', { method: 'POST' })
      const { client_secret, error: sessionErr } = await res.json() as { client_secret?: string; error?: string }
      if (sessionErr || !client_secret) throw new Error(sessionErr ?? 'Could not create session')

      // 2. Open Stripe Financial Connections UI
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const { financialConnectionsSession, error: fcError } = await stripe.collectFinancialConnectionsAccounts({ clientSecret: client_secret })
      if (fcError) throw new Error(fcError.message)
      if (!financialConnectionsSession?.accounts?.length) {
        setStatus('idle')
        setMessage('No accounts were connected.')
        return
      }

      // 3. Import transactions for each connected account
      setStatus('importing')
      let totalImported = 0
      for (const account of financialConnectionsSession.accounts) {
        setMessage(`Importing ${account.display_name ?? account.institution_name ?? 'account'}…`)
        const impRes = await fetch('/api/stripe/import-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: account.id }),
        })
        const impData = await impRes.json() as { imported?: number; error?: string }
        if (impData.error) console.warn('Import warning:', impData.error)
        totalImported += impData.imported ?? 0
      }

      setImported(totalImported)
      setStatus('done')
      setMessage(`${totalImported} transactions imported successfully`)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <AppLayout noPad>
        <div style={{ padding: '80px 20px 140px', maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
              background: 'radial-gradient(circle, rgba(201,169,110,0.2) 0%, transparent 70%)',
              border: '1.5px solid rgba(201,169,110,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 style={{ width: 32, height: 32, color: GOLDEN }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 6 }}>Connect Your Bank</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              Securely link your bank account through Stripe. Your credentials are never stored — only read-only access.
            </p>
          </div>

          {/* Status */}
          {status === 'done' ? (
            <div style={{ ...CARD, background: 'rgba(90,138,90,0.1)', border: '1px solid rgba(90,138,90,0.3)', textAlign: 'center', padding: 28 }}>
              <CheckCircle style={{ width: 36, height: 36, color: GREEN, margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>Connected!</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{imported} transactions imported</p>
              <button
                onClick={() => router.push('/money')}
                style={{ marginTop: 16, width: '100%', height: 44, borderRadius: 12, border: 'none', background: GOLDEN, color: '#1A1240', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                View Money Dashboard →
              </button>
            </div>
          ) : status === 'error' ? (
            <div style={{ ...CARD, background: 'rgba(201,107,90,0.08)', border: '1px solid rgba(201,107,90,0.25)', textAlign: 'center', padding: 24 }}>
              <AlertTriangle style={{ width: 28, height: 28, color: '#C96B5A', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>{message}</p>
              <button onClick={() => setStatus('idle')} style={{ fontSize: 13, color: GOLDEN, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Info cards */}
              {[
                { icon: '🔒', title: 'Bank-level security', desc: 'Powered by Stripe — the same infrastructure used by millions of businesses worldwide' },
                { icon: '👁️', title: 'Read-only access', desc: 'LUNA can only read your transactions. It cannot move money or make changes' },
                { icon: '⚡', title: 'Instant import', desc: 'Up to 200 recent transactions imported automatically after you connect' },
              ].map(item => (
                <div key={item.title} style={{ ...CARD, display: 'flex', gap: 14, padding: 16 }}>
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3 }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}

              {message && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{message}</p>
              )}

              <button
                onClick={() => void handleConnect()}
                disabled={status === 'connecting' || status === 'importing'}
                style={{
                  width: '100%', height: 52, borderRadius: 16, border: 'none',
                  background: status !== 'idle' ? 'rgba(201,169,110,0.4)' : 'linear-gradient(135deg, #C9A96E 0%, #B8903A 100%)',
                  color: '#1A1240', fontSize: 16, fontWeight: 800, cursor: status !== 'idle' ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {status === 'connecting' || status === 'importing'
                  ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> {message}</>
                  : 'Connect Bank Account'}
              </button>
            </>
          )}
        </div>
      </AppLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
