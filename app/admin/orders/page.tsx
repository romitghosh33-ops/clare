import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate, orderStatusColor } from '@/lib/utils'
import Link from 'next/link'
import { OrderStatusUpdate } from './order-status-update'

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string; q?: string; page?: string } }) {
  await requireAdmin()
  const supabase = await createAdminClient()
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 25
  const from = (page - 1) * perPage

  let query = supabase
    .from('orders')
    .select('*, buyer:profiles(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.q) query = query.ilike('order_number', `%${searchParams.q}%`)

  const { data: orders, count } = await query

  const statuses = ['', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{count ?? 0} total orders</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border bg-white p-1">
          {statuses.map(s => (
            <a
              key={s}
              href={`/admin/orders${s ? `?status=${s}` : ''}`}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                (searchParams.status ?? '') === s ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s || 'All'}
            </a>
          ))}
        </div>
        <form className="ml-auto">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search order number..."
            className="rounded-md border px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders ?? []).map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{order.buyer?.full_name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{order.buyer?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatCurrency(order.subtotal)}</TableCell>
                  <TableCell className="text-green-600 text-sm font-medium">{formatCurrency(order.platform_fee)}</TableCell>
                  <TableCell className="font-bold text-sm">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${orderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!orders || orders.length === 0) && (
            <p className="text-center text-gray-400 py-8 text-sm">No orders found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
