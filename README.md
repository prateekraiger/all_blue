<div align="center">

# 🌊 ALL BLUE

### AI-Powered Gift Shop Platform

**Smart India Hackathon 2025** · Full-Stack · Next.js + Express.js + TypeScript

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-INR-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](./backend/package.json)

> **ALL BLUE** — Where AI meets the art of gifting.
> A next-generation, production-ready e-commerce platform with AI recommendations, voice search, and AR product previews — built for the premium gifting market.

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Database Schema](#-database-schema) · [Deployment](#-deployment) · [AI System Design](#-ai-system-design)

</div>

---

## 📋 Table of Contents

- [Hackathon Statement](#-hackathon-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [AI System Design](#-ai-system-design)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏆 Hackathon Statement

| Field | Value |
|-------|-------|
| **Problem Statement ID** | PS-2025-ECOM-AI-047 |
| **Title** | AI-Powered Smart E-Commerce Platform for Premium Gifting |
| **Theme** | Smart Automation · AI & ML Solutions |
| **Category** | Software — Full Stack Web Application |
| **Team** | Team ALL BLUE |
| **Author** | Prateek Raiger |

**Objective:** Build a Next.js + AI-powered shopping platform for a premium gift shop — delivering personalised, intelligent, and immersive shopping experiences with voice search, AR preview, and intelligent recommendation systems.

---

## ✨ Features

### 🛍️ Core E-Commerce
| Feature | Status | Details |
|---------|:------:|---------|
| **Product Catalog** | ✅ | Filterable, sortable grid with pagination and category browsing |
| **Product Detail** | ✅ | Image gallery, reviews, similar products, AR preview trigger |
| **Real-time Search** | ✅ | Debounced full-text search with relevance scoring and tag overlap |
| **Shopping Cart** | ✅ | Persistent for logged-in users (Supabase), localStorage for guests |
| **Checkout Flow** | ✅ | Indian address form with all states/UTs, GST & shipping calculation |
| **Stripe Payments** | ✅ | Stripe Checkout Sessions (INR) with signature-verified webhooks |
| **Order Tracking** | ✅ | Full lifecycle: `pending → paid → shipped → delivered → cancelled` |
| **User Auth** | ✅ | Sign-up, sign-in, profile management via Stack Auth |
| **Admin Dashboard** | ✅ | Revenue stats, low-stock alerts, order management, popular products |
| **Reviews & Ratings** | ✅ | Star ratings + comments, average rating display, one review per user |

### 🤖 AI Features
| Feature | Status | Details |
|---------|:------:|---------|
| **AI Recommendation Engine** | ✅ | Tag + category affinity scoring personalised by purchase/view history |
| **AI Shopping Chatbot** | ✅ | Intent detection, keyword→tag mapping, price range extraction, quick replies |
| **AI Gift Finder** | ✅ | Multi-step wizard: persona × occasion × budget → ranked suggestions with match % |
| **Personalised Product Feed** | ✅ | Auto-updates on login; driven by viewed categories and purchased tags |
| **Similar Products** | ✅ | Tag-overlap + category-fallback similarity engine |
| **User Preference Learning** | ✅ | Silently records viewed categories, tags, and search terms |

### 🎤 Voice Search
| Feature | Status | Details |
|---------|:------:|---------|
| **Voice Search — Navbar** | ✅ | Web Speech API (`en-IN`), real-time transcript display |
| **Voice Search — Search Page** | ✅ | Mic button in search bar, auto-submits on final result |
| **Voice Input — Chatbot** | ✅ | Mic button inside AI chatbot message input |
| **`useVoiceSearch` Hook** | ✅ | Reusable React hook with error handling and browser support check |

### 🏠 AR / 360° Preview
| Feature | Status | Details |
|---------|:------:|---------|
| **AR Preview Modal** | ✅ | Full-screen image gallery viewer with zoom, pan, and thumbnail strip |
| **AR Category Detection** | ✅ | Auto-detects AR-capable categories: Decor, Lighting, Bedroom, etc. |
| **AR Instructions Panel** | ✅ | Contextual usage instructions for AR vs. image-only products |
| **AR Metadata API** | ✅ | `/api/ar/preview/:id` returns images, AR flag, instructions, model URL |
| **GLTF/GLB Ready** | ✅ | Architecture supports 3D model integration when `modelUrl` is set |

### 📱 UX & Performance
| Feature | Status | Details |
|---------|:------:|---------|
| **Responsive Design** | ✅ | Mobile-first, tested across all screen sizes |
| **SEO Metadata** | ✅ | OpenGraph, Twitter cards, keywords, robots directives |
| **Loading Skeletons** | ✅ | Animated placeholders on all data-fetching pages |
| **Toast Notifications** | ✅ | Success/error feedback via Sonner |
| **Framer Motion Animations** | ✅ | Page transitions, magnetic buttons, slide-in effects |
| **Dark Mode** | ✅ | CSS variable-based theming with `.dark` class toggle |
| **Guest Cart** | ✅ | localStorage cart for non-authenticated users |

### 🔒 Security & Reliability
| Feature | Status | Details |
|---------|:------:|---------|
| **Rate Limiting** | ✅ | 200 req/min per IP — in-memory with automatic cleanup |
| **Helmet.js** | ✅ | Security HTTP headers on every response |
| **Zod Validation** | ✅ | All request bodies validated before processing |
| **JWT Authentication** | ✅ | Stack Auth JWKS verification via Jose |
| **Admin RBAC** | ✅ | Role-based route protection (`role === 'admin'`) |
| **Stock Safety** | ✅ | Stock verified before add-to-cart; decremented only on confirmed payment |
| **Stripe Webhooks** | ✅ | Signature-verified webhook for reliable payment confirmation |
| **Request IDs** | ✅ | `x-request-id` header on every response for tracing |
| **CORS Policy** | ✅ | Origin whitelist with credentials support |

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) | SSR/SSG, routing, layouts |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + CSS Variables | Utility-first, dark mode |
| UI Components | [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/) | Accessible headless primitives |
| Animations | [Framer Motion](https://www.framer.com/motion/) | Page transitions, effects |
| Auth | [Stack Auth](https://stack-auth.com/) (`@stackframe/stack`) | Authentication flows |
| State Management | React Hooks + Context API | Cart, auth global state |
| Database Client | [Supabase JS](https://supabase.com/) | Direct DB access from client |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) | Real-time web analytics |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js v18+ | Server runtime |
| Framework | [Express.js 4](https://expressjs.com/) | REST API routing |
| Language | [TypeScript 5](https://www.typescriptlang.org/) | Type-safe development |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) | Managed DB with RLS |
| Auth Verification | [Jose](https://github.com/panva/jose) (JWT / JWKS) | Token verification |
| Payments | [Stripe](https://stripe.com/) | Checkout sessions, webhooks |
| Validation | [Zod](https://zod.dev/) | Runtime schema validation |
| Security | Helmet, CORS, Rate Limiting | HTTP security hardening |
| Logging | Morgan | HTTP request logging |
| Error Handling | express-async-errors + custom AppError | Global error middleware |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│          Next.js 16 App Router  ·  React 18  ·  Tailwind CSS 4      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │  HTTP / REST API
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND (TypeScript)                   │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Helmet  │  │   CORS   │  │  Morgan  │  │  Rate Limiter    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              ROUTES  (10 route modules)                       │  │
│  │  products · cart · orders · payment · ai · ar ·              │  │
│  │  gift-finder · reviews · search · admin                       │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────▼────────────────────────────────────┐  │
│  │              SERVICES  (business logic)                        │  │
│  │  aiService · productService · cartService · orderService ·    │  │
│  │  paymentService · reviewService · searchService               │  │
│  └──────────────┬───────────────────────────┬────────────────────┘  │
└─────────────────┼───────────────────────────┼──────────────────────┘
                  │                           │
        ┌─────────▼─────────┐      ┌─────────▼──────────┐
        │  SUPABASE         │      │  STRIPE             │
        │  PostgreSQL + RLS │      │  Checkout Sessions  │
        │  JSONB · GIN idx  │      │  Webhooks · INR     │
        └───────────────────┘      └────────────────────┘
                  │
        ┌─────────▼─────────┐
        │  STACK AUTH       │
        │  JWT / JWKS       │
        │  Role-based Auth  │
        └───────────────────┘
```

---

## 📁 Project Structure

```
all_blue/
│
├── frontend/                          # Next.js 16 (App Router)
│   ├── app/
│   │   ├── layout.tsx                 # Root layout — providers, SEO metadata
│   │   ├── page.tsx                   # Home: AI feed + trending products
│   │   ├── shop/
│   │   │   ├── page.tsx               # Product catalog with filters & sort
│   │   │   └── [id]/page.tsx          # Product detail + AR preview + reviews
│   │   ├── gift-finder/page.tsx       # AI Gift Finder wizard
│   │   ├── search/page.tsx            # Full-text search with voice input
│   │   ├── cart/page.tsx              # Shopping cart (guest + auth)
│   │   ├── checkout/
│   │   │   ├── page.tsx               # Checkout form + Stripe redirect
│   │   │   └── success/page.tsx       # Payment success handler
│   │   ├── orders/
│   │   │   ├── page.tsx               # Order history list
│   │   │   └── [id]/page.tsx          # Single order detail
│   │   ├── admin/page.tsx             # Admin dashboard (RBAC protected)
│   │   ├── profile/page.tsx           # User profile management
│   │   ├── about/page.tsx             # About page
│   │   ├── contact/page.tsx           # Contact page
│   │   ├── collections/page.tsx       # Product collections
│   │   ├── corporate-gifting/page.tsx # Corporate gifting landing
│   │   ├── sign-in/page.tsx           # Sign-in page
│   │   └── handler/                   # Stack Auth callback handlers
│   ├── components/
│   │   ├── AIChatbot.tsx              # AI shopping assistant (voice + quick replies)
│   │   ├── chatbot.tsx                # Chatbot base component
│   │   ├── navigation.tsx             # Navbar — search, voice, user menu, cart
│   │   ├── hero.tsx                   # Landing hero section
│   │   ├── product-grid.tsx           # Reusable product grid component
│   │   ├── collections.tsx            # Product collections grid
│   │   ├── footer.tsx                 # Site footer
│   │   ├── newsletter.tsx             # Newsletter signup widget
│   │   ├── Magnetic.tsx               # Framer Motion magnetic button
│   │   ├── PageTransition.tsx         # Page transition wrapper
│   │   ├── SilenceWarnings.tsx        # Dev environment warning silencer
│   │   ├── theme-provider.tsx         # Dark/light mode provider
│   │   └── ui/                        # Radix UI + shadcn/ui components
│   ├── context/
│   │   ├── AuthContext.tsx            # Global auth state (Stack Auth)
│   │   └── CartContext.tsx            # Global cart state (DB + localStorage)
│   ├── hooks/
│   │   ├── useVoiceSearch.ts          # Web Speech API reusable hook
│   │   └── useDebounce.ts             # Debounce hook for search inputs
│   ├── lib/
│   │   ├── api.ts                     # Typed API client for all backend calls
│   │   └── supabase.ts                # Supabase browser client
│   ├── stack/                         # Stack Auth configuration
│   ├── styles/                        # Global CSS
│   ├── public/                        # Static assets
│   ├── next.config.mjs                # Next.js configuration
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   └── package.json
│
└── backend/                           # Express.js + TypeScript
    ├── src/
    │   ├── index.ts                   # App bootstrap — middleware, routes, server
    │   ├── config/
    │   │   └── supabase.ts            # Supabase admin client (service role)
    │   ├── data/
    │   │   └── seed.ts                # Sample product seed data
    │   ├── middlewares/
    │   │   ├── auth.ts                # requireAuth / optionalAuth / requireAdmin
    │   │   ├── rateLimiter.ts         # In-memory IP rate limiter (200 req/min)
    │   │   ├── errorHandler.ts        # Global error handler + AppError class
    │   │   └── validate.ts            # Zod schema validation factory middleware
    │   ├── routes/
    │   │   ├── products.ts            # GET/POST/PUT/DELETE /api/products/*
    │   │   ├── cart.ts                # CRUD /api/cart (auth required)
    │   │   ├── orders.ts              # Order lifecycle /api/orders/*
    │   │   ├── payment.ts             # Stripe /api/payment/*
    │   │   ├── ai.ts                  # AI endpoints /api/ai/*
    │   │   ├── ar.ts                  # AR metadata /api/ar/*
    │   │   ├── giftFinder.ts          # /api/gift-finder
    │   │   ├── reviews.ts             # /api/reviews/*
    │   │   ├── search.ts              # /api/search
    │   │   └── admin.ts               # /api/admin/* (admin RBAC)
    │   ├── services/
    │   │   ├── aiService.ts           # Recommendation engine, chatbot, gift finder
    │   │   ├── productService.ts      # Product CRUD + trending
    │   │   ├── cartService.ts         # Cart operations + stock check
    │   │   ├── orderService.ts        # Order lifecycle + stock management
    │   │   ├── paymentService.ts      # Stripe Checkout + webhook handler
    │   │   ├── reviewService.ts       # Reviews + average rating
    │   │   └── searchService.ts       # Full-text + tag search with scoring
    │   └── types/
    │       └── index.ts               # Shared TypeScript interfaces
    ├── scripts/                       # Utility scripts
    ├── supabase_schema.sql            # Complete database schema
    ├── tsconfig.json                  # TypeScript configuration
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Link |
|-------------|---------|------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org/) |
| pnpm | Latest | `npm install -g pnpm` |
| Supabase account | — | [supabase.com](https://supabase.com/) |
| Stack Auth account | — | [stack-auth.com](https://stack-auth.com/) |
| Stripe account | — | [stripe.com](https://stripe.com/) |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/prateekraiger/all_blue.git
cd all_blue
```

### Step 2 — Set up the database

1. Create a new project at [supabase.com](https://supabase.com/)
2. Open the **SQL Editor** in your Supabase dashboard
3. Copy and run the full contents of `backend/supabase_schema.sql`

This creates all 5 tables, indexes, RLS policies, and helper RPC functions.

### Step 3 — Install dependencies

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### Step 4 — Configure environment variables

#### Backend — create `backend/.env`

```env
# ── Server ────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Supabase ──────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Stack Auth (JWT verification) ─────────────────────────────────────
STACK_PROJECT_ID=your_stack_project_id
STACK_SECRET_SERVER_KEY=ssk_...

# ── Stripe ────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── CORS ──────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
```

#### Frontend — create `frontend/.env.local`

```env
# ── Supabase ──────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Backend API ───────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:5000

# ── Stack Auth ────────────────────────────────────────────────────────
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_...
```

### Step 5 — (Optional) Seed sample products

Uncomment the `INSERT` block at the bottom of `backend/supabase_schema.sql` and re-run it in the Supabase SQL Editor to populate sample gift products.

### Step 6 — Start development servers

```bash
# Terminal 1 — Backend API
cd backend
pnpm dev
# → Running at http://localhost:5000
# → Health check: http://localhost:5000/health

# Terminal 2 — Frontend
cd frontend
pnpm dev
# → Running at http://localhost:3000
```

### Step 7 — (Optional) Configure Stripe webhook for local testing

```bash
# Install Stripe CLI
stripe listen --forward-to http://localhost:5000/api/payment/webhook
# Copy the webhook signing secret shown and add it to backend/.env as STRIPE_WEBHOOK_SECRET
```

---

## 🔑 Environment Variables Reference

| Variable | Service | Required | Description |
|----------|---------|:--------:|-------------|
| `PORT` | Backend | ✅ | Server port (default: 5000) |
| `NODE_ENV` | Backend | ✅ | `development` or `production` |
| `SUPABASE_URL` | Backend | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | ✅ | Service role key — bypasses RLS |
| `STACK_PROJECT_ID` | Backend | ✅ | Stack Auth project ID |
| `STACK_SECRET_SERVER_KEY` | Backend | ✅ | Stack Auth server secret key |
| `STRIPE_SECRET_KEY` | Backend | ✅ | Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Backend | ✅ | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Backend | ✅ | Stripe webhook signing secret (`whsec_...`) |
| `FRONTEND_URL` | Backend | ✅ | Frontend origin for CORS + Stripe redirect |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | ✅ | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Frontend | ✅ | Backend base URL |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Frontend | ✅ | Stack Auth project ID |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Frontend | ✅ | Stack Auth client key |

---

## 📡 API Reference

Base URL: `http://localhost:5000`

All protected endpoints require an `Authorization: Bearer <jwt_token>` header.

### Health Check

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/health` | None | Server health, uptime, feature list |

**Response:**
```json
{
  "status": "ok",
  "uptime": 12345,
  "features": ["products", "cart", "orders", "ai", "payments", "reviews", "search", "ar", "admin"]
}
```

---

### Products

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/products` | Optional | List with filters, search, pagination, sort |
| `GET` | `/api/products/trending` | None | Top products from the last 7 days |
| `GET` | `/api/products/categories` | None | All distinct categories |
| `GET` | `/api/products/:id` | None | Single product detail |
| `POST` | `/api/products` | Admin | Create a new product |
| `PUT` | `/api/products/:id` | Admin | Update an existing product |
| `DELETE` | `/api/products/:id` | Admin | Soft-delete a product |

**Query Parameters for `GET /api/products`:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search query |
| `category` | string | Filter by category name |
| `minPrice` | number | Minimum price filter (INR) |
| `maxPrice` | number | Maximum price filter (INR) |
| `sort` | string | `price_asc` \| `price_desc` \| `newest` \| `popular` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |

---

### Search

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/search?q=gift` | None | Full-text + tag search with relevance scoring |

---

### Cart

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/cart` | Required | Get the current user's cart |
| `POST` | `/api/cart` | Required | Add an item to cart |
| `PUT` | `/api/cart/:id` | Required | Update item quantity |
| `DELETE` | `/api/cart/:id` | Required | Remove a single cart item |
| `DELETE` | `/api/cart` | Required | Clear the entire cart |

---

### Orders

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/api/orders` | Required | Place an order |
| `GET` | `/api/orders` | Required | List the current user's orders |
| `GET` | `/api/orders/:id` | Required | Single order detail |
| `PATCH` | `/api/orders/:id/cancel` | Required | Cancel a pending order |
| `GET` | `/api/orders/admin` | Admin | All orders (admin view) |
| `PATCH` | `/api/orders/admin/:id/status` | Admin | Update order status |

---

### Payments (Stripe)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/api/payment/create-checkout` | Required | Create a Stripe Checkout Session |
| `POST` | `/api/payment/verify` | Required | Verify payment after Stripe redirect |
| `POST` | `/api/payment/webhook` | None | Stripe webhook event handler (raw body) |
| `GET` | `/api/payment/config` | None | Returns Stripe publishable key |

> ⚠️ The `/api/payment/webhook` endpoint requires the **raw** request body. Do not apply `express.json()` middleware to this route.

---

### AI Endpoints

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/ai/recommendations` | Required | Personalised product feed (up to 12) |
| `GET` | `/api/ai/similar/:productId` | None | Similar products by tag overlap |
| `POST` | `/api/ai/preferences` | Required | Update user preference signals |
| `POST` | `/api/ai/chat` | Optional | AI chatbot — intent detection + product search |

**POST `/api/ai/chat` body:**
```json
{
  "message": "I need a birthday gift under ₹1000",
  "sessionId": "optional-session-uuid"
}
```

---

### Gift Finder

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/api/gift-finder` | None | AI Gift Finder — persona × occasion × budget |

**POST `/api/gift-finder` body:**
```json
{
  "persona": "friend",
  "occasion": "birthday",
  "budget": 1500,
  "limit": 6
}
```

---

### AR Preview

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/ar/preview/:productId` | None | AR metadata for a specific product |
| `GET` | `/api/ar/supported-categories` | None | List of AR-capable categories |

---

### Reviews

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/reviews/:productId` | None | All reviews + average rating for a product |
| `POST` | `/api/reviews` | Required | Submit a review (one per product per user) |
| `DELETE` | `/api/reviews/:id` | Required | Delete own review |

---

### Admin

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/admin/dashboard` | Admin | Revenue totals, order counts, low-stock list, popular products |

---

## 🗄️ Database Schema

All tables live in **Supabase (PostgreSQL)**. Run `backend/supabase_schema.sql` to create them.

### Tables

#### `products`
```sql
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC NOT NULL CHECK (price >= 0),
  category    TEXT,
  tags        TEXT[]   DEFAULT '{}',     -- GIN indexed for fast overlap queries
  images      TEXT[]   DEFAULT '{}',
  stock       INT      DEFAULT 0 CHECK (stock >= 0),
  is_active   BOOLEAN  DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `orders`
```sql
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  items             JSONB NOT NULL DEFAULT '[]',     -- [{product_id, name, qty, price}]
  total_amount      NUMERIC NOT NULL CHECK (total_amount >= 0),
  status            TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  payment_id        TEXT,
  stripe_session_id TEXT,
  address           JSONB,                           -- {name, line1, city, state, pin, phone}
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `cart`
```sql
CREATE TABLE cart (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity   INT  DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)                       -- one row per item per user
);
```

#### `reviews`
```sql
CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating     INT  CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)                       -- one review per product per user
);
```

#### `user_preferences`
```sql
CREATE TABLE user_preferences (
  user_id           UUID PRIMARY KEY,
  viewed_categories TEXT[] DEFAULT '{}',
  purchased_tags    TEXT[] DEFAULT '{}',
  last_search       TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_tags      ON products USING GIN(tags);  -- critical for AI
CREATE INDEX idx_orders_user_id     ON orders(user_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created_at  ON orders(created_at DESC);
CREATE INDEX idx_cart_user_id       ON cart(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
```

### RPC Functions
```sql
-- Called on successful Stripe payment
SELECT decrement_stock('product-uuid', 2);

-- Called on order cancellation
SELECT increment_stock('product-uuid', 2);
```

### Row Level Security (RLS)
All tables have RLS enabled. The backend uses the **service role key** which bypasses RLS for admin operations. Client-side Supabase uses the **anon key** which respects RLS policies.

---

## 🤖 AI System Design

### Recommendation Engine

The recommendation pipeline runs server-side in `aiService.ts`:

```
1. Fetch user_preferences (purchased_tags + viewed_categories)
        │
        ▼
2. Query products WHERE tags && user_purchased_tags
   (PostgreSQL array overlap operator + GIN index → sub-10ms)
        │
        ▼
3. Fill remaining slots with same-category products
        │
        ▼
4. Fill any remaining slots with newest active products
        │
        ▼
5. Return up to `limit` deduplicated products
```

**Preference learning** — `POST /api/ai/preferences` accepts signals:
```json
{
  "viewedCategory": "Home Decor",
  "purchasedTags": ["luxury", "candle"],
  "searchQuery": "birthday gifts"
}
```
These are upserted into `user_preferences` silently on every product view and purchase.

---

### Chatbot Intent System

```
User message
    │
    ▼
detectIntent()
    ├── "hello" / "hi"       → greeting response
    ├── "bye" / "thanks"     → farewell response
    ├── "help" / "how"       → help guide
    ├── "order" / "track"    → order_help response
    └── default              → product_search flow
                                    │
                                    ▼
                            extractPrice()
                            └── "under ₹500"  → { maxPrice: 500 }
                            └── "above ₹1000" → { minPrice: 1000 }
                                    │
                                    ▼
                            extractTags()
                            └── KEYWORD_TAG_MAP lookup
                                e.g. "birthday" → ['birthday']
                                     "luxury"   → ['luxury','premium']
                                    │
                                    ▼
                            Supabase query
                            └── is_active=true + stock>0
                                + tags &&  matched_tags
                                + price BETWEEN min AND max
                                    │
                                    ▼
                            Format reply + inject quick_replies[]
```

---

### AI Gift Finder

```
Input: { persona, occasion, budget, limit }
    │
    ▼
PERSONA_TAG_MAP[persona] + OCCASION_TAG_MAP[occasion]
→ combined weighted tag set
    │
    ▼
Supabase: products WHERE tags && combined_tags
          AND price <= budget
          AND is_active = true
    │
    ▼
Score each product:
  matchScore = (overlapping tags / total tags) × 100
    │
    ▼
Sort by score DESC, return top `limit` with:
  { product, matchScore, reason }
```

---

### Voice Search (`useVoiceSearch` hook)

```typescript
// Usage
const { transcript, isListening, startListening, stopListening, supported } = useVoiceSearch();

// Implementation
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
recognition.lang = 'en-IN';           // Indian English
recognition.continuous = false;
recognition.interimResults = true;    // Real-time transcript updates

// Auto-submits search when recognition ends
recognition.onend = () => onResult(transcript);
```

---

## 🔒 Security

### Middleware Stack (applied in order)

```
Request
  → x-request-id assignment
  → Helmet (security headers)
  → CORS (origin whitelist)
  → Morgan (HTTP logging)
  → Rate Limiter (200 req/min per IP)
  → express.json() (body parsing)
  → Route-specific auth middleware
  → Zod validation middleware
  → Route handler
  → Global error handler
```

### Authentication Flow

```
Client sends: Authorization: Bearer <stack-auth-jwt>
                    │
                    ▼
         requireAuth middleware
                    │
                    ▼
         Jose.createRemoteJWKSet()
         → fetch JWKS from Stack Auth
                    │
                    ▼
         jose.jwtVerify(token, JWKS)
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
      Valid token            Invalid token
      req.user = payload     → 401 Unauthorized
```

### Rate Limiting

```typescript
// In-memory store: Map<ip, { count, resetAt }>
// 200 requests per minute per IP
// Auto-cleanup of expired entries every 60 seconds
// Returns 429 Too Many Requests on limit exceeded
```

---

## 🚢 Deployment

### Frontend — Vercel (Recommended)

```bash
cd frontend
pnpm build          # Verify build succeeds locally first

# Push to GitHub → connect repo in Vercel dashboard
# Add all NEXT_PUBLIC_* environment variables in Vercel settings
# Deploy automatically on every push to main
```

### Backend — Railway (Recommended)

```bash
cd backend
pnpm build          # Compiles TypeScript → dist/

# Create a new Railway project
# Connect your GitHub repository
# Set root directory to /backend
# Add all environment variables in Railway settings
# Start command: pnpm start   (runs node dist/index.js)
```

### Backend — Render

```yaml
# render.yaml
services:
  - type: web
    name: all-blue-api
    env: node
    rootDir: backend
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: NODE_ENV
        value: production
      # Add remaining env vars in Render dashboard
```

### Backend — Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY backend/ .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

### Environment Checklist for Production

- [ ] Switch Stripe keys from `sk_test_...` to `sk_live_...`
- [ ] Update `FRONTEND_URL` to your production domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure Stripe webhook endpoint to your production `/api/payment/webhook`
- [ ] Enable Supabase project's connection pooler for high traffic
- [ ] Add your production domain to Stack Auth's allowed origins
- [ ] Set up monitoring (e.g., Sentry, Datadog) for production error tracking

---

## 🧪 Development Scripts

### Backend

```bash
cd backend

pnpm dev        # Start dev server with ts-node (hot reload)
pnpm build      # Compile TypeScript → dist/
pnpm start      # Run compiled JS (production)
pnpm lint       # ESLint check
```

### Frontend

```bash
cd frontend

pnpm dev        # Start Next.js dev server (port 3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Next.js ESLint check
pnpm typecheck  # TypeScript type checking (tsc --noEmit)
```

---

## 📊 Performance Notes

| Operation | Implementation | Target Latency |
|-----------|---------------|---------------|
| Product list | Supabase indexed query | < 50ms |
| Tag-based AI recommendations | GIN index array overlap | < 30ms |
| Full-text search | Supabase + relevance scoring | < 80ms |
| Stripe checkout creation | Stripe API call | < 500ms |
| Cart operations | Supabase single-row upsert | < 30ms |
| Chatbot response | In-memory logic + 1 DB query | < 150ms |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Formatting, no logic changes
refactor: Code restructuring
test:     Adding or updating tests
chore:    Build process, dependency updates
```

---

## 📁 Additional Files

| File | Description |
|------|-------------|
| `backend/supabase_schema.sql` | Complete PostgreSQL schema with RLS policies |
| `sampleppt.pptx` | SIH presentation template reference |
| `final.pptx` | **Project presentation — 12 slides, production-ready** |

---

## 📝 License

This project is licensed under the [ISC License](./backend/package.json).

---

## 👤 Author

<div align="center">

**Prateek Raiger**

Built with ❤️ for **Smart India Hackathon 2025**

[![GitHub](https://img.shields.io/badge/GitHub-prateekraiger-181717?style=flat-square&logo=github)](https://github.com/prateekraiger)

> **ALL BLUE** — Where AI meets the art of gifting.

</div>
