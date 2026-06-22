import { Navbar } from '@/components/shared/navbar'

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      <footer className="border-t bg-white mt-16">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">CLARE</h3>
              <p className="mt-2 text-sm text-gray-500">The marketplace for everything.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
              <ul className="mt-2 space-y-1">
                <li><a href="/products" className="text-sm text-gray-500 hover:text-gray-900">All Products</a></li>
                <li><a href="/sellers" className="text-sm text-gray-500 hover:text-gray-900">Find Sellers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Sell</h3>
              <ul className="mt-2 space-y-1">
                <li><a href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Seller Plans</a></li>
                <li><a href="/seller/onboarding" className="text-sm text-gray-500 hover:text-gray-900">Start Selling</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Help</h3>
              <ul className="mt-2 space-y-1">
                <li><a href="/help" className="text-sm text-gray-500 hover:text-gray-900">Help Center</a></li>
                <li><a href="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} CLARE Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
