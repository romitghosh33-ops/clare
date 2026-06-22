import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/auth'

export async function PATCH(req: Request) {
  try {
    await requireAdmin()
    const { orderId, status } = await req.json()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabase.from('audit_logs').insert({ action: `order.${status}`, table_name: 'orders', record_id: orderId, new_data: { status } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
