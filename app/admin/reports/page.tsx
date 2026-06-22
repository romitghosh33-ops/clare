import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ReportsCharts } from './reports-charts'

export default async function AdminReportsPage() {
  await requireAdmin()
  const supabase = await createAdminClient()

  const now = new Date()
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toISOString().slice(0, 7))
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, platform_fee, created_at, status')
    .eq('status', 'paid')
    .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString())

  const { data: topProducts } = await supabase
    .from('products')
    .select('title, total_sales, price, seller:sellers(shop_name)')
    .order('total_sales', { ascending: false })
    .limit(10)

  const { data: topSellers } = await supabase
    .from('sellers')
    .select('shop_name, total_sales, total_orders, commission_rate')
    .eq('status', 'approved')
    .order('total_sales', { ascending: false })
    .limit(10)

  // Build monthly aggregates
  const monthlyData = months.map(month => {
    const monthOrders = (orders ?? []).filter((o: any) => o.created_at.startsWith(month))
    return {
      month,
      revenue: monthOrders.reduce((s: number, o: any) => s + Number(o.total_amount), 0),
      fees: monthOrders.reduce((s: number, o: any) => s + Number(o.platform_fee), 0),
      orders: monthOrders.length,
    }
  })

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
  const totalFees = monthlyData.reduce((s, m) => s + m.fees, 0)
  const totalOrders = monthlyData.reduce((s, m) => s + m.orders, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Platform performance over the last 6 months</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '6-Month Revenue', value: formatCurrency(totalRevenue) },
          { label: '6-Month Platform Fees', value: formatCurrency(totalFees) },
          { label: '6-Month Orders', value: String(totalOrders) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-white p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Monthly Revenue & Orders</CardTitle></CardHeader>
        <CardContent>
          <ReportsCharts data={monthlyData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Top Products by Sales</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(topProducts ?? []).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.seller?.shop_name}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold">{p.total_sales} sold</p>
                    <p className="text-xs text-gray-400">{formatCurrency(p.price)} each</p>
                  </div>
                </div>
              ))}
              {(!topProducts || topProducts.length === 0) && <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Top Sellers by Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(topSellers ?? []).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.shop_name}</p>
                    <p className="text-xs text-gray-400">{s.total_orders} orders · {s.commission_rate}% commission</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-green-600">{formatCurrency(s.total_sales)}</p>
                    <p className="text-xs text-gray-400">platform earns {formatCurrency(s.total_sales * s.commission_rate / 100)}</p>
                  </div>
                </div>
              ))}
              {(!topSellers || topSellers.length === 0) && <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
