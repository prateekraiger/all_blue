import { Router } from 'express';
import type { Response } from 'express';
import { requireAdmin, optionalAuth } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import * as productService from '../services/productService';
import type { AuthRequest } from '../types';

const router = Router();

// ─── GET /api/products — List with filters / search / pagination ──────────────
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { category, tag, q, page, limit, sort } = req.query as Record<string, string>;

  const result = await productService.listProducts({
    category: category || undefined,
    tag: tag || undefined,
    q: q || undefined,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
    sort: sort || 'created_at',
  });

  res.json({ success: true, data: result });
});

// ─── GET /api/products/trending — Trending products ──────────────────────────
router.get('/trending', async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit
    ? Math.min(parseInt(req.query.limit as string, 10), 20)
    : 8;

  const products = await productService.getTrendingProducts(limit);
  res.json({ success: true, data: products });
});

// ─── GET /api/products/categories — Distinct category list ───────────────────
router.get('/categories', async (_req: AuthRequest, res: Response) => {
  const categories = await productService.getCategories();
  res.json({ success: true, data: categories });
});

// ─── GET /api/products/:id — Single product detail ───────────────────────────
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const product = await productService.getProduct(req.params.id);
  res.json({ success: true, data: product });
});

// ─── POST /api/products — Create (admin) ─────────────────────────────────────
router.post(
  '/',
  requireAdmin,
  validate(schemas.product),
  async (req: AuthRequest, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  }
);

// ─── PUT /api/products/:id — Update (admin) ───────────────────────────────────
router.put(
  '/:id',
  requireAdmin,
  validate(schemas.product.partial()),
  async (req: AuthRequest, res: Response) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  }
);

// ─── DELETE /api/products/:id — Soft-delete (admin) ──────────────────────────
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await productService.deleteProduct(req.params.id);
  res.json({ success: true, data: result });
});

export default router;
