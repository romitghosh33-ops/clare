-- ============================================================
-- CLARE Marketplace â€” Initial Schema
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('buyer', 'seller', 'admin');
create type seller_status as enum ('pending', 'approved', 'suspended', 'rejected');
create type product_status as enum ('draft', 'active', 'paused', 'archived');
create type order_status as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type subscription_plan as enum ('free', 'starter', 'pro', 'enterprise');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'cancelled', 'unpaid');
create type payout_status as enum ('pending', 'processing', 'paid', 'failed');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null unique,
  full_name       text,
  avatar_url      text,
  phone           text,
  role            user_role not null default 'buyer',
  is_active       boolean not null default true,
  stripe_customer_id text unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Public profiles are viewable" on public.profiles
  for select using (is_active = true);

-- ============================================================
-- SELLERS
-- ============================================================
create table public.sellers (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null unique references public.profiles(id) on delete cascade,
  shop_name             text not null unique,
  shop_slug             text not null unique,
  description           text,
  logo_url              text,
  banner_url            text,
  status                seller_status not null default 'pending',
  commission_rate       numeric(5,2) not null default 10.00, -- platform takes 10%
  stripe_account_id     text unique,     -- Stripe Connect account
  stripe_account_status text,
  subscription_plan     subscription_plan not null default 'free',
  subscription_status   subscription_status,
  stripe_subscription_id text unique,
  total_sales           numeric(12,2) not null default 0,
  total_orders          integer not null default 0,
  rating                numeric(3,2),
  review_count          integer not null default 0,
  approved_at           timestamptz,
  approved_by           uuid references public.profiles(id),
  rejection_reason      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.sellers enable row level security;

create policy "Sellers can view own seller record" on public.sellers
  for select using (auth.uid() = user_id);
create policy "Sellers can update own record" on public.sellers
  for update using (auth.uid() = user_id);
create policy "Public can view approved sellers" on public.sellers
  for select using (status = 'approved');
create policy "Admins full access to sellers" on public.sellers
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create index idx_sellers_status on public.sellers(status);
create index idx_sellers_shop_slug on public.sellers(shop_slug);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  image_url   text,
  parent_id   uuid references public.categories(id),
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;
create policy "Categories are publicly viewable" on public.categories
  for select using (is_active = true);
create policy "Admins manage categories" on public.categories
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id              uuid primary key default uuid_generate_v4(),
  seller_id       uuid not null references public.sellers(id) on delete cascade,
  category_id     uuid references public.categories(id),
  title           text not null,
  slug            text not null,
  description     text,
  price           numeric(10,2) not null check (price >= 0),
  compare_price   numeric(10,2),
  cost_price      numeric(10,2),
  sku             text,
  stock_quantity  integer not null default 0,
  track_inventory boolean not null default true,
  status          product_status not null default 'draft',
  images          jsonb not null default '[]',  -- [{url, alt, sort_order}]
  tags            text[] not null default '{}',
  weight          numeric(8,2),
  dimensions      jsonb,  -- {length, width, height, unit}
  is_digital      boolean not null default false,
  digital_file_url text,
  stripe_price_id text unique,
  total_sales     integer not null default 0,
  rating          numeric(3,2),
  review_count    integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(seller_id, slug)
);

alter table public.products enable row level security;

create policy "Public can view active products" on public.products
  for select using (status = 'active');
create policy "Sellers manage own products" on public.products
  for all using (
    seller_id in (select id from public.sellers where user_id = auth.uid())
  );
create policy "Admins manage all products" on public.products
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create index idx_products_seller on public.products(seller_id);
create index idx_products_category on public.products(category_id);
create index idx_products_status on public.products(status);
create index idx_products_title_trgm on public.products using gin(title gin_trgm_ops);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id                  uuid primary key default uuid_generate_v4(),
  order_number        text not null unique default ('ORD-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  buyer_id            uuid not null references public.profiles(id),
  status              order_status not null default 'pending',
  subtotal            numeric(12,2) not null,
  shipping_amount     numeric(10,2) not null default 0,
  tax_amount          numeric(10,2) not null default 0,
  platform_fee        numeric(10,2) not null default 0,
  total_amount        numeric(12,2) not null,
  currency            text not null default 'usd',
  stripe_payment_intent_id text unique,
  stripe_session_id   text unique,
  shipping_address    jsonb,  -- {line1, line2, city, state, postal_code, country}
  billing_address     jsonb,
  notes               text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Buyers view own orders" on public.orders
  for select using (auth.uid() = buyer_id);
create policy "Admins view all orders" on public.orders
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- ORDER ITEMS (per-seller line items inside an order)
-- ============================================================
create table public.order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid not null references public.products(id),
  seller_id       uuid not null references public.sellers(id),
  quantity        integer not null check (quantity > 0),
  unit_price      numeric(10,2) not null,
  total_price     numeric(12,2) not null,
  commission_rate numeric(5,2) not null,
  commission_amount numeric(10,2) not null,
  seller_payout   numeric(10,2) not null,
  product_snapshot jsonb,  -- title, image, sku at time of purchase
  created_at      timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "Sellers view items for their products" on public.order_items
  for select using (
    seller_id in (select id from public.sellers where user_id = auth.uid())
  );
create policy "Buyers view own order items" on public.order_items
  for select using (
    order_id in (select id from public.orders where buyer_id = auth.uid())
  );
create policy "Admins view all order items" on public.order_items
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_seller on public.order_items(seller_id);

-- ============================================================
-- PAYOUTS
-- ============================================================
create table public.payouts (
  id                    uuid primary key default uuid_generate_v4(),
  seller_id             uuid not null references public.sellers(id) on delete cascade,
  amount                numeric(12,2) not null,
  currency              text not null default 'usd',
  status                payout_status not null default 'pending',
  stripe_transfer_id    text unique,
  stripe_payout_id      text unique,
  period_start          date not null,
  period_end            date not null,
  notes                 text,
  processed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.payouts enable row level security;

create policy "Sellers view own payouts" on public.payouts
  for select using (
    seller_id in (select id from public.sellers where user_id = auth.uid())
  );
create policy "Admins manage all payouts" on public.payouts
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- INVOICES
-- ============================================================
create table public.invoices (
  id                    uuid primary key default uuid_generate_v4(),
  invoice_number        text not null unique default ('INV-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  order_id              uuid references public.orders(id),
  buyer_id              uuid not null references public.profiles(id),
  seller_id             uuid references public.sellers(id),
  amount                numeric(12,2) not null,
  tax_amount            numeric(10,2) not null default 0,
  total_amount          numeric(12,2) not null,
  currency              text not null default 'usd',
  status                text not null default 'draft', -- draft, sent, paid, void
  stripe_invoice_id     text unique,
  stripe_invoice_url    text,
  stripe_invoice_pdf    text,
  due_date              date,
  paid_at               timestamptz,
  notes                 text,
  line_items            jsonb not null default '[]',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "Buyers view own invoices" on public.invoices
  for select using (auth.uid() = buyer_id);
create policy "Sellers view invoices for their sales" on public.invoices
  for select using (
    seller_id in (select id from public.sellers where user_id = auth.uid())
  );
create policy "Admins manage all invoices" on public.invoices
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  order_id    uuid references public.orders(id),
  rating      integer not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_verified boolean not null default false,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  unique(product_id, reviewer_id)
);

alter table public.reviews enable row level security;
create policy "Reviews are publicly viewable" on public.reviews
  for select using (is_visible = true);
create policy "Users create reviews" on public.reviews
  for insert with check (auth.uid() = reviewer_id);
create policy "Admins manage reviews" on public.reviews
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create index idx_reviews_product on public.reviews(product_id);

-- ============================================================
-- CART (server-side cart for persistence)
-- ============================================================
create table public.cart_items (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, product_id)
);

alter table public.cart_items enable row level security;
create policy "Users manage own cart" on public.cart_items
  for all using (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTION PLANS TABLE (admin-managed)
-- ============================================================
create table public.subscription_tiers (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null unique,
  plan                subscription_plan not null unique,
  price_monthly       numeric(10,2) not null,
  price_yearly        numeric(10,2) not null,
  stripe_price_monthly text unique,
  stripe_price_yearly  text unique,
  product_limit       integer,  -- null = unlimited
  commission_rate     numeric(5,2) not null,
  features            jsonb not null default '[]',
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

alter table public.subscription_tiers enable row level security;
create policy "Plans are publicly viewable" on public.subscription_tiers
  for select using (is_active = true);
create policy "Admins manage plans" on public.subscription_tiers
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table public.audit_logs (
  id          bigserial primary key,
  actor_id    uuid references public.profiles(id),
  action      text not null,
  table_name  text,
  record_id   text,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
create policy "Admins view audit logs" on public.audit_logs
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create index idx_audit_logs_actor on public.audit_logs(actor_id);
create index idx_audit_logs_created on public.audit_logs(created_at desc);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger trg_sellers_updated_at before update on public.sellers
  for each row execute function public.update_updated_at();
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.update_updated_at();
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at();
create trigger trg_payouts_updated_at before update on public.payouts
  for each row execute function public.update_updated_at();
create trigger trg_invoices_updated_at before update on public.invoices
  for each row execute function public.update_updated_at();

-- Update seller stats when order item is paid
create or r	eplace function public.update_seller_stats()
returns trigger as $$
begin
  if new.status = 'paid' and old.status != 'paid' then
    update public.sellers s
    set total_sales = total_sales + oi.total_price,
        total_orders = total_orders + 1
    from public.order_items oi
    where oi.order_id = new.id and oi.seller_id = s.id;

    update public.products p
    set total_sales = total_sales + oi.quantity
    from public.order_items oi
    where oi.order_id = new.id and oi.product_id = p.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_order_paid
  after update on public.orders
  for every row execute function public.update_seller_stats();

-- ============================================================
-- SEED DEFAULT DATA
-- ============================================================

insert into public.categories (name, slug, description, sort_order) values
  ('Electronics', 'electronics', 'Gadgets, devices, and tech accessories', 1),
  ('Fashion', 'fashion', 'Clothing, shoes, and accessories', 2),
  ('Home & Garden', 'home-garden', 'Furniture, decor, and outdoor', 3),
  ('Books & Media', 'books-media', 'Books, music, movies, and games', 4),
  ('Sports & Outdoors', 'sports-outdoors', 'Equipment and activewear',q®Bˆ
	Ğ™X]]H	ˆX[	Ë	Ø™X]]KZX[	Ë	ĞÛÜÛY]XÜËÚÚ[˜Ø\™K[™Ù[™\ÜÉËŠKˆ
	ÕŞ\È	ˆØ[Y\ÉË	İŞ\ËYØ[Y\ÉË	Ñ›Üˆ[YÙ\ÉËÊKˆ
	Ğ\	ˆÜ˜YÉË	Ø\XÜ˜YÉË	Ò[™XYH[™Ü™X]]™Hİ\Y\ÉË
NÂ‚š[œÙ\[ÈX›XËœİXœØÜš\[Û—İY\œÈ
˜[YK[‹šXÙWÛ[ÛKšXÙWŞYX\›KÛÛ[Z\ÜÚ[Û—Ü˜]K›ÙXİÛ[Z]™X]\™\ÊH˜[Y\Âˆ
	Ñœ™YIË	Ùœ™YIËMKŒLˆ	ÖÈ•\ÈL›ÙXİÈ‹ŒMIHÛÛ[Z\ÜÚ[Ûˆ‹˜\ÚXÈ[˜[]XÜÈ‹‘[XZ[İ\Ü—IÊKˆ
	Ôİ\\‰Ë	Üİ\\‰ËNKNKNNKNKL‹ŒLˆ	ÖÈ•\ÈL›ÙXİÈ‹ŒL‰HÛÛ[Z\ÜÚ[Ûˆ‹”İ[™\™[˜[]XÜÈ‹”š[Üš]H[XZ[İ\Ü‹İ\İÛHÚÜ˜[›™\ˆ—IÊKˆ
	Ô›ÉË	Ü›ÉËC’ã“’ÂC“’ã“’Â‚ãÂÀ¢u²%WFò&öGV7G2"Â#‚R6öÖÖ—76–öâ"Â$Gfæ6VBæÇ—F–72"Â$6†B7W÷'B"Â$7W7FöÒFöÖ–â"Â%&öÖ÷F–öç2bF—66÷VçG2%Òr’À¢‚tVçFW'&—6RrÂvVçFW'&—6RrÂ“’ã“’Â““’ã“’ÂRãÂçVÆÂÀ¢u²%VæÆ–Ö—FVB&öGV7G2"Â#RR6öÖÖ—76–öâ"Â$gVÆÂæÇ—F–727V—FR"Â$FVF–6FVB66÷VçBÖævW""Â$’66W72"Â$7W7FöÒ–çFVw&F–öç2%Òr“°  