const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');
const orderService = require('../services/orderService');
const { z } = require('zod');

// All order routes require authentication
router.use(requireAuth);

// POST /api/orders — Create order
router.post('/', validate(schemas.order), async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json({ success: true, data: order });
});

// GET /api/orders — Get user's orders
router.get('/', async (req, res) => {
  const { page, limit } = req.query;
  const result = await orderService.getUserOrders(req.user.id, {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
  });
  res.json({ success: true, data: result });
});

// GET /api/orders/admin — Admin: all orders
router.get('/admin', requireAdmin, async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await orderService.getAllOrders({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
    status,
  });
  res.json({ success: true, data: result });
});

// PATCH /api/orders/admin/:id/status — Admin: update status
router.patch(
  '/admin/:id/status',
  requireAdmin,
  validate(z.object({ status: z.string() })),
  async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  }
);

// GET /api/orders/:id — Get single order
router.get('/:id', async (req, res) => {
  const order = await orderService.getOrder(req.user.id, req.params.id);
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/cancel — Cancel order
router.patch('/:id/cancel', async (req, res) => {
  const order = await orderService.cancelOrder(req.user.id, req.params.id);
  res.json({ success: true, data: order });
});

module.exports = router;
