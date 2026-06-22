import { NextResponse } from 'next/server'
import { plaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from '@/lib/plaid'
import { Products, CountryCode } from 'plaid'

const ZOE_USER_ID = '98f5b277-bb63-41d5-89ec-0edadc1e2858'

export async function POST() {
  try {
    const request = {
      user: { client_user_id: ZOE_USER_ID },
      client_name: 'LUNA',
      products: PLAID_PRODUCTS as Products[],
      country_codes: PLAID_COUNTRY_CODES as CountryCode[],
      language: 'en',
      ...(process.env.PLAID_REDIRECT_URI ? { redirect_uri: process.env.PLAID_REDIRECT_URI } : {}),
    }

    const response = await plaidClient.linkTokenCreate(request)
    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error) {
    console.error('[Plaid] create-link-token error:', error)
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 })
  }
}
