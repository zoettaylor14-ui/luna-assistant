import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET() {
  try {
    const { data } = await adminDb().from('gmail_tokens').select('email, connected_at').order('connected_at', { ascending: true })
    const accounts = (data ?? []).map((r: { email: string }) => ({ email: r.email, connected: true }))
    return NextResponse.json({ connected: accounts.length > 0, email: accounts[0]?.email ?? null, accounts })
  } catch {
    return NextResponse.json({ connected: false, email: null, accounts: [] })
  }
}
