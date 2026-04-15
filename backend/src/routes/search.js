const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');

// GET /api/search?q=gift&category=birthday&maxPrice=500
router.get('/', async (req, res) => {
  const { q, page, limit, category, maxPrice, minPrice, sort } = req.query;
  const result = await searchService.searchProducts(q, {
    page: page ? parseInt(page) : 1,
    limit: limit ? Math.min(parseInt(limit), 50) : 20,
    category,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    sort,
  });
  res.json({ success: true, data: result });
});

module.exports = router;
