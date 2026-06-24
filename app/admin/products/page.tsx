import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { ProductStatusUpdate } from './product-status-update'

export default async function AdminProductsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  await requireAdmin()
  const supabase = await createAdminClient()

  let query = supabase
    .from('products')
    .select('*, seller:sellers(shop_name), category:categories(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)

  const { data: products } = await query

  const statuses = ['', 'active', 'draft', 'paused', 'archived']
  const statusColor: { [key: string]: string } = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-700',
    paused: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 text-sm mt-1">Moderate all marketplace products</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg border bg-white p-1">
          {statuses.map(s => (
            <a
              key={s}
              href={`/admin/products${s ? `?status=${s}` : ''}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                (searchParams.status ?? '') === s ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s || 'All'}
            </a>
          ))}
        </div>
        <form className="ml-auto">
          <input name="q" defaultValue={searchParams.q} placeholder="Search product title..."
            className="rounded-md border px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary" />
          {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Listed</TableHead>
                <TableHead>Moderate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products ?? []).map((p: any) => {
                const img = p.images?.[0]
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative h-9 w-9 rounded bg-gray-100 overflow-hidden shrink-0">
                          {img ? <Image src={img.url} alt={p.title} fill className="object-cover" /> : <Package className="h-5 w-5 text-gray-300 m-2" />}
                        </div>
                        <span className="font-medium text-sm line-clamp-1 max-w-[180px]">{p.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{p.seller?.shop_name ?? '—'}</TableCell>
                    <TableCell className="text-sm text-gray-500">{p.category?.name ?? '—'}</TableCell>
                    <TableCell className="font-medium text-sm">{formatCurrency(p.price)}</TableCell>
                    <TableCell className="text-sm">{p.track_inventory ? p.stock_quantity : '∞'}</TableCell>
                    <TableCell className="text-sm">{p.total_sales}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[p.status]}`}>
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDate(p.created_at)}</TableCell>
                    <TableCell>
                      <ProductStatusUpdate productId={p.id} currentStatus={p.status} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {(!products || products.length === 0) && <p className="text-center text-gray-400 py-8 text-sm">No products found.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
