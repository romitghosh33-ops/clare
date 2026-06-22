'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export function OrderStatusUpdate({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const update = async (status: string) => {
    if (status === currentStatus) return
    setLoading(true)
    await fetch('/api/admin/orders/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={e => update(e.target.value)}
      disabled={loading}
      className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
    >
      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
    </select>
  )
}
