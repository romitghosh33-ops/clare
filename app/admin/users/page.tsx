import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { UserStatusToggle } from './user-status-toggle'

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string; role?: string } }) {
  await requireAdmin()
  const supabase = await createAdminClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (searchParams.q) query = query.or(`email.ilike.%${searchParams.q}%,full_name.ilike.%${searchParams.q}%`)
  if (searchParams.role) query = query.eq('role', searchParams.role)

  const { data: users } = await query

  const roleColor: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    seller: 'bg-blue-100 text-blue-800',
    buyer: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all platform users</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg border bg-white p-1">
          {['', 'buyer', 'seller', 'admin'].map(role => (
            <a
              key={role}
              href={`/admin/users${role ? `?role=${role}` : ''}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                (searchParams.role ?? '') === role ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {role || 'All'}
            </a>
          ))}
        </div>
        <form className="ml-auto">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search by name or email..."
            className="rounded-md border px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchParams.role && <input type="hidden" name="role" value={searchParams.role} />}
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users ?? []).map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                        {(user.full_name ?? user.email)?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{user.full_name ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleColor[user.role]}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-400">
                    {user.stripe_customer_id ? user.stripe_customer_id.slice(0, 12) + '...' : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <UserStatusToggle userId={user.id} isActive={user.is_active} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!users || users.length === 0) && (
            <p className="text-center text-gray-400 py-8 text-sm">No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
