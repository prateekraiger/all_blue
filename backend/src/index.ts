import 'dotenv/config';
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middlewares/errorHandler';

// ─── Route imports ────────────────────────────────────────────────────────────
import productRoutes     from './routes/products';
import cartRoutes        from './routes/cart';
import orderRoutes       from './routes/orders';
import paymentRoutes     from './routes/payment';
import aiRoutes          from './routes/ai';
import reviewRoutes      from './routes/reviews';
import searchRoutes      from './routes/search';
import adminRoutes       from './routes/admin';
import giftFinderRoutes  from './routes/giftFinder';

// ─── App setup ────────────────────────────────────────────────────────────────
const app: express.Application = express();
const PORT = parseInt(process.env.PORT ?? '5000', 10);

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Stripe webhook needs the raw body for signature verification — must be BEFORE express.json()
app.use(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'GiftShop AI Backend is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/products',     productRoutes);
app.use('/api/cart',         cartRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/payment',      paymentRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/search',       searchRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/gift-finder',  giftFinderRoutes);

// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 GiftShop AI Backend (TypeScript) running on port ${PORT}`);
  console.log(`📦 Environment : ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`🌐 CORS allowed: ${process.env.FRONTEND_URL ?? 'http://localhost:3000'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

export default app;
