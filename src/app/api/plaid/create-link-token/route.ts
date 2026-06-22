import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { Products, CountryCode } from 'plaid'

const ZOE_USER_ID = '98f5b277-bb63-41d5-89ec-0edadc1e2858'

export async function POST() {
  try {
    // Only pass redirect_uri for production https URLs — sandbox doesn't need it
    const redirectUri = process.env.PLAID_REDIRECT_URI
    const useRedirect = !!redirectUri && redirectUri.startsWith('https://')

    const response = await plaidClient.linkTokenCreate({
      user:          { client_user_id: ZOE_USER_ID },
      client_name:   'LUNA',
      products:      [Products.Transactions],
      country_codes: [CountryCode.Us],
      language:      'en',
      ...(useRedirect ? { redirect_uri: redirectUri } : {}),
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (err: unknown) {
    // Surface the real Plaid error so we can debug
    const plaidErr = err as { response?: { data?: unknown }; message?: string }
    const detail   = plaidErr?.response?.data ?? plaidErr?.message ?? String(err)
    console.error('[Plaid] create-link-token error:', JSON.stringify(detail))
    return NextResponse.json({ error: 'Failed to create link token', detail }, { status: 500 })
  }
}
