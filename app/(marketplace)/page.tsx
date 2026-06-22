import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shared/product-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck, Truck, Star, Tag } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, seller:sellers(id, shop_name, shop_slug), category:categories(id, name, slug)')
    .eq('status', 'active')
    .order('total_sales', { ascending: false })
    .limit(8)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    .limit(8)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Everything you need,<br />from sellers you trust.
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-xl mx-auto">
            CLARE connects buyers with verified sellers across thousands of categories. 
            Discover unique products or start your own shop today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold">
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/seller/onboarding">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b py-6">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, label: 'Secure Payments', sub: 'Protected by Stripe' },
            { icon: Truck, label: 'Fast Shipping', sub: 'From verified sellers' },
            { icon: Star, label: 'Trusted Sellers', sub: 'All sellers are vetted' },
            { icon: Tag, label: 'Best Prices', sub: 'Competitive marketplace' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-12 px-4">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center p-4 rounded-xl border bg-white hover:border-primary hover:siØdow-sm transition-all text-center"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 mb-2 flex items-center justify-center">
                    <Tag className="h-6 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 line-clamp-2">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
              <Link href="/products" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA â€” Sell on CLARE */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start selling?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of sellers on CLARE. Set up your shop in minutes, reach millions of buyers, and grow your business.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              See Seller Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
