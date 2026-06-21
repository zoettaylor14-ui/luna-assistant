'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { DollarSign, TrendingUp, TrendingDown, Plus, AlertTriangle, Check } from 'lucide-react'
import { format } from 'date-fns'

type MoneyTab = 'daily' | 'trading' | 'goals'

const TRADING_RULES = [
  { rule: 'No trading when emotional', icon: '🧘' },
  { rule: 'No revenge trading after a loss', icon: '❌' },
  { rule: 'No oversized trades', icon: '⚖️' },
  { rule: 'Write the setup before entering', icon: '📝' },
  { rule: 'No trading because I feel behind', icon: '🛑' },
]

const MONEY_CATEGORIES = ['Food', 'Transport', 'Business', 'Self-care', 'Subscriptions', 'Personal', 'Investment', 'Other']

interface SpendLog {
  id: string
  type: 'expense' | 'income' | 'saving'
  amount: string
  category: string
  note: string
}

interface TradeEntry {
  asset: string
  setup: string
  result: '' | 'win' | 'loss' | 'breakeven' | 'open'
  emotion_before: string
  emotion_after: string
  lesson: string
  followed_rules: boolean
}

export default function MoneyScreen() {
  const [tab, setTab]           = useState<MoneyTab>('daily')
  const [logs, setLogs]         = useState<SpendLog[]>([])
  const [newLog, setNewLog]     = useState<Partial<SpendLog>>({ type: 'expense', category: 'Other' })
  const [addingLog, setAddingLog] = useState(false)
  const [trade, setTrade]       = useState<TradeEntry>({
    asset: '', setup: '', result: '', emotion_before: '', emotion_after: '', lesson: '', followed_rules: true,
  })
  const [rulesChecked, setRulesChecked] = useState<Set<number>>(new Set())
  const today = format(new Date(), 'MMM d')

  function addLog() {
    if (!newLog.amount) return
    setLogs(prev => [...prev, { id: Date.now().toString(), type: newLog.type ?? 'expense', amount: newLog.amount ?? '0', category: newLog.category ?? 'Other', note: newLog.note ?? '' }])
    setNewLog({ type: 'expense', category: 'Other' })
    setAddingLog(false)
  }

  const totalExpenses = logs.filter(l => l.type === 'expense').reduce((s, l) => s + Number(l.amount), 0)
  const totalIncome   = logs.filter(l => l.type === 'income').reduce((s, l) => s + Number(l.amount), 0)

  return (
    <div className="bg-sanctuary min-h-screen">
      <AppLayout noPad>
        <div className="px-5 pt-14 pb-nav">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(90,138,90,0.1)' }}>
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider text-green-700">Money</p>
          </div>

          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--depth)' }}>
            Wealth through calm choices.
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--mid)' }}>
            Not panic moves. Track simply. Move intentionally.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['daily', 'trading', 'goals'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`tab-pill ${tab === t ? 'active' : ''}`}>
                {t === 'daily' ? '📊 Daily' : t === 'trading' ? '📈 Trading' : '🎯 Goals'}
              </button>
            ))}
          </div>

          {/* Daily tab */}
          {tab === 'daily' && (
            <div className="space-y-4 animate-fade-up">
              {/* Summary */}
              {logs.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <GlassCard className="text-center p-4!">
                    <TrendingDown className="h-4 w-4 mx-auto mb-1" style={{ color: '#E05E5E' }} />
                    <p className="text-xs" style={{ color: 'var(--mist)' }}>Spent today</p>
                    <p className="font-display text-xl font-semibold" style={{ color: 'var(--depth)' }}>
                      ${totalExpenses.toFixed(2)}
                    </p>
                  </GlassCard>
                  <GlassCard className="text-center p-4!">
                    <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <p className="text-xs" style={{ color: 'var(--mist)' }}>Income today</p>
                    <p className="font-display text-xl font-semibold" style={{ color: 'var(--depth)' }}>
                      ${totalIncome.toFixed(2)}
                    </p>
                  </GlassCard>
                </div>
              )}

              {/* Daily check-in */}
              <GlassCard>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--golden)' }}>Daily money check</p>
                {[
                  'Did I spend today?',
                  'Did I track it?',
                  'Did I save anything?',
                  'What is one money move I can make today?',
                ].map((q, i) => (
                  <div key={i} className="flex items-center gap-2 py-2" style={{ borderBottom: i < 3 ? '1px solid rgba(139,111,184,0.06)' : 'none' }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--golden)' }} />
                    <p className="text-sm" style={{ color: 'var(--mid)' }}>{q}</p>
                  </div>
                ))}
              </GlassCard>

              {/* Log entries */}
              {logs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--mist)' }}>{today}&apos;s log</p>
                  {logs.map(log => (
                    <div key={log.id} className="glass-card p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--depth)' }}>{log.category}{log.note ? ` — ${log.note}` : ''}</p>
                        <p className="text-xs" style={{ color: 'var(--mist)' }}>{log.type}</p>
                      </div>
                      <p className="font-semibold" style={{ color: log.type === 'income' ? '#5A8A5A' : log.type === 'saving' ? 'var(--golden)' : '#E05E5E' }}>
                        {log.type === 'expense' ? '-' : '+'}${log.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add log */}
              {addingLog ? (
                <GlassCard>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--golden)' }}>Add entry</p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {(['expense','income','saving'] as const).map(t => (
                        <button key={t} onClick={() => setNewLog(p => ({ ...p, type: t }))}
                          className="flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                          style={{
                            background: newLog.type === t ? 'var(--violet)' : 'rgba(139,111,184,0.08)',
                            color: newLog.type === t ? 'white' : 'var(--mid)',
                          }}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number" placeholder="Amount ($)"
                      value={newLog.amount ?? ''}
                      onChange={e => setNewLog(p => ({ ...p, amount: e.target.value }))}
                      className="w-full bg-transparent outline-none text-2xl font-display font-semibold"
                      style={{ color: 'var(--depth)' }}
                    />
                    <select
                      value={newLog.category ?? 'Other'}
                      onChange={e => setNewLog(p => ({ ...p, category: e.target.value }))}
                      className="w-full bg-transparent outline-none text-sm py-2 rounded-xl"
                      style={{ color: 'var(--mid)', border: '1px solid rgba(139,111,184,0.15)' }}>
                      {MONEY_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input
                      type="text" placeholder="Note (optional)"
                      value={newLog.note ?? ''}
                      onChange={e => setNewLog(p => ({ ...p, note: e.target.value }))}
                      className="w-full bg-transparent outline-none text-sm"
                      style={{ color: 'var(--depth)' }}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setAddingLog(false)} className="flex-1 py-3 rounded-xl font-semibold" style={{ background: 'rgba(139,111,184,0.08)', color: 'var(--mist)' }}>Cancel</button>
                      <button onClick={addLog} className="flex-1 py-3 rounded-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))' }}>Save</button>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <button onClick={() => setAddingLog(true)}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all"
                  style={{ background: 'rgba(201,169,110,0.08)', color: 'var(--golden)', border: '1.5px dashed rgba(201,169,110,0.2)' }}>
                  <Plus className="h-4 w-4" /> Log a transaction
                </button>
              )}
            </div>
          )}

          {/* Trading tab */}
          {tab === 'trading' && (
            <div className="space-y-4 animate-fade-up">
              {/* Rules */}
              <GlassCard>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#E05E5E' }}>Trading rules (check before entering)</p>
                {TRADING_RULES.map((r, i) => {
                  const checked = rulesChecked.has(i)
                  return (
                    <button key={i} onClick={() => setRulesChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })}
                      className="w-full flex items-center gap-3 py-2.5 text-left" style={{ borderBottom: i < 4 ? '1px solid rgba(139,111,184,0.06)' : 'none' }}>
                      <span className="text-base flex-shrink-0">{r.icon}</span>
                      <p className="text-sm flex-1" style={{ color: checked ? 'var(--mist)' : 'var(--depth)', textDecoration: checked ? 'line-through' : 'none' }}>{r.rule}</p>
                      <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background: checked ? 'var(--violet)' : 'transparent', border: checked ? 'none' : '1.5px solid rgba(139,111,184,0.2)' }}>
                        {checked && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  )
                })}
              </GlassCard>

              {/* Trade journal */}
              <GlassCard>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--golden)' }}>Log a trade</p>
                <div className="space-y-3">
                  <input
                    placeholder="Asset (BTC, ETH, AAPL...)"
                    value={trade.asset}
                    onChange={e => setTrade(p => ({ ...p, asset: e.target.value }))}
                    className="w-full bg-transparent outline-none text-sm py-2 rounded-xl px-3"
                    style={{ border: '1px solid rgba(139,111,184,0.15)', color: 'var(--depth)' }}
                  />
                  <textarea
                    placeholder="Setup — why are you taking this trade? Write it before entering."
                    value={trade.setup}
                    onChange={e => setTrade(p => ({ ...p, setup: e.target.value }))}
                    rows={3}
                    className="w-full bg-transparent outline-none text-sm resize-none py-2 px-3 rounded-xl"
                    style={{ border: '1px solid rgba(139,111,184,0.15)', color: 'var(--depth)' }}
                  />
                  <input
                    placeholder="Emotion before entering"
                    value={trade.emotion_before}
                    onChange={e => setTrade(p => ({ ...p, emotion_before: e.target.value }))}
                    className="w-full bg-transparent outline-none text-sm py-2 rounded-xl px-3"
                    style={{ border: '1px solid rgba(139,111,184,0.15)', color: 'var(--depth)' }}
                  />
                  <div className="flex gap-2">
                    {(['win','loss','breakeven','open'] as const).map(r => (
                      <button key={r} onClick={() => setTrade(p => ({ ...p, result: r }))}
                        className="flex-1 py-2 rounded-xl text-xs font-medium capitalize"
                        style={{
                          background: trade.result === r ? (r === 'win' ? '#5A8A5A' : r === 'loss' ? '#E05E5E' : 'var(--violet)') : 'rgba(139,111,184,0.08)',
                          color: trade.result === r ? 'white' : 'var(--mid)',
                        }}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Lesson from this trade..."
                    value={trade.lesson}
                    onChange={e => setTrade(p => ({ ...p, lesson: e.target.value }))}
                    rows={2}
                    className="w-full bg-transparent outline-none text-sm resize-none py-2 px-3 rounded-xl"
                    style={{ border: '1px solid rgba(139,111,184,0.15)', color: 'var(--depth)' }}
                  />
                  <button className="w-full py-3.5 rounded-2xl font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))' }}>
                    Save trade
                  </button>
                </div>
              </GlassCard>

              <p className="text-xs text-center italic" style={{ color: 'var(--mist)' }}>
                &ldquo;Wealth is built through calm choices, not panic moves.&rdquo;
              </p>
            </div>
          )}

          {/* Goals tab */}
          {tab === 'goals' && (
            <div className="space-y-4 animate-fade-up">
              <GlassCard soul>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--violet)' }}>Saturn in Taurus reminder</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--mid)' }}>
                  Zoe is learning money discipline, self-worth, saving, and slow wealth. Not fast. Not frantic. Steady. Your Saturn placement teaches that consistent, grounded action builds the wealth that lasts.
                </p>
              </GlassCard>
              {[
                { label: 'Emergency fund', target: '$5,000', desc: 'Build the foundation first' },
                { label: 'Monthly savings goal', target: '10% of income', desc: 'Automatic, no exceptions' },
                { label: 'Trading capital protected', target: 'Risk < 2% per trade', desc: 'Discipline over profit' },
                { label: 'Subscription audit', target: 'Monthly', desc: 'What is actually useful?' },
              ].map((g, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--depth)' }}>{g.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--mist)' }}>{g.desc}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--golden)' }}>
                      {g.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </AppLayout>
    </div>
  )
}
