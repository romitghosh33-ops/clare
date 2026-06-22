import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SellerPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 mx-auto mb-6">
          <Clock className="h-10 w-10 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Your application is under review</h1>
        <p className="text-gray-500 mb-6">
          Our team is reviewing your seller application. This usually takes less than 24 hours.
          We'll email you once you're approved and ready to start selling.
        </p>
        <Link href="/"><Button variant="outline">Back to Marketplace</Button></Link>
      </div>
    </div>
  )
}
