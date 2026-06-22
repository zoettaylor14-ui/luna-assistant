import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createAdminClient } from '@/lib/supabase/admin'

const ZOE_USER_ID = '98f5b277-bb63-41d5-89ec-0edadc1e2858'

export async function POST(req: NextRequest) {
  try {
    const { public_token, institution_id, institution_name } = await req.json()

    if (!public_token) {
      return NextResponse.json({ error: 'public_token required' }, { status: 400 })
    }

    // Exchange public token for access token (server-side only)
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token })
    const { access_token, item_id } = exchangeResponse.data

    const db = createAdminClient()

    // Store in Supabase — never return access_token to client
    const { error: insertError } = await db.from('plaid_items').upsert({
      user_id: ZOE_USER_ID,
      plaid_item_id: item_id,
      access_token,
      institution_id: institution_id ?? null,
      institution_name: institution_name ?? null,
      products: ['transactions'],
      status: 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'plaid_item_id' })

    if (insertError) {
      console.error('[Plaid] insert plaid_items error:', insertError)
      return NextResponse.json({ error: 'Failed to store item' }, { status: 500 })
    }

    // Immediately sync accounts and transactions in background (fire-and-forget)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    Promise.all([
      fetch(`${baseUrl}/api/plaid/accounts/sync`, { method: 'POST' }),
      fetch(`${baseUrl}/api/plaid/transactions/sync`, { method: 'POST' }),
    ]).catch(err => console.error('[Plaid] background sync error:', err))

    return NextResponse.json({
      success: true,
      item_id,
      institution_name: institution_name ?? null,
    })
  } catch (error) {
    console.error('[Plaid] exchange-public-token error:', error)
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 })
  }
}
