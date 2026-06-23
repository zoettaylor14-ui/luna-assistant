import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — LUNA',
  description: 'Terms of Service for LUNA personal AI assistant at mylunaguide.online',
}

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1A1240 0%, #100C30 35%, #0A0820 65%, #060418 100%)',
      color: 'rgba(255,255,255,0.88)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(10,8,28,0.94)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #8B6FB8, #6A4F9B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 14 }}>☽</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.18em', color: 'white' }}>LUNA</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Terms of Service</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.01em' }}>
          Terms of Service
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 48 }}>
          Effective date: June 23, 2026 &nbsp;·&nbsp; Last updated: June 23, 2026
        </p>

        <Section title="1. Acceptance of Terms">
          By accessing or using LUNA at <strong>mylunaguide.online</strong> (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
        </Section>

        <Section title="2. Description of Service">
          LUNA is a personal AI assistant application that provides:
          <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>AI-powered email triage and inbox management via Gmail integration</li>
            <li>Google Calendar event display and scheduling assistance</li>
            <li>Daily spiritual guidance, astrology readings, and moon phase tracking</li>
            <li>Financial tracking and spending insights via bank CSV import or Plaid</li>
            <li>Conversational AI support (LUNA chat) powered by Groq/Llama AI models</li>
            <li>Morning check-ins, task management, and productivity features</li>
            <li>Business workflow tools for client and project management</li>
          </ul>
        </Section>

        <Section title="3. Authorized Use">
          LUNA is a private application intended for use by its owner and authorized users only. Unauthorized access or use of this Service is strictly prohibited. By using the Service, you represent that you are an authorized user.
        </Section>

        <Section title="4. Google Account Integration">
          <p style={{ marginBottom: 12 }}>When you connect your Google account to LUNA:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li>You authorize LUNA to access your Gmail messages and Google Calendar events through the Google OAuth 2.0 protocol</li>
            <li>Access is limited to the scopes explicitly listed in our <Link href="/privacy" style={{ color: '#8B9FD4' }}>Privacy Policy</Link></li>
            <li>You may revoke this access at any time through the LUNA Settings page or via <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: '#8B9FD4' }}>myaccount.google.com/permissions</a></li>
            <li>LUNA will only use your Google data to provide the features described in these Terms and will not use it for advertising, model training, or any purpose not described in our <Link href="/privacy" style={{ color: '#8B9FD4' }}>Privacy Policy</Link></li>
          </ul>
        </Section>

        <Section title="5. AI-Generated Content">
          <p style={{ marginBottom: 12 }}>LUNA uses AI language models (Groq/Llama 3.3) to generate content including:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Email summaries and suggested replies</li>
            <li>Astrology and spiritual guidance</li>
            <li>Financial insights and spending analysis</li>
            <li>Daily briefs, mantras, and motivational content</li>
            <li>Conversational responses</li>
          </ul>
          <p style={{ marginTop: 12 }}><strong>AI-generated content is for informational and personal guidance purposes only.</strong> Astrology readings, spiritual guidance, and financial insights do not constitute professional financial, medical, legal, or psychological advice. Do not make major life decisions based solely on AI-generated content.</p>
        </Section>

        <Section title="6. Financial Data">
          Financial data imported into LUNA (via CSV or Plaid) is stored in your private database for personal budgeting and insight purposes only. LUNA does not execute financial transactions, provide regulated financial advice, or share your financial data with any third party beyond what is necessary to operate the Service.
        </Section>

        <Section title="7. Intellectual Property">
          The LUNA application, including its design, code, and AI prompting systems, is the intellectual property of Zoe Taylor / DRYP Digital. You may not copy, redistribute, or reverse-engineer any part of this application without express written permission.
        </Section>

        <Section title="8. Disclaimer of Warranties">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF SECURITY VULNERABILITIES. USE OF THE SERVICE IS AT YOUR OWN RISK.
        </Section>

        <Section title="9. Limitation of Liability">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LUNA AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF REVENUE, OR UNAUTHORIZED ACCESS TO YOUR ACCOUNTS.
        </Section>

        <Section title="10. Third-Party Services">
          LUNA integrates with third-party services including Google, Supabase, Groq, Plaid, and Vercel. Your use of these integrations is also subject to their respective terms of service and privacy policies. LUNA is not responsible for the availability, accuracy, or conduct of these third-party services.
        </Section>

        <Section title="11. Changes to Terms">
          These Terms may be updated from time to time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms. The &quot;Last updated&quot; date at the top of this page reflects when the Terms were most recently changed.
        </Section>

        <Section title="12. Governing Law">
          These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, United States, without regard to its conflict of law provisions.
        </Section>

        <Section title="13. Contact">
          Questions about these Terms? Contact:
          <br /><br />
          <strong>Zoe Taylor</strong><br />
          <a href="mailto:info@drypdigital.com" style={{ color: '#8B9FD4' }}>info@drypdigital.com</a><br />
          DRYP Digital / Ad-Vantage Media Agency
        </Section>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ color: '#8B9FD4', fontSize: 13, textDecoration: 'none' }}>Privacy Policy →</Link>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}>← Back to LUNA</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#C9A96E', marginBottom: 14, letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)' }}>
        {children}
      </div>
    </div>
  )
}
