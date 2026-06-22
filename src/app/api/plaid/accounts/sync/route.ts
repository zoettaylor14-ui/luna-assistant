import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createAdminClient } from '@/lib/supabase/admin'

const ZOE_USER_ID = '98f5b277-bb63-41d5-89ec-0edadc1e2858'

export async function POST() {
  try {
    const db = createAdminClient()

    // Fetch all active plaid items
    const { data: items, error: itemsError } = await db
      .from('plaid_items')
      .select('*')
      .eq('user_id', ZOE_USER_ID)
      .eq('status', 'active')

    if (itemsError || !items?.length) {
      return NextResponse.json({ accounts: [], synced: 0 })
    }

    const allAccounts: Record<string, unknown>[] = []

    for (const item of items) {
      try {
        const response = await plaidClient.accountsGet({ access_token: item.access_token })
        const accounts = response.data.accounts

        for (const acct of accounts) {
          const upsertData = {
            user_id: ZOE_USER_ID,
            plaid_item_id: item.id,
            plaid_account_id: acct.account_id,
            name: acct.name,
            official_name: acct.official_name ?? null,
            type: acct.type,
            subtype: acct.subtype ?? null,
            mask: acct.mask ?? null,
            current_balance: acct.balances.current ?? null,
            available_balance: acct.balances.available ?? null,
            iso_currency_code: acct.balances.iso_currency_code ?? 'USD',
            last_balance_update: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error } = await db
            .from('plaid_accounts')
            .upsert(upsertData, { onConflict: 'plaid_account_id' })

          if (error) console.error('[Plaid] upsert account error:', error)
          else allAccounts.push(upsertData)
        }
      } catch (err) {
        console.error(`[Plaid] accountsGet error for item ${item.id}:`, err)
      }
    }

    return NextResponse.json({ accounts: allAccounts, synced: allAccounts.length })
  } catch (error) {
    console.error('[Plaid] accounts/sync error:', error)
    return NextResponse.json({ error: 'Failed to sync accounts' }, { status: 500 })
  }
}
