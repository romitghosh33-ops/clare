'use client'
import { useRouter } from 'next/navigation'

export function ProductStatusUpdate({ productId, currentStatus }: { productId: string; currentStatus: string }) {
  const router = useRouter()
  const update = async (status: string) => {
    await fetch('/api/admin/products/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, status }),
    })
    router.refresh()
  }
  return (
    <select defaultValue={currentStatus} onChange={e => update(e.target.value)}
      className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
      {['active', 'draft', 'paused', 'archived'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
    </select>
  )
}
