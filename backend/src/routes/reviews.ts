import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import * as reviewService from '../services/reviewService';
import type { AuthRequest } from '../types';

const router = Router();

// ─── GET /api/reviews/:productId — Get all reviews for a product ──────────────
router.get('/:productId', async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;

  const result = await reviewService.getProductReviews(req.params.productId, {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
  });

  res.json({ success: true, data: result });
});

// ─── POST /api/reviews — Submit a review (auth required) ──────────────────────
router.post(
  '/',
  requireAuth,
  validate(schemas.review),
  async (req: AuthRequest, res: Response) => {
    const review = await reviewService.createReview(req.user!.id, req.body);
    res.status(201).json({ success: true, data: review });
  }
);

// ─── DELETE /api/reviews/:id — Delete own review (auth required) ──────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await reviewService.deleteReview(req.user!.id, req.params.id);
  res.json({ success: true, data: result });
});

export default router;
