import { requireSeller } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Plus } from 'lucide-react'

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  paused: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-red-100 text-red-800',
}

export default async function SellerProductsPage() {
  const { seller } = await requireSeller()
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/seller/products/new"><Button><Plus className="h-4 w-4 mr-1" /> Add Product</Button></Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p: any) => {
                  const img = p.images?.[0]
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded bg-gray-100 overflow-hidden shrink-0">
                            {img ? <Image src={img.url} alt={p.title} fill className="object-cover" /> : <Package className="h-6 w-6 text-gray-300 m-2" />}
                          </div>
                          <span className="font-medium text-sm line-clamp-1 max-w-[200px]">{p.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{p.category?.name ?? '—'}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(p.price)}</TableCell>
                      <TableCell>
                        <span className={p.stock_quantity === 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                          {p.track_inventory ? p.stock_quantity : '∞'}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{p.total_sales}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[p.status]}`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/seller/products/${p.id}/edit`} className="text-xs text-primary hover:underline">Edit</Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package className="h-12 w-12 mb-3" />
              <p className="font-medium">No products yet</p>
              <p className="text-sm mt-1">Add your first product to start selling</p>
              <Link href="/seller/products/new" className="mt-4">
                <Button><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
