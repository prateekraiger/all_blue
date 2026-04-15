# 🌊 All Blue — Next-Gen AI E-Commerce Platform

All Blue is a cutting-edge, AI-powered e-commerce ecosystem designed for premium gift shopping experiences. Built with a modern full-stack architecture, it leverages advanced AI capabilities to provide personalized recommendations, dynamic searching, and a seamless shopping journey.

---

## 🏗️ Project Architecture

The project is structured as a monorepo-style setup with separate directories for the frontend and backend:

- **[`/frontend`](./frontend)**: A high-performance Next.js application focused on user experience and visual excellence.
- **[`/backend`](./backend)**: A robust Express.js API handling business logic, payments, and data orchestration.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & Vanilla CSS
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & CSS Transitions
- **State Management**: React Hooks & Context API
- **Client SDK**: [Supabase JS](https://supabase.com/docs/reference/javascript/introduction)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Payments**: [Razorpay](https://razorpay.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: Morgan & Winston

---

## ✨ Core Features

- **🛍️ Dynamic Shop**: Browse products with AI-driven categorization and filtering.
- **🔍 Smart Search**: Real-time search functionality to find the perfect gift instantly.
- **🔐 Secure Auth**: Built-in authentication and profile management via Supabase.
- **🛒 Shopping Cart**: Persistent cart state with intuitive UX.
- **💳 Checkout & Payments**: Integrated Razorpay payment gateway for secure transactions.
- **📦 Order Tracking**: Complete order history and status tracking for users.
- **🛡️ Admin Dashboard**: Full control over products, orders, and user management.
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop viewing.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (Recommended) or npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd all_blue
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install frontend dependencies
   cd frontend
   pnpm install

   # Install backend dependencies
   cd ../backend
   pnpm install
   ```

### Running the Development Server

1. **Start the Backend**:
   ```bash
   cd backend
   pnpm dev
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   pnpm dev
   ```

The application will be available at `http://localhost:3000` (frontend) and `http://localhost:5000` (backend).

---

## 🔑 Environment Variables

Create a `.env` file in both `frontend` and `backend` directories.

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## 📄 License

This project is licensed under the [ISC License](./backend/package.json).
