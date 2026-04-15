import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth, optionalAuth } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import * as aiService from '../services/aiService';
import type { AuthRequest } from '../types';

const router = Router();

// ─── GET /api/ai/recommendations — Personalised recommendations ───────────────
router.get('/recommendations', requireAuth, async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit
    ? Math.min(parseInt(req.query.limit as string, 10), 20)
    : 12;

  const products = await aiService.getRecommendations(req.user!.id, limit);
  res.json({ success: true, data: products });
});

// ─── GET /api/ai/similar/:productId — Similar products ───────────────────────
router.get('/similar/:productId', async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit
    ? Math.min(parseInt(req.query.limit as string, 10), 12)
    : 8;

  const products = await aiService.getSimilarProducts(req.params.productId, limit);
  res.json({ success: true, data: products });
});

// ─── POST /api/ai/preferences — Record user behaviour signals ─────────────────
router.post(
  '/preferences',
  requireAuth,
  validate(schemas.preferences),
  async (req: AuthRequest, res: Response) => {
    const prefs = await aiService.updatePreferences(req.user!.id, req.body);
    res.json({ success: true, data: prefs });
  }
);

// ─── POST /api/ai/chat — Rule-based chatbot endpoint ─────────────────────────
router.post(
  '/chat',
  optionalAuth,
  validate(schemas.chat),
  async (req: AuthRequest, res: Response) => {
    const { message } = req.body as { message: string };
    const response = await aiService.chatbotResponse(message, req.user?.id ?? null);
    res.json({ success: true, data: response });
  }
);

export default router;
