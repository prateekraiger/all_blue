# 🎁 GiftShop AI — Backend & Frontend Plan

## Stack Decision

| Layer       | Technology              |
|-------------|-------------------------|
| Frontend    | Next.js 14 (App Router) |
| Backend     | Express.js (Node.js)    |
| Database    | Supabase (PostgreSQL)   |
| Auth        | TBD by developer        |
| Payments    | Razorpay                |
| AI          | Custom recommendation logic / simple ML |
| Storage     | Supabase Storage (product images) |

---

## Phase 1 — Project Setup & Foundation

### Backend (Express)

- [ ] Initialize Express project: `npm init -y`, install dependencies
  - `express`, `cors`, `dotenv`, `helmet`, `morgan`
  - `@supabase/supabase-js` (Supabase client)
  - `razorpay` (payment gateway)
  - `zod` (request validation)
- [ ] Set up folder structure:
  ```
  backend/
  ├── src/
  │   ├── config/         # Supabase client, env config
  │   ├── routes/         # All route files
  │   ├── controllers/    # Business logic
  │   ├── middlewares/    # Auth guard, error handler, validator
  │   ├── services/       # DB queries and external API calls
  │   └── index.js        # Entry point
  ├── .env
  └── package.json
  ```
- [ ] Set up `supabase.js` config using `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set up CORS for frontend origin
- [ ] Set up a global error handler middleware
- [ ] Add auth middleware: validates JWT from Supabase (passed as `Authorization: Bearer <token>` from frontend)

### Supabase Database Schema

Create the following tables in Supabase SQL editor:

```sql
-- Products Table
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  category text,
  tags text[],           -- e.g. ['birthday', 'love', 'corporate']
  images text[],         -- array of Supabase Storage URLs
  stock int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Orders Table
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,         -- from Supabase auth
  items jsonb not null,          -- [{ product_id, qty, price }]
  total_amount numeric not null,
  status text default 'pending', -- pending | paid | shipped | delivered | cancelled
  payment_id text,               -- Razorpay payment ID
  razorpay_order_id text,
  address jsonb,
  created_at timestamptz default now()
);

-- Cart Table (optional — can also be frontend state)
create table cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid references products(id),
  quantity int default 1,
  created_at timestamptz default now()
);

-- Product Reviews / Ratings
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid references products(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- User Preferences (for AI feed)
create table user_preferences (
  user_id uuid primary key,
  viewed_categories text[],
  purchased_tags text[],
  last_search text,
  updated_at timestamptz default now()
);
```

---

## Phase 2 — Core Backend APIs

### 2.1 Products API (`/api/products`)

| Method | Route                | Description                     |
|--------|----------------------|---------------------------------|
| GET    | `/api/products`      | List all products (with filters)|
| GET    | `/api/products/:id`  | Get single product detail       |
| POST   | `/api/products`      | Admin: create product           |
| PUT    | `/api/products/:id`  | Admin: update product           |
| DELETE | `/api/products/:id`  | Admin: delete product           |

**Query params for listing:**
- `?category=birthday`
- `?tag=love`
- `?q=mug` (search)
- `?page=1&limit=20`

### 2.2 Cart API (`/api/cart`) — Auth required

| Method | Route             | Description                 |
|--------|-------------------|-----------------------------|
| GET    | `/api/cart`       | Get user's cart             |
| POST   | `/api/cart`       | Add item to cart            |
| PUT    | `/api/cart/:id`   | Update quantity             |
| DELETE | `/api/cart/:id`   | Remove item from cart       |

### 2.3 Orders API (`/api/orders`) — Auth required

| Method | Route                      | Description             |
|--------|----------------------------|-------------------------|
| POST   | `/api/orders`              | Create order            |
| GET    | `/api/orders`              | Get user's orders       |
| GET    | `/api/orders/:id`          | Get single order detail |
| PATCH  | `/api/orders/:id/cancel`   | Cancel order            |

### 2.4 Payment API (`/api/payment`) — Razorpay

| Method | Route                        | Description                            |
|--------|------------------------------|----------------------------------------|
| POST   | `/api/payment/create-order`  | Create Razorpay order (returns order ID)|
| POST   | `/api/payment/verify`        | Verify signature after payment         |

**Flow:**
1. Frontend calls `/payment/create-order` → gets `razorpay_order_id`
2. User pays in Razorpay checkout
3. Frontend calls `/payment/verify` with signature
4. Backend marks order as `paid`

### 2.5 AI Recommendation API (`/api/ai`)

| Method | Route                       | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/ai/recommendations`   | Personalized products for user       |
| GET    | `/api/ai/similar/:productId`| Similar products (content-based)     |
| POST   | `/api/ai/preferences`       | Update user preference signals       |

**Simple AI Logic (Phase 1 — no heavy ML):**
- **Tag-based matching**: User buys "birthday" tagged items → show more birthday products
- **Category frequency**: Track which categories user views the most → rank those higher
- **Trending**: Products with most orders in last 7 days → show in "Trending" section
- **Similar products**: Match on overlapping `tags[]` array between products

> Note: This is achievable with pure SQL queries and basic logic. No TensorFlow needed in Phase 1.

### 2.6 Reviews API (`/api/reviews`)

| Method | Route                    | Description               |
|--------|--------------------------|---------------------------|
| GET    | `/api/reviews/:productId`| Get reviews for a product |
| POST   | `/api/reviews`           | Submit a review           |
| DELETE | `/api/reviews/:id`       | Delete own review         |

### 2.7 Search API (`/api/search`)

| Method | Route         | Description                     |
|--------|---------------|---------------------------------|
| GET    | `/api/search` | `?q=gift` — full text search    |

- Use Supabase `ilike` or PostgreSQL `to_tsvector` full-text search on `name` + `description` + `tags`

---

## Phase 3 — Frontend Dynamic Features (Next.js)

### 3.1 Pages & Routes

```
frontend/src/app/
├── page.tsx                    # Home — hero + featured + AI feed
├── shop/page.tsx               # Product catalog
├── shop/[id]/page.tsx          # Product detail + AR preview
├── cart/page.tsx               # Cart page
├── checkout/page.tsx           # Checkout + Razorpay
├── orders/page.tsx             # Order history
├── orders/[id]/page.tsx        # Order tracking
├── search/page.tsx             # Search results
└── profile/page.tsx            # User profile
```

### 3.2 Dynamic Features to Build

#### Home Page (`/`)
- Fetch **personalized product feed** from `/api/ai/recommendations`
- Trending section from `/api/products?sort=trending`
- Category filter chips (Birthday, Anniversary, Corporate, etc.)

#### Product Catalog (`/shop`)
- Server-side filtered product listing
- Infinite scroll or pagination
- Filter by: category, price range, tags, rating
- Sort by: newest, price, popularity

#### Product Detail (`/shop/[id]`)
- Full product info + image gallery
- **AI-similar products** carousel from `/api/ai/similar/:id`
- Reviews section
- **AR Preview button** (Phase 2: uses WebAR / model-viewer)
- Add to cart button

#### Cart (`/cart`)
- Live cart (synced to backend or localStorage → sync on login)
- Quantity update/remove
- Price breakdown (subtotal, taxes)
- Proceed to Checkout CTA

#### Checkout (`/checkout`)
- Address form
- **Razorpay payment integration** (frontend Razorpay SDK)
- Order confirmation page after payment

#### Order Tracking (`/orders/[id]`)
- Order status timeline: `Pending → Paid → Shipped → Delivered`
- Dynamic status polling or Supabase Realtime subscription

#### Search (`/search`)
- Debounced search input → hits `/api/search?q=...`
- **Voice Search** (Phase 2): uses Web Speech API to convert speech → query
- Results with product cards

#### AI Chatbot (`/` — floating widget)
- Simple rule-based chatbot first (FAQ + product suggestions)
- Input: "Looking for a birthday gift under ₹500"
- Backend: keyword match → return filtered products
- Phase 2: Use Gemini API / OpenAI for natural language

---

## Phase 4 — Advanced Features (After Core is Working)

### Voice Search
- Use browser `Web Speech API` (`SpeechRecognition`)
- On transcript → auto-fill search bar → hit search API
- Works without any backend changes

### AI Chatbot (Advanced)
- Integrate Gemini API (free tier available)
- System prompt: "You are a gift recommendation assistant for GiftShop..."
- Pass user's previous purchases as context

---

## Phase 5 — Admin Panel (Simple)

- Separate route (`/admin`) protected by role check
- Add/edit/delete products
- View all orders + update status (Shipped, Delivered)
- Basic dashboard: total revenue, orders today, popular products

---

## Environment Variables

### Backend `.env`
```
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Implementation Order (Recommended)

1. **Week 1**: DB schema in Supabase + Express project setup + Products API
2. **Week 2**: Orders API + Razorpay payment flow (most critical)
3. **Week 3**: Cart API + Reviews API + Search API
4. **Week 4**: Next.js pages — Home, Shop, Product Detail, Cart, Checkout
5. **Week 5**: AI Recommendations API + Order Tracking page
6. **Week 6**: Chatbot widget + Voice Search + Polish
7. **Week 7+**: AR Preview + Admin Panel

---

## Notes

- **Auth**: The user will handle authentication separately. Backend should have a middleware that reads the Supabase JWT from the `Authorization` header and extracts `user_id` from it.
- **Cart**: Cart can be stored in `localStorage` for guests and synced to DB on login.
- **Images**: Upload product images to Supabase Storage bucket, store public URLs in the `images[]` column.
- **AI in Phase 1** does NOT require TensorFlow — pure SQL-based tag/category matching is sufficient and fast.
- **Razorpay** is the recommended payment gateway for India with UPI, NetBanking, Cards support.
