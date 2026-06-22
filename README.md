# CLARE Marketplace

A full-stack multi-vendor e-commerce marketplace built with **Next.js 14**, **Supabase**, and **Stripe**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS + Radix UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe (Checkout, Connect, Subscriptions) |
| Deployment | Vercel |

---

## Architecture

```
/app
  /(marketplace)   — Public storefront (homepage, products, sellers)
  /(auth)          — Login, register
  /(seller)        — Seller dashboard (products, orders, payouts)
  /(buyer)         — Buyer account (orders, profile)
  /admin           — Admin control panel
  /api             — REST API routes
/components        — Shared UI components
/lib               — Supabase, Stripe, utilities
/supabase          — DB migrations
/types             — TypeScript types
```

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd clare
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key
3. Run migrations:
   ```bash
   npx supabase db push
   ```
   Or paste migration files directly in the Supabase SQL Editor

### 3. Configure Stripe

1. Create a [Stripe](https://stripe.com) account
2. Enable **Stripe Connect** for multi-vendor payouts
3. Create subscription products for seller plans (Starter, Pro, Enterprise)
4. Copy price IDs and add to your DB via `subscription_tiers` table

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `NEXT_PUBLIC_APP_URL` — Your app URL (e.g. https://yourapp.com)

### 5. Run Locally

```bash
npm run dev
```

### 6. Set Up Stripe Webhooks

Point Stripe webhooks to: `https://your-domain.com/api/stripe/webhooks`

Events to listen for:
- `checkout.session.completed`
- `checkout.session.expired`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 7. Create First Admin

After signing up, manually update your role in Supabase:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Then access the admin panel at `/admin/login`.

### 8. Deploy to Vercel

```bash
npx vercel deploy
```

Add all environment variables in Vercel's dashboard under Settings → Environment Variables.

---

## Key Features

### Marketplace
- Product listings with search, filter, sort
- Category browsing
- Product detail with reviews
- Shopping cart (server-persisted)
- Stripe Checkout with tax calculation

### Seller Portal
- Self-service onboarding (pending admin approval)
- Product CRUD with images, inventory, categories
- Order management
- Payout tracking
- Subscription plan management

### Admin Control Panel (`/admin`)
- **Dashboard** — Live revenue, orders, users, platform fee metrics + chart
- **Orders** — Full order list with inline status updates
- **Products** — Moderate all products, update status
- **Sellers** — Approve/reject/suspend sellers, view stats
- **Users** — View and manage all user accounts
- **Billing** — GMV, platform fees, invoices, seller payouts, subscription breakdown
- **Reports** — 6-month revenue trends, top products, top sellers

### Security
- Row Level Security (RLS) on all Supabase tables
- Middleware-enforced route protection
- Admin routes double-verified server-side
- Stripe webhook signature verification
- Service role key never exposed to client
- Audit log for all admin actions

---

## Scaling Notes

- **Database**: Supabase auto-scales. Add read replicas for high traffic.
- **Images**: Store in Supabase Storage behind a CDN.
- **Search**: Upgrade from `ilike` to Supabase's pgvector or Typesense for full-text search at scale.
- **Payouts**: Implement cron job for automated weekly seller payouts via Stripe Connect.
- **Email**: Add Resend or SendGrid for transactional emails (order confirmations, seller approvals).
- **Queue**: For high-volume webhook processing, use a queue (e.g. Upstash QStash).
