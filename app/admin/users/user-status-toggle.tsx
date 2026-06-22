'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function UserStatusToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toggle = async () => {
    setLoading(true)
    await fetch('/api/admin/users/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, is_active: !isActive }),
    })
    setLoading(false)
    router.refresh()
  }
  return (
    <Button size="sm" variant="outline" onClick={toggle} disabled={loading}
      className={`text-xs h-7 px-2 ${isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
    >
      {isActive ? 'Suspend' : 'Activate'}
    </Button>
  )
}
