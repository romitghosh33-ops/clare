'use client'
import { useState } from 'react'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AddToCartButton({ product }: { product: any }) {
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?redirect=' + window.location.pathname); return }

    const { error } = await supabase.from('cart_items').upsert({
      user_id: user.id,
      product_id: product.id,
      quantity: 1,
    }, { onConflict: 'user_id,product_id', ignoreDuplicates: false })

    if (!error) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-3">
      <Button
        size="lg"
        className="flex-1"
        onClick={handleAdd}
        disabled={loading || product.stock_quantity === 0}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        {added ? 'Added!' : 'Add to Cart'}
      </Button>
      <Button size="lg" variant="outline" onClick={() => router.push('/checkout')}>Buy Now</Button>
    </div>
  )
}
