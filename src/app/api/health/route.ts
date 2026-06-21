import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Safe health check — never exposes secret keys in response
export async function GET() {
  const checks: Record<string, boolean | string> = {
    supabase_url_set:      !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url',
    supabase_anon_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key',
    service_role_key_set:  !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key',
    anthropic_key_set:     !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key',
  }

  // Only attempt live Supabase ping if credentials look real
  if (checks.supabase_url_set && checks.supabase_anon_key_set) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('users').select('id').limit(1)
      checks.supabase_connected = !error
      if (error) checks.supabase_error = error.message
    } catch (e) {
      checks.supabase_connected = false
      checks.supabase_error = e instanceof Error ? e.message : 'unknown'
    }
  } else {
    checks.supabase_connected = false
    checks.supabase_error = 'Credentials not configured'
  }

  const allReady = checks.supabase_url_set && checks.supabase_anon_key_set && checks.anthropic_key_set

  return NextResponse.json({
    status: allReady ? 'ready' : 'needs_configuration',
    checks,
    timestamp: new Date().toISOString(),
  })
}
