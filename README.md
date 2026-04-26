# 🌊 ALL BLUE — AI-Powered Gift Shop Platform

> **Hackathon Project** · Next.js + Express.js + TypeScript · Full-Stack AI E-Commerce

ALL BLUE is a next-generation, AI-powered e-commerce platform built specifically for premium gift shopping. It combines a polished Next.js storefront with a robust Express.js backend and a suite of AI features — from personalized recommendations to voice search and AR product previews.

---

## 🏆 Hackathon Statement

**Objective:** Develop a smart e-commerce platform using modern AI technologies.

**Description:** Build a Next.js + AI-powered shopping platform for a premium gift shop — delivering personalized, intelligent, and immersive shopping experiences.

---

## 🏗️ Architecture Overview

```
all_blue/
├── frontend/          # Next.js 16 (App Router) — UI & UX
│   ├── app/           # Pages (shop, cart, checkout, orders, admin…)
│   ├── components/    # Reusable UI components
│   ├── context/       # Auth & Cart global state
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API client, Supabase client, utilities
│   └── styles/        # Global CSS & Tailwind config
│
└── backend/           # Express.js + TypeScript — API & Business Logic
    └── src/
        ├── config/    # Supabase client & DB schema
        ├── data/      # Seed data
        ├── middlewares/ # Auth, error handler, rate limiter, validator
        ├── routes/    # REST API route handlers
        ├── services/  # Business logic (AI, products, orders…)
        └── types/     # Shared TypeScript interfaces
```

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + CSS Variables |
| UI Components | [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Auth | [Stack Auth](https://stack-auth.com/) (`@stackframe/stack`) |
| State | React Hooks + Context API |
| Database Client | [Supabase JS](https://supabase.com/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | [Express.js 4](https://expressjs.com/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth Verification | [Jose](https://github.com/panva/jose) (JWT / JWKS) |
| Payments | [Stripe](https://stripe.com/) (INR, Checkout Sessions) |
| Validation | [Zod](https://zod.dev/) |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Morgan |

---

## ✨ Features Implemented

### 🛍️ Core E-Commerce
| Feature | Status | Details |
|---------|--------|---------|
| **Product Catalog** | ✅ | Filterable, sortable grid with pagination |
| **Product Detail** | ✅ | Image gallery, reviews, similar products |
| **Search** | ✅ | Real-time debounced search with relevance scoring |
| **Shopping Cart** | ✅ | Persistent for logged-in users, localStorage for guests |
| **Checkout** | ✅ | Indian address form with all states, GST & shipping calc |
| **Payments** | ✅ | Stripe Checkout (INR) with webhook verification |
| **Order Tracking** | ✅ | Full order history and status (pending→paid→shipped→delivered) |
| **User Auth** | ✅ | Sign-up, sign-in, profile via Stack Auth |
| **Admin Dashboard** | ✅ | Revenue stats, low stock alerts, order management |
| **Reviews** | ✅ | Star ratings + comments, average rating display |

### 🤖 AI Features
| Feature | Status | Details |
|---------|--------|---------|
| **AI Gift Recommendation Engine** | ✅ | Tag + category affinity scoring, personalized by purchase/view history |
| **AI Shopping Chatbot** | ✅ | Intent detection, keyword→tag mapping, price range extraction, quick replies |
| **AI Gift Finder** | ✅ | Multi-step wizard: persona × occasion × budget → ranked suggestions with match score |
| **Personalized Product Feed** | ✅ | Auto-updates on login; based on viewed categories and purchased tags |
| **Similar Products** | ✅ | Tag-overlap + category-fallback similarity engine |
| **User Preference Learning** | ✅ | Silently records viewed categories, tags, and searches |

### 🔍 Voice Search
| Feature | Status | Details |
|---------|--------|---------|
| **Voice Search — Navbar** | ✅ | Web Speech API (`en-IN`), real-time transcript |
| **Voice Search — Search Page** | ✅ | Mic button in search bar, auto-submits on result |
| **Voice Input — Chatbot** | ✅ | Mic button inside AI chatbot input |
| **`useVoiceSearch` Hook** | ✅ | Reusable hook with error handling & browser support check |

### 🏠 AR / 360° Preview
| Feature | Status | Details |
|---------|--------|---------|
| **AR Preview Backend** | ✅ | `/api/ar/preview/:id` returns AR metadata, supported categories, instructions |
| **AR Preview Modal** | ✅ | Full-screen image gallery viewer with zoom, thumbnails |
| **AR Category Detection** | ✅ | Auto-detects AR-capable categories (Decor, Lighting, Bedroom, etc.) |
| **AR Instructions** | ✅ | Contextual instructions for AR vs image-only products |
| **`ARPreview` Component** | ✅ | Accessible, keyboard-navigable, zoom-in/out |

### 📱 UX & Performance
| Feature | Status | Details |
|---------|--------|---------|
| **Responsive Design** | ✅ | Mobile-first, works on all screen sizes |
| **SEO Metadata** | ✅ | OpenGraph, Twitter cards, keywords, robots directives |
| **Loading Skeletons** | ✅ | Animated placeholders on all data-fetching pages |
| **Toast Notifications** | ✅ | Success/error feedback via Sonner |
| **Framer Motion Animations** | ✅ | Page transitions, magnetic buttons, slide-ins |
| **Dark Mode** | ✅ | CSS variable-based theme with `.dark` class |
| **Guest Cart** | ✅ | localStorage cart for non-logged-in users |

### 🔒 Security & Reliability
| Feature | Status | Details |
|---------|--------|---------|
| **Rate Limiting** | ✅ | 200 req/min per IP, in-memory with auto-cleanup |
| **Request IDs** | ✅ | `x-request-id` header on every response |
| **Helmet** | ✅ | Security headers on all responses |
| **Zod Validation** | ✅ | All request bodies validated before processing |
| **JWT Auth** | ✅ | Stack Auth JWKS verification via Jose |
| **Admin RBAC** | ✅ | Role-based route protection (`role === 'admin'`) |
| **Stock Safety** | ✅ | Stock verified before add-to-cart, decremented on payment |
| **Stripe Webhooks** | ✅ | Signature-verified webhook for reliable payment confirmation |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) (recommended) — `npm install -g pnpm`
- A [Supabase](https://supabase.com/) project
- A [Stack Auth](https://stack-auth.com/) project
- A [Stripe](https://stripe.com/) account

### 1. Clone the repository
```bash
git clone https://github.com/prateekraiger/all_blue.git
cd all_blue
```

### 2. Set up the database
Run `backend/src/config/schema.sql` in your Supabase SQL editor to create all tables.

### 3. Install dependencies
```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 4. Configure environment variables

#### Backend — `backend/.env`
```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stack Auth (for JWT verification)
STACK_PROJECT_ID=your_stack_project_id
STACK_SECRET_SERVER_KEY=your_stack_secret_key

# Stripe (payment gateway)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL (for CORS and Stripe redirect)
FRONTEND_URL=http://localhost:3000
```

#### Frontend — `frontend/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_client_key
```

### 5. Start the development servers

```bash
# Terminal 1 — Backend
cd backend
pnpm dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
pnpm dev
# → http://localhost:3000
```

---

## 📡 API Reference

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Server health, uptime, feature list |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | Optional | List with filters, search, pagination, sort |
| GET | `/api/products/trending` | None | Top products from last 7 days |
| GET | `/api/products/categories` | None | All distinct categories |
| GET | `/api/products/:id` | None | Single product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft-delete product |

### Search
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/search?q=...` | None | Full-text search with relevance scoring, tag overlap |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cart` | Required | Get user cart |
| POST | `/api/cart` | Required | Add item |
| PUT | `/api/cart/:id` | Required | Update quantity |
| DELETE | `/api/cart/:id` | Required | Remove item |
| DELETE | `/api/cart` | Required | Clear cart |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | Required | Place order |
| GET | `/api/orders` | Required | List user orders |
| GET | `/api/orders/:id` | Required | Single order |
| PATCH | `/api/orders/:id/cancel` | Required | Cancel pending order |
| GET | `/api/orders/admin` | Admin | All orders |
| PATCH | `/api/orders/admin/:id/status` | Admin | Update order status |

### Payments (Stripe)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payment/create-checkout` | Required | Create Stripe Checkout Session |
| POST | `/api/payment/verify` | Required | Verify payment after redirect |
| POST | `/api/payment/webhook` | None | Stripe webhook event handler |
| GET | `/api/payment/config` | None | Returns Stripe publishable key |

### AI
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ai/recommendations` | Required | Personalized product feed |
| GET | `/api/ai/similar/:productId` | None | Similar products |
| POST | `/api/ai/preferences` | Required | Update user preference signals |
| POST | `/api/ai/chat` | Optional | AI chatbot with intent detection |
| POST | `/api/gift-finder` | None | AI gift finder wizard |

### AR Preview
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ar/preview/:productId` | None | AR metadata for a product |
| GET | `/api/ar/supported-categories` | None | Categories with AR support |

### Reviews
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reviews/:productId` | None | Reviews + avg rating |
| POST | `/api/reviews` | Required | Submit review |
| DELETE | `/api/reviews/:id` | Required | Delete own review |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Revenue, orders, low-stock, popular products |

---

## 🤖 AI System Design

### Recommendation Engine
1. **Personalized Feed** — fetches `user_preferences` (purchased tags + viewed categories), queries products with `overlaps()` on tags, fills with category matches, falls back to newest.
2. **Similar Products** — tag-overlap query, then same-category fill.
3. **Gift Finder** — persona × occasion → tag affinity map → scored products (0–99% match) + generated reason text.
4. **Preference Learning** — silently upserts `user_preferences` on product view, search, and purchase.

### Chatbot Intent System
```
User message
    │
    ▼
detectIntent()  →  greeting / farewell / help / order_help
    │
    ▼ (product_search / price_query)
extractPrice()  →  maxPrice / minPrice
extractTags()   →  matched tags from KEYWORD_TAG_MAP
    │
    ▼
Supabase query  →  is_active + stock > 0 + tag overlap + price filter
    │
    ▼
Reply generation + quick replies
```

### Voice Search
- Uses Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- Language: `en-IN` for Indian English
- Available in: Navbar, Search page, AI Chatbot
- Implemented as reusable `useVoiceSearch` hook

### AR Preview System
- Backend detects AR-capable categories (Decor, Lighting, Bedroom, etc.)
- Returns: images, AR support flag, instructions, preview message
- Frontend: Full-screen image viewer with zoom, thumbnail strip, instructions panel
- Ready for GLTF/GLB 3-D model integration when `modelUrl` is set

---

## 📁 Key Files

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with providers, SEO metadata
│   ├── page.tsx                # Home: AI feed + trending products
│   ├── shop/page.tsx           # Product catalog with filters
│   ├── shop/[id]/page.tsx      # Product detail with AR preview
│   ├── gift-finder/page.tsx    # AI Gift Finder wizard
│   ├── search/page.tsx         # Full-text search with voice
│   ├── cart/page.tsx           # Shopping cart
│   ├── checkout/page.tsx       # Checkout + Stripe redirect
│   ├── orders/page.tsx         # Order history
│   └── admin/page.tsx          # Admin dashboard
├── components/
│   ├── AIChatbot.tsx           # AI shopping assistant (with quick replies + voice)
│   ├── ARPreview.tsx           # AR / 360° image viewer modal
│   ├── navigation.tsx          # Navbar with search + voice + user menu
│   ├── hero.tsx                # Landing hero section
│   ├── product-grid.tsx        # Reusable product grid
│   └── gift-finder.tsx         # Gift finder embedded widget
├── hooks/
│   ├── useVoiceSearch.ts       # Web Speech API hook
│   └── useDebounce.ts          # Debounce hook for search inputs
└── lib/
    ├── api.ts                  # Typed API client for all backend calls
    └── supabase.ts             # Supabase browser client

backend/src/
├── index.ts                    # Express app bootstrap + rate limiter + request ID
├── middlewares/
│   ├── auth.ts                 # requireAuth / optionalAuth / requireAdmin
│   ├── rateLimiter.ts          # In-memory IP rate limiter (200 req/min)
│   ├── errorHandler.ts         # Global error handler + AppError class
│   └── validate.ts             # Zod schema validation factory
├── routes/
│   ├── ai.ts                   # /api/ai/* — recommendations, chat, preferences
│   ├── ar.ts                   # /api/ar/* — AR preview metadata
│   ├── giftFinder.ts           # /api/gift-finder
│   ├── products.ts             # /api/products/*
│   ├── cart.ts                 # /api/cart/*
│   ├── orders.ts               # /api/orders/*
│   ├── payment.ts              # /api/payment/* (Stripe)
│   ├── search.ts               # /api/search
│   ├── reviews.ts              # /api/reviews/*
│   └── admin.ts                # /api/admin/*
└── services/
    ├── aiService.ts            # AI engine: recommendations, chatbot, gift finder
    ├── productService.ts       # CRUD + trending
    ├── cartService.ts          # Cart operations
    ├── orderService.ts         # Order lifecycle + stock management
    ├── paymentService.ts       # Stripe Checkout + webhook
    ├── reviewService.ts        # Reviews + avg rating
    └── searchService.ts        # Full-text + tag search with relevance scoring
```

---

## 🔑 Environment Variables Reference

| Variable | Service | Description |
|----------|---------|-------------|
| `PORT` | Backend | Server port (default: 5000) |
| `NODE_ENV` | Backend | `development` or `production` |
| `SUPABASE_URL` | Backend | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Supabase service role key (admin) |
| `STACK_PROJECT_ID` | Backend | Stack Auth project ID |
| `STACK_SECRET_SERVER_KEY` | Backend | Stack Auth server secret |
| `STRIPE_SECRET_KEY` | Backend | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Backend | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Backend | Stripe webhook signing secret |
| `FRONTEND_URL` | Backend | Frontend URL for CORS + Stripe redirect |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API base URL |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Frontend | Stack Auth project ID |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Frontend | Stack Auth client key |

---

## 🗄️ Database Schema

Tables managed in Supabase (PostgreSQL):

| Table | Description |
|-------|-------------|
| `products` | Product catalog with tags, images, stock |
| `cart` | Per-user cart items |
| `orders` | Order records with JSONB items + address |
| `reviews` | Product reviews with rating |
| `user_preferences` | AI learning — viewed categories, purchased tags |

Key Supabase RPC functions:
- `decrement_stock(product_id, qty)` — called on payment success
- `increment_stock(product_id, qty)` — called on order cancellation

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
pnpm build
# Deploy to Vercel — auto-detected Next.js app
```

### Backend (Railway / Render / EC2)
```bash
cd backend
pnpm build       # Compiles TypeScript → dist/
pnpm start       # Runs compiled JS
```

---

## 📝 License

This project is licensed under the [ISC License](./backend/package.json).

---

## 👤 Author

Built with ❤️ by **Prateek** for the Hackathon — 2025.

> **ALL BLUE** — Where AI meets the art of gifting.
