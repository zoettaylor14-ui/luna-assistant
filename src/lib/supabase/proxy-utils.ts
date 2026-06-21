import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/auth']
const PROTECTED_PREFIXES = [
  '/', '/today', '/work', '/spirit', '/more',
  '/morning', '/late-mode', '/rush-mode', '/night',
  '/dictation', '/vault', '/money', '/career', '/highest-self',
  '/lessons', '/messages', '/tasks', '/email', '/settings',
  '/projects', '/brain-dump', '/plan-my-day',
  '/api/ai', '/api/google', '/api/dryphub', '/api/bedtime',
]

export async function updateSession(request: NextRequest) {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const path = request.nextUrl.pathname

  // Skip auth if Supabase not configured
  if (!url || !url.startsWith('http') || !key || key === 'your_supabase_anon_key') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  const isPublic = PUBLIC_ROUTES.some(r => path.startsWith(r))
  const isProtected = PROTECTED_PREFIXES.some(p =>
    p === '/' ? path === '/' : path.startsWith(p)
  )

  if (!user && isProtected && !isPublic) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/auth/login'
    return NextResponse.redirect(redirect)
  }

  if (user && path.startsWith('/auth')) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/'
    return NextResponse.redirect(redirect)
  }

  // Redirect old /dashboard to /
  if (path === '/dashboard') {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/'
    return NextResponse.redirect(redirect)
  }

  return supabaseResponse
}
