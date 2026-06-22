import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shared/product-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SearchParams { category?: string; q?: string; sort?: string; page?: string }

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 24
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('products')
    .select('*, seller:sellers(id, shop_name, shop_slug), category:categories(id, name, slug)', { count: 'exact' })
    .eq('status', 'active')
    .range(from, to)

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', searchParams.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (searchParams.sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (searchParams.sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (searchParams.sort === 'newest') query = query.order('created_at', { ascending: false })
  else query = query.order('total_sales', { ascending: false })

  const { data: products, count } = await query
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')

  const totalPages = Math.ceil((count ?? 0) / perPage)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <a href="/products" className="block rounded px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50">All Categories</a>
              </li>
              {categories?.map(cat => (
                <li key={cat.id}>
                  <a
                    href={`/products?category=${cat.slug}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
                    className={`block rounded px-2 py-1.5 text-sm transition-colors ${
                      searchParams.category === cat.slug
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {count ?? 0} products{searchParams.q ? ` for "${searchParams.q}"` : ''}
            </p>
            <form>
              <select
                name="sort"
                defaultValue={searchParams.sort ?? 'popular'}
                className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('sort', e.target.value)
                  window.location.href = url.toString()
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </form>
          </div>

          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <a
                      key={p}
                      href={`?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        p === page ? 'bg-primary text-white' : 'border hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400 rounded-lg border border-dashed">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
