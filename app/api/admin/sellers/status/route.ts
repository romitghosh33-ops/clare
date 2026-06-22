import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/auth'

export async function PATCH(req: Request) {
  try {
    await requireAdmin()
    const { sellerId, status } = await req.json()
    if (!sellerId || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const supabase = await createAdminClient()
    const update: Record<string, unknown> = { status }
    if (status === 'approved') update.approved_at = new Date().toISOString()
    const { error } = await supabase.from('sellers').update(update).eq('id', sellerId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabase.from('audit_logs').insert({ action: `seller.${status}`, table_name: 'sellers', record_id: sellerId, new_data: { status } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
