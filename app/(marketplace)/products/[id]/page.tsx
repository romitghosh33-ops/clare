import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Store, Package, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddToCartButton } from './add-to-cart-button'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, seller:sellers(*, profile:profiles(full_name, avatar_url)), category:categories(*)')
    .eq('id', params.id)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles(full_name, avatar_url)')
    .eq('product_id', product.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(10)

  const images: any[] = product.images ?? []
  const mainImage = images[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            {mainImage ? (
              <Image src={mainImage.url} alt={mainImage.alt ?? product.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <Package className="h-24 w-24" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img: any, i: number) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={img.url} alt={img.alt ?? product.title} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link href={`/products?category=${product.category.slug}`} className="text-sm text-primary hover:underline">
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.title}</h1>

          {product.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.rating.toFixed(1)} ({product.review_count} reviews)</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
            {product.compare_price && (
              <span className="text-lg text-gray-400 line-through">{formatCurrency(product.compare_price)}</span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              {product.stock_quantity > 0
                ? <span className="text-green-600 font-medium">{product.stock_quantity} in stock</span>
                : <span className="text-red-600 font-medium">Out of stock</span>
              }
            </div>
            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
          </div>

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-6 rounded-lg border p-4 space-y-3 bg-gray-50">
            {[
              { icon: Shield, text: 'Secure checkout powered by Stripe' },
              { icon: Package, text: 'Ships within 2-5 business days' },
              { icon: Store, text: 'Sold by a verified CLARE seller' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                <Icon className="h-4 w-4 text-primary" />
                {text}
              </div>
            ))}
          </div>

          {/* Seller */}
          {product.seller && (
            <div className="mt-6 rounded-lg border p-4">
              <p className="text-xs text-gray-500 mb-2">Sold by</p>
              <Link href={`/sellers/${product.seller.shop_slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {product.seller.shop_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{product.seller.shop_name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {product.seller.rating && <><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{product.seller.rating.toFixed(1)}</>}
                    <span>· {product.seller.total_orders} sales</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {(review.reviewer?.full_name ?? 'A')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.reviewer?.full_name ?? 'Anonymous'}</p>
                      <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                {review.body && <p className="text-sm text-gray-600">{review.body}</p>}
                {review.is_verified && <Badge variant="success" className="mt-2 text-xs">Verified Purchase</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
