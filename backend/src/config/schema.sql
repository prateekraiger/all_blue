-- AI Gift Finder - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the necessary tables and seed data.

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in cents/paise
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Cart Table
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Corresponds to Auth User ID
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    items JSONB NOT NULL, -- Array of objects: { product_id, qty, price }
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
    payment_id TEXT,
    stripe_session_id TEXT,
    address JSONB NOT NULL, -- { name, phone, line1, line2, city, state, pincode, country }
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure these columns exist if the table was created previously
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- 4. Enable Row Level Security (RLS) - Basic Setup
-- NOTE: For production, refine these policies to restrict access appropriately.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active products
DROP POLICY IF EXISTS "Allow public read active products" ON public.products;
CREATE POLICY "Allow public read active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Allow users to manage their own cart
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart;
CREATE POLICY "Users can manage their own cart" ON public.cart
    USING (auth.uid() = user_id);

-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- 5. Seed Initial Data (from products.json)
INSERT INTO public.products (name, category, price, tags, images, stock, description)
VALUES
('Modern Chair', 'Living Room', 29900, ARRAY['furniture', 'minimalist'], ARRAY['/modern-minimalist-chair.jpg'], 10, 'A sleek, modern chair for your living room.'),
('Ceramic Vase', 'Decor', 8900, ARRAY['decor', 'minimalist', 'ceramic'], ARRAY['/minimalist-ceramic-vase.png'], 10, 'Handcrafted ceramic vase with a minimalist touch.'),
('Wood Table', 'Living Room', 59900, ARRAY['furniture', 'minimalist', 'wood'], ARRAY['/minimalist-wood-table.jpg'], 10, 'Solid wood table with a light finish.'),
('Pendant Lamp', 'Lighting', 15900, ARRAY['lighting', 'minimalist'], ARRAY['/minimalist-pendant-lamp.jpg'], 10, 'Elegant pendant lamp for a soft ambiance.'),
('Storage Unit', 'Bedroom', 44900, ARRAY['furniture', 'minimalist'], ARRAY['/minimalist-storage-cabinet.jpg'], 10, 'Versatile storage unit for any room.'),
('Wall Mirror', 'Decor', 19900, ARRAY['decor', 'minimalist'], ARRAY['/minimalist-round-mirror.jpg'], 10, 'Minimalist round mirror for your wall.'),
('Minimalist Bed', 'Bedroom', 89900, ARRAY['furniture', 'bedroom'], ARRAY['/modern-minimalist-bedroom.png'], 5, 'A comfortable and stylish bed for the modern bedroom.');

-- 6. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY,
    viewed_categories TEXT[] DEFAULT '{}',
    purchased_tags TEXT[] DEFAULT '{}',
    gift_interests TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. RPC Functions for Stock Management
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = stock - qty
    WHERE id = product_id AND stock >= qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock or product not found';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_stock(product_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = stock + qty
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- 10. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
