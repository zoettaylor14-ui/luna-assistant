'use client'
import { useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Moon, Clock, Home, Sparkles } from 'lucide-react'

const LOCATIONS = [
  { value: 'home',         label: '🏠 Home',        drive: 0  },
  { value: 'office',       label: '🏢 Office',      drive: 20 },
  { value: 'kalebs',       label: '💜 Kaleb\'s',    drive: 15 },
  { value: 'friends',      label: '👯 Friends\'',   drive: 25 },
  { value: 'out',          label: '✨ Out',          drive: 30 },
  { value: 'working_late', label: '💼 Working late', drive: 20 },
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

interface Plan {
  stopWorkTime: string
  leaveTime: string | null
  homeTime: string | null
  bedTime: string
  lightsOutTime: string
  message: string
}

export default function NightScreen() {
  const [wakeGoal, setWakeGoal]         = useState('08:00')
  const [sleepHours, setSleepHours]     = useState(8)
  const [location, setLocation]         = useState('home')
  const [prepMinutes, setPrepMinutes]   = useState(45)
  const [firstMeeting, setFirstMeeting] = useState('')
  const [plan, setPlan]                 = useState<Plan | null>(null)

  const calculate = useCallback(() => {
    const wakeMin      = timeToMinutes(wakeGoal) + 24 * 60 // next day
    const lightsOut    = wakeMin - sleepHours * 60
    const bedMin       = lightsOut - prepMinutes
    const loc          = LOCATIONS.find(l => l.value === location)
    const driveMin     = loc?.drive ?? 0
    const leaveMin     = driveMin > 0 ? lightsOut - driveMin - 15 : null
    const homeMin      = leaveMin !== null ? leaveMin + driveMin : null
    const stopWorkMin  = (leaveMin ?? lightsOut) - 15

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
      lightsOutTime: minutesToTime(lightsOut),
      message,
    })
  }, [wakeGoal, sleepHours, location, prepMinutes])

  const selectedLoc = LOCATIONS.find(l => l.value === location)

  return (
    <div className="bg-night min-h-screen">
      <AppLayout noPad>
        <div className="px-5 pt-14 pb-nav">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,111,184,0.2)' }}>
              <Moon className="h-5 w-5 text-purple-200" />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider text-purple-200">Night Mode</p>
          </div>

          <h1 className="font-display text-3xl font-semibold mb-2 text-white">
            Protect tomorrow.
          </h1>
          <p className="text-base mb-8 text-purple-200">
            Your morning starts tonight.
          </p>

          {/* Inputs */}
          <div className="space-y-4 mb-6">

            {/* Wake goal */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" style={{ color: 'var(--violet)' }} />
                <p className="text-sm font-semibold text-white">What time do you want to wake up?</p>
              </div>
              <input type="time" value={wakeGoal} onChange={e => setWakeGoal(e.target.value)}
                className="text-2xl font-display font-semibold bg-transparent outline-none" style={{ color: 'var(--violet-mid)' }} />
            </div>

            {/* Sleep hours */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold text-white mb-3">Sleep goal: <span style={{ color: 'var(--violet-mid)' }}>{sleepHours} hours</span></p>
              <input type="range" min={5} max={10} step={0.5} value={sleepHours}
                onChange={e => setSleepHours(Number(e.target.value))} />
            </div>

            {/* Location */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Home className="h-4 w-4" style={{ color: 'var(--violet)' }} />
                <p className="text-sm font-semibold text-white">Where are you right now?</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map(l => (
                  <button key={l.value} onClick={() => setLocation(l.value)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                    style={{
                      background: location === l.value ? 'rgba(139,111,184,0.3)' : 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${location === l.value ? 'rgba(139,111,184,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: location === l.value ? '#C4B5E0' : '#9E8CB0',
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prep time */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold text-white mb-3">
                Bedtime prep time: <span style={{ color: 'var(--violet-mid)' }}>{prepMinutes} min</span>
              </p>
              <input type="range" min={15} max={90} step={5} value={prepMinutes}
                onChange={e => setPrepMinutes(Number(e.target.value))} />
              <p className="text-xs mt-2" style={{ color: '#6B6080' }}>skincare, journal, wind-down ritual</p>
            </div>

            {/* First meeting */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold text-white mb-3">First meeting tomorrow? (optional)</p>
              <input type="time" value={firstMeeting} onChange={e => setFirstMeeting(e.target.value)}
                className="bg-transparent outline-none text-xl font-display" style={{ color: 'var(--violet-mid)' }} />
            </div>
          </div>

          {/* Calculate */}
          <button onClick={calculate}
            className="w-full py-4 rounded-2xl font-semibold text-white mb-6 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--violet) 0%, #4A3080 100%)' }}>
            <Sparkles className="inline h-4 w-4 mr-2" />
            Calculate my night
          </button>

          {/* Result */}
          {plan && (
            <div className="space-y-3 animate-fade-up">
              <p className="text-white text-base font-medium text-center mb-4 leading-relaxed">
                {plan.message}
              </p>

              {[
                { label: '🛑 Stop work',  value: plan.stopWorkTime,  show: true },
                { label: '🚗 Leave by',   value: plan.leaveTime,     show: !!plan.leaveTime },
                { label: '🏠 Home by',    value: plan.homeTime,      show: !!plan.homeTime },
                { label: '🌙 Begin prep', value: plan.bedTime,       show: true },
                { label: '✨ Lights out', value: plan.lightsOutTime, show: true },
              ].filter(r => r.show).map((row, i) => (
                <div key={i} className="flex items-center justify-between glass-card p-4">
                  <span className="text-sm text-purple-200">{row.label}</span>
                  <span className="font-display text-xl font-semibold text-white">{row.value}</span>
                </div>
              ))}

              <div className="text-center pt-4">
                <p className="font-display italic text-purple-200 text-base">
                  &ldquo;Tomorrow-you is asking for rest.&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Wind-down reminders */}
          <div className="mt-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B6080' }}>Tonight&apos;s wind-down</p>
            {[
              '🕯 Dim lights and soften the room',
              '📵 Close work apps and tabs',
              '📓 Journal what you&apos;re releasing',
              '🧖 Skincare — love your face',
              '💧 One last glass of water',
              '🙏 Close the loops in your mind',
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: '#9E8CB0' }}>
                {item}
              </div>
            ))}
          </div>

        </div>
      </AppLayout>
    </div>
  )
}
