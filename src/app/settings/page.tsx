'use client'
import { useEffect, useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { LoadingPage } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'
import { AssistantProfile } from '@/types'
import { Sparkles, Save, CheckCircle, User, Settings, Brain } from 'lucide-react'

const DEFAULT_PROFILE: Omit<AssistantProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  preferred_tone: 'Clear, warm, human, and confident. Not too formal. Gets to the point.',
  business_context: 'Zoe runs Ad-Vantage Media Agency and DRYP Digital. Active clients: EHM Strategies, DRYP Studio, Babe Coffee Lounge, Flanagan\'s Irish Pub, Villa Residential, Hoover Digital, Linked Up events.',
  personal_context: 'Zoe is in school at USF. She has personal appointments, social media goals, content creation goals, and business growth goals.',
  banned_phrases: ['As per my last email', 'I hope this email finds you well', 'Please don\'t hesitate', 'Best regards', 'Synergy', 'Leverage'],
  response_style: 'Direct and clear. Warm but not overly casual. No corporate filler. No over-explaining.',
  main_projects: ['EHM Strategies', 'DRYP Studio', 'DRYP Digital', 'Ad-Vantage', 'Hoover Digital', 'Babe Coffee Lounge', "Flanagan's Irish Pub", 'Villa Residential', 'Linked Up', 'USF'],
  common_contacts: 'Mick (Flanagan\'s), clients from EHM, DRYP team, USF professors',
  daily_routine: 'Morning: email + priority tasks. Afternoon: client work and calls. Evening: creative and admin.',
  personal_goals: 'Grow Ad-Vantage, expand DRYP Studio, graduate from USF, grow personal social media, stay healthy.',
}

export default function SettingsPage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [bannedPhrasesInput, setBannedPhrasesInput] = useState('')
  const [mainProjectsInput, setMainProjectsInput] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const supabase = createClient()

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserEmail(user.email || '')

    const { data } = await supabase
      .from('assistant_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setProfileId(data.id)
      setBannedPhrasesInput((data.banned_phrases || []).join(', '))
      setMainProjectsInput((data.main_projects || []).join(', '))
    } else {
      setBannedPhrasesInput(DEFAULT_PROFILE.banned_phrases.join(', '))
      setMainProjectsInput(DEFAULT_PROFILE.main_projects.join(', '))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadProfile() }, [loadProfile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const profileData = {
      ...profile,
      banned_phrases: bannedPhrasesInput.split(',').map(s => s.trim()).filter(Boolean),
      main_projects: mainProjectsInput.split(',').map(s => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    }

    if (profileId) {
      await supabase.from('assistant_profile').update(profileData).eq('id', profileId)
    } else {
      const { data } = await supabase.from('assistant_profile').insert({ ...profileData, user_id: user.id }).select().single()
      if (data) setProfileId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <AppLayout><LoadingPage /></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Customize how your assistant knows you</p>
        </div>

        {/* Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <CardTitle>Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-violet-600 font-bold text-sm">{userEmail?.[0]?.toUpperCase() || 'Z'}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Zoe Taylor</p>
                <p className="text-xs text-slate-400">{userEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSave} className="space-y-5">
          {/* AI Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-500" />
                <CardTitle>AI Profile</CardTitle>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">The AI reads this to write replies and rank tasks in your voice</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Your preferred tone"
                value={profile.preferred_tone}
                onChange={e => setProfile(p => ({ ...p, preferred_tone: e.target.value }))}
                rows={2}
                placeholder="Clear, warm, confident, not too formal..."
              />
              <Textarea
                label="Business context"
                value={profile.business_context}
                onChange={e => setProfile(p => ({ ...p, business_context: e.target.value }))}
                rows={3}
                placeholder="Describe your business, what you do, your main clients..."
              />
              <Textarea
                label="Personal context"
                value={profile.personal_context}
                onChange={e => setProfile(p => ({ ...p, personal_context: e.target.value }))}
                rows={2}
                placeholder="School, appointments, personal goals..."
              />
              <Textarea
                label="Response style"
                value={profile.response_style}
                onChange={e => setProfile(p => ({ ...p, response_style: e.target.value }))}
                rows={2}
                placeholder="Direct. No corporate filler. Gets to the point..."
              />
            </CardContent>
          </Card>

          {/* Banned phrases */}
          <Card>
            <CardHeader>
              <CardTitle>Banned phrases</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">The AI will never use these in your replies (comma-separated)</p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={bannedPhrasesInput}
                onChange={e => setBannedPhrasesInput(e.target.value)}
                rows={2}
                placeholder="As per my last email, I hope this finds you well, Please don't hesitate..."
              />
            </CardContent>
          </Card>

          {/* Projects & contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" />
                <CardTitle>Projects & contacts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Main projects (comma-separated)"
                value={mainProjectsInput}
                onChange={e => setMainProjectsInput(e.target.value)}
                rows={2}
                placeholder="EHM Strategies, DRYP Studio, Ad-Vantage..."
              />
              <Textarea
                label="Common contacts"
                value={profile.common_contacts}
                onChange={e => setProfile(p => ({ ...p, common_contacts: e.target.value }))}
                rows={2}
                placeholder="Names the AI should recognize in emails and messages..."
              />
            </CardContent>
          </Card>

          {/* Goals & routine */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <CardTitle>Goals & daily routine</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Personal goals"
                value={profile.personal_goals}
                onChange={e => setProfile(p => ({ ...p, personal_goals: e.target.value }))}
                rows={2}
                placeholder="What are you working toward? Business growth, health, school..."
              />
              <Textarea
                label="Daily routine preferences"
                value={profile.daily_routine}
                onChange={e => setProfile(p => ({ ...p, daily_routine: e.target.value }))}
                rows={2}
                placeholder="When do you work best? Morning emails, afternoon calls..."
              />
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving} size="lg" className="gap-2">
              {saved ? (
                <><CheckCircle className="h-4 w-4" /> Saved!</>
              ) : (
                <><Save className="h-4 w-4" /> Save settings</>
              )}
            </Button>
            {saved && <p className="text-sm text-green-600">Your profile has been saved. AI will use these settings.</p>}
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
