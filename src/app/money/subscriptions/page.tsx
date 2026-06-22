'use client'
import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { RefreshCw, AlertTriangle, Check, X, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/money'
import { createClient } from '@/lib/supabase/client'

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

interface Subscription {
  id: string
  merchant_name: string | null
  amount_estimate: number | null
  frequency: string | null
  last_charge_date: string | null
  next_expected_charge: string | null
  category: string | null
  status: string
  cancel_url: string | null
  notes: string | null
}

type LeakAction = 'keep' | 'cancel' | 'investigate'
type SubTab = 'all' | 'business' | 'personal' | 'leaks'

const MONEY_LEAKS = [
  { merchant: 'ChatGPT', reason: 'Possible duplicate — you also have Claude ($20/mo). Do you use both?', amount: 20 },
  { merchant: 'eDreams', reason: 'Travel subscription — still actively using this?', amount: 9.99 },
  { merchant: 'Rocket Money', reason: 'Paying $10/mo to track expenses when LUNA already does this for free.', amount: 10 },
]

function getLetterAvatar(name: string | null) {
  return (name ?? '?').charAt(0).toUpperCase()
}

function getMonthlyAmount(sub: Subscription): number {
  const amt = sub.amount_estimate ?? 0
  if (sub.frequency === 'annual') return amt / 12
  if (sub.frequency === 'weekly') return amt * 4
  return amt
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<SubTab>('all')
  const [leakActions, setLeakActions] = useState<Record<string, LeakAction>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  const loadSubs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('money_subscriptions')
        .select('*')
        .order('amount_estimate', { ascending: false })
      setSubscriptions((data ?? []) as Subscription[])
    } catch {
      console.error('Failed to load subscriptions')
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadSubs() }, [loadSubs])

  const active = subscriptions.filter(s => s.status === 'active')
  const businessSubs = active.filter(s => s.notes === 'business')
  const personalSubs = active.filter(s => s.notes !== 'business')

  const monthlyTotal = active.reduce((s, sub) => s + getMonthlyAmount(sub), 0)
  const annualCost = monthlyTotal * 12
  const businessTotal = businessSubs.reduce((s, sub) => s + getMonthlyAmount(sub), 0)
  const personalTotal = personalSubs.reduce((s, sub) => s + getMonthlyAmount(sub), 0)

  function handleLeakAction(merchant: string, action: LeakAction) {
    setLeakActions(prev => ({ ...prev, [merchant]: action }))
  }

  function filterSubs(subs: Subscription[]): Subscription[] {
    if (!searchQuery.trim()) return subs
    const q = searchQuery.toLowerCase()
    return subs.filter(s => (s.merchant_name ?? '').toLowerCase().includes(q) || (s.category ?? '').toLowerCase().includes(q))
  }

  const TABS: { id: SubTab; label: string }[] = [
    { id: 'all',      label: 'All' },
    { id: 'business', label: 'Business' },
    { id: 'personal', label: 'Personal' },
    { id: 'leaks',    label: 'Leaks' },
  ]

  const personalByCategory: Record<string, Subscription[]> = {}
  for (const sub of personalSubs) {
    const cat = sub.category ?? 'Other'
    if (!personalByCategory[cat]) personalByCategory[cat] = []
    personalByCategory[cat].push(sub)
  }

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <AppLayout noPad className="pt-16">
        <div style={{ padding: '20px 16px 120px' }}>

          <div style={{ marginBottom: 18 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>Subscriptions</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>What is actually useful?</p>
          </div>

          {/* Summary bar */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 18, paddingBottom: 4 }}>
            <div style={{ ...CARD, minWidth: 120, padding: 14, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 5 }}>Active</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{active.length}</p>
            </div>
            <div style={{ ...CARD, minWidth: 130, padding: 14, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 5 }}>Monthly</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: GOLDEN }}>{formatCurrency(monthlyTotal)}</p>
            </div>
            <div style={{ ...CARD, minWidth: 130, padding: 14, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 5 }}>Annual</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: AMBER }}>{formatCurrency(annualCost)}</p>
            </div>
            <div style={{ ...CARD, minWidth: 140, padding: 14, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 5 }}>Business</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#6A8AE8' }}>{businessSubs.length} &middot; {formatCurrency(businessTotal)}</p>
            </div>
            <div style={{ ...CARD, minWidth: 140, padding: 14, flexShrink: 0 }}>
              <p style={{ ...LABEL_STYLE, marginBottom: 5 }}>Personal</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>{personalSubs.length} &middot; {formatCurrency(personalTotal)}</p>
            </div>
          </div>

          {/* Money Leak Review card */}
          <div style={{
            border: `1px solid rgba(201,169,110,0.4)`,
            background: 'rgba(201,169,110,0.08)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AlertTriangle style={{ width: 16, height: 16, color: GOLDEN }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: GOLDEN }}>Money Leaks — Review These</p>
            </div>
            {MONEY_LEAKS.map(leak => {
              const action = leakActions[leak.merchant]
              return (
                <div key={leak.merchant} style={{
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3 }}>{leak.merchant}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{leak.reason}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: AMBER, flexShrink: 0 }}>{formatCurrency(leak.amount)}/mo</p>
                  </div>
                  {action ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check style={{ width: 13, height: 13, color: GREEN }} />
                      <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, textTransform: 'capitalize' }}>Marked: {action}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleLeakAction(leak.merchant, 'keep')}
                        style={{ flex: 1, height: 32, borderRadius: 8, border: `1px solid ${GREEN}`, background: `rgba(90,138,106,0.12)`, color: GREEN, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Keep
                      </button>
                      <button onClick={() => handleLeakAction(leak.merchant, 'cancel')}
                        style={{ flex: 1, height: 32, borderRadius: 8, border: `1px solid ${RED}`, background: `rgba(201,107,90,0.12)`, color: RED, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={() => handleLeakAction(leak.merchant, 'investigate')}
                        style={{ flex: 1, height: 32, borderRadius: 8, border: `1px solid ${AMBER}`, background: `rgba(201,146,58,0.12)`, color: AMBER, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Investigate
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Search */}
          <div style={{
            ...CARD,
            padding: '10px 14px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <Search style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'none', border: 'none', outline: 'none', flex: 1,
                fontSize: 13, color: 'white',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  flex: 1, height: 36, borderRadius: 10, border: tab === t.id ? `1px solid rgba(201,169,110,0.4)` : 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: tab === t.id ? `rgba(201,169,110,0.2)` : 'rgba(255,255,255,0.06)',
                  color: tab === t.id ? GOLDEN : 'rgba(255,255,255,0.55)',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <RefreshCw style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.4)' }} className="animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {tab === 'leaks' && (
                <div>
                  <p style={{ ...LABEL_STYLE, marginBottom: 12 }}>Potential Waste</p>
                  {MONEY_LEAKS.map(leak => (
                    <div key={leak.merchant} style={{ ...CARD, padding: 16, marginBottom: 10, border: `1px solid rgba(201,146,58,0.3)`, background: 'rgba(201,146,58,0.06)' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{leak.merchant}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 8 }}>{leak.reason}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: AMBER }}>{formatCurrency(leak.amount)}/mo = {formatCurrency(leak.amount * 12)}/yr</p>
                    </div>
                  ))}
                </div>
              )}

              {(tab === 'all' || tab === 'business') && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ ...LABEL_STYLE, marginBottom: 12 }}>DRYP Business Tools</p>
                  {filterSubs(businessSubs).length === 0 ? (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', padding: '12px 0' }}>No business subscriptions yet.</p>
                  ) : (
                    filterSubs(businessSubs).map(sub => <SubCard key={sub.id} sub={sub} type="business" />)
                  )}
                  {businessSubs.length > 0 && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'right', marginTop: 4 }}>
                      Total: <span style={{ color: '#6A8AE8', fontWeight: 600 }}>{formatCurrency(businessTotal)}/mo</span>
                    </div>
                  )}
                </div>
              )}

              {(tab === 'all' || tab === 'personal') && (
                <div>
                  <p style={{ ...LABEL_STYLE, marginBottom: 12 }}>Personal Subscriptions</p>
                  {Object.entries(personalByCategory).map(([cat, subs]) => (
                    <div key={cat} style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 8, paddingLeft: 2 }}>{cat}</p>
                      {filterSubs(subs).map(sub => <SubCard key={sub.id} sub={sub} type="personal" />)}
                    </div>
                  ))}
                  {personalSubs.length === 0 && (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', padding: '12px 0' }}>No personal subscriptions found.</p>
                  )}
                </div>
              )}
            </>
          )}

          <div style={{ ...CARD, padding: 18, border: `1px solid rgba(201,169,110,0.15)`, background: 'rgba(201,169,110,0.04)', marginTop: 16 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, fontStyle: 'italic', textAlign: 'center' }}>
              &ldquo;Slow wealth starts with knowing where the slow leaks are.&rdquo;
            </p>
            <p style={{ fontSize: 11, color: GOLDEN, textAlign: 'center', marginTop: 6 }}>Do a subscription audit every 90 days.</p>
          </div>

        </div>
      </AppLayout>
    </div>
  )
}

function SubCard({ sub, type }: { sub: Subscription; type: 'business' | 'personal' }) {
  const [localAction, setLocalAction] = useState<'keep' | 'cancel' | null>(null)

  const statusColor = sub.status === 'active' ? GREEN : RED
  const typeColor = type === 'business' ? '#6A8AE8' : GREEN
  const monthlyAmt = getMonthlyAmount(sub)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.11)',
      borderRadius: 18,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: 14,
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, rgba(201,169,110,0.3) 0%, rgba(201,169,110,0.12) 100%)`,
          border: `1.5px solid rgba(201,169,110,0.3)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: GOLDEN,
        }}>
          {getLetterAvatar(sub.merchant_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{sub.merchant_name ?? 'Unknown'}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {sub.category && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)', padding: '2px 7px', borderRadius: 5 }}>
                {sub.category}
              </span>
            )}
            <span style={{ fontSize: 11, color: typeColor, background: `${typeColor}18`, padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>
              {type === 'business' ? 'Business' : 'Personal'}
            </span>
            <span style={{ fontSize: 11, color: statusColor, background: `${statusColor}18`, padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>
              {sub.status}
            </span>
          </div>
          {sub.next_expected_charge && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>
              Next: {sub.next_expected_charge} &middot; {sub.frequency ?? 'monthly'}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: GOLDEN }}>{formatCurrency(monthlyAmt)}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>/mo</p>
        </div>
      </div>

      {localAction ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check style={{ width: 13, height: 13, color: GREEN }} />
          <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, textTransform: 'capitalize' }}>Marked to {localAction}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setLocalAction('keep')}
            style={{ flex: 1, height: 32, borderRadius: 8, border: `1px solid rgba(90,138,106,0.5)`, background: 'rgba(90,138,106,0.08)', color: GREEN, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Check style={{ width: 11, height: 11 }} /> Keep
          </button>
          <button onClick={() => setLocalAction('cancel')}
            style={{ flex: 1, height: 32, borderRadius: 8, border: `1px solid rgba(201,107,90,0.5)`, background: 'rgba(201,107,90,0.08)', color: RED, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <X style={{ width: 11, height: 11 }} /> Cancel
          </button>
          <button style={{ width: 48, height: 32, borderRadius: 8, border: `1px solid rgba(201,146,58,0.5)`, background: 'rgba(201,146,58,0.08)', color: AMBER, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            ?
          </button>
        </div>
      )}
    </div>
  )
}
