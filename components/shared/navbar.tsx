'use client'
import Link from 'next/link'
import { ShoppingCart, Search, User, Package, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Profile } from '@/types'

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      const { count } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setCartCount(count ?? 0)
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-primary">CLARE</Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">Shop</Link>
              <Link href="/sellers" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sellers</Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sell on CLARE</Link>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-full border bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {profile ? (
              <div className="flex items-center gap-2">
                {profile.role === 'seller' && (
                  <Link href="/seller/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 rounded-full border p-1.5 hover:bg-gray-50">
                    <User className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500">{profile.email}</div>
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50">My Account</Link>
                      <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-gray-50">Orders</Link>
                      {profile.role === 'admin' && (
                        <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-primary hover:bg-gray-50">Admin Panel</Link>
                      )}
                      <button onClick={handleSignOut} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link href="/register"><Button size="sm">Get Started</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
