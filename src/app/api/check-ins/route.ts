import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, wakeTime, sleepRating, energyRating, moodRating, hadDream, dreamText,
          feeling, onMind, supportNeed, prideGoal, aiResponse } = body

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      type: type || 'morning',
      wake_time: wakeTime,
      sleep_rating: sleepRating,
      energy_rating: energyRating,
      mood_rating: moodRating,
      had_dream: hadDream,
      dream_text: dreamText,
      feeling,
      on_mind: onMind,
      support_need: supportNeed,
      pride_goal: prideGoal,
      ai_response: aiResponse,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ checkIn: data })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30')

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ checkIns: data || [] })
}
