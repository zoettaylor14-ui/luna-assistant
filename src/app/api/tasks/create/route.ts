import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const { data, error } = await adminDb()
      .from('tasks')
      .insert({ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ task: data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
