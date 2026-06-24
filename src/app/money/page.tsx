'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { formatCurrency } from '@/lib/money'
import {
  DollarSign, AlertTriangle, TrendingUp, TrendingDown,
  CreditCard, RefreshCw, ArrowRight, Upload,
} from 'lucide-react'

const BG = 'linear-gradient(180deg, #1A1240 0%, #100C30 35%, #0A0820 65%, #060418 100%)'
const GOLDEN = '#C9A96E'
const GREEN  = '#5A8A6A'
const RED    = '#C96B5A'
const AMBER  = '#C9923A'

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: 18,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)',
}

interface Transaction {
  id: string
  merchant_name?: string | null; name?: string | null
  amount: number; transaction_date: string
  expense_type?: string | null; is_income?: boolean
  account_name?: string | null; pending?: boolean; category_primary?: string | null
}
interface BillDue {
  id: string; name?: string | null; merchant_name?: string | null
  amount_estimate?: number | null; due_date?: string | null; autopay?: boolean | null; status: string
}
interface ActiveSub { id: string; merchant_name?: string | null; amount_estimate?: number | null }
interface MoneyAlert { id: string; title?: string | null; body?: string | null; severity?: string | null }
interface SummaryData {
  spending_this_month: number; spending_this_week: number; income_this_month: number
  top_categories: { category: string; amount: number; count: number }[]
  recent_transactions: Transaction[]
  bills_due_soon: BillDue[]
  active_subscriptions: { count: number; total: number; items: ActiveSub[] }
  needs_review_count: number
  alerts: MoneyAlert[]
  has_transactions: boolean
}

const QUICK_NAV = [
  { label: 'Transactions',  href: '/money/transactions',      icon: TrendingDown },
  { label: 'Bills',         href: '/money/bills',             icon: AlertTriangle },
  { label: 'Subscriptions', href: '/money/subscriptions',     icon: RefreshCw },
  { label: 'Import CSV',    href: '/money/import',            icon: Upload },
  { label: 'Insights',      href: '/money/insights',          icon: TrendingUp },
  { label: 'Business',      href: '/money/business-expenses', icon: DollarSign },
  { label: 'Planning',      href: '/money/planning',          icon: TrendingUp },
  { label: 'Review',        href: '/money/review',            icon: AlertTriangle },
]

function Skeleton({ h = 80, w = '100%' }: { h?: number; w?: string | number }) {
  return (
    <div style={{
      ...CARD, height: h, width: w,
      animation: 'luna-pulse 1.8s ease-in-out infinite',
    }} />
  )
}

export default function MoneyCommandCenter() {
  const [summary, setSummary]     = useState<SummaryData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/money/summary')
      if (res.ok) setSummary(await res.json() as SummaryData)
    } catch (e) {
      console.error('[money] summary fetch failed', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadSummary() }, [loadSummary])

  const alerts   = (summary?.alerts ?? []).filter(a => !dismissed.has(a.id))
  const recentTxns = (summary?.recent_transactions ?? []).slice(0, 8)
  const topCats  = summary?.top_categories ?? []
  const maxCat   = topCats.length > 0 ? Math.max(...topCats.map(c => c.amount)) : 1
  const billsDue = summary?.bills_due_soon ?? []

  // ─── NO DATA YET ───────────────────────────────────────────────────────────
  if (!loading && !summary?.has_transactions) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }}>
        <AppLayout noPad>
          <div style={{
            padding: '80px 20px 140px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: 24, maxWidth: 400, margin: '0 auto',
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.06) 70%)',
              border: '1.5px solid rgba(201,169,110,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(201,169,110,0.18)',
            }}>
              <DollarSign style={{ width: 40, height: 40, color: GOLDEN }} />
            </div>

            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: GOLDEN, marginBottom: 6, letterSpacing: '-0.02em' }}>
                Finance Command Center
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                Your money needs visibility, not fear.
              </p>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
              Import your bank statements and LUNA will track every dollar —
              expenses, bills, subscriptions, money leaks, and your path to wealth.
            </p>

            <Link href="/money/connect" style={{
              width: '100%', height: 52, borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #C9A96E 0%, #B8903A 100%)',
              color: '#1A1240', fontSize: 16, fontWeight: 800, letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              textDecoration: 'none',
            }}>
              <CreditCard style={{ width: 18, height: 18 }} /> Connect Bank Account
            </Link>

            <Link href="/money/import" style={{
              width: '100%', height: 44, borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              textDecoration: 'none',
            }}>
              <Upload style={{ width: 15, height: 15 }} /> Or import CSV instead
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%' }}>
              {QUICK_NAV.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{ ...CARD, padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <Icon style={{ width: 16, height: 16, color: GOLDEN }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </AppLayout>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }}>
        <AppLayout noPad>
          <div style={{ padding: '80px 20px 140px' }}>
            <Skeleton h={28} w={180} />
            <div style={{ height: 16 }} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[1,2,3,4,5].map(i => <Skeleton key={i} w={160} h={90} />)}
            </div>
            <Skeleton h={300} />
            <div style={{ height: 12 }} />
            <Skeleton h={200} />
          </div>
        </AppLayout>
        <style>{`@keyframes luna-pulse { 0%,100%{opacity:.5} 50%{opacity:.22} }`}</style>
      </div>
    )
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <AppLayout noPad>
        <div style={{ padding: '80px 20px 140px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ ...LABEL, color: GOLDEN, marginBottom: 4 }}>Finance Command Center</p>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                Your Money
              </h1>
            </div>
            <Link href="/money/import" style={{
              height: 36, padding: '0 14px', borderRadius: 10, border: '1px solid rgba(201,169,110,0.4)',
              background: 'transparent', color: GOLDEN, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none',
            }}>
              <Upload style={{ width: 12, height: 12 }} /> Import CSV
            </Link>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
            {[
              { label: 'Spent This Month', value: formatCurrency(summary?.spending_this_month ?? 0), color: GOLDEN },
              { label: 'Spent This Week',  value: formatCurrency(summary?.spending_this_week ?? 0),  color: GOLDEN },
              { label: 'Income This Month',value: formatCurrency(summary?.income_this_month ?? 0),   color: GREEN  },
              { label: 'Bills Due',        value: String(billsDue.length), color: billsDue.length > 0 ? AMBER : 'rgba(255,255,255,0.5)' },
              { label: 'Subscriptions/mo', value: formatCurrency(summary?.active_subscriptions?.total ?? 0), color: GOLDEN },
            ].map(stat => (
              <div key={stat.label} style={{ ...CARD, minWidth: 155, flexShrink: 0, padding: 16 }}>
                <p style={{ ...LABEL, marginBottom: 8 }}>{stat.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: stat.color, letterSpacing: '-0.01em' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div style={{
              border: '1px solid rgba(201,146,58,0.4)', background: 'rgba(201,146,58,0.08)',
              borderRadius: 14, padding: '12px 14px', marginBottom: 14,
              display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap',
            }}>
              <AlertTriangle style={{ width: 14, height: 14, color: AMBER, marginTop: 2, flexShrink: 0 }} />
              {alerts.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,146,58,0.14)', borderRadius: 20, padding: '4px 10px' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{a.title}</span>
                  <button
                    onClick={() => setDismissed(p => new Set([...p, a.id]))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1, padding: 0 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent Transactions */}
          <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={LABEL}>Recent Transactions</p>
              <Link href="/money/transactions" style={{ fontSize: 12, color: GOLDEN, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                All <ArrowRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            {recentTxns.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textAlign: 'center', padding: '20px 0' }}>
                No transactions yet. <Link href="/money/import" style={{ color: GOLDEN }}>Import a CSV</Link> to begin.
              </p>
            ) : recentTxns.map(txn => {
              const label = txn.merchant_name ?? txn.name ?? 'Unknown'
              const income = txn.is_income === true
              return (
                <div key={txn.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: income ? 'rgba(90,138,106,0.18)' : 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: income ? GREEN : 'rgba(255,255,255,0.65)',
                  }}>
                    {label.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      {txn.expense_type ?? txn.category_primary ?? '—'} · {txn.transaction_date}
                      {txn.pending ? ' · pending' : ''}
                    </p>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: income ? GREEN : RED, flexShrink: 0 }}>
                    {income ? '+' : '−'}{formatCurrency(Math.abs(txn.amount))}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Spending by Category */}
          {topCats.length > 0 && (
            <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
              <p style={{ ...LABEL, marginBottom: 14 }}>Spending by Category</p>
              {topCats.map(cat => (
                <div key={cat.category} style={{ marginBottom: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', textTransform: 'capitalize' }}>{cat.category}</span>
                    <span style={{ fontSize: 13, color: GOLDEN, fontWeight: 700 }}>{formatCurrency(cat.amount)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${maxCat > 0 ? (cat.amount / maxCat) * 100 : 0}%`,
                      height: '100%', borderRadius: 3,
                      background: `linear-gradient(90deg, ${GOLDEN} 0%, #B8903A 100%)`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bills Due */}
          {billsDue.length > 0 && (
            <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={LABEL}>Bills Due Soon</p>
                <Link href="/money/bills" style={{ fontSize: 12, color: GOLDEN, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                  All bills <ArrowRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>
              {billsDue.map(bill => {
                const today = new Date(); today.setHours(0,0,0,0)
                const due   = bill.due_date ? new Date(bill.due_date + 'T00:00:00') : null
                const days  = due ? Math.ceil((due.getTime() - today.getTime()) / 86_400_000) : null
                const c     = days !== null && days <= 0 ? RED : days !== null && days <= 3 ? RED : days !== null && days <= 7 ? AMBER : GOLDEN
                return (
                  <div key={bill.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{bill.name ?? bill.merchant_name}</p>
                      <p style={{ fontSize: 11, color: c, marginTop: 2 }}>
                        {days === null ? bill.due_date : days <= 0 ? '⚠ Due today' : `Due in ${days} day${days !== 1 ? 's' : ''}`}
                        {bill.autopay ? ' · autopay' : ''}
                      </p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: c }}>{formatCurrency(bill.amount_estimate ?? 0)}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Active Subscriptions */}
          {(summary?.active_subscriptions?.items?.length ?? 0) > 0 && (
            <div style={{ ...CARD, padding: 18, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={LABEL}>Active Subscriptions — {formatCurrency(summary?.active_subscriptions?.total ?? 0)}/mo</p>
                <Link href="/money/subscriptions" style={{ fontSize: 12, color: GOLDEN, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                  All <ArrowRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>
              {(summary?.active_subscriptions?.items ?? []).slice(0, 6).map(sub => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{sub.merchant_name ?? 'Unknown'}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: GOLDEN }}>{formatCurrency(sub.amount_estimate ?? 0)}/mo</p>
                </div>
              ))}
            </div>
          )}

          {/* One Money Move */}
          <div style={{ ...CARD, padding: 18, border: '1px solid rgba(201,169,110,0.22)', background: 'rgba(201,169,110,0.05)', marginBottom: 20 }}>
            <p style={{ ...LABEL, color: GOLDEN, marginBottom: 8 }}>One Money Move Today</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
              Review your subscriptions and cancel one thing you haven&rsquo;t used in 30 days.
              Every $10/mo saved = $120/yr. Slow wealth builds through clean systems.
            </p>
          </div>

          {/* Quick Nav */}
          <p style={{ ...LABEL, marginBottom: 12 }}>Navigate</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 28 }}>
            {QUICK_NAV.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{ ...CARD, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <Icon style={{ width: 18, height: 18, color: GOLDEN }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{label}</p>
                </div>
              </Link>
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7 }}>
            &ldquo;Wealth is built through calm choices, not panic moves.&rdquo;
          </p>
        </div>
      </AppLayout>
      <style>{`
        @keyframes luna-pulse { 0%,100%{opacity:.5} 50%{opacity:.22} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
