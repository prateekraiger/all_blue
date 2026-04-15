import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import * as paymentService from '../services/paymentService';
import * as orderService from '../services/orderService';
import { AppError } from '../middlewares/errorHandler';
import type { AuthRequest } from '../types';

const router = Router();

// ─── POST /api/payment/create-order ──────────────────────────────────────────
/**
 * Create a Razorpay order for an internal order that is still in 'pending' status.
 * Returns the Razorpay order details + public key so the frontend can open the checkout widget.
 */
router.post(
  '/create-order',
  requireAuth,
  validate(schemas.paymentCreate),
  async (req: AuthRequest, res: Response) => {
    const { order_id, amount } = req.body as { order_id: string; amount: number };

    // Ensure the order belongs to this user and is still pending
    const order = await orderService.getOrder(req.user!.id, order_id);
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
        key_id: process.env.RAZORPAY_KEY_ID ?? '',
        order_id,
      },
    });
  }
);

// ─── POST /api/payment/verify ─────────────────────────────────────────────────
/**
 * Verify the HMAC signature from Razorpay and mark the internal order as paid.
 */
router.post(
  '/verify',
  requireAuth,
  validate(schemas.paymentVerify),
  async (req: AuthRequest, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } =
      req.body as {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        order_id: string;
      };

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
      data: { message: 'Payment verified successfully', order },
    });
  }
);

// ─── GET /api/payment/razorpay-key ────────────────────────────────────────────
/**
 * Return the Razorpay public key for the frontend to initialise the payment widget.
 */
router.get('/razorpay-key', (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: { key_id: process.env.RAZORPAY_KEY_ID ?? '' },
  });
});

export default router;
