import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI, STYLE_INSPIRATION_ANALYSIS_PROMPT, parseAIJson } from '@/lib/ai'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('style_references')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ references: data ?? [] })
  } catch (err) {
    console.error('Inspiration GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch references' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { image_url, source, user_notes, description, analyze, is_preloaded, ref_number } = await request.json()

    if (!image_url) return NextResponse.json({ error: 'image_url required' }, { status: 400 })

    let analysis = null
    if (analyze && (description || user_notes)) {
      const result = await callAI(
        STYLE_INSPIRATION_ANALYSIS_PROMPT,
        `Analyze this style reference for Zoe.\n\nDescription: ${description ?? ''}\nUser notes: ${user_notes ?? ''}\nSource: ${source ?? 'unknown'}`,
        1000
      )
      analysis = parseAIJson(result)
    }

    const toInsert = {
      user_id: user.id,
      image_url,
      source: source ?? null,
      user_notes: user_notes ?? null,
      is_preloaded: is_preloaded ?? false,
      ref_number: ref_number ?? null,
      extracted_style_lane:  analysis ? (analysis as { style_lane?: string }).style_lane : null,
      extracted_colors:      analysis ? (analysis as { extracted_colors?: string[] }).extracted_colors : null,
      extracted_silhouette:  analysis ? (analysis as { extracted_silhouette?: string }).extracted_silhouette : null,
      extracted_accessories: analysis ? (analysis as { accessories?: string[] }).accessories : null,
      extracted_notes:       analysis ? (analysis as { zoe_translation?: string }).zoe_translation : null,
    }

    const { data, error } = await supabase.from('style_references').insert(toInsert).select().single()
    if (error) throw error

    return NextResponse.json({ reference: data, analysis })
  } catch (err) {
    console.error('Inspiration POST error:', err)
    return NextResponse.json({ error: 'Failed to save reference' }, { status: 500 })
  }
}
