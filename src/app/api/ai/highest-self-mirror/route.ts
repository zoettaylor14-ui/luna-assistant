import { NextRequest, NextResponse } from 'next/server'
import { callAI, HIGHEST_SELF_PROMPT, parseAIJson } from '@/lib/ai'

const FALLBACK_MIRRORS = [
  { current_pattern: 'Woke up late, feel like the day is ruined.', current_description: 'This pattern makes sense. One disrupted morning can make everything feel off.', highest_self_action: 'One late start does not define me. I recalibrate, choose one priority, and begin from here.', bridge_step: 'Open Late Mode and choose just one clear step right now.', chart_connection: 'Cancer Moon reminder: your emotional safety is not dependent on a perfect morning. Softness is allowed here.' },
  { current_pattern: 'Too many ideas and I want to start all of them at once.', current_description: 'Gemini Rising collects fast. This is your gift — and your challenge.', highest_self_action: 'My ideas are safe in the Vault. I choose what supports work, money, peace, or growth today.', bridge_step: 'Go to the Vault. Park everything except today\'s one priority.', chart_connection: 'Gemini Rising collects fast. Virgo Midheaven builds slow systems. Both are you — let the system catch what the mind generates.' },
  { current_pattern: 'I carry tasks in my head instead of writing them down.', current_description: 'Scorpio Mercury can hold a lot — but it was not designed to carry everything alone.', highest_self_action: 'If it is not written down, it does not exist. LUNA holds it — not me.', bridge_step: 'Dictate everything right now. Get it out of your head and into the system.', chart_connection: 'Scorpio Mercury: depth-seeking and precise — but your mind is an oracle, not a filing cabinet.' },
  { current_pattern: 'I overthink messages and react from emotion.', current_description: 'Mars in Libra needs balance before action. Responding from feeling first is the not-self pattern.', highest_self_action: 'I dictate the feeling first. Then I send from clarity.', bridge_step: 'Go to Messages. Use the "Send from wisdom" tool before responding.', chart_connection: 'Cancer Moon feels deeply. Scorpio Mercury wants to say everything. Respond with 30% of what you feel like saying.' },
  { current_pattern: 'I try to prove I can do everything myself.', current_description: 'This pattern comes from the South Node in Capricorn — the old story of earning your place through output.', highest_self_action: 'I choose the work where my guidance is most valuable. I do not need to prove anything.', bridge_step: 'Ask: Is this invited, or am I forcing it? If it is forced, let it rest.', chart_connection: 'Projector reminder: recognition cannot be forced. Your power is in being seen, not proving. You are a guide, not a grinder.' },
  { current_pattern: 'I feel behind and like I should be further along by now.', current_description: 'This is the Capricorn South Node speaking — the old measurement of worth through achievement and pace.', highest_self_action: 'I am not behind. I am arriving. My timeline is not a race — it is an invitation.', bridge_step: 'Name one thing you have already done. Just one. Then choose the next step from there.', chart_connection: 'Your 6th line is the role model in the making. The "behind" feeling is part of the becoming — not evidence against it.' },
]

export async function POST(request: NextRequest) {
  try {
    const { situation } = await request.json()
    if (!situation?.trim()) return NextResponse.json({ error: 'Situation required' }, { status: 400 })
    const context = `Zoe's current situation or pattern:\n\n${situation}`

    try {
      const result = await callAI(HIGHEST_SELF_PROMPT, context, 1800)
      return NextResponse.json(parseAIJson(result))
    } catch {
      // AI unavailable — pick closest static mirror based on keyword matching
      const lower = situation.toLowerCase()
      const mirror = FALLBACK_MIRRORS.find(m =>
        lower.includes('late') || lower.includes('morning') ? m.current_pattern.includes('late') :
        lower.includes('idea') || lower.includes('start') ? m.current_pattern.includes('ideas') :
        lower.includes('task') || lower.includes('head') ? m.current_pattern.includes('head') :
        lower.includes('message') || lower.includes('react') ? m.current_pattern.includes('overthink') :
        lower.includes('prove') || lower.includes('everything') ? m.current_pattern.includes('prove') :
        lower.includes('behind') || lower.includes('further') ? m.current_pattern.includes('behind') :
        false
      ) ?? FALLBACK_MIRRORS[Math.floor(Math.random() * FALLBACK_MIRRORS.length)]

      return NextResponse.json({
        reflection: 'I see you. You are not stuck — you are in a moment. Your highest self is not harsher. She is calmer, clearer, and more selective.',
        current_pattern: mirror.current_pattern,
        current_description: mirror.current_description,
        highest_self_action: mirror.highest_self_action,
        bridge_step: mirror.bridge_step,
        chart_connection: mirror.chart_connection,
        affirmation: 'I am becoming the woman I see in my future — through softness, not force.',
        closing: 'One small move toward your highest self. That is all today asks.',
      })
    }
  } catch (err) {
    console.error('Highest self error:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
