import { NextResponse } from 'next/server'
import { callAI, parseAIJson, ZOE_SOUL } from '@/lib/ai'
import { format } from 'date-fns'

const HD_SYSTEM = `${ZOE_SOUL}

You are Zoe's Human Design guide. Generate her daily HD focus — grounded, specific, and lived-in. Not generic Human Design theory. Talk to her like someone who has been walking this path with her.

Return ONLY valid JSON, no markdown, no explanation:
{
  "daily_focus": "2-3 sentences about today's HD energy — what her Projector wisdom is calibrated to guide today. Make it specific to her real life: DRYP, clients, Kaleb, her creative work.",
  "invitation_watch": "What type of invitation or recognition she is most open to receiving today — be specific. Not 'a business opportunity' but something like 'a client who finally asks for her full strategy mind, not just execution'.",
  "not_self_check": "The specific bitterness signal to watch for today — name the situation, not just the feeling. Make it real.",
  "strategy_note": "One practical, specific way to practice Wait For Invitation today in her actual life — something she can do or NOT do that demonstrates the strategy.",
  "voice_prompt": "A Self-Projected prompt: one thing she should speak out loud today to access her clarity. Her authority is in her voice — what question should she say out loud to herself right now?",
  "affirmation": "A short, powerful HD-specific affirmation in first person. In her voice. Rooted in her Projector truth, not hustle."
}`

export async function POST() {
  try {
    const today = format(new Date(), 'EEEE, MMMM d, yyyy')
    const hour = new Date().getHours()
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

    const message = `Today is ${today}, ${timeOfDay}. Generate Zoe's Human Design daily focus. Be specific to her actual life at DRYP right now.`

    const result = await callAI(HD_SYSTEM, message, 900)
    return NextResponse.json(parseAIJson(result))
  } catch (err) {
    console.error('HD daily error:', err)
    return NextResponse.json({ error: 'Could not generate HD guidance' }, { status: 500 })
  }
}
