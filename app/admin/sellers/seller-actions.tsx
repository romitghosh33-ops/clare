'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SellerActions({ sellerId, status }: { sellerId: string; status: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus)
    await fetch('/api/admin/sellers/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, status: newStatus }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      {status === 'pending' && (
        <>
          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-7 px-2" onClick={() => updateStatus('approved')} disabled={!!loading}>
            {loading === 'approved' ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve'}
          </Button>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-2" onClick={() => updateStatus('rejected')} disabled={!!loading}>
            {loading === 'rejected' ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Reject'}
          </Button>
        </>
      )}
      {status === 'approved' && (
        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-2" onClick={() => updateStatus('suspended')} disabled={!!loading}>
          {loading === 'suspended' ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Suspend'}
        </Button>
      )}
      {(status === 'suspended' || status === 'rejected') && (
        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-7 px-2" onClick={() => updateStatus('approved')} disabled={!!loading}>
          {loading === 'approved' ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Reinstate'}
        </Button>
      )}
    </div>
  )
}
