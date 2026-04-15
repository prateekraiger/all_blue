const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');
const cartService = require('../services/cartService');

// All cart routes require authentication
router.use(requireAuth);

// GET /api/cart — Get user's cart
router.get('/', async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json({ success: true, data: cart });
});

// POST /api/cart — Add item to cart
router.post('/', validate(schemas.cartItem), async (req, res) => {
  const { product_id, quantity } = req.body;
  const item = await cartService.addToCart(req.user.id, product_id, quantity);
  res.status(201).json({ success: true, data: item });
});

// PUT /api/cart/:id — Update quantity
router.put('/:id', validate(schemas.cartUpdate), async (req, res) => {
  const item = await cartService.updateCartItem(req.user.id, req.params.id, req.body.quantity);
  res.json({ success: true, data: item });
});

// DELETE /api/cart/:id — Remove item
router.delete('/:id', async (req, res) => {
  const result = await cartService.removeFromCart(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

// DELETE /api/cart — Clear entire cart
router.delete('/', async (req, res) => {
  await cartService.clearCart(req.user.id);
  res.json({ success: true, data: { message: 'Cart cleared' } });
});

module.exports = router;
