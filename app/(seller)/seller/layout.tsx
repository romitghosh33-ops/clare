import { requireSeller } from '@/lib/supabase/auth'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Settings, Tag } from 'lucide-react'

const navItems = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/seller/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/seller/settings', label: 'Settings', icon: Settings },
]

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const { seller } = await requireSeller()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-white border-r flex flex-col shadow-sm">
        <div className="flex h-16 items-center px-5 border-b gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Tag className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 truncate">{seller.shop_name}</p>
            <p className="text-xs text-gray-400 capitalize">{seller.subscription_plan} plan</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors">
            ← Back to Marketplace
          </Link>
        </div>
      </aside>
      <div className="flex-1 ml-60">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
