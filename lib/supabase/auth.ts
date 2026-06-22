import { createClient } from './server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== 'admin') redirect('/admin/login?error=unauthorized')
  return profile
}

export async function requireSeller() {
  const supabase = await createClient()
  const user = await requireAuth()
  const { data: seller } = await supabase
    .from('sellers')
    .select('*')
    .eq('user_id', user.id)
    .single()
  if (!seller || seller.status !== 'approved') redirect('/seller/onboarding')
  return { user, seller }
}
