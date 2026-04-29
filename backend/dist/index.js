"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const uuid_1 = require("uuid");
const errorHandler_1 = require("./middlewares/errorHandler");
const rateLimiter_1 = require("./middlewares/rateLimiter");
// ─── Route imports ────────────────────────────────────────────────────────────
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const payment_1 = __importDefault(require("./routes/payment"));
const ai_1 = __importDefault(require("./routes/ai"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const search_1 = __importDefault(require("./routes/search"));
const admin_1 = __importDefault(require("./routes/admin"));
const giftFinder_1 = __importDefault(require("./routes/giftFinder"));
// ─── App setup ────────────────────────────────────────────────────────────────
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT ?? '5000', 10);
const startTime = Date.now();
// ─── Request ID middleware ────────────────────────────────────────────────────
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    res.setHeader('x-request-id', requestId);
    req.requestId = requestId;
    next();
});
// ─── Security & Logging ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Allow frontend proxying in dev
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowed = [
            process.env.FRONTEND_URL ?? 'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3000',
        ];
        // Allow requests with no origin (e.g. curl, server-to-server)
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
}));
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// ─── Body parsing ─────────────────────────────────────────────────────────────
// Stripe webhook needs the raw body for signature verification — must be BEFORE express.json()
app.use('/api/payment/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api/', rateLimiter_1.rateLimiter);
// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    const uptimeMs = Date.now() - startTime;
    const uptimeSec = Math.floor(uptimeMs / 1000);
    res.json({
        success: true,
        message: 'ALL BLUE — GiftShop AI Backend is running',
        version: '2.2.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? 'development',
        uptime: `${uptimeSec}s`,
        features: [
            'AI Gift Recommendations',
            'Voice Search',
            'AR Product Preview',
            'Personalized Feed',
            'AI Shopping Chatbot (Gemini 1.5 Flash)',
            'Razorpay / Stripe Payments',
            'Order Tracking',
            'Admin Dashboard',
        ],
    });
});
// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/products', products_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/payment', payment_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/search', search_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/gift-finder', giftFinder_1.default);
// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
});
// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 ALL BLUE — GiftShop AI Backend v2.2.0 running on port ${PORT}`);
    console.log(`📦 Environment : ${process.env.NODE_ENV ?? 'development'}`);
    console.log(`🌐 CORS allowed: ${process.env.FRONTEND_URL ?? 'http://localhost:3000'}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 AI features : recommendations, chatbot, gift finder`);
    console.log(`🧠 Gemini 1.5  : ${process.env.GEMINI_API_KEY ? 'ENABLED (Flash)' : 'DISABLED — using rule-based fallback'}`);
    console.log(`🔒 Rate limiting: enabled`);
});
exports.default = app;
//# sourceMappingURL=index.js.map