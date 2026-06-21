'use client'
import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { Calendar, Clock, MapPin, Video, Users, ChevronLeft, ChevronRight, Plus, Zap } from 'lucide-react'
import Link from 'next/link'

interface CalEvent {
  id: string
  title: string
  time: string
  end_time?: string
  duration: string
  location?: string
  type: 'meeting' | 'focus' | 'personal' | 'reminder'
  client?: string
  join_url?: string
  prep_notes?: string
  attendees?: string[]
}

const SAMPLE_EVENTS: Record<string, CalEvent[]> = {
  today: [
    { id: '1', title: 'DRYP Weekly Strategy Sync', time: '11:00 AM', end_time: '11:45 AM', duration: '45 min', location: 'Google Meet', type: 'meeting', client: 'DRYP Digital', join_url: 'https://meet.google.com', attendees: ['Zoe', 'Kaleb'], prep_notes: 'Review Q2 metrics, discuss ad performance, next campaign brief' },
    { id: '2', title: 'Deep Focus Block', time: '1:00 PM', end_time: '3:00 PM', duration: '2 hrs', type: 'focus', prep_notes: 'Website copy for EHM, client deliverable priority' },
    { id: '3', title: 'EHM Client Call', time: '3:30 PM', end_time: '4:00 PM', duration: '30 min', location: 'Zoom', type: 'meeting', client: 'EHM Strategies', join_url: 'https://zoom.us', attendees: ['Zoe', 'EHM Team'] },
    { id: '4', title: 'Evening wind-down', time: '9:00 PM', duration: 'Reminder', type: 'reminder' },
  ],
}

const EVENT_COLORS: Record<string, string> = {
  meeting:  '#8B6FB8',
  focus:    '#5A9E5A',
  personal: '#C9A96E',
  reminder: '#A8C4DA',
}

const EVENT_BG: Record<string, string> = {
  meeting:  'rgba(139,111,184,0.12)',
  focus:    'rgba(90,158,90,0.12)',
  personal: 'rgba(201,169,110,0.12)',
  reminder: 'rgba(168,196,218,0.12)',
}

export default function CalendarPage() {
  const [selected, setSelected] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const weekStart = startOfWeek(selected, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()
  const events = SAMPLE_EVENTS.today

  const nextEvent = events.find(e => e.type === 'meeting')

  return (
    <AppLayout>
      <div className="pt-4 lg:pt-6 pb-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--depth)' }}>Calendar</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--mist)' }}>{format(today, 'EEEE, MMMM d')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/today">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                Today's Plan
              </button>
            </Link>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--violet)', color: 'white' }}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Next event banner */}
        {nextEvent && (
          <div className="rounded-2xl p-4 mb-4 flex items-center gap-4"
            style={{ background: 'rgba(139,111,184,0.08)', border: '1px solid rgba(139,111,184,0.2)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,111,184,0.15)' }}>
              <Calendar className="h-6 w-6" style={{ color: 'var(--violet)' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--mist)' }}>Next meeting</p>
              <p className="text-base font-bold" style={{ color: 'var(--depth)' }}>{nextEvent.title}</p>
              <p className="text-sm" style={{ color: 'var(--mid)' }}>{nextEvent.time} · {nextEvent.duration}</p>
            </div>
            <div className="flex gap-2">
              {nextEvent.join_url && (
                <a href={nextEvent.join_url} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--violet)', color: 'white' }}>
                    <Video className="h-3.5 w-3.5" /> Join
                  </button>
                </a>
              )}
              <button onClick={() => setSelectedEvent(nextEvent)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                <Zap className="h-3.5 w-3.5" /> Prep
              </button>
            </div>
          </div>
        )}

        {/* Week strip */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button onClick={() => setSelected(addDays(selected, -7))}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,111,184,0.06)', color: 'var(--mist)' }}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          {weekDays.map(day => {
            const isToday = isSameDay(day, today)
            const isSel = isSameDay(day, selected)
            return (
              <button key={day.toISOString()} onClick={() => setSelected(day)}
                className="flex-1 min-w-[44px] flex flex-col items-center gap-1 py-2 rounded-2xl transition-all"
                style={{
                  background: isSel ? 'var(--violet)' : isToday ? 'rgba(139,111,184,0.08)' : 'transparent',
                  border: isToday && !isSel ? '1.5px solid rgba(139,111,184,0.3)' : '1.5px solid transparent',
                }}>
                <span className="text-xs font-semibold uppercase" style={{ color: isSel ? 'rgba(255,255,255,0.7)' : 'var(--mist)' }}>
                  {format(day, 'EEE')}
                </span>
                <span className="text-sm font-bold" style={{ color: isSel ? 'white' : isToday ? 'var(--violet)' : 'var(--depth)' }}>
                  {format(day, 'd')}
                </span>
              </button>
            )
          })}
          <button onClick={() => setSelected(addDays(selected, 7))}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139,111,184,0.06)', color: 'var(--mist)' }}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Events list + detail panel */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">

          {/* Timeline */}
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--mist)' }}>
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nothing scheduled. A free day.</p>
              </div>
            ) : events.map(event => (
              <button key={event.id} onClick={() => setSelectedEvent(event === selectedEvent ? null : event)}
                className="w-full text-left rounded-2xl p-4 transition-all"
                style={{
                  background: selectedEvent?.id === event.id ? EVENT_BG[event.type] : 'rgba(255,255,255,0.8)',
                  border: `1.5px solid ${selectedEvent?.id === event.id ? EVENT_COLORS[event.type] + '40' : 'rgba(139,111,184,0.08)'}`,
                  boxShadow: '0 2px 16px rgba(139,111,184,0.05)',
                }}>
                <div className="flex items-start gap-3">
                  <div className="w-1 h-12 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: EVENT_COLORS[event.type] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--depth)' }}>{event.title}</p>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--mist)' }}>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {event.client && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                          {event.client}
                        </span>
                      )}
                      {event.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" style={{ color: 'var(--mist)' }} />
                          <span className="text-xs" style={{ color: 'var(--mist)' }}>{event.duration}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          {event.join_url ? <Video className="h-3 w-3" style={{ color: 'var(--mist)' }} /> : <MapPin className="h-3 w-3" style={{ color: 'var(--mist)' }} />}
                          <span className="text-xs" style={{ color: 'var(--mist)' }}>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Connect Google Calendar */}
            <div className="rounded-2xl p-5 text-center mt-4"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px dashed rgba(139,111,184,0.2)' }}>
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" style={{ color: 'var(--violet)' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--depth)' }}>Connect Google Calendar</p>
              <p className="text-xs mb-3" style={{ color: 'var(--mist)' }}>See real events, meeting prep, and smart scheduling</p>
              <Link href="/settings">
                <button className="px-5 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--violet)', color: 'white' }}>
                  Connect Calendar
                </button>
              </Link>
            </div>
          </div>

          {/* Detail / prep panel */}
          {selectedEvent ? (
            <div className="mt-4 lg:mt-0 rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(139,111,184,0.12)', boxShadow: '0 4px 24px rgba(139,111,184,0.08)' }}>
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: EVENT_BG[selectedEvent.type] }}>
                  <Calendar className="h-5 w-5" style={{ color: EVENT_COLORS[selectedEvent.type] }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--mist)' }}>{selectedEvent.type}</p>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--depth)' }}>{selectedEvent.title}</h2>
                  <p className="text-sm" style={{ color: 'var(--mid)' }}>{selectedEvent.time}{selectedEvent.end_time ? ` – ${selectedEvent.end_time}` : ''} · {selectedEvent.duration}</p>
                </div>
              </div>

              {selectedEvent.attendees && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--mist)' }}>Attendees</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedEvent.attendees.map(a => (
                      <div key={a} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                        style={{ background: 'rgba(139,111,184,0.08)', border: '1px solid rgba(139,111,184,0.12)' }}>
                        <Users className="h-3 w-3" style={{ color: 'var(--violet)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--mid)' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.prep_notes && (
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--mist)' }}>Prep notes</p>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(139,111,184,0.06)', border: '1px solid rgba(139,111,184,0.1)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--mid)' }}>{selectedEvent.prep_notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {selectedEvent.join_url && (
                  <a href={selectedEvent.join_url} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--violet)', color: 'white' }}>
                      <Video className="h-4 w-4" /> Join Meeting
                    </button>
                  </a>
                )}
                <Link href="/dictation">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(139,111,184,0.1)', color: 'var(--violet)' }}>
                    <Zap className="h-4 w-4" /> Dictate prep
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex mt-0 rounded-2xl p-8 items-center justify-center flex-col gap-3"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px dashed rgba(139,111,184,0.15)', minHeight: 300 }}>
              <Calendar className="h-10 w-10 opacity-20" style={{ color: 'var(--violet)' }} />
              <p className="text-sm" style={{ color: 'var(--mist)' }}>Select an event to see details and prep notes</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
