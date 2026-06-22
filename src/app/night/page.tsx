'use client'
import { useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Moon, Clock, Home, Sparkles } from 'lucide-react'

const LOCATIONS = [
  { value: 'home',         label: '🏠 Home',         drive: 0  },
  { value: 'office',       label: '🏢 Office',       drive: 20 },
  { value: 'kalebs',       label: '💜 Kaleb\'s',     drive: 15 },
  { value: 'friends',      label: '👯 Friends\'',    drive: 25 },
  { value: 'out',          label: '✨ Out',           drive: 30 },
  { value: 'working_late', label: '💼 Working late', drive: 20 },
]

const RITUAL_ITEMS = [
  { emoji: '🕯', label: 'Dim lights and soften the room', mins: 5  },
  { emoji: '📵', label: 'Close work apps and tabs',        mins: 5  },
  { emoji: '📓', label: 'Journal what you\'re releasing',  mins: 10 },
  { emoji: '🧖', label: 'Skincare — love your face',       mins: 10 },
  { emoji: '💧', label: 'One last glass of water',         mins: 3  },
  { emoji: '🙏', label: 'Close the loops in your mind',    mins: 7  },
]

function timeToMinutes(t: string): number {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60)
  const m = ((mins % 1440) + 1440) % 1440 % 60
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function minutesToInput(mins: number): string {
  const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60)
  const m = ((mins % 1440) + 1440) % 1440 % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

interface Plan {
  stopWorkTime: string
  leaveTime: string | null
  homeTime: string | null
  bedTime: string
  bedMinRaw: number
  lightsOutTime: string
  message: string
}

type Tab = 'sleep' | 'tomorrow' | 'ritual'

const TABS: { value: Tab; label: string; emoji: string }[] = [
  { value: 'sleep',    label: 'Sleep',    emoji: '🌙' },
  { value: 'tomorrow', label: 'Tomorrow', emoji: '☀️' },
  { value: 'ritual',   label: 'Ritual',   emoji: '🕯' },
]

export default function NightScreen() {
  const [tab, setTab]                     = useState<Tab>('sleep')
  const [wakeGoal, setWakeGoal]           = useState('08:00')
  const [sleepHours, setSleepHours]       = useState(8)
  const [location, setLocation]           = useState('home')
  const [prepMinutes, setPrepMinutes]     = useState(45)
  const [firstMeeting, setFirstMeeting]   = useState('')
  const [plan, setPlan]                   = useState<Plan | null>(null)
  const [checked, setChecked]             = useState<Set<number>>(new Set())
  const [manualRitual, setManualRitual]   = useState(() => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
  })

  const calculate = useCallback(() => {
    const wakeMin     = timeToMinutes(wakeGoal) + 24 * 60
    const lightsOut   = wakeMin - sleepHours * 60
    const bedMin      = lightsOut - prepMinutes
    const loc         = LOCATIONS.find(l => l.value === location)
    const driveMin    = loc?.drive ?? 0
    const leaveMin    = driveMin > 0 ? lightsOut - driveMin - 15 : null
    const homeMin     = leaveMin !== null ? leaveMin + driveMin : null
    const stopWorkMin = (leaveMin ?? lightsOut) - 15

    let message = `Your lights-out is ${minutesToTime(lightsOut)}.`
    if (leaveMin !== null) {
      message = `Leave by ${minutesToTime(leaveMin)} to be home before ${minutesToTime(homeMin!)}. Lights out by ${minutesToTime(lightsOut)}.`
    }
    if (driveMin === 0) {
      message = `Stop work by ${minutesToTime(stopWorkMin)} and begin your wind-down. Lights out by ${minutesToTime(lightsOut)}.`
    }

    setPlan({
      stopWorkTime:  minutesToTime(stopWorkMin),
      leaveTime:     leaveMin !== null ? minutesToTime(leaveMin) : null,
      homeTime:      homeMin !== null  ? minutesToTime(homeMin)  : null,
      bedTime:       minutesToTime(bedMin),
      bedMinRaw:     bedMin,
      lightsOutTime: minutesToTime(lightsOut),
      message,
    })
    setManualRitual(minutesToInput(bedMin))
    setTab('tomorrow')
  }, [wakeGoal, sleepHours, location, prepMinutes])

  function toggleCheck(i: number) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const card = {
    background: 'rgba(255,255,255,0.13)',
    border: '1px solid rgba(255,255,255,0.20)',
    borderRadius: 20,
  }

  const selectedLocStyle = (val: string) => ({
    background: location === val ? 'rgba(139,111,184,0.35)' : 'rgba(255,255,255,0.07)',
    border: `1.5px solid ${location === val ? 'rgba(139,111,184,0.6)' : 'rgba(255,255,255,0.10)'}`,
    color: '#FFFFFF',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left' as const,
  })

  return (
    <div className="bg-night min-h-screen">
      <AppLayout noPad className="pt-16">
        <div className="px-6 pb-nav">

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(139,111,184,0.25)' }}>
              <Moon className="h-5 w-5" style={{ color: '#D4BBFF' }} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#D4BBFF' }}>Night Mode</p>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
            Protect tomorrow.
          </h1>
          <p className="text-base mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Your morning starts tonight.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: tab === t.value ? 'rgba(139,111,184,0.5)' : 'rgba(255,255,255,0.08)',
                  border: `1.5px solid ${tab === t.value ? 'rgba(139,111,184,0.7)' : 'rgba(255,255,255,0.10)'}`,
                  color: '#FFFFFF',
                }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* ── Sleep tab ── */}
          {tab === 'sleep' && (
            <div className="space-y-4 animate-fade-up">

              <div style={card} className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" style={{ color: '#D4BBFF' }} />
                  <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>What time do you want to wake up?</p>
                </div>
                <input type="time" value={wakeGoal} onChange={e => setWakeGoal(e.target.value)}
                  className="text-3xl font-display font-bold bg-transparent outline-none w-full"
                  style={{ color: '#D4BBFF', colorScheme: 'dark' }} />
              </div>

              <div style={card} className="p-5">
                <p className="text-sm font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                  Sleep goal: <span style={{ color: '#D4BBFF' }}>{sleepHours} hours</span>
                </p>
                <input type="range" min={5} max={10} step={0.5} value={sleepHours}
                  onChange={e => setSleepHours(Number(e.target.value))} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>5h</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>10h</span>
                </div>
              </div>

              <div style={card} className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="h-4 w-4" style={{ color: '#D4BBFF' }} />
                  <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Where are you right now?</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LOCATIONS.map(l => (
                    <button key={l.value} onClick={() => setLocation(l.value)} style={selectedLocStyle(l.value)}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={card} className="p-5">
                <p className="text-sm font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                  Bedtime prep time: <span style={{ color: '#D4BBFF' }}>{prepMinutes} min</span>
                </p>
                <input type="range" min={15} max={90} step={5} value={prepMinutes}
                  onChange={e => setPrepMinutes(Number(e.target.value))} />
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>skincare · journal · wind-down</p>
              </div>

              <div style={card} className="p-5">
                <p className="text-sm font-semibold mb-3" style={{ color: '#FFFFFF' }}>First meeting tomorrow? <span style={{ color: 'rgba(255,255,255,0.5)' }}>(optional)</span></p>
                <input type="time" value={firstMeeting} onChange={e => setFirstMeeting(e.target.value)}
                  className="bg-transparent outline-none text-2xl font-display font-bold w-full"
                  style={{ color: '#D4BBFF', colorScheme: 'dark' }} />
              </div>

              <button onClick={calculate}
                className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #8B6FB8 0%, #5A3A90 100%)', fontSize: '1rem' }}>
                <Sparkles className="inline h-4 w-4 mr-2" />
                Calculate my night
              </button>
            </div>
          )}

          {/* ── Tomorrow tab ── */}
          {tab === 'tomorrow' && (
            <div className="space-y-4 animate-fade-up">
              {!plan ? (
                <div className="text-center py-12">
                  <span className="text-5xl block mb-4">🌙</span>
                  <p className="text-base font-semibold mb-2" style={{ color: '#FFFFFF' }}>Fill in Sleep first</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Go to the Sleep tab and calculate your night.</p>
                  <button onClick={() => setTab('sleep')} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(139,111,184,0.3)', color: '#FFFFFF', border: '1px solid rgba(139,111,184,0.4)' }}>
                    Set up sleep
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ ...card, padding: 20, textAlign: 'center' }}>
                    <p className="text-base font-medium leading-relaxed" style={{ color: '#FFFFFF' }}>{plan.message}</p>
                    <p className="mt-3 font-display italic" style={{ color: 'rgba(212,187,255,0.8)' }}>
                      &ldquo;Tomorrow-you is asking for rest.&rdquo;
                    </p>
                  </div>

                  {[
                    { label: '🛑 Stop work',  value: plan.stopWorkTime,  show: true },
                    { label: '🚗 Leave by',   value: plan.leaveTime,     show: !!plan.leaveTime },
                    { label: '🏠 Home by',    value: plan.homeTime,      show: !!plan.homeTime },
                    { label: '🌙 Begin prep', value: plan.bedTime,       show: true },
                    { label: '✨ Lights out', value: plan.lightsOutTime, show: true },
                  ].filter(r => r.show).map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl"
                      style={card}>
                      <span className="text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>{row.label}</span>
                      <span className="font-display text-2xl font-bold" style={{ color: '#D4BBFF' }}>{row.value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── Ritual tab ── */}
          {tab === 'ritual' && (
            <div className="space-y-3 animate-fade-up">

              {/* Start time picker */}
              <div style={card} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Ritual starts at
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {plan ? 'Auto-set from Sleep plan' : 'Set your start time'}
                  </p>
                </div>
                <input
                  type="time"
                  value={manualRitual}
                  onChange={e => setManualRitual(e.target.value)}
                  className="bg-transparent outline-none font-display text-2xl font-bold text-right"
                  style={{ color: '#D4BBFF', colorScheme: 'dark', width: 110 }}
                />
              </div>

              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Night Ritual Checklist
              </p>

              {/* Timed checklist */}
              {(() => {
                const startMin = timeToMinutes(manualRitual)
                let cursor = startMin
                return RITUAL_ITEMS.map((item, i) => {
                  const itemTime = minutesToTime(cursor)
                  cursor += item.mins
                  const done = checked.has(i)
                  return (
                    <button key={i} onClick={() => toggleCheck(i)}
                      className="w-full text-left rounded-2xl transition-all flex items-center gap-4 overflow-hidden"
                      style={{
                        background: done ? 'rgba(139,111,184,0.22)' : 'rgba(255,255,255,0.08)',
                        border: `1.5px solid ${done ? 'rgba(139,111,184,0.45)' : 'rgba(255,255,255,0.10)'}`,
                        opacity: done ? 0.72 : 1,
                        transition: 'all 0.2s ease',
                      }}>

                      {/* Time stripe */}
                      <div className="flex flex-col items-center justify-center flex-shrink-0 self-stretch px-3 py-4"
                        style={{
                          background: done ? 'rgba(139,111,184,0.3)' : 'rgba(255,255,255,0.06)',
                          borderRight: '1px solid rgba(255,255,255,0.08)',
                          minWidth: 72,
                        }}>
                        <span className="font-display text-sm font-bold tabular-nums"
                          style={{ color: done ? '#D4BBFF' : 'rgba(255,255,255,0.6)' }}>
                          {itemTime}
                        </span>
                        <span className="text-xs mt-0.5"
                          style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
                          {item.mins} min
                        </span>
                      </div>

                      {/* Checkbox + label */}
                      <div className="flex items-center gap-3 flex-1 py-4 pr-4">
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{
                            background: done ? '#8B6FB8' : 'rgba(255,255,255,0.1)',
                            border: `1.5px solid ${done ? '#8B6FB8' : 'rgba(255,255,255,0.2)'}`,
                          }}>
                          {done && <span className="text-white font-bold" style={{ fontSize: 10 }}>✓</span>}
                        </div>
                        <div>
                          <span className="text-base leading-snug" style={{
                            color: '#FFFFFF',
                            textDecoration: done ? 'line-through' : 'none',
                            display: 'block',
                          }}>
                            {item.emoji} {item.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })
              })()}

              {/* Lights-out indicator */}
              {plan && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(139,111,184,0.12)', border: '1px solid rgba(139,111,184,0.25)' }}>
                  <span className="text-lg">✨</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#D4BBFF' }}>
                      Lights out: {plan.lightsOutTime}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Wake: {wakeGoal ? (() => { const m=timeToMinutes(wakeGoal); return minutesToTime(m) })() : '—'} · {sleepHours}h sleep
                    </p>
                  </div>
                </div>
              )}

              {checked.size === RITUAL_ITEMS.length && (
                <div className="text-center py-6">
                  <span className="text-4xl block mb-2">🌙</span>
                  <p className="font-display text-lg italic" style={{ color: '#D4BBFF' }}>
                    You are ready for rest. Sleep well.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </AppLayout>
    </div>
  )
}
