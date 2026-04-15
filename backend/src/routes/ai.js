const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');
const aiService = require('../services/aiService');
const { z } = require('zod');

// GET /api/ai/recommendations — Personalized products (auth required)
router.get('/recommendations', requireAuth, async (req, res) => {
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 20) : 12;
  const products = await aiService.getRecommendations(req.user.id, limit);
  res.json({ success: true, data: products });
});

// GET /api/ai/similar/:productId — Similar products (no auth required)
router.get('/similar/:productId', async (req, res) => {
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 12) : 8;
  const products = await aiService.getSimilarProducts(req.params.productId, limit);
  res.json({ success: true, data: products });
});

// POST /api/ai/preferences — Update user preference signals
router.post('/preferences', requireAuth, validate(schemas.preferences), async (req, res) => {
  const prefs = await aiService.updatePreferences(req.user.id, req.body);
  res.json({ success: true, data: prefs });
});

// POST /api/ai/chat — Chatbot endpoint
router.post(
  '/chat',
  optionalAuth,
  validate(z.object({ message: z.string().min(1).max(500) })),
  async (req, res) => {
    const response = await aiService.chatbotResponse(
      req.body.message,
      req.user?.id || null
    );
    res.json({ success: true, data: response });
  }
);

module.exports = router;
