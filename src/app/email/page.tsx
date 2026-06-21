'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AIThinking } from '@/components/ui/loading'
import { Sparkles, Copy, CheckCheck, Mail, AlertCircle, ArrowRight } from 'lucide-react'
import { cn, URGENCY_COLORS } from '@/lib/utils'

interface EmailAnalysis {
  summary: string
  urgency: string
  sender_intent: string
  suggested_action: string
  replies: {
    short: string
    professional: string
    warm: string
  }
}

const REPLY_LABELS = [
  { key: 'short', label: 'Short & sweet', icon: '⚡' },
  { key: 'professional', label: 'Professional', icon: '💼' },
  { key: 'warm', label: 'Warm & direct', icon: '✨' },
] as const

export default function EmailPage() {
  const [sender, setSender] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  async function handleAnalyze() {
    if (!body.trim()) return
    setLoading(true)
    setError('')
    setAnalysis(null)
    try {
      const res = await fetch('/api/ai/email-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_body: body, sender, subject, context }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function resetForm() {
    setSender('')
    setSubject('')
    setBody('')
    setContext('')
    setAnalysis(null)
    setError('')
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Email Assistant</h1>
          <p className="text-slate-500 text-sm mt-0.5">Paste an email and get smart reply suggestions in your voice</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <CardTitle>Paste email</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  label="From (optional)"
                  placeholder="Sender name or email"
                  value={sender}
                  onChange={e => setSender(e.target.value)}
                />
                <Input
                  label="Subject (optional)"
                  placeholder="Email subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
                <Textarea
                  label="Email body *"
                  placeholder="Paste the full email here..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={8}
                />
                <Textarea
                  label="Your context (optional)"
                  placeholder="Any relevant background? e.g. 'This is about the EHM project launch'"
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  rows={2}
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 rounded-xl px-3 py-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!body.trim() || loading}
                    loading={loading}
                    className="flex-1 gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze & suggest replies
                  </Button>
                  {analysis && (
                    <Button variant="outline" onClick={resetForm}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis output */}
          <div className="space-y-4">
            {loading && (
              <Card>
                <CardContent className="pt-6">
                  <AIThinking message="Reading the email and drafting replies..." />
                </CardContent>
              </Card>
            )}

            {analysis && (
              <>
                {/* Summary card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Summary</p>
                      <p className="text-sm text-slate-700">{analysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Urgency</p>
                        <Badge className={cn(URGENCY_COLORS[analysis.urgency] || 'bg-slate-100 text-slate-600')}>
                          {analysis.urgency}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">They want...</p>
                        <p className="text-xs text-slate-600">{analysis.sender_intent}</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-0.5">Suggested action</p>
                      <p className="text-sm text-amber-800">{analysis.suggested_action}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Reply options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reply options</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">Written in your voice. Click to copy.</p>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    {REPLY_LABELS.map(({ key, label, icon }) => {
                      const text = analysis.replies[key as keyof typeof analysis.replies]
                      return (
                        <div key={key} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-600">
                              {icon} {label}
                            </span>
                            <Button
                              size="sm"
                              variant={copied === key ? 'secondary' : 'outline'}
                              onClick={() => copyToClipboard(text, key)}
                              className="gap-1.5 h-7 text-xs"
                            >
                              {copied === key ? (
                                <><CheckCheck className="h-3 w-3 text-green-500" /> Copied</>
                              ) : (
                                <><Copy className="h-3 w-3" /> Copy</>
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{text}</p>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </>
            )}

            {!analysis && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-blue-400" />
                </div>
                <p className="text-slate-500 text-sm">Paste an email on the left to get AI reply suggestions</p>
                <p className="text-slate-400 text-xs mt-1">Replies are written in Zoe's voice — clear, human, not corporate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
