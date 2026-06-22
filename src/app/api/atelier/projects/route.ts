import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const STARTER_PROJECTS = [
  { title: 'Crop an oversized jersey', project_type: 'crop', skill_level: 'beginner', estimated_time: '30 min', style_lane: 'Jersey Siren', is_starter: true, sort_order: 1,
    description: 'Take any oversized jersey or tee and crop it to hit just above the navel. No pattern needed.', materials_needed: ['oversized jersey or tee', 'fabric scissors', 'chalk or marker', 'ruler'] },
  { title: 'Add lace or scarf detail to pants', project_type: 'embellish', skill_level: 'beginner', estimated_time: '45 min', style_lane: 'Soft Grunge Fairy', is_starter: true, sort_order: 2,
    description: 'Sew or safety-pin a lace trim or scarf along a waistband, hem, or side seam.', materials_needed: ['lace trim or scarf', 'thread', 'pins'] },
  { title: 'Make a bandana halter top', project_type: 'new_piece', skill_level: 'beginner', estimated_time: '20 min', style_lane: 'LUNA Street Fairy', is_starter: true, sort_order: 3,
    description: 'Fold a large bandana into a triangle, tie around neck, and tie behind the back. Optional: sew ties for a cleaner finish.', materials_needed: ['large bandana or scarf', 'thread (optional)'] },
  { title: 'Add chain or belt loops to cargos', project_type: 'embellish', skill_level: 'beginner', estimated_time: '1 hour', style_lane: 'Street Oracle', is_starter: true, sort_order: 4,
    description: 'Sew extra belt loops onto the sides of cargos so a chain belt sits lower for that low-rise hip look.', materials_needed: ['cargos', 'matching thread', 'chain belt or fabric strip', 'sewing machine'] },
  { title: 'Customize a bikini top', project_type: 'swimwear', skill_level: 'beginner', estimated_time: '1–2 hours', style_lane: 'Resort Street', is_starter: true, sort_order: 5,
    description: 'Add crystals, charms, or a scarf tie to an existing bikini top. Or alter the straps for a new shape.', materials_needed: ['basic bikini top', 'crystals', 'fabric glue or thread', 'charms or chain'] },
  { title: 'Simple tie-front top', project_type: 'new_piece', skill_level: 'beginner', estimated_time: '1.5 hours', style_lane: 'LUNA Street Fairy', is_starter: true, sort_order: 6,
    description: 'Cut a rectangle of jersey or stretchy fabric, hem the edges, and cut ties at the center front to tie at the waist.', materials_needed: ['jersey fabric (¼ yard)', 'fabric scissors', 'sewing machine', 'thread'] },
  { title: 'Alter waist on a thrifted piece', project_type: 'alter', skill_level: 'beginner', estimated_time: '45 min', style_lane: 'Dark Founder', is_starter: true, sort_order: 7,
    description: 'Take in or let out a waistband to create a lower, looser, or more fitted look. Great for thrift-store pants.', materials_needed: ['thrifted pants or skirt', 'seam ripper', 'thread', 'sewing machine'] },
]

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('sewing_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ projects: data ?? [] })
  } catch (err) {
    console.error('Projects GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    if (body.seed_starters) {
      const toInsert = STARTER_PROJECTS.map(p => ({ ...p, user_id: user.id, status: 'idea' }))
      const { data, error } = await supabase.from('sewing_projects').insert(toInsert).select()
      if (error) throw error
      return NextResponse.json({ projects: data })
    }

    const { data, error } = await supabase
      .from('sewing_projects')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ project: data })
  } catch (err) {
    console.error('Projects POST error:', err)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, ...updates } = await request.json()
    if (!id) return NextResponse.json({ error: 'Project ID required' }, { status: 400 })

    const { data, error } = await supabase
      .from('sewing_projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ project: data })
  } catch (err) {
    console.error('Projects PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}
