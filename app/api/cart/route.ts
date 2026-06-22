import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ items: [] })

  const { data } = await supabase
    .from('cart_items')
    .select('*, product:products(*, seller:sellers(shop_name, shop_slug))')
    .eq('user_id', user.id)

  return NextResponse.json({ items: data ?? [] })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId } = await req.json()
  await supabase.from('cart_items').delete().eq('id', itemId).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
