import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

const env = process.env.PLAID_ENV ?? 'sandbox'

// Map env name to base URL defensively — don't rely on enum key lookup
const BASE_PATHS: Record<string, string> = {
  sandbox:     'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production:  'https://production.plaid.com',
}

const basePath = BASE_PATHS[env] ?? PlaidEnvironments.sandbox

const configuration = new Configuration({
  basePath,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID ?? '',
      'PLAID-SECRET':    process.env.PLAID_SECRET ?? '',
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

export const PLAID_PRODUCTS  = ['transactions'] as const
export const PLAID_COUNTRY_CODES = ['US'] as const
