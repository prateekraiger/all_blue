const supabase = require('../config/supabase');
const { AppError } = require('./errorHandler');

/**
 * Validates the Supabase JWT from the Authorization header.
 * Attaches the user object to req.user.
 */
const requireAuth = async (req, res, next) => {
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
  } catch (err) {
    next(new AppError('Authentication failed', 401));
  }
};

/**
 * Optional auth — attaches user if token is valid, but doesn't block.
 */
const optionalAuth = async (req, res, next) => {
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
 * Checks if authenticated user has admin role.
 * User metadata must have: { role: 'admin' }
 */
const requireAdmin = async (req, res, next) => {
  try {
    await requireAuth(req, res, async () => {
      const userRole = req.user?.user_metadata?.role;
      if (userRole !== 'admin') {
        return next(new AppError('Admin access required', 403));
      }
      next();
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAuth, optionalAuth, requireAdmin };
