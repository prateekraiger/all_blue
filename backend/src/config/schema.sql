-- ================================================================
-- GiftShop AI — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Products ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  description TEXT,
  price      NUMERIC NOT NULL CHECK (price >= 0),
  category   TEXT,
  tags       TEXT[] DEFAULT '{}',
  images     TEXT[] DEFAULT '{}',
  stock      INT DEFAULT 0 CHECK (stock >= 0),
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster category + tag filtering
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_tags      ON products USING GIN(tags);

-- ─── Orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  items              JSONB NOT NULL DEFAULT '[]',
  total_amount       NUMERIC NOT NULL CHECK (total_amount >= 0),
  status             TEXT DEFAULT 'pending'
                       CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_id         TEXT,
  razorpay_order_id  TEXT,
  address            JSONB,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ─── Cart ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity   INT DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- ─── Reviews ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating     INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- ─── User Preferences ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id             UUID PRIMARY KEY,
  viewed_categories   TEXT[] DEFAULT '{}',
  purchased_tags      TEXT[] DEFAULT '{}',
  last_search         TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Helper Functions ────────────────────────────────────────────────────────

-- Decrement stock (used after payment)
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET    stock      = GREATEST(stock - qty, 0),
         updated_at = NOW()
  WHERE  id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Increment stock (used on order cancellation)
CREATE OR REPLACE FUNCTION increment_stock(product_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET    stock      = stock + qty,
         updated_at = NOW()
  WHERE  id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security ──────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Products: public read, admin write (backend uses service role — bypasses RLS)
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- Orders: users can only see their own (backend service role bypasses)
CREATE POLICY "Users see own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Cart: users can only manage their own cart
CREATE POLICY "Users manage own cart"
  ON cart FOR ALL
  USING (auth.uid() = user_id);

-- Reviews: public read, authenticated write own
CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "Users create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- User preferences: users manage own
CREATE POLICY "Users manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ─── Sample Seed Data (Optional) ─────────────────────────────────────────────
-- Uncomment and run to seed sample products

/*
INSERT INTO products (name, description, price, category, tags, images, stock) VALUES
  ('Birthday Gift Box', 'A curated box of birthday surprises', 999, 'Gift Sets',
   ARRAY['birthday', 'celebration', 'surprise'],
   ARRAY['https://your-supabase.co/storage/v1/object/public/products/birthday-box.jpg'], 50),

  ('Anniversary Candle Set', 'Luxury scented candles for couples', 1299, 'Home Decor',
   ARRAY['anniversary', 'love', 'romantic', 'candle'],
   ARRAY['https://your-supabase.co/storage/v1/object/public/products/candle-set.jpg'], 30),

  ('Corporate Gift Hamper', 'Premium hamper for corporate gifting', 2499, 'Corporate',
   ARRAY['corporate', 'premium', 'hamper'],
   ARRAY['https://your-supabase.co/storage/v1/object/public/products/corporate-hamper.jpg'], 20),

  ('Personalized Photo Mug', 'Custom printed ceramic mug', 499, 'Personalized',
   ARRAY['personalized', 'photo', 'mug', 'birthday'],
   ARRAY['https://your-supabase.co/storage/v1/object/public/products/photo-mug.jpg'], 100),

  ('Luxury Perfume Gift', 'Imported fragrance in gift packaging', 3999, 'Luxury',
   ARRAY['luxury', 'perfume', 'premium', 'anniversary'],
   ARRAY['https://your-supabase.co/storage/v1/object/public/products/perfume.jpg'], 15),

  ('Baby Welcome Kit', 'Everything for the new arrival', 1799, 'Baby',
   ARRAY['baby', 'newborn', 'kids'],
   ARRAY['https://your-supabase.co/storage/v1/object/public/products/baby-kit.jpg'], 25);
*/
