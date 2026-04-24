import { Router } from 'express';
import type { Response } from 'express';
import * as searchService from '../services/searchService';
import type { AuthRequest } from '../types';

const router: Router = Router();

// ─── GET /api/search?q=gift&category=birthday&maxPrice=500 ────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  const { q, page, limit, category, maxPrice, minPrice, sort } =
    req.query as Record<string, string>;

  const result = await searchService.searchProducts(q, {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
    category: category || undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    sort: sort || 'relevance',
  });

  res.json({ success: true, data: result });
});

export default router;
