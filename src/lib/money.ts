// ─── Money helpers for LUNA banking integration ───────────────────────────────

export interface Transaction {
  transaction_id: string
  account_id?: string
  amount: number
  date: string
  authorized_date?: string | null
  merchant_name?: string | null
  name: string
  payment_channel?: string
  pending: boolean
  personal_finance_category?: {
    primary?: string
    detailed?: string
    confidence_level?: string
  } | null
  category?: string[] | null
}

const BUSINESS_MERCHANTS = [
  'adobe', 'slack', 'notion', 'figma', 'shopify', 'stripe', 'quickbooks',
  'zoom', 'dropbox', 'google workspace', 'microsoft 365', 'canva', 'mailchimp',
  'convertkit', 'klaviyo', 'hubspot', 'salesforce', 'hootsuite', 'buffer',
  'later', 'loom', 'calendly', 'typeform', 'supabase', 'vercel', 'netlify',
  'aws', 'github', 'digital ocean', 'cloudflare', 'godaddy', 'namecheap',
  'squarespace', 'wix', 'webflow', 'resend', 'sendgrid', 'twilio',
]

const SUBSCRIPTION_PATTERNS = [
  'netflix', 'hulu', 'spotify', 'apple', 'disney+', 'hbo', 'amazon prime',
  'youtube premium', 'paramount', 'peacock', 'crunchyroll', 'audible',
  'headspace', 'calm', 'duolingo', 'skillshare', 'masterclass', 'linkedin',
  'peloton', 'noom', 'weight watchers', 'stitch fix', 'ipsy', 'birchbox',
]

const BILL_PATTERNS = [
  'at&t', 'verizon', 't-mobile', 'comcast', 'xfinity', 'spectrum', 'cox',
  'duke energy', 'florida power', 'fpl', 'teco', 'water', 'waste', 'sewage',
  'trash', 'electric', 'gas company', 'national grid', 'rental', 'mortgage',
  'insurance', 'geico', 'progressive', 'allstate', 'state farm', 'usaa',
  'rent', 'lease', 'hoa',
]

const INCOME_CATEGORIES = [
  'INCOME', 'PAYROLL', 'DEPOSIT', 'TRANSFER_IN', 'INCOME_WAGES',
  'INCOME_OTHER_INCOME', 'INCOME_TAX_REFUND', 'INCOME_UNEMPLOYMENT',
  'INCOME_RETIREMENT_PENSION', 'INCOME_DIVIDENDS',
]

export function classifyTransaction(txn: Transaction): string {
  const name = (txn.merchant_name ?? txn.name ?? '').toLowerCase()
  const cat = txn.personal_finance_category?.primary?.toUpperCase() ?? ''
  const catDetail = txn.personal_finance_category?.detailed?.toUpperCase() ?? ''

  if (txn.amount < 0) return 'income'
  if (INCOME_CATEGORIES.some(c => cat.includes(c) || catDetail.includes(c))) return 'income'
  if (isBill(txn)) return 'bill'
  if (isSubscription(txn)) return 'subscription'
  if (isBusinessExpense(txn)) return 'business'

  if (cat.includes('FOOD') || cat.includes('DINING')) return 'food'
  if (cat.includes('TRANSPORT') || cat.includes('TRAVEL')) return 'transport'
  if (cat.includes('HEALTHCARE') || cat.includes('MEDICAL')) return 'healthcare'
  if (cat.includes('SHOPPING')) return 'shopping'
  if (cat.includes('ENTERTAINMENT')) return 'entertainment'
  if (cat.includes('PERSONAL_CARE')) return 'self_care'
  if (cat.includes('EDUCATION')) return 'education'
  if (cat.includes('GENERAL_SERVICES')) return 'services'
  if (cat.includes('HOME')) return 'home'

  void name

  return 'other'
}

export function isBusinessExpense(txn: Transaction): boolean {
  const name = (txn.merchant_name ?? txn.name ?? '').toLowerCase()
  const cat = txn.personal_finance_category?.primary?.toUpperCase() ?? ''
  if (BUSINESS_MERCHANTS.some(m => name.includes(m))) return true
  if (cat.includes('BUSINESS') || cat.includes('PROFESSIONAL')) return true
  return false
}

export function isSubscription(txn: Transaction): boolean {
  const name = (txn.merchant_name ?? txn.name ?? '').toLowerCase()
  const cat = txn.personal_finance_category?.primary?.toUpperCase() ?? ''
  const catDetail = txn.personal_finance_category?.detailed?.toUpperCase() ?? ''
  if (SUBSCRIPTION_PATTERNS.some(m => name.includes(m))) return true
  if (catDetail.includes('SUBSCRIPTION')) return true
  if (cat.includes('SUBSCRIPTION')) return true
  return false
}

export function isBill(txn: Transaction): boolean {
  const name = (txn.merchant_name ?? txn.name ?? '').toLowerCase()
  const cat = txn.personal_finance_category?.primary?.toUpperCase() ?? ''
  if (BILL_PATTERNS.some(m => name.includes(m))) return true
  if (cat.includes('UTILITIES') || cat.includes('RENT') || cat.includes('INSURANCE')) return true
  return false
}

export function isIncome(txn: Transaction): boolean {
  if (txn.amount < 0) return true
  const cat = txn.personal_finance_category?.primary?.toUpperCase() ?? ''
  return INCOME_CATEGORIES.some(c => cat.includes(c))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
}

export function getMonthRange(date?: Date): { start: string; end: string } {
  const d = date ?? new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - dayOfWeek)
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  }
}

export const CATEGORY_ICONS: Record<string, string> = {
  income: '💚',
  bill: '📋',
  subscription: '🔄',
  business: '💼',
  food: '🍽️',
  transport: '🚗',
  healthcare: '🏥',
  shopping: '🛍️',
  entertainment: '🎬',
  self_care: '✨',
  education: '📚',
  services: '🔧',
  home: '🏠',
  other: '💳',
}
