import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const image = product.images?.[0]
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <div className="group rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-gray-100">
          {image ? (
            <Image src={image.url} alt={image.alt ?? product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0">-{discount}%</Badge>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-medium text-sm">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors">{product.title}</h3>
        </Link>
        {product.seller && (
          <Link href={`/sellers/${product.seller.shop_slug}`} className="text-xs text-gray-500 hover:text-primary mt-0.5 block">
            {product.seller.shop_name}
          </Link>
        )}
        {product.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">{product.rating.toFixed(1)} ({product.review_count})</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
            {product.compare_price && (
              <span className="ml-2 text-sm text-gray-400 line-through">{formatCurrency(product.compare_price)}</span>
            )}
          </div>
          {onAddToCart && (
            <Button
              size="sm"
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
