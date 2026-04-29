import { Response, NextFunction } from 'express';
import * as jose from 'jose';
import { AppError } from './errorHandler';
import { AuthRequest, StackPayload } from '../types';

const STACK_PROJECT_ID = (process.env.STACK_PROJECT_ID || '').trim();

// ── JWKS for Stack Auth token verification ───────────────────────────────────
const JWKS = jose.createRemoteJWKSet(
  new URL(`https://api.stackauth.com/api/v1/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`)
);

export const LOCAL_ADMIN_TOKEN = 'local-admin-secret-token-allblue-2026';

/**
 * verifyStackToken — Helper to verify JWT from Stack Auth using jose.
 * Handles different issuer formats and clock skew.
 */
async function verifyStackToken(token: string): Promise<StackPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: [
        `https://api.stackauth.com/api/v1/projects/${STACK_PROJECT_ID}`,
        `https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}`,
        `https://api.stackauth.com/projects/${STACK_PROJECT_ID}`,
        `https://api.stack-auth.com/projects/${STACK_PROJECT_ID}`,
      ],
      clockTolerance: 60, // Allow 60s clock skew
    });
    return payload as unknown as StackPayload;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[AUTH] Token verification failed: ${msg}`);
    
    // Debug info for the user/logs
    try {
      const decoded = jose.decodeJwt(token);
      console.log('[AUTH] Token Debug:', {
        issuer: decoded.iss,
        subject: decoded.sub,
        expires: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A',
        now: new Date().toISOString(),
        expectedProjectId: STACK_PROJECT_ID
      });
    } catch (decodeError) {
      console.error('[AUTH] Could not decode failed token');
    }
    
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
    
    // ── Local admin panel bypass ────────────────────────────────────────────────
    if (authHeader && authHeader.trim() === `Bearer ${LOCAL_ADMIN_TOKEN}`) {
      req.user = {
        id: 'local-admin',
        email: 'admin@gmail.com',
        user_metadata: { full_name: 'Admin', role: 'admin' },
      };
      return next();
    }

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
  } catch (error) {
    next(error);
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
    
    // ── Local admin panel bypass ────────────────────────────────────────────────
    if (authHeader === `Bearer ${LOCAL_ADMIN_TOKEN}`) {
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
  } catch {
    next();
  }
};

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
  const expectedHeader = `Bearer ${LOCAL_ADMIN_TOKEN}`;
  
  if (authHeader && authHeader.trim() === expectedHeader) {
    console.log('[Auth] Admin bypass successful');
    req.user = {
      id: 'local-admin',
      email: 'admin@gmail.com',
      user_metadata: { full_name: 'Admin', role: 'admin' },
    };
    return next();
  }
  
  console.log(`[Auth] Admin check failed. Header: ${authHeader ? 'present' : 'missing'}`);
  if (authHeader && authHeader !== expectedHeader) {
    console.log(`[Auth] Header mismatch. Received: "${authHeader.substring(0, 20)}...", Expected: "${expectedHeader.substring(0, 20)}..."`);
  }
  
  if (authHeader) {
    console.log(`[Auth] Attempting standard auth. Header starts with: ${authHeader.substring(0, 15)}...`);
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
