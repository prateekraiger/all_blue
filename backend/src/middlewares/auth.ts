import type { Response, NextFunction } from 'express';
import supabase from '../config/supabase';
import { AppError } from './errorHandler';
import type { AuthRequest } from '../types';

/**
 * requireAuth — Validates the Supabase JWT from the Authorization header.
 * Attaches the Supabase user object to req.user on success.
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

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(new AppError('Invalid or expired token', 401));
    }

    req.user = user;
    next();
  } catch {
    next(new AppError('Authentication failed', 401));
  }
};

/**
 * optionalAuth — Attaches user if a valid token is present,
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
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

/**
 * requireAdmin — Checks that the authenticated user has role === 'admin'
 * in their user_metadata. Must be chained after requireAuth.
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await requireAuth(req, res, async () => {
    const userRole = req.user?.user_metadata?.role as string | undefined;
    if (userRole !== 'admin') {
      return next(new AppError('Admin access required', 403));
    }
    next();
  });
};
