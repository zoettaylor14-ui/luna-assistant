import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VAULT_SEED = [
  { brand_name: 'Soluna Swim', concept: 'Crystal Swimwear Line', category: 'swimwear',
    description: 'One-of-a-kind crystal bathing suits. Goddess-themed, mystic, sexy Brazilian-style fit with designer fashion feel.',
    style_notes: 'Waterproof crystals. Bulk/wholesale sourcing. Luxury + minimalist + tropical + flirty + empowered.',
    product_ideas: [
      { name: 'The Havana', description: 'Dragon scale print, cross-back, cheeky one-piece Brazilian bikini with premium stitching and detail' },
      { name: 'Pink Shimmer Set', description: 'Pink shimmer cheetah print bikini set' },
      { name: 'Crystal Triangle', description: 'Classic triangle top adorned with crystals along the ties and center' },
    ], status: 'vault', sort_order: 1 },
  { brand_name: 'Euphoria Swim', concept: 'Euphoric Crystal Swim', category: 'swimwear',
    description: 'A sister brand to Soluna — more fashion-forward, edgier. Art-meets-swimwear.', style_notes: 'Crystal embellishment, oversized hardware, fashion-show aesthetic.',
    product_ideas: [], status: 'vault', sort_order: 2 },
  { brand_name: 'Maison Sirena', concept: 'Luxury Siren Swim House', category: 'swimwear',
    description: 'A luxury swimwear house with couture energy. Limited runs, premium fabrics, handmade details.', style_notes: 'Designer feel. Premium stitching. Handcrafted crystal placement.',
    product_ideas: [], status: 'vault', sort_order: 3 },
  { brand_name: 'Goddess Wave', concept: 'Spiritual Swim + Resort Wear', category: 'swimwear',
    description: 'Swim + resort cover-up line with goddess/spiritual themes. Lace, gauze, crystal, and natural fiber.',
    style_notes: 'Spiritual symbols. Moon, star, eye motifs. Resort-to-street crossover.',
    product_ideas: [], status: 'vault', sort_order: 4 },
  { brand_name: 'LUNA Street Fairy Collection', concept: 'Custom Handmade Clothing Line', category: 'streetwear',
    description: 'Handmade one-of-a-kind pieces in the LUNA Street Fairy style. Cropped jerseys, lace-insert cargos, tie-front tops, chain-detail pieces.',
    style_notes: 'Sporty + spiritual + siren. Made by Zoe. Limited runs. Custom orders.',
    product_ideas: [
      { name: 'Chain Cargo', description: 'Low-rise cargos with added decorative chain belt loops and crystal charm' },
      { name: 'Fairy Halter', description: 'Handmade lace or bandana halter — tie-front or tie-back' },
      { name: 'Jersey Crop', description: 'Hand-cropped oversized jersey with custom edge finish' },
    ], status: 'vault', sort_order: 5 },
]

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('fashion_vault_concepts')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ concepts: data ?? [] })
  } catch (err) {
    console.error('Vault GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch vault' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    if (body.seed_vault) {
      const toInsert = VAULT_SEED.map(v => ({ ...v, user_id: user.id }))
      const { data, error } = await supabase.from('fashion_vault_concepts').insert(toInsert).select()
      if (error) throw error
      return NextResponse.json({ concepts: data })
    }

    const { data, error } = await supabase
      .from('fashion_vault_concepts')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ concept: data })
  } catch (err) {
    console.error('Vault POST error:', err)
    return NextResponse.json({ error: 'Failed to save concept' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, ...updates } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { data, error } = await supabase
      .from('fashion_vault_concepts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ concept: data })
  } catch (err) {
    console.error('Vault PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update concept' }, { status: 500 })
  }
}
