const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validate');
const paymentService = require('../services/paymentService');
const orderService = require('../services/orderService');
const { AppError } = require('../middlewares/errorHandler');
const { z } = require('zod');

// POST /api/payment/create-order
// Creates a Razorpay order for a given internal order ID
router.post(
  '/create-order',
  requireAuth,
  validate(z.object({ order_id: z.string().uuid(), amount: z.number().positive() })),
  async (req, res) => {
    const { order_id, amount } = req.body;

    // Verify the order belongs to this user
    const order = await orderService.getOrder(req.user.id, order_id);
    if (order.status !== 'pending') {
      throw new AppError('Order is not in pending state', 400);
    }

    const razorpayOrder = await paymentService.createRazorpayOrder(amount, order_id);

    res.json({
      success: true,
      data: {
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        order_id,
      },
    });
  }
);

// POST /api/payment/verify
// Verifies Razorpay signature and marks order as paid
router.post('/verify', requireAuth, validate(schemas.paymentVerify), async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

  const isValid = paymentService.verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    throw new AppError('Invalid payment signature', 400);
  }

  const order = await orderService.markOrderPaid(
    order_id,
    razorpay_order_id,
    razorpay_payment_id
  );

  res.json({
    success: true,
    data: {
      message: 'Payment verified successfully',
      order,
    },
  });
});

// GET /api/payment/razorpay-key — Return public key for frontend
router.get('/razorpay-key', (req, res) => {
  res.json({
    success: true,
    data: { key_id: process.env.RAZORPAY_KEY_ID || '' },
  });
});

module.exports = router;
