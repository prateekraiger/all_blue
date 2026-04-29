"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalAuth = exports.requireAuth = exports.LOCAL_ADMIN_TOKEN = void 0;
const jose = __importStar(require("jose"));
const errorHandler_1 = require("./errorHandler");
const STACK_PROJECT_ID = (process.env.STACK_PROJECT_ID || '').trim();
// ── JWKS for Stack Auth token verification ───────────────────────────────────
const JWKS = jose.createRemoteJWKSet(new URL(`https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`));
exports.LOCAL_ADMIN_TOKEN = 'local-admin-secret-token-allblue-2026';
/**
 * verifyStackToken — Helper to verify JWT from Stack Auth using jose.
 * Handles different issuer formats and clock skew.
 */
async function verifyStackToken(token) {
    try {
        // Stack Auth can use various issuer formats depending on the version and configuration.
        // We include common patterns to ensure compatibility.
        const { payload } = await jose.jwtVerify(token, JWKS, {
            issuer: [
                `https://api.stackauth.com/api/v1/projects/${STACK_PROJECT_ID}`,
                `https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}`,
                `https://api.stackauth.com/projects/${STACK_PROJECT_ID}`,
                `https://api.stack-auth.com/projects/${STACK_PROJECT_ID}`,
                `https://api.stackauth.com`,
                `https://api.stack-auth.com`,
                `https://stackauth.com`,
                `https://stack-auth.com`,
            ],
            clockTolerance: 120, // Increased to 120s to handle more significant clock drift
        });
        return payload;
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[AUTH] Token verification failed: ${msg}`);
        // Debug info for logs
        try {
            const decoded = jose.decodeJwt(token);
            console.log('[AUTH] Token Debug:', {
                issuer: decoded.iss,
                subject: decoded.sub,
                expires: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A',
                now: new Date().toISOString(),
                expectedProjectId: STACK_PROJECT_ID,
                match: decoded.iss?.includes(STACK_PROJECT_ID) ? 'Project ID match found in issuer' : 'No match'
            });
        }
        catch (decodeError) {
            console.error('[AUTH] Could not decode failed token');
        }
        return null;
    }
}
/**
 * requireAuth — Validates a Stack Auth JWT from the Authorization header.
 * Attaches a normalized user object to req.user on success.
 */
const requireAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // ── Local admin panel bypass ────────────────────────────────────────────────
        if (authHeader && authHeader.trim() === `Bearer ${exports.LOCAL_ADMIN_TOKEN}`) {
            req.user = {
                id: 'local-admin',
                email: 'admin@gmail.com',
                user_metadata: { full_name: 'Admin', role: 'admin' },
            };
            return next();
        }
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new errorHandler_1.AppError('No token provided', 401));
        }
        const token = authHeader.split(' ')[1];
        const payload = await verifyStackToken(token);
        if (!payload || !payload.sub) {
            return next(new errorHandler_1.AppError('Invalid or expired token', 401));
        }
        // Normalize to a shape compatible with the rest of the codebase
        req.user = {
            id: payload.sub,
            email: payload.email ?? null,
            user_metadata: {
                full_name: payload.displayName ?? null,
                role: payload.role ?? 'user',
            },
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAuth = requireAuth;
/**
 * optionalAuth — Attaches user if a valid Stack Auth token is present,
 * but does NOT block requests without a token.
 */
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // ── Local admin panel bypass ────────────────────────────────────────────────
        if (authHeader === `Bearer ${exports.LOCAL_ADMIN_TOKEN}`) {
            req.user = {
                id: 'local-admin',
                email: 'admin@gmail.com',
                user_metadata: { full_name: 'Admin', role: 'admin' },
            };
            return next();
        }
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.split(' ')[1];
        const payload = await verifyStackToken(token);
        if (payload?.sub) {
            req.user = {
                id: payload.sub,
                email: payload.email ?? null,
                user_metadata: {
                    full_name: payload.displayName ?? null,
                    role: payload.role ?? 'user',
                },
            };
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * requireAdmin — Middleware to restrict routes to admin users only.
 * Supports both local bypass and Stack Auth role verification.
 */
const requireAdmin = async (req, res, next) => {
    // ── Use requireAuth to populate req.user ─────────────────────────────────────
    await (0, exports.requireAuth)(req, res, (err) => {
        if (err)
            return next(err);
        const userRole = req.user?.user_metadata?.role;
        if (userRole !== 'admin') {
            return next(new errorHandler_1.AppError('Admin access required', 403));
        }
        next();
    });
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map