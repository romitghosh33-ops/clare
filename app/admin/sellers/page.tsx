import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, sellerStatusColor } from '@/lib/utils'
import Link from 'next/link'
import { SellerActions } from './seller-actions'

export default async function AdminSellersPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  await requireAdmin()
  const supabase = await createAdminClient()

  let query = supabase
    .from('sellers')
    .select('*, profile:profiles(full_name, email, created_at)')
    .order('created_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.q) query = query.ilike('shop_name', `%${searchParams.q}%`)

  const { data: sellers } = await query

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Rejected', value: 'rejected' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
        <p className="text-gray-500 text-sm mt-1">Manage seller accounts and applications</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg border bg-white p-1">
          {statusTabs.map(tab => (
            <a
              key={tab.value}
              href={`/admin/sellers${tab.value ? `?status=${tab.value}` : ''}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                (searchParams.status ?? '') === tab.value
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
        <form className="ml-auto">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search shop name..."
            className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sellers ?? []).map((seller: any) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div>
                      <Link href={`/admin/sellers/${seller.id}`} className="font-medium text-primary hover:underline text-sm">
                        {seller.shop_name}
                      </Link>
                      <p className="text-xs text-gray-400">/{seller.shop_slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{seller.profile?.full_name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{seller.profile?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-sm">{seller.subscription_plan}</TableCell>
                  <TableCell className="font-medium text-sm">{formatCurrency(seller.total_sales)}</TableCell>
                  <TableCell className="text-sm">{seller.total_orders}</TableCell>
                  <TableCell className="text-sm">{seller.commission_rate}%</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${sellerStatusColor(seller.status)}`}>
                      {seller.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{formatDate(seller.created_at)}</TableCell>
                  <TableCell>
                    <SellerActions sellerId={seller.id} status={seller.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!sellers || sellers.length === 0) && (
            <p className="text-center text-gray-400 py-8 text-sm">No sellers found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
