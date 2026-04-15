-- ================================================================
-- GiftShop AI — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── Products ────────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  category text,
  tags text[] default '{}',
  images text[] default '{}',
  stock int default 0 check (stock >= 0),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster category + tag filtering
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_is_active on products(is_active);
create index if not exists idx_products_tags on products using gin(tags);

-- ─── Orders ──────────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  items jsonb not null default '[]',
  total_amount numeric not null check (total_amount >= 0),
  status text default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_id text,
  razorpay_order_id text,
  address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);

-- ─── Cart ────────────────────────────────────────────────────────────────────
create table if not exists cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid references products(id) on delete cascade,
  quantity int default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_cart_user_id on cart(user_id);

-- ─── Reviews ─────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid references products(id) on delete cascade,
  rating int check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_reviews_product_id on reviews(product_id);

-- ─── User Preferences ────────────────────────────────────────────────────────
create table if not exists user_preferences (
  user_id uuid primary key,
  viewed_categories text[] default '{}',
  purchased_tags text[] default '{}',
  last_search text,
  updated_at timestamptz default now()
);

-- ─── Helper Functions ────────────────────────────────────────────────────────

-- Decrement stock (used after payment)
create or replace function decrement_stock(product_id uuid, qty int)
returns void as $$
begin
  update products
  set stock = greatest(stock - qty, 0),
      updated_at = now()
  where id = product_id;
end;
$$ language plpgsql;

-- Increment stock (used on order cancellation)
create or replace function increment_stock(product_id uuid, qty int)
returns void as $$
begin
  update products
  set stock = stock + qty,
      updated_at = now()
  where id = product_id;
end;
$$ language plpgsql;

-- Auto-update updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_products_updated_at
  before update on products
  for each row execute function update_updated_at_column();

create trigger update_orders_updated_at
  before update on orders
  for each row execute function update_updated_at_column();

-- ─── Row Level Security ──────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table products enable row level security;
alter table orders enable row level security;
alter table cart enable row level security;
alter table reviews enable row level security;
alter table user_preferences enable row level security;

-- Products: public read, admin write (backend uses service role — bypasses RLS)
create policy "Public can view active products"
  on products for select
  using (is_active = true);

-- Orders: users can only see their own (backend service role bypasses)
create policy "Users see own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users create own orders"
  on orders for insert
  with check (auth.uid() = user_id);

-- Cart: users can only manage their own cart
create policy "Users manage own cart"
  on cart for all
  using (auth.uid() = user_id);

-- Reviews: public read, authenticated write own
create policy "Public can view reviews"
  on reviews for select
  using (true);

create policy "Users create own reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "Users delete own reviews"
  on reviews for delete
  using (auth.uid() = user_id);

-- User preferences: users manage own
create policy "Users manage own preferences"
  on user_preferences for all
  using (auth.uid() = user_id);

-- ─── Sample Data (Optional) ──────────────────────────────────────────────────
-- Uncomment and run to seed sample products

/*
insert into products (name, description, price, category, tags, images, stock) values
  ('Birthday Gift Box', 'A curated box of birthday surprises', 999, 'Gift Sets', ARRAY['birthday', 'celebration', 'surprise'], ARRAY['https://your-supabase.co/storage/v1/object/public/products/birthday-box.jpg'], 50),
  ('Anniversary Candle Set', 'Luxury scented candles for couples', 1299, 'Home Decor', ARRAY['anniversary', 'love', 'romantic', 'candle'], ARRAY['https://your-supabase.co/storage/v1/object/public/products/candle-set.jpg'], 30),
  ('Corporate Gift Hamper', 'Premium hamper for corporate gifting', 2499, 'Corporate', ARRAY['corporate', 'premium', 'hamper'], ARRAY['https://your-supabase.co/storage/v1/object/public/products/corporate-hamper.jpg'], 20),
  ('Personalized Photo Mug', 'Custom printed ceramic mug', 499, 'Personalized', ARRAY['personalized', 'photo', 'mug', 'birthday'], ARRAY['https://your-supabase.co/storage/v1/object/public/products/photo-mug.jpg'], 100),
  ('Luxury Perfume Gift', 'Imported fragrance in gift packaging', 3999, 'Luxury', ARRAY['luxury', 'perfume', 'premium', 'anniversary'], ARRAY['https://your-supabase.co/storage/v1/object/public/products/perfume.jpg'], 15),
  ('Baby Welcome Kit', 'Everything for the new arrival', 1799, 'Baby', ARRAY['baby', 'newborn', 'kids'], ARRAY['https://your-supabase.co/storage/v1/object/public/products/baby-kit.jpg'], 25);
*/
