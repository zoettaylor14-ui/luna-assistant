import { NextRequest, NextResponse } from 'next/server'
import { getGmailAuthUrl } from '@/lib/gmail'

export function GET(req: NextRequest) {
  const hint = req.nextUrl.searchParams.get('hint') ?? undefined
  return NextResponse.redirect(getGmailAuthUrl(hint))
}
