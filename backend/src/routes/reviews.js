const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');
const reviewService = require('../services/reviewService');

// GET /api/reviews/:productId — Get product reviews
router.get('/:productId', async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.getProductReviews(req.params.productId, {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json({ success: true, data: result });
});

// POST /api/reviews — Submit a review (auth required)
router.post('/', requireAuth, validate(schemas.review), async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body);
  res.status(201).json({ success: true, data: review });
});

// DELETE /api/reviews/:id — Delete own review (auth required)
router.delete('/:id', requireAuth, async (req, res) => {
  const result = await reviewService.deleteReview(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

module.exports = router;
