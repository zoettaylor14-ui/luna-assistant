import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !url.startsWith('http') || !key || key === 'your_supabase_anon_key') {
    // Return a stub during build/prerender when env vars aren't configured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ data: null, error: null }) }), data: null, error: null }), not: () => ({ order: () => ({ limit: () => ({ data: [], error: null }), data: [], error: null }) }), single: () => ({ data: null, error: null }), data: null, error: null }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }), data: null, error: null }), data: null, error: null }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
        upsert: () => ({ data: null, error: null }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  }

  return createBrowserClient(url, key)
}
