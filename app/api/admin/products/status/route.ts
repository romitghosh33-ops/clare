import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/auth'

export async function PATCH(req: Request) {
  try {
    await requireAdmin()
    const { productId, status } = await req.json()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('products').update({ status }).eq('id', productId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabase.from('audit_logs').insert({ action: `product.${status}`, table_name: 'products', record_id: productId, new_data: { status } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
