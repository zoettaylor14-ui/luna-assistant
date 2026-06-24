import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (stripe.financialConnections.sessions as any).create({
      account_holder: { type: 'individual' },
      permissions: ['balances', 'transactions', 'ownership'],
      filters: { countries: ['US'] },
    }) as { client_secret: string }
    return NextResponse.json({ client_secret: session.client_secret })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Stripe FC] create session error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
