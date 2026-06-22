import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createAdminClient } from '@/lib/supabase/admin'
import { classifyTransaction, isIncome, isBusinessExpense, isSubscription, isBill, PlaidTransaction } from '@/lib/money'

const ZOE_USER_ID = '98f5b277-bb63-41d5-89ec-0edadc1e2858'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { item_id } = body as { item_id?: string }

    const db = createAdminClient()

    // Build query
    let query = db
      .from('plaid_items')
      .select('*')
      .eq('user_id', ZOE_USER_ID)
      .eq('status', 'active')

    if (item_id) {
      query = query.eq('id', item_id)
    }

    const { data: items, error: itemsError } = await query

    if (itemsError || !items?.length) {
      return NextResponse.json({ synced_count: 0, items_synced: 0 })
    }

    let totalSynced = 0

    for (const item of items) {
      try {
        let cursor = item.cursor ?? undefined
        let hasMore = true
        let itemSynced = 0

        while (hasMore) {
          const response = await plaidClient.transactionsSync({
            access_token: item.access_token,
            cursor,
            count: 500,
          })

          const { added, modified, removed, next_cursor, has_more } = response.data

          // Handle added transactions
          for (const txn of added) {
            const plaidTxn: PlaidTransaction = {
              transaction_id: txn.transaction_id,
              account_id: txn.account_id,
              amount: txn.amount,
              date: txn.date,
              authorized_date: txn.authorized_date ?? null,
              merchant_name: txn.merchant_name ?? null,
              name: txn.name,
              payment_channel: txn.payment_channel,
              pending: txn.pending,
              personal_finance_category: txn.personal_finance_category ? {
                primary: txn.personal_finance_category.primary,
                detailed: txn.personal_finance_category.detailed,
                confidence_level: txn.personal_finance_category.confidence_level ?? undefined,
              } : null,
              category: txn.category ?? null,
            }

            const expenseType = classifyTransaction(plaidTxn)
            const incomeFlag = isIncome(plaidTxn)
            const bizFlag = isBusinessExpense(plaidTxn)
            const subFlag = isSubscription(plaidTxn)
            const billFlag = isBill(plaidTxn)

            // Get account name
            const { data: acctData } = await db
              .from('plaid_accounts')
              .select('name')
              .eq('plaid_account_id', txn.account_id)
              .single()

            const { error: insertErr } = await db.from('money_transactions').upsert({
              user_id: ZOE_USER_ID,
              plaid_item_id: item.id,
              plaid_account_id: txn.account_id,
              plaid_transaction_id: txn.transaction_id,
              account_name: acctData?.name ?? null,
              amount: txn.amount,
              transaction_date: txn.date,
              authorized_date: txn.authorized_date ?? null,
              merchant_name: txn.merchant_name ?? null,
              name: txn.name,
              payment_channel: txn.payment_channel,
              pending: txn.pending,
              category_primary: txn.personal_finance_category?.primary ?? null,
              category_detailed: txn.personal_finance_category?.detailed ?? null,
              personal_finance_category: txn.personal_finance_category ?? null,
              expense_type: expenseType,
              is_income: incomeFlag,
              is_bill: billFlag,
              is_subscription: subFlag,
              is_business_expense: bizFlag,
              is_personal_expense: !incomeFlag && !bizFlag,
              needs_review: false,
              raw: txn,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'plaid_transaction_id' })

            if (insertErr) console.error('[Plaid] insert transaction error:', insertErr)
            else itemSynced++
          }

          // Handle modified transactions
          for (const txn of modified) {
            const plaidTxn: PlaidTransaction = {
              transaction_id: txn.transaction_id,
              account_id: txn.account_id,
              amount: txn.amount,
              date: txn.date,
              authorized_date: txn.authorized_date ?? null,
              merchant_name: txn.merchant_name ?? null,
              name: txn.name,
              payment_channel: txn.payment_channel,
              pending: txn.pending,
              personal_finance_category: txn.personal_finance_category ? {
                primary: txn.personal_finance_category.primary,
                detailed: txn.personal_finance_category.detailed,
                confidence_level: txn.personal_finance_category.confidence_level ?? undefined,
              } : null,
              category: txn.category ?? null,
            }

            const expenseType = classifyTransaction(plaidTxn)

            await db.from('money_transactions')
              .update({
                amount: txn.amount,
                merchant_name: txn.merchant_name ?? null,
                name: txn.name,
                pending: txn.pending,
                expense_type: expenseType,
                is_income: isIncome(plaidTxn),
                is_bill: isBill(plaidTxn),
                is_subscription: isSubscription(plaidTxn),
                is_business_expense: isBusinessExpense(plaidTxn),
                raw: txn,
                updated_at: new Date().toISOString(),
              })
              .eq('plaid_transaction_id', txn.transaction_id)
          }

          // Handle removed transactions
          for (const removed_txn of removed) {
            await db.from('money_transactions')
              .delete()
              .eq('plaid_transaction_id', removed_txn.transaction_id)
          }

          cursor = next_cursor
          hasMore = has_more
        }

        // Update cursor and last_synced_at
        await db.from('plaid_items')
          .update({ cursor, last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', item.id)

        totalSynced += itemSynced

        // Detect bills and subscriptions, create alerts
        await detectAndCreateAlerts(db, item.id)
      } catch (err) {
        console.error(`[Plaid] transactionsSync error for item ${item.id}:`, err)
      }
    }

    return NextResponse.json({ synced_count: totalSynced, items_synced: items.length })
  } catch (error) {
    console.error('[Plaid] transactions/sync error:', error)
    return NextResponse.json({ error: 'Failed to sync transactions' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function detectAndCreateAlerts(db: any, itemId: string) {
  try {
    // Detect large transactions (>$500) that need review
    const { data: largeTxns } = await db
      .from('money_transactions')
      .select('*')
      .eq('plaid_item_id', itemId)
      .eq('user_id', ZOE_USER_ID)
      .gt('amount', 500)
      .eq('is_income', false)
      .gte('transaction_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    for (const txn of (largeTxns ?? [])) {
      await db.from('money_alerts').insert({
        user_id: ZOE_USER_ID,
        alert_type: 'large_transaction',
        title: `Large charge: ${txn.merchant_name ?? txn.name}`,
        body: `$${Math.abs(txn.amount).toFixed(2)} — was this expected?`,
        severity: 'normal',
        source_transaction_id: txn.plaid_transaction_id,
        status: 'pending',
      }).then(() => {}).catch(() => {})
    }
  } catch {
    // Non-fatal
  }
}
