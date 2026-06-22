'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const BG = 'linear-gradient(180deg, #1A1240 0%, #100C30 35%, #0A0820 65%, #060418 100%)'
const GOLDEN = '#C9A96E'

function OAuthReturnContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'connecting' | 'success' | 'error'>('connecting')

  useEffect(() => {
    const oauthStateId = searchParams.get('oauth_state_id')
    if (!oauthStateId) {
      setStatus('error')
      return
    }

    // Load Plaid Link script and re-initialize in OAuth return mode
    const loadAndReopen = async () => {
      try {
        // Get a new link token (Plaid requires this for OAuth return)
        const res = await fetch('/api/plaid/create-link-token', { method: 'POST' })
        const { link_token } = await res.json()
        if (!link_token) throw new Error('No link token')

        await new Promise<void>((resolve, reject) => {
          if ((window as unknown as { Plaid?: unknown }).Plaid) { resolve(); return }
          const script = document.createElement('script')
          script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
          script.onload = () => resolve()
          script.onerror = () => reject()
          document.head.appendChild(script)
        })

        const plaidWindow = window as unknown as {
          Plaid: {
            create: (config: {
              token: string
              receivedRedirectUri: string
              onSuccess: (publicToken: string, metadata: Record<string, unknown>) => void
              onExit: (err: unknown) => void
            }) => { open: () => void }
          }
        }

        const handler = plaidWindow.Plaid.create({
          token: link_token,
          receivedRedirectUri: window.location.href,
          onSuccess: async (publicToken: string, metadata: Record<string, unknown>) => {
            await fetch('/api/plaid/exchange-public-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                public_token: publicToken,
                institution_id: (metadata.institution as { institution_id?: string })?.institution_id,
                institution_name: (metadata.institution as { name?: string })?.name,
              }),
            })
            setStatus('success')
            setTimeout(() => router.push('/money'), 2000)
          },
          onExit: () => {
            setStatus('error')
            setTimeout(() => router.push('/money'), 2000)
          },
        })

        handler.open()
      } catch {
        setStatus('error')
        setTimeout(() => router.push('/money'), 3000)
      }
    }

    loadAndReopen()
  }, [searchParams, router])

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 32 }}>
      {status === 'connecting' && (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🏦</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8, textAlign: 'center' }}>Reconnecting to your bank…</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6 }}>
            Completing the secure bank connection. This will only take a moment.
          </p>
          <div style={{ marginTop: 24, width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: GOLDEN, animation: 'spin 1s linear infinite' }} />
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>Bank Connected</h1>
          <p style={{ fontSize: 13, color: '#8AB88A' }}>Redirecting to Money…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>Connection issue</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Returning to Money…</p>
        </>
      )}
    </div>
  )
}

export default function OAuthReturnPage() {
  return (
    <Suspense fallback={
      <div style={{ background: 'linear-gradient(180deg, #1A1240 0%, #060418 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
      </div>
    }>
      <OAuthReturnContent />
    </Suspense>
  )
}
