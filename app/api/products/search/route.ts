import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const limit = parseInt(searchParams.get('limit') ?? '10')

  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, title, price, images, seller:sellers(shop_name)')
    .eq('status', 'active')
    .ilike('title', `%${q}%`)
    .limit(limit)

  return NextResponse.json({ results: data ?? [] })
}
