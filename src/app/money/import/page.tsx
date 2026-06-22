'use client'
import { useState, useRef, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { formatCurrency } from '@/lib/money'
import { Upload, CheckCircle, AlertCircle, ArrowLeft, FileText, X } from 'lucide-react'
import Link from 'next/link'

const BG     = 'linear-gradient(180deg, #1A1240 0%, #100C30 35%, #0A0820 65%, #060418 100%)'
const GOLDEN = '#C9A96E'
const GREEN  = '#5A8A6A'
const RED    = '#C96B5A'

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: 18,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}
const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)',
}

interface ParsedRow {
  date: string
  description: string
  amount: number
  category?: string
  raw: string[]
}

interface ImportResult {
  imported: number
  skipped: number
  errors: number
  transactions: ParsedRow[]
}

// ─── Parse CSV ────────────────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  for (const line of lines) {
    const cols: string[] = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') { inQ = !inQ }
      else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
      else { cur += c }
    }
    cols.push(cur.trim())
    rows.push(cols)
  }
  return rows
}

function detectColumns(headers: string[]): { dateIdx: number; descIdx: number; amountIdx: number; creditIdx: number } {
  const h = headers.map(h => h.toLowerCase().replace(/[^a-z]/g, ''))
  const dateIdx   = h.findIndex(x => x.includes('date'))
  const descIdx   = h.findIndex(x => x.includes('desc') || x.includes('memo') || x.includes('name') || x.includes('payee') || x.includes('transaction'))
  const amountIdx = h.findIndex(x => x.includes('amount') || x.includes('debit') || x.includes('withdrawal') || x.includes('charge'))
  const creditIdx = h.findIndex(x => x.includes('credit') || x.includes('deposit'))
  return { dateIdx: dateIdx >= 0 ? dateIdx : 0, descIdx: descIdx >= 0 ? descIdx : 1, amountIdx: amountIdx >= 0 ? amountIdx : 2, creditIdx }
}

function parseAmount(str: string): number {
  if (!str) return 0
  const cleaned = str.replace(/[$,\s]/g, '').replace(/\((.+)\)/, '-$1')
  return parseFloat(cleaned) || 0
}

function autoCategory(desc: string): string {
  const d = desc.toLowerCase()
  if (d.includes('spotify') || d.includes('netflix') || d.includes('hulu') || d.includes('apple music')) return 'Entertainment'
  if (d.includes('amazon') || d.includes('amzn')) return 'Shopping'
  if (d.includes('starbucks') || d.includes('coffee') || d.includes('dunkin')) return 'Coffee/Drinks'
  if (d.includes('uber eats') || d.includes('doordash') || d.includes('grubhub')) return 'Food Delivery'
  if (d.includes('uber') || d.includes('lyft')) return 'Transportation'
  if (d.includes('gas') || d.includes('shell') || d.includes('bp ') || d.includes('chevron') || d.includes('exxon')) return 'Gas'
  if (d.includes('walmart') || d.includes('target') || d.includes('costco')) return 'Groceries'
  if (d.includes('publix') || d.includes('whole foods') || d.includes('kroger') || d.includes('aldi')) return 'Groceries'
  if (d.includes('att') || d.includes('at&t') || d.includes('verizon') || d.includes('t-mobile')) return 'Phone/Utilities'
  if (d.includes('spectrum') || d.includes('xfinity') || d.includes('comcast')) return 'Internet/Cable'
  if (d.includes('chatgpt') || d.includes('openai') || d.includes('anthropic') || d.includes('claude')) return 'AI Tools'
  if (d.includes('vercel') || d.includes('supabase') || d.includes('github') || d.includes('godaddy')) return 'Business/Hosting'
  if (d.includes('gym') || d.includes('crunch') || d.includes('planet fitness')) return 'Fitness'
  if (d.includes('sephora') || d.includes('ulta') || d.includes('salon') || d.includes('spa')) return 'Beauty/Self-Care'
  if (d.includes('rent') || d.includes('mortgage') || d.includes('lease')) return 'Housing'
  if (d.includes('zelle') || d.includes('venmo') || d.includes('cashapp') || d.includes('paypal')) return 'Transfer'
  if (d.includes('direct dep') || d.includes('payroll') || d.includes('salary') || d.includes('deposit')) return 'Income'
  return 'Other'
}

function processCSV(text: string): ParsedRow[] {
  const rows = parseCSV(text)
  if (rows.length < 2) return []
  const headers = rows[0]
  const { dateIdx, descIdx, amountIdx, creditIdx } = detectColumns(headers)
  const results: ParsedRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length < 2) continue
    const date = row[dateIdx] ?? ''
    const desc = row[descIdx] ?? ''
    if (!date || !desc) continue
    let amount = parseAmount(row[amountIdx] ?? '0')
    // If there's a separate credit column and this row has a credit, it's income
    if (creditIdx >= 0 && row[creditIdx] && parseAmount(row[creditIdx]) > 0) {
      amount = -Math.abs(parseAmount(row[creditIdx])) // income = negative in our system
    }
    results.push({
      date,
      description: desc,
      amount: Math.abs(amount),
      category: autoCategory(desc),
      raw: row,
    })
  }
  return results
}

const BANK_GUIDES = [
  { bank: 'Chase', steps: 'Sign in → Accounts → Download Account Activity → CSV' },
  { bank: 'Bank of America', steps: 'Sign in → Accounts → Download Transactions → CSV' },
  { bank: 'Wells Fargo', steps: 'Sign in → Accounts → Download Transactions → CSV' },
  { bank: 'Capital One', steps: 'Sign in → Account → Download Transactions → CSV' },
  { bank: 'Discover', steps: 'Sign in → See Statements → Download → CSV' },
  { bank: 'US Bank', steps: 'Sign in → Account Activity → Download → CSV' },
]

export default function ImportPage() {
  const [dragging, setDragging]       = useState(false)
  const [parsed, setParsed]           = useState<ParsedRow[] | null>(null)
  const [fileName, setFileName]       = useState('')
  const [importing, setImporting]     = useState(false)
  const [result, setResult]           = useState<ImportResult | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError(null)
    setResult(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = processCSV(text)
      if (rows.length === 0) {
        setError('No transactions found. Make sure you exported as CSV.')
        return
      }
      setParsed(rows)
    }
    reader.onerror = () => setError('Could not read file.')
    reader.readAsText(file)
  }, [])

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  async function handleImport() {
    if (!parsed) return
    setImporting(true)
    setError(null)
    try {
      const res = await fetch('/api/money/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: parsed, source: fileName }),
      })
      const data = await res.json() as ImportResult
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Import failed')
      setResult(data)
      setParsed(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <AppLayout noPad>
        <div style={{ padding: '80px 20px 140px' }}>

          <div style={{ marginBottom: 20 }}>
            <Link href="/money" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, marginBottom: 16 }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Money
            </Link>
            <p style={{ ...LABEL, color: GOLDEN, marginBottom: 4 }}>Finance Command Center</p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Import Bank Transactions</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.6 }}>
              Download your transactions as CSV from your bank and upload here. LUNA will categorize everything automatically.
            </p>
          </div>

          {/* Success state */}
          {result && (
            <div style={{ ...CARD, padding: 24, border: '1px solid rgba(90,138,106,0.4)', background: 'rgba(90,138,106,0.08)', marginBottom: 20, textAlign: 'center' }}>
              <CheckCircle style={{ width: 40, height: 40, color: GREEN, margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>Import Complete</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                {result.imported} transactions imported · {result.skipped} skipped
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                <Link href="/money/transactions" style={{ textDecoration: 'none', background: `linear-gradient(135deg, ${GOLDEN}, #B8903A)`, color: '#1A1240', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                  View Transactions
                </Link>
                <button onClick={() => { setResult(null); setFileName('') }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Import Another
                </button>
              </div>
            </div>
          )}

          {/* Drop zone */}
          {!result && !parsed && (
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                ...CARD,
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                border: dragging ? `2px dashed ${GOLDEN}` : '2px dashed rgba(255,255,255,0.18)',
                background: dragging ? 'rgba(201,169,110,0.08)' : 'rgba(255,255,255,0.04)',
                marginBottom: 20,
                transition: 'all 0.2s',
              }}>
              <Upload style={{ width: 40, height: 40, color: GOLDEN, margin: '0 auto 16px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                Drop your CSV file here
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                or click to browse · supports Chase, BofA, Wells Fargo, Capital One, and most US banks
              </p>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={onFileChange} style={{ display: 'none' }} />
            </div>
          )}

          {error && (
            <div style={{ ...CARD, padding: '12px 16px', border: `1px solid rgba(201,107,90,0.4)`, background: 'rgba(201,107,90,0.08)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle style={{ width: 16, height: 16, color: RED, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: RED }}>{error}</p>
            </div>
          )}

          {/* Preview */}
          {parsed && !result && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...CARD, padding: 18, marginBottom: 12, border: `1px solid rgba(201,169,110,0.22)`, background: 'rgba(201,169,110,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText style={{ width: 18, height: 18, color: GOLDEN }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{fileName}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{parsed.length} transactions found</p>
                    </div>
                  </div>
                  <button onClick={() => { setParsed(null); setFileName('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                    <X style={{ width: 18, height: 18 }} />
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[
                    { label: 'Total Transactions', value: String(parsed.length) },
                    { label: 'Total Spend', value: formatCurrency(parsed.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0)) },
                    { label: 'Categories Found', value: String(new Set(parsed.map(r => r.category)).size) },
                  ].map(s => (
                    <div key={s.label} style={{ ...CARD, padding: '10px 14px', flex: 1, minWidth: 100 }}>
                      <p style={{ ...LABEL, marginBottom: 4 }}>{s.label}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: GOLDEN }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => void handleImport()}
                  disabled={importing}
                  style={{
                    width: '100%', height: 48, borderRadius: 14, border: 'none', cursor: importing ? 'wait' : 'pointer',
                    background: importing ? 'rgba(201,169,110,0.4)' : `linear-gradient(135deg, ${GOLDEN}, #B8903A)`,
                    color: '#1A1240', fontSize: 15, fontWeight: 800, letterSpacing: '0.02em',
                  }}>
                  {importing ? 'Importing…' : `Import ${parsed.length} Transactions`}
                </button>
              </div>

              {/* Preview table */}
              <div style={{ ...CARD, padding: 18 }}>
                <p style={{ ...LABEL, marginBottom: 14 }}>Preview (first 10)</p>
                {parsed.slice(0, 10).map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                      {(row.description || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{row.category} · {row.date}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: row.category === 'Income' ? GREEN : RED, flexShrink: 0 }}>
                      {row.category === 'Income' ? '+' : '−'}{formatCurrency(row.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to download by bank */}
          {!parsed && !result && (
            <div style={{ ...CARD, padding: 20 }}>
              <p style={{ ...LABEL, marginBottom: 16 }}>How to download from your bank</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {BANK_GUIDES.map((g, i) => (
                  <div key={g.bank} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < BANK_GUIDES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: GOLDEN }}>{g.bank.charAt(0)}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{g.bank}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{g.steps}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(201,169,110,0.06)', borderRadius: 10, border: '1px solid rgba(201,169,110,0.15)' }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  Your file never leaves your device until you tap Import. LUNA reads the CSV, categorizes each transaction with AI, and stores only the cleaned data.
                </p>
              </div>
            </div>
          )}

        </div>
      </AppLayout>
    </div>
  )
}
