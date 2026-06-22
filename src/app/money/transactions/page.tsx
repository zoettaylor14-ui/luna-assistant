'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency, CATEGORY_ICONS } from '@/lib/money'
import { createClient } from '@/lib/supabase/client'

const BG = 'linear-gradient(180deg, #1A1240 0%, #100C30 35%, #0A0820 65%, #060418 100%)'
const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: 18,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  padding: 18,
  marginBottom: 12,
}
const GOLDEN = '#C9A96E'

type DateFilter = 'week' | 'month' | 'last_month' | 'all'

interface Transaction {
  id: string
  plaid_transaction_id: string
  merchant_name: string | null
  name: string
  amount: number
  transaction_date: string
  expense_type: string
  is_income: boolean
  account_name: string | null
  pending: boolean
  category_primary: string | null
  category_detailed: string | null
  notes: string | null
  needs_review: boolean
}

function TransactionsContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'review' ? 'review' : 'all'

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [tab, setTab] = useState<'all' | 'review'>(defaultTab)
  const [expanded, setExpanded] = useState<string | null>(null)

  const supabase = createClient()

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      let startDate: string | null = null

      if (dateFilter === 'week') {
        const d = new Date(now); d.setDate(now.getDate() - 7)
        startDate = d.toISOString().split('T')[0]
      } else if (dateFilter === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      } else if (dateFilter === 'last_month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
      }

      let query = supabase
        .from('money_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(200)

      if (startDate) query = query.gte('transaction_date', startDate)
      if (tab === 'review') query = query.eq('needs_review', true)

      const { data } = await query
      setTransactions(data ?? [])
    } catch {
      console.error('Failed to load transactions')
    }
    setLoading(false)
  }, [dateFilter, tab, supabase])

  useEffect(() => { loadTransactions() }, [loadTransactions])

  const filtered = transactions.filter(t => {
    const matchSearch = !search ||
      (t.merchant_name ?? t.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || t.expense_type === categoryFilter
    return matchSearch && matchCat
  })

  const categories = ['all', ...Array.from(new Set(transactions.map(t => t.expense_type).filter(Boolean)))]

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <AppLayout noPad className="pt-16">
        <div style={{ padding: '20px 16px 120px' }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display, sans-serif)', marginBottom: 2 }}>Transactions</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Every move tracked with clarity</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['all', 'review'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: tab === t ? 'rgba(139,111,184,0.25)' : 'rgba(255,255,255,0.07)',
                  color: tab === t ? 'rgba(196,169,232,0.9)' : 'rgba(255,255,255,0.5)',
                  border: tab === t ? '1px solid rgba(139,111,184,0.3)' : '1px solid rgba(255,255,255,0.1)',
                }}>
                {t === 'all' ? 'All Transactions' : 'Needs Review'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search className="h-4 w-4 absolute left-12px top-50% translate-y-50%" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search merchants…"
              style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px 10px 36px', fontSize: 13, color: 'white', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
            {(['week', 'month', 'last_month', 'all'] as DateFilter[]).map(f => (
              <button key={f} onClick={() => setDateFilter(f)}
                style={{ padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  background: dateFilter === f ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,255,0.06)',
                  color: dateFilter === f ? GOLDEN : 'rgba(255,255,255,0.45)',
                  border: dateFilter === f ? `1px solid rgba(201,169,110,0.3)` : '1px solid rgba(255,255,255,0.1)',
                }}>
                {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f === 'last_month' ? 'Last Month' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                style={{ padding: '5px 10px', borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  background: categoryFilter === cat ? 'rgba(139,111,184,0.2)' : 'rgba(255,255,255,0.05)',
                  color: categoryFilter === cat ? 'rgba(196,169,232,0.9)' : 'rgba(255,255,255,0.4)',
                  border: categoryFilter === cat ? '1px solid rgba(139,111,184,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {cat === 'all' ? 'All' : `${CATEGORY_ICONS[cat] ?? ''} ${cat.replace('_', ' ')}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)' }}>
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p style={{ fontSize: 13 }}>Loading transactions…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ ...CARD, textAlign: 'center', padding: 32 }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>No transactions found.</p>
            </div>
          ) : (
            <div style={CARD}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                {filtered.length} transactions
              </p>
              {filtered.map(txn => (
                <div key={txn.id}>
                  <button
                    onClick={() => setExpanded(expanded === txn.id ? null : txn.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[txn.expense_type] ?? '💳'}</span>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{txn.merchant_name ?? txn.name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                          {txn.transaction_date}{txn.account_name ? ` · ${txn.account_name}` : ''}{txn.pending ? ' · Pending' : ''}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: txn.is_income ? '#8AB88A' : '#E05E5E' }}>
                        {txn.is_income ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      {expanded === txn.id ? <ChevronUp className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />}
                    </div>
                  </button>

                  {expanded === txn.id && (
                    <div style={{ padding: '12px 0 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, margin: '4px 0 8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
                        <div>
                          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Category</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>{txn.expense_type?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Date</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{txn.transaction_date}</p>
                        </div>
                        {txn.category_primary && (
                          <div>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Plaid Category</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{txn.category_primary}</p>
                          </div>
                        )}
                        {txn.account_name && (
                          <div>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Account</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{txn.account_name}</p>
                          </div>
                        )}
                      </div>
                      {txn.notes && (
                        <div style={{ padding: '8px 12px 0' }}>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>{txn.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div style={{ background: 'linear-gradient(180deg, #1A1240 0%, #060418 100%)', minHeight: '100vh' }} />}>
      <TransactionsContent />
    </Suspense>
  )
}
