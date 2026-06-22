import { requireSeller } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, ShoppingBag, Package, Star } from 'lucide-react'
import { formatCurrency, formatDate, orderStatusColor } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SellerDashboard() {
  const { seller } = await requireSeller()
  const supabase = await createClient()

  const { data: recentOrders } = await supabase
    .from('order_items')
    .select('*, order:orders(order_number, status, created_at, buyer:profiles(full_name, email)), product:products(title)')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: activeProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', seller.id)
    .eq('status', 'active')

  const { count: pendingOrders } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', seller.id)
    .in('order.status', ['paid', 'processing'])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {seller.shop_name}</p>
        </div>
        <Link href="/seller/products/new">
          <Button>+ Add Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(seller.total_sales)} icon={DollarSign} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard title="Total Orders" value={String(seller.total_orders)} icon={ShoppingBag} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard title="Active Products" value={String(activeProducts ?? 0)} icon={Package} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard title="Rating" value={seller.rating ? `${seller.rating.toFixed(1)} / 5` : 'No reviews'} icon={Star} iconBg="bg-yellow-100" iconColor="text-yellow-600" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Link href="/seller/orders" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.order?.order_number}</TableCell>
                    <TableCell className="max-w[150px] truncate text-sm">{item.product?.title}</TableCell>
                    <TableCell className="text-sm">{item.order?.buyer?.full_name ?? item.order?.buyer?.email}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.total_price)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusColor(item.order?.status)}`}>
                        {item.order?.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDate(item.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-400 py-8 text-sm">No orders yet. Share your shop to start selling!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
