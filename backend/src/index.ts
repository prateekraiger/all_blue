import "dotenv/config";
import "express-async-errors";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";

import { errorHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";

// ─── Route imports ────────────────────────────────────────────────────────────
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import paymentRoutes from "./routes/payment";
import aiRoutes from "./routes/ai";
import reviewRoutes from "./routes/reviews";
import searchRoutes from "./routes/search";
import adminRoutes from "./routes/admin";
import giftFinderRoutes from "./routes/giftFinder";

// ─── App setup ────────────────────────────────────────────────────────────────
const app: express.Application = express();
const PORT = parseInt(process.env.PORT ?? "5000", 10);
const startTime = Date.now();

// ─── Request ID middleware ────────────────────────────────────────────────────
app.use((req, res, next) => {
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();
  res.setHeader("x-request-id", requestId);
  (req as any).requestId = requestId;
  next();
});

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow frontend proxying in dev
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      const envOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
      const allowed = [
        ...envOrigins,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5000",
        "http://localhost:4000",
      ];
      // Allow requests with no origin (e.g. curl, server-to-server)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Origin ${origin} blocked`);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    exposedHeaders: ["x-request-id"],
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Stripe webhook needs the raw body for signature verification — must be BEFORE express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use("/api/", rateLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  const uptimeMs = Date.now() - startTime;
  const uptimeSec = Math.floor(uptimeMs / 1000);

  res.json({
    success: true,
    message: "ALL BLUE — GiftShop AI Backend is running",
    version: "2.2.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    uptime: `${uptimeSec}s`,
    features: [
      "AI Gift Recommendations",
      "Voice Search",
      "AR Product Preview",
      "Personalized Feed",
      "AI Shopping Chatbot (Gemini 2.5 Flash)",
      "Razorpay / Stripe Payments",
      "Order Tracking",
      "Admin Dashboard",
    ],
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gift-finder", giftFinderRoutes);

// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(
    `🚀 ALL BLUE — GiftShop AI Backend v2.2.0 running on port ${PORT}`,
  );
  console.log(`📦 Environment : ${process.env.NODE_ENV ?? "development"}`);
  console.log(
    `🌐 CORS allowed: ${process.env.FRONTEND_URL ?? "http://localhost:3000"}`,
  );
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI features : recommendations, chatbot, gift finder`);
  console.log(
    `🧠 Gemini 2.5  : ${process.env.GEMINI_API_KEY ? "ENABLED (Flash-Lite/Pro)" : "DISABLED — using rule-based fallback"}`,
  );
  console.log(`🔒 Rate limiting: enabled`);
});

export default app;
