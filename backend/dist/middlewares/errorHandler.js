"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
// ─── Custom Application Error ────────────────────────────────────────────────
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        // Maintains proper stack trace in V8
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// ─── Global Error Handler Middleware ─────────────────────────────────────────
const errorHandler = (err, _req, res, _next) => {
    console.error('[ERROR]', err.name, '—', err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }
    // Custom application errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }
    // Supabase / JWT error passthrough (common 401 pattern)
    if (err.message.includes('JWT') || err.message.includes('token')) {
        res.status(401).json({
            success: false,
            error: 'Authentication failed',
        });
        return;
    }
    // Generic 500
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map