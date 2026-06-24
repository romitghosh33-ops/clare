export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'buyer' | 'seller' | 'admin'
          is_active: boolean
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'buyer' | 'seller' | 'admin'
          is_active?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'buyer' | 'seller' | 'admin'
          is_active?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          id: string
          user_id: string
          shop_name: string
          shop_slug: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          status: 'pending' | 'approved' | 'suspended' | 'rejected'
          commission_rate: number
          stripe_account_id: string | null
          stripe_account_status: string | null
          subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise'
          subscription_status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid' | null
          stripe_subscription_id: string | null
          total_sales: number
          total_orders: number
          rating: number | null
          review_count: number
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shop_name: string
          shop_slug: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          status?: 'pending' | 'approved' | 'suspended' | 'rejected'
          commission_rate?: number
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          subscription_plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid' | null
          stripe_subscription_id?: string | null
          total_sales?: number
          total_orders?: number
          rating?: number | null
          review_count?: number
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shop_name?: string
          shop_slug?: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          status?: 'pending' | 'approved' | 'suspended' | 'rejected'
          commission_rate?: number
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          subscription_plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid' | null
          stripe_subscription_id?: string | null
          total_sales?: number
          total_orders?: number
          rating?: number | null
          review_count?: number
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'sellers_user_id_fkey'; columns: ['user_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          seller_id: string
          category_id: string | null
          title: string
          slug: string
          description: string | null
          price: number
          compare_price: number | null
          cost_price: number | null
          sku: string | null
          stock_quantity: number
          track_inventory: boolean
          status: 'draft' | 'active' | 'paused' | 'archived'
          images: Json
          tags: string[]
          weight: number | null
          dimensions: Json | null
          is_digital: boolean
          digital_file_url: string | null
          stripe_price_id: string | null
          total_sales: number
          rating: number | null
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: string | null
          title: string
          slug: string
          description?: string | null
          price: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          stock_quantity?: number
          track_inventory?: boolean
          status?: 'draft' | 'active' | 'paused' | 'archived'
          images?: Json
          tags?: string[]
          weight?: number | null
          dimensions?: Json | null
          is_digital?: boolean
          digital_file_url?: string | null
          stripe_price_id?: string | null
          total_sales?: number
          rating?: number | null
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string | null
          title?: string
          slug?: string
          description?: string | null
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          stock_quantity?: number
          track_inventory?: boolean
          status?: 'draft' | 'active' | 'paused' | 'archived'
          images?: Json
          tags?= string[]
          weight?: number | null
          dimensions?: Json | null
          is_digital?: boolean
          digital_file_url?: string | null
          stripe_price_id?: string | null
          total_sales?: number
          rating?: number | null
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'products_seller_id_fkey'; columns: ['seller_id']; referencedRelation: 'sellers'; referencedColumns: ['id'] },
          { foreignKeyName: 'products_category_id_fkey'; columns: ['category_id']; referencedRelation: 'categories'; referencedColumns: ['id'] }
        ]
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          platform_fee: number
          shipping_cost: number
          tax_amount: number
          total_amount: number
          currency: string
          stripe_payment_intent_id: string | null
          shipping_address: Json | null
          billing_address: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          platform_fee?: number
          shipping_cost?: number
          tax_amount?: number
          total_amount: number
          currency?: string
          stripe_payment_intent_id?: string | null
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal?: number
          platform_fee?: number
          shipping_cost?: number
          tax_amount?: number
          total_amount?: number
          currency?: string
          stripe_payment_intent_id?: string | null
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'orders_buyer_id_fkey'; columns: ['buyer_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          seller_id: string
          quantity: number
          unit_price: number
          total_price: number
          platform_fee: number
          seller_amount: number
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          stripe_transfer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          seller_id: string
          quantity: number
          unit_price: number
          total_price: number
          platform_fee?: number
          seller_amount: number
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          stripe_transfer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          seller_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          platform_fee?: number
          seller_amount?: number
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          stripe_transfer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'order_items_order_id_fkey'; columns: ['order_id']; referencedRelation: 'orders'; referencedColumns: ['id'] },
          { foreignKeyName: 'order_items_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedColumns: ['id'] },
          { foreignKeyName: 'order_items_seller_id_fkey'; columns: ['seller_id']; referencedRelation: 'sellers'; referencedColumns: ['id'] }
        ]
      }
      payouts: {
        Row: {
          id: string
          seller_id: string
          amount: number
          currency: string
          status: 'pending' | 'processing' | 'paid' | 'failed'
          stripe_transfer_id: string | null
          notes: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'paid' | 'failed'
          stripe_transfer_id?: string | null
          notes?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'processing' | 'paid' | 'failed'
          stripe_transfer_id?: string | null
          notes?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'payouts_seller_id_fkey'; columns: ['seller_id']; referencedRelation: 'sellers'; referencedColumns: ['id'] }
        ]
      }
      invoices: {
        Row: {
          id: string
          order_id: string
          buyer_id: string
          invoice_number: string
          amount: number
          tax_amount: number
          total_amount: number
          currency: string
          status: string
          pdf_url: string | null
          issued_at: string
          due_at: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          buyer_id: string
          invoice_number: string
          amount: number
          tax_amount?: number
          total_amount: number
          currency?: string
          status?: string
          pdf_url?: string | null
          issued_at?: string
          due_at?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          buyer_id?: string
          invoice_number?: string
          amount?: number
          tax_amount?: number
          total_amount?: number
          currency?: string
          status?: string
          pdf_url?: string | null
          issued_at?: string
          due_at?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'invoices_order_id_fkey'; columns: ['order_id']; referencedRelation: 'orders'; referencedColumns: ['id'] }
        ]
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          buyer_id: string
          order_item_id: string | null
          rating: number
          title: string | null
          body: string | null
          is_verified: boolean
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          buyer_id: string
          order_item_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          is_verified?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          buyer_id?: string
          order_item_id?: string | null
          rating?: number
          title?: string | null
          body?: string | null
          is_verified?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'reviews_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedColumns: ['id'] }
        ]
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'cart_items_user_id_fkey'; columns: ['user_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'cart_items_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedColumns: ['id'] }
        ]
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          price_monthly: number
          price_yearly: number
          commission_rate: number
          product_limit: number | null
          features: Json
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          price_monthly: number
          price_yearly: number
          commission_rate: number
          product_limit?: number | null
          features?: Json
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          price_monthly?: number
          price_yearly?: number
          commission_rate?: number
          product_limit?: number | null
          features?: Json
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'buyer' | 'seller' | 'admin'
      seller_status: 'pending' | 'approved' | 'suspended' | 'rejected'
      product_status: 'draft' | 'active' | 'paused' | 'archived'
      order_status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
      subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise'
      subscription_status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid'
      payout_status: 'pending' | 'processing' | 'paid' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
