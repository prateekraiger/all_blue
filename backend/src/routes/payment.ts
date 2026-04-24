import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import * as paymentService from '../services/paymentService';
import * as orderService from '../services/orderService';
import { AppError } from '../middlewares/errorHandler';
import type { AuthRequest } from '../types';

const router: Router = Router();

// ─── POST /api/payment/create-checkout — Create a Stripe Checkout Session ────
/**
 * Create a Stripe Checkout Session for an internal order that is still 'pending'.
 * Returns the session ID and redirect URL so the frontend can redirect to Stripe.
 */
router.post(
  '/create-checkout',
  requireAuth,
  validate(schemas.paymentCreate),
  async (req: AuthRequest, res: Response) => {
    const { order_id, amount } = req.body as { order_id: string; amount: number };

    // Ensure the order belongs to this user and is still pending
    const order = await orderService.getOrder(req.user!.id, order_id);
    if (order.status !== 'pending') {
      throw new AppError('Order is not in pending state', 400);
    }

    const session = await paymentService.createCheckoutSession(
      amount,
      order_id,
      req.user!.email ?? undefined
    );

    res.json({
      success: true,
      data: {
        session_id: session.sessionId,
        checkout_url: session.url,
        order_id,
      },
    });
  }
);

// ─── POST /api/payment/verify — Verify payment after Stripe Checkout ─────────
/**
 * Verify a completed Stripe Checkout Session and mark the order as paid.
 * This is the client-side fallback — a webhook should also be configured for reliability.
 */
router.post(
  '/verify',
  requireAuth,
  validate(schemas.paymentVerify),
  async (req: AuthRequest, res: Response) => {
    const { session_id, order_id } = req.body as {
      session_id: string;
      order_id: string;
    };

    const session = await paymentService.getCheckoutSession(session_id);

    if (session.payment_status !== 'paid') {
      throw new AppError('Payment not completed', 400);
    }

    // Ensure the metadata matches
    if (session.metadata?.order_id !== order_id) {
      throw new AppError('Order ID mismatch', 400);
    }

    const order = await orderService.markOrderPaid(
      order_id,
      session.id,
      session.payment_intent as string
    );

    res.json({
      success: true,
      data: { message: 'Payment verified successfully', order },
    });
  }
);

// ─── POST /api/payment/webhook — Stripe webhook (no auth required) ───────────
/**
 * Handles Stripe webhook events.
 * NOTE: express.json() must NOT be applied to this route — it needs the raw body.
 * The raw body middleware is registered in index.ts.
 */
router.post(
  '/webhook',
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      throw new AppError('Missing stripe-signature header', 400);
    }

    const event = paymentService.constructWebhookEvent(
      req.body as Buffer,
      signature
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;

      if (orderId && session.payment_status === 'paid') {
        try {
          await orderService.markOrderPaid(
            orderId,
            session.id,
            session.payment_intent as string
          );
        } catch {
          // Order may already be marked as paid via the /verify endpoint
        }
      }
    }

    res.json({ received: true });
  }
);

// ─── GET /api/payment/config — Return the Stripe publishable key ─────────────
/**
 * Return the Stripe publishable key for the frontend.
 */
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: { publishable_key: process.env.STRIPE_PUBLISHABLE_KEY ?? '' },
  });
});

export default router;
