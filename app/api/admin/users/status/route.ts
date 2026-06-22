import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/auth'

export async function PATCH(req: Request) {
  try {
    await requireAdmin()
    const { userId, is_active } = await req.json()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('profiles').update({ is_active }).eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabase.from('audit_logs').insert({ action: is_active ? 'user.activate' : 'user.suspend', table_name: 'profiles', record_id: userId })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
