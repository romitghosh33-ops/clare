import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ShoppingBag, Users, Store, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate, orderStatusColor } from '@/lib/utils'
import Link from 'next/link'
import { RevenueChart } from './revenue-chart'

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    { data: totalRevData },
    { data: monthRevData },
    { count: totalOrders },
    { count: monthOrders },
    { count: totalUsers },
    { count: monthUsers },
    { count: activeSellers },
    { count: pendingSellers },
    { data: recentOrders },
    { data: revenueByDay },
  ] = await Promise.all([
    supabase.from('orders').select('total_amount').eq('status', 'paid'),
    supabase.from('orders').select('total_amount').eq('status', 'paid').gte('created_at', startOfMonth),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth).neq('role', 'admin'),
    supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*, buyer:profiles(full_name, email), items:order_items(count)').order('created_at', { ascending: false }).limit(8),
    supabase.from('orders').select('created_at, total_amount, platform_fee').eq('status', 'paid').gte('created_at', new Date(now.setDate(now.getDate() - 30)).toISOString()),
  ])

  const totalRevenue = (totalRevData ?? []).reduce((s: number, o: any) => s + Number(o.total_amount), 0)
  const monthRevenue = (monthRevData ?? []).reduce((s: number, o: any) => s + Number(o.total_amount), 0)

  // Aggregate revenue by day for chart
  const chartData = (() => {
    const map: Record<string, { revenue: number; orders: number; fees: number }> = {}
    ;(revenueByDay ?? []).forEach((o: any) => {
      const day = o.created_at.slice(0, 10)
      if (!map[day]) map[day] = { revenue: 0, orders: 0, fees: 0 }
      map[day].revenue += Number(o.total_amount)
      map[day].orders += 1
      map[day].fees += Number(o.platform_fee)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ date, ...d }))
  })()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview — all metrics are live</p>
      </div>

      {/* Alerts */}
      {(pendingSellers ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-yellow-600" />
          <span><strong>{pendingSellers}</strong> seller application{(pendingSellers ?? 0) > 1 ? 's' : ''} waiting for review.</span>
          <Link href="/admin/sellers?status=pending" className="ml-auto font-medium underline text-yellow-700">Review now</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard title="This Month" value={formatCurrency(monthRevenue)} icon={TrendingUp} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard title="Total Orders" value={String(totalOrders ?? 0)} icon={ShoppingBag} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard title="Total Users" value={String(totalUsers ?? 0)} icon={Users} iconBg="bg-orange-100" iconColor="text-orange-600" />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue ℔ Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recentOrders ?? []).map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{order.buyer?.full_name ?? order.buyer?.email ?? '—'}</TableCell>
                  <TableCell className="text-sm text-gray-500">{order.items?.[0]?.count ?? 0}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell className="text-green-600 font-medium">{formatCurrency(order.platform_fee)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${orderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{formatDate(order.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
