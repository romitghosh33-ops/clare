'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, Store } from 'lucide-react'

export default function SellerOnboardingPage() {
  const [form, setForm] = useState({ shop_name: '', shop_slug: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('sellers').insert({
      user_id: user.id,
      shop_name: form.shop_name,
      shop_slug: form.shop_slug,
      description: form.description,
      status: 'pending',
    })

    if (error) {
      setError(error.message.includes('unique') ? 'That shop name or URL is already taken.' : error.message)
      setLoading(false)
      return
    }

    await supabase.from('profiles').update({ role: 'seller' }).eq('id', user.id)
    router.push('/seller/pending')
  }

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Open your shop on CLARE</h1>
          <p className="text-gray-500 mt-2 text-sm">Tell us about your shop. Our team will review and approve within 24 hours.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Shop Details</CardTitle>
            <CardDescription>This is how buyers will find and recognise your shop.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="shop_name">Shop Name *</Label>
                <Input
                  id="shop_name"
                  value={form.shop_name}
                  onChange={e => {
                    const name = e.target.value
                    setForm(f => ({ ...f, shop_name: name, shop_slug: generateSlug(name) }))
                  }}
                  placeholder="e.g. Jane's Handmade Goods"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="shop_slug">Shop URL *</Label>
                <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-primary overflow-hidden">
                  <span className="px-3 py-2 bg-gray-50 text-sm text-gray-400 border-r">clare.com/sellers/</span>
                  <input
                    id="shop_slug"
                    value={form.shop_slug}
                    onChange={e => setForm(f => ({ ...f, shop_slug: generateSlug(e.target.value) }))}
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                    placeholder="janes-handmade-goods"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Shop Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell buyers what makes your shop unique..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Review
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
