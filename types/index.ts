export interface Product {
  id: string
  seller_id: string
  category_id?: string
  title: string
  slug: string
  description?: string
  price: number
  compare_price?: number
  sku?: string
  stock_quantity: number
  track_inventory: boolean
  status: 'draft' | 'active' | 'paused' | 'archived'
  images: ProductImage[]
  tags: string[]
  is_digital: boolean
  stripe_price_id?: string
  total_sales: number
  rating?: number
  review_count: number
  created_at: string
  updated_at: string
  seller?: Seller
  category?: Category
}

export interface ProductImage {
  url: string
  alt?: string
  sort_order: number
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  role: 'buyer' | 'seller' | 'admin'
  is_active: boolean
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export interface Seller {
  id: string
  user_id: string
  shop_name: string
  shop_slug: string
  description?: string
  logo_url?: string
  banner_url?: string
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  commission_rate: number
  stripe_account_id?: string
  subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise'
  total_sales: number
  total_orders: number
  rating?: number
  review_count: number
  created_at: string
  profile?: Profile
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  sort_order: number
  is_active: boolean
}

export interface Order {
  id: string
  order_number: string
  buyer_id: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  shipping_amount: number
  tax_amount: number
  platform_fee: number
  total_amount: number
  currency: string
  shipping_address?: Address
  billing_address?: Address
  paid_at?: string
  created_at: string
  buyer?: Profile
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  seller_id: string
  quantity: number
  unit_price: number
  total_price: number
  commission_rate: number
  commission_amount: number
  seller_payout: number
  product_snapshot?: Record<string, unknown>
  product?: Product
  seller?: Seller
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

export interface Invoice {
  id: string
  invoice_number: string
  order_id?: string
  buyer_id: string
  seller_id?: string
  amount: number
  tax_amount: number
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'void'
  stripe_invoice_url?: string
  stripe_invoice_pdf?: string
  due_date?: string
  paid_at?: string
  created_at: string
}

export interface AdminStats {
  totalRevenue: number
  revenueGrowth: number
  totalOrders: number
  ordersGrowth: number
  totalUsers: number
  usersGrowth: number
  activeSellers: number
  sellersGrowth: number
  platformFees: number
  feesGrowth: number
  pendingSellers: number
  pendingProducts: number
}

export interface ChartData {
  date: string
  revenue: number
  orders: number
  users: number
}

export interface SubscriptionTier {
  id: string
  name: string
  plan: string
  price_monthly: number
  price_yearly: number
  stripe_price_monthly?: string
  stripe_price_yearly?: string
  product_limit?: number
  commission_rate: number
  features: string[]
  is_active: boolean
}
