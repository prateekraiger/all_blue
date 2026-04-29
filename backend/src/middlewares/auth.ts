import type { Response, NextFunction } from 'express';
import * as jose from 'jose';
import { AppError } from './errorHandler';
import {
  AuthRequest,
  AuthUser,
  StackPayload,
} from '../types';

const STACK_PROJECT_ID = process.env.STACK_PROJECT_ID ?? '';
const STACK_SECRET_SERVER_KEY = process.env.STACK_SECRET_SERVER_KEY ?? '';

const JWKS_URL = `https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`;

// Cache the JWKS remote set (refreshes automatically via jose)
let _jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;
function getJWKS() {
  if (!_jwks) {
    _jwks = jose.createRemoteJWKSet(new URL(JWKS_URL));
  }
  return _jwks;
}

/**
 * Verify a Stack Auth access token from the x-stack-access-token header.
 * Returns the JWT payload on success, or null if invalid/missing.
 */
async function verifyStackToken(token: string): Promise<StackPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJWKS());
    return payload as unknown as StackPayload;
  } catch {
    return null;
  }
}

/**
 * requireAuth — Validates a Stack Auth JWT from the Authorization header.
 * Attaches a normalized user object to req.user on success.
 */
export const requireAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401));
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyStackToken(token);

    if (!payload || !payload.sub) {
      return next(new AppError('Invalid or expired token', 401));
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
  } catch {
    next(new AppError('Authentication failed', 401));
  }
};

/**
 * optionalAuth — Attaches user if a valid Stack Auth token is present,
 * but does NOT block requests without a token.
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
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
  } catch {
    next();
  }
};

/**
 * LOCAL_ADMIN_TOKEN — Hardcoded static token for the local admin panel.
 * This bypasses Stack Auth entirely and grants full admin access.
 */
const LOCAL_ADMIN_TOKEN = 'local-admin-secret-token-allblue-2024';

/**
 * requireAdmin — Checks that the authenticated user has role === 'admin'.
 * Also accepts the hardcoded local admin token for the /admin panel.
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // ── Local admin panel bypass ────────────────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${LOCAL_ADMIN_TOKEN}`) {
    req.user = {
      id: 'local-admin',
      email: 'admin@gmail.com',
      user_metadata: { full_name: 'Admin', role: 'admin' },
    };
    return next();
  }

  // ── Standard Stack Auth flow ────────────────────────────────────────────────
  await requireAuth(req, res, (err?: any) => {
    if (err) return next(err);
    const userRole = req.user?.user_metadata?.role;
    if (userRole !== 'admin') {
      return next(new AppError('Admin access required', 403));
    }
    next();
  });
};
