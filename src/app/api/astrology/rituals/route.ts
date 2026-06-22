import { NextRequest, NextResponse } from 'next/server'
import { getMoonRitualContext } from '@/lib/astrology'
import type { ZodiacSign } from '@/lib/astrology'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const phase = url.searchParams.get('phase') ?? 'New Moon'
    const sign  = (url.searchParams.get('sign') ?? 'Cancer') as ZodiacSign

    const context = getMoonRitualContext(phase, sign)
    return NextResponse.json(context)
  } catch (err) {
    console.error('rituals route error:', err)
    return NextResponse.json({ error: 'Ritual context error' }, { status: 500 })
  }
}
