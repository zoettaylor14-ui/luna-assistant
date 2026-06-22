'use client'
import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { formatCurrency } from '@/lib/money'
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, CreditCard, RefreshCw } from 'lucide-react'

const BG = 'linear-gradient(180deg, #1A1240 0%, #100C30 35%, #0A0820 65%, #060418 100%)'
const GOLDEN = '#C9A96E'
const GREEN = '#5A8A6A'
const RED = '#C96B5A'
const AMBER = '#C9923A'

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: 18,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.42)',
}

interface Transaction {
  id: string
  plaid_transaction_id?: string
  merchant_name?: string | null
  name?: string | null
  amount: number
  transaction_date: string
  expense_type?: string | null
  is_income?: boolean
  account_name?: string | null
  pending?: boolean
  category_primary?: string | null
}

interface BillDue {
  id: string
  name?: string | null
  merchant_name?: string | null
  amount_estimate?: number | null
  due_date?: string | null
  autopay?: boolean | null
  status: string
}

interface ActiveSub {
  id: string
  merchant_name?: string | null
  amount_estimate?: number | null
}

interface TopCategory {
  category: string
  amount: number
  count: number
}

interface Alert {
  id: string
  title?: string | null
  body?: string | null
  severity?: string | null
}

interface SummaryData {
  total_available_balance: number
  total_current_balance: number
  spending_this_month: number
  spending_this_week: number
  income_this_month: number
  top_categories: TopCategory[]
  recent_transactions: Transaction[]
  bills_due_soon: BillDue[]
  active_subscriptions: {
    count: number
    total: number
    items: ActiveSub[]
  }
  accounts: unknown[]
  needs_review_count: number
  alerts: Alert[]
  plaid_connected: boolean
  last_synced_at: string | null
}

const QUICK_NAV = [
  { label: 'Accounts',      href: '/money/accounts',          icon: CreditCard },
  { label: 'Transactions',  href: '/money/transactions',      icon: TrendingDown },
  { label: 'Bills',         href: '/money/bills',             icon: AlertTriangle },
  { label: 'Subscriptions', href: '/money/subscriptions',     icon: RefreshCw },
  { label: 'Insights',      href: '/money/insights',          icon: TrendingUp },
  { label: 'Business',      href: '/money/business-expenses', icon: DollarSign },
  { label: 'Planning',      href: '/money/planning',          icon: TrendingUp },
  { label: 'Review',        href: '/money/review',            icon: AlertTriangle },
]

function SkeletonCard({ width = '100%', height = 80 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      ...CARD,
      width,
      height,
      animation: 'pulse 1.8s ease-in-out infinite',
    }} />
  )
}

export default function MoneyCommandCenter() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [linkReady, setLinkReady] = useState(false)

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/money/summary')
      if (res.ok) {
        const data = await res.json() as SummaryData
        setSummary(data)
      }
    } catch (e) {
      console.error('[money] summary fetch failed', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSummary() }, [loadSummary])

  async function initPlaidLink() {
    const res = await fetch('/api/plaid/create-link-token', { method: 'POST' })
    const { link_token } = await res.json() as { link_token: string }
    setLinkToken(link_token)

    const win = window as unknown as { Plaid?: { create: (config: object) => { open: () => void } } }
    if (!win.Plaid) {
      const script = document.createElement('script')
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
      script.onload = () => setLinkReady(true)
      document.head.appendChild(script)
    } else {
      setLinkReady(true)
    }
  }

  function openPlaidLink() {
    if (!linkToken || !linkReady) return
    const PlaidWindow = (window as unknown as { Plaid?: { create: (config: object) => { open: () => void } } }).Plaid
    if (!PlaidWindow) return
    const handler = PlaidWindow.create({
      token: linkToken,
      onSuccess: async (public_token: string, metadata: { institution: { name: string; institution_id: string } }) => {
        await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token,
            institution_id: metadata.institution.institution_id,
            institution_name: metadata.institution.name,
          }),
        })
        loadSummary()
      },
      onExit: () => {},
    })
    handler.open()
  }

  const isConnected = summary?.plaid_connected === true

  // ─── NOT CONNECTED STATE ──────────────────────────────────────────────────────
  if (!loading && !isConnected) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }}>
        <AppLayout noPad className="pt-16">
          <div style={{ padding: '20px 16px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '80vh', justifyContent: 'center', gap: 24 }}>

            {/* Gold icon */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.06) 70%)`,
              border: `1.5px solid rgba(201,169,110,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(201,169,110,0.18)',
            }}>
              <DollarSign style={{ width: 36, height: 36, color: GOLDEN }} />
            </div>

            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: GOLDEN, marginBottom: 8, letterSpacing: '-0.02em' }}>Finance Command Center</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>Your money needs visibility, not fear.</p>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 320 }}>
              Connect both banks through Plaid and LUNA will track every dollar — expenses, bills, subscriptions, money leaks, and your path to wealth.
            </p>

            <button
              onClick={() => { void initPlaidLink().then(openPlaidLink) }}
              style={{
                width: '100%', maxWidth: 320, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, #C9A96E 0%, #B8903A 100%)`,
                color: '#1A1240', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
              }}>
              Connect Bank
            </button>

            {/* Preview card */}
            <div style={{
              ...CARD,
              padding: '14px 20px',
              border: `1px solid rgba(201,169,110,0.22)`,
              background: 'rgba(201,169,110,0.06)',
              maxWidth: 320, width: '100%',
            }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                19 known subscriptions from April &mdash; <span style={{ color: GOLDEN, fontWeight: 700 }}>$437/mo estimated</span>
              </p>
            </div>

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, maxWidth: 280 }}>
              Your data is encrypted. LUNA never sells your information.
            </p>
          </div>
        </AppLayout>
      </div>
    )
  }

  // ─── LOADING STATE ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }}>
        <AppLayout noPad className="pt-16">
          <div style={{ padding: '20px 16px 120px' }}>
            <div style={{ marginBottom: 24 }}>
              <SkeletonCard height={24} width={160} />
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
              {[1,2,3,4,5].map(i => <SkeletonCard key={i} width={160} height={90} />)}
            </div>
            <SkeletonCard height={300} />
            <div style={{ marginTop: 12 }}>
              <SkeletonCard height={200} />
            </div>
          </div>
        </AppLayout>
      </div>
    )
  }

  // ─── CONNECTED STATE ──────────────────────────────────────────────────────────
  const alerts = (summary?.alerts ?? []).filter(a => !dismissedAlerts.has(a.id))
  const recentTxns = (summary?.recent_transactions ?? []).slice(0, 8)
  const topCategories = summary?.top_categories ?? []
  const maxCatAmount = topCategories.length > 0 ? Math.max(...topCategories.map(c => c.amount)) : 1
  const billsDue = summary?.bills_due_soon ?? []

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <AppLayout noPad className="pt-16">
        <div style={{ padding: '20px 16px 120px' }}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ ...LABEL_STYLE, color: GOLDEN, marginBottom: 4 }}>MONEY COMMAND CENTER</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 2 }}>Finance Command Center</h1>
          </div>

          {/* Top stat cards */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 20, paddingBottom: 6 }}>
            <div style={{ ...CARD, minWidth: 160, padding: 16, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 6 }}>Total Cash</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>{formatCurrency(summary?.total_available_balance ?? 0)}</p>
            </div>
            <div style={{ ...CARD, minWidth: 160, padding: 16, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 6 }}>Month Spending</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: GOLDEN }}>{formatCurrency(summary?.spending_this_month ?? 0)}</p>
            </div>
            <div style={{ ...CARD, minWidth: 160, padding: 16, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 6 }}>Month Income</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>{formatCurrency(summary?.income_this_month ?? 0)}</p>
            </div>
            <div style={{ ...CARD, minWidth: 160, padding: 16, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 6 }}>Bills Due</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: AMBER }}>{billsDue.length}</p>
            </div>
            <div style={{ ...CARD, minWidth: 160, padding: 16, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 6 }}>Subscriptions</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: GOLDEN }}>
                {summary?.active_subscriptions?.count ?? 0} subs &middot; {formatCurrency(summary?.active_subscriptions?.total ?? 0)}/mo
              </p>
            </div>
          </div>

          {/* Alert strip */}
          {alerts.length > 0 && (
            <div style={{
              border: `1px solid rgba(201,146,58,0.4)`,
              background: 'rgba(201,146,58,0.08)',
              borderRadius: 14,
              padding: '12px 14px',
              marginBottom: 16,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}>
              <AlertTriangle style={{ width: 14, height: 14, color: AMBER, flexShrink: 0, marginTop: 2 }} />
              {alerts.map(alert => (
                <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,146,58,0.14)', borderRadius: 20, padding: '4px 10px' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{alert.title}</span>
                  <button onClick={() => setDismissedAlerts(p => new Set([...p, alert.id]))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1, padding: 0 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent Transactions */}
          <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
            <p style={{ ...LABEL_STYLE, marginBottom: 14 }}>Recent Transactions</p>
            {recentTxns.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '16px 0' }}>No transactions yet — connect a bank to begin.</p>
            ) : (
              recentTxns.map(txn => {
                const label = txn.merchant_name ?? txn.name ?? 'Unknown'
                const isIncome = txn.is_income === true
                const amtColor = isIncome ? GREEN : RED
                return (
                  <div key={txn.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
                    }}>
                      {label.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)' }}>{txn.category_primary ?? txn.expense_type ?? ''} &middot; {txn.transaction_date}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: amtColor, flexShrink: 0 }}>
                      {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                  </div>
                )
              })
            )}
          </div>

          {/* Spending by Category */}
          {topCategories.length > 0 && (
            <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 14 }}>Spending by Category</p>
              {topCategories.map(cat => {
                const pct = maxCatAmount > 0 ? (cat.amount / maxCatAmount) * 100 : 0
                return (
                  <div key={cat.category} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{cat.category}</span>
                      <span style={{ fontSize: 12, color: GOLDEN, fontWeight: 600 }}>{formatCurrency(cat.amount)}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${GOLDEN} 0%, #B8903A 100%)`, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Bills Due Soon */}
          {billsDue.length > 0 && (
            <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 14 }}>Bills Due Soon</p>
              {billsDue.map(bill => {
                const today = new Date(); today.setHours(0,0,0,0)
                const due = bill.due_date ? new Date(bill.due_date) : null
                const days = due ? Math.ceil((due.getTime() - today.getTime()) / (1000*60*60*24)) : null
                const urgencyColor = days !== null && days <= 3 ? RED : days !== null && days <= 7 ? AMBER : GOLDEN
                return (
                  <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{bill.name ?? bill.merchant_name ?? 'Unknown'}</p>
                      <p style={{ fontSize: 11, color: urgencyColor }}>
                        {days !== null ? (days <= 0 ? 'Due today' : `Due in ${days} day${days !== 1 ? 's' : ''}`) : bill.due_date}
                      </p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: urgencyColor }}>{formatCurrency(bill.amount_estimate ?? 0)}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Active Subscriptions (top 5) */}
          {(summary?.active_subscriptions?.items?.length ?? 0) > 0 && (
            <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 14 }}>Active Subscriptions</p>
              {(summary?.active_subscriptions?.items ?? []).slice(0, 5).map(sub => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{sub.merchant_name ?? 'Unknown'}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: GOLDEN }}>{formatCurrency(sub.amount_estimate ?? 0)}/mo</p>
                </div>
              ))}
            </div>
          )}

          {/* LUNA Money Move */}
          <div style={{ ...CARD, padding: 18, border: `1px solid rgba(201,169,110,0.22)`, background: 'rgba(201,169,110,0.05)', marginBottom: 20 }}>
            <p style={{ ...LABEL_STYLE, color: GOLDEN, marginBottom: 8 }}>One Money Move Today</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
              Review your subscriptions and cancel one thing you haven&rsquo;t used in 30 days. Every $10 saved compounds to over $120/year — and that&rsquo;s before investing it.
            </p>
          </div>

          {/* Quick Nav Grid */}
          <p style={{ ...LABEL_STYLE, marginBottom: 12 }}>Navigate</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 28 }}>
            {QUICK_NAV.map(({ label, href, icon: Icon }) => (
              <a key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  ...CARD,
                  padding: '14px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  cursor: 'pointer',
                }}>
                  <Icon style={{ width: 18, height: 18, color: GOLDEN }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>{label}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Bottom quote */}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7 }}>
            &ldquo;Wealth is built through calm choices, not panic moves.&rdquo;
          </p>
        </div>
      </AppLayout>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  )
}
