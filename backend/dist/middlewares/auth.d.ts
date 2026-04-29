import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const LOCAL_ADMIN_TOKEN = "local-admin-secret-token-allblue-2026";
/**
 * requireAuth — Validates a Stack Auth JWT from the Authorization header.
 * Attaches a normalized user object to req.user on success.
 */
export declare const requireAuth: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * optionalAuth — Attaches user if a valid Stack Auth token is present,
 * but does NOT block requests without a token.
 */
export declare const optionalAuth: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * requireAdmin — Middleware to restrict routes to admin users only.
 * Supports both local bypass and Stack Auth role verification.
 */
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map