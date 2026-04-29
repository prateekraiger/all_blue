"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
/**
 * Simple in-memory rate limiter.
 * Limits each IP to `MAX_REQUESTS` requests per `WINDOW_MS` milliseconds.
 *
 * For production, replace with `express-rate-limit` backed by Redis.
 */
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 200; // per window per IP
const store = new Map();
// Cleanup stale entries every 5 minutes to avoid memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now)
            store.delete(key);
    }
}, 5 * 60 * 1000);
const rateLimiter = (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown';
    const now = Date.now();
    const entry = store.get(ip);
    if (!entry || entry.resetAt < now) {
        store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        setRateLimitHeaders(res, MAX_REQUESTS - 1, now + WINDOW_MS);
        return next();
    }
    entry.count += 1;
    const remaining = MAX_REQUESTS - entry.count;
    setRateLimitHeaders(res, Math.max(0, remaining), entry.resetAt);
    if (entry.count > MAX_REQUESTS) {
        res.status(429).json({
            success: false,
            error: 'Too many requests. Please slow down and try again in a minute.',
            retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        });
        return;
    }
    next();
};
exports.rateLimiter = rateLimiter;
function setRateLimitHeaders(res, remaining, resetAt) {
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(resetAt).toISOString());
}
//# sourceMappingURL=rateLimiter.js.map