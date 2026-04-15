const express = require('express');
const router = express.Router();
const { requireAdmin, optionalAuth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');
const productService = require('../services/productService');
const { z } = require('zod');

// GET /api/products — List with filters
router.get('/', optionalAuth, async (req, res) => {
  const { category, tag, q, page, limit, sort } = req.query;
  const result = await productService.listProducts({
    category,
    tag,
    q,
    page: page ? parseInt(page) : 1,
    limit: limit ? Math.min(parseInt(limit), 100) : 20,
    sort,
  });
  res.json({ success: true, data: result });
});

// GET /api/products/trending — Trending products
router.get('/trending', async (req, res) => {
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 20) : 8;
  const products = await productService.getTrendingProducts(limit);
  res.json({ success: true, data: products });
});

// GET /api/products/categories — All distinct categories
router.get('/categories', async (req, res) => {
  const categories = await productService.getCategories();
  res.json({ success: true, data: categories });
});

// GET /api/products/:id — Single product
router.get('/:id', optionalAuth, async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  res.json({ success: true, data: product });
});

// POST /api/products — Create (admin)
router.post(
  '/',
  requireAdmin,
  validate(schemas.product),
  async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  }
);

// PUT /api/products/:id — Update (admin)
router.put(
  '/:id',
  requireAdmin,
  validate(schemas.product.partial()),
  async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  }
);

// DELETE /api/products/:id — Delete (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = router;
