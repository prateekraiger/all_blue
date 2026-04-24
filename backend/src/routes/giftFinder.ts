import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate, schemas } from '../middlewares/validate';
import * as aiService from '../services/aiService';
import type { GiftFinderInput } from '../types';

const router: Router = Router();

// ─── POST /api/gift-finder — AI-powered gift recommendations ──────────────────
router.post(
  '/',
  validate(schemas.giftFinder),
  async (req: Request, res: Response) => {
    const input = req.body as GiftFinderInput;
    const result = await aiService.giftFinderRecommendations(input);

    res.json({
      success: true,
      data: result,
    });
  }
);

export default router;
