import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, CreditCard, FileText, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminBillingPage() {
  await requireAdmin()
  const supabase = await createAdminClient()

  const [
    { data: paidOrders },
    { data: invoices },
    { data: subscriptions },
    { data: payouts },
  ] = await Promise.all([
    supabase.from('orders').select('total_amount, platform_fee, created_at').eq('status', 'paid').order('created_at', { ascending: false }).limit(50),
    supabase.from('invoices').select('*, buyer:profiles(full_name, email)').order('created_at', { ascending: false }).limit(25),
    supabase.from('sellers').select('subscription_plan, subscription_status').not('subscription_plan', 'eq', 'free'),
    supabase.from('payouts').select('*, seller:sellers(shop_name)').order('created_at', { ascending: false }).limit(25),
  ])

  const totalRevenue = (paidOrders ?? []).reduce((s: number, o: any) => s + Number(o.total_amount), 0)
  const totalFees = (paidOrders ?? []).reduce((s: number, o: any) => s + Number(o.platform_fee), 0)
  const activeSubscriptions = (subscriptions ?? []).filter((s: any) => s.subscription_status === 'active').length

  const payoutStatusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Finance</h1>
        <p className="text-gray-500 text-sm mt-1">Revenue, payouts, invoices, and subscriptions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total GMV" value={formatCurrency(totalRevenue)} icon={DollarSign} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard title="Platform Fees" value={formatCurrency(totalFees)} icon={TrendingUp} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard title="Active Subscriptions" value={String(activeSubscriptions)} icon={CreditCard} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard title="Total Invoices" value={String(invoices?.length ?? 0)} icon={FileText} iconBg="bg-orange-100" iconColor="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoices ?? []).map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                    <TableCell className="text-sm">{inv.buyer?.full_name ?? inv.buyer?.email ?? '—'}</TableCell>
                    <TableCell className="font-medium text-sm">{formatCurrency(inv.total_amount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                        inv.status === 'void' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{inv.status}</span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDate(inv.created_at)}</TableCell>
                  </TableRow>
                ))}
                {(!invoices || invoices.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-6 text-sm">No invoices yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Seller Payouts</CardTitle>
            <button className="text-sm text-primary hover:underline">Run Payouts</button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payouts ?? []).map((payout: any) => (
                  <TableRow key={payout.id}>
                    <TableCell className="text-sm font-medium">{payout.seller?.shop_name ?? '—'}</TableCell>
                    <TableCell className="font-medium text-sm">{formatCurrency(payout.amount)}</TableCell>
                    <TableCell className="text-xs text-gray-500">{payout.period_start} → {payout.period_end}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${payoutStatusColor[payout.status]}`}>
                        {payout.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!payouts || payouts.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center text-gray-400 py-6 text-sm">No payouts yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Subscription breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Seller Subscription Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['free', 'starter', 'pro', 'enterprise'].map(plan => {
              const count = (subscriptions ?? []).filter((s: any) => s.subscription_plan === plan).length
              return (
                <div key={plan} className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm font-medium capitalize text-gray-600 mt-1">{plan}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
