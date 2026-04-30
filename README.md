# ALL BLUE

## AI-Powered Gift Shop Platform

A modern e-commerce platform for finding the perfect gifts with AI recommendations, voice search, and AR product previews.

## Features

- **AI Gift Recommendations** - Smart suggestions based on preferences
- **Voice Search** - Find products using voice commands
- **AR Product Preview** - See products in your space
- **Responsive Design** - Works perfectly on all devices
- **Secure Payments** - Integrated with Stripe
- **Real-time Search** - Instant product discovery

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Stack Auth
- **Payments**: Stripe
- **AI**: Custom recommendation engine

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd all_blue
```

2. Install dependencies:
```bash
# Frontend
cd frontend
pnpm install

# Backend
cd backend
pnpm install
```

3. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Backend (.env)
DATABASE_URL=your_database_url
STRIPE_SECRET_KEY=your_stripe_secret_key
STACK_API_KEY=your_stack_api_key
```

4. Run the application:
```bash
# Frontend
cd frontend
pnpm dev

# Backend
cd backend
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
all_blue/
frontend/
  app/                 # Next.js app router
  components/          # React components
  lib/                # Utility functions
  public/             # Static assets
backend/
  src/
    controllers/      # API controllers
    models/           # Database models
    routes/           # API routes
    middleware/       # Custom middleware
```

## Key Components

- **Navigation** - Responsive navbar with search and cart
- **Product Grid** - Product display with filtering
- **Hero Section** - Landing page with animations
- **AI Chatbot** - Interactive gift recommendations
- **Shopping Cart** - E-commerce functionality

## Environment Variables

### Frontend
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STACK_API_KEY` - Stack authentication key
- `NODE_ENV` - Environment (development/production)

## Deployment

### Frontend (Vercel)
```bash
cd frontend
pnpm build
vercel --prod
```

### Backend (Railway/
```bash
cd backend
pnpm build
# Deploy to your preferred platform
```

