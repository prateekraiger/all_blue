import Stripe from 'stripe';
import { AppError } from '../middlewares/errorHandler';

// Lazy-initialised singleton — avoids crashing at startup if env vars are absent
let stripeInstance: any = null;

const getStripe = (): any => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new AppError('Stripe credentials not configured', 500);
    }

    stripeInstance = new Stripe(secretKey, { 
      apiVersion: '2025-01-27.acacia' as any 
    });
  }
  return stripeInstance;
};

/**
 * Create a Stripe Checkout Session.
 *
 * @param amount   - Amount in INR (converted to paise internally)
 * @param orderId  - Your internal UUID order ID, used as the metadata reference
 * @param customerEmail - The customer's email for receipt
 */
export const createCheckoutSession = async (
  amount: number,
  orderId: string,
  customerEmail?: string
): Promise<{ sessionId: string; url: string }> => {
  const stripe = getStripe();

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `ALL BLUE — Order #${orderId.slice(0, 8)}`,
            },
            unit_amount: Math.round(amount * 100), // INR → paise
          },
          quantity: 1,
        },
      ],
      metadata: { order_id: orderId },
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${frontendUrl}/checkout?payment=cancelled`,
    });

    if (!session.url) {
      throw new AppError('Stripe did not return a checkout URL', 500);
    }

    return { sessionId: session.id, url: session.url };
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError(`Stripe error: ${message}`, 500);
  }
};

/**
 * Verify a Stripe webhook event to mark the order as paid.
 * Used by the /api/payment/webhook endpoint.
 */
export const constructWebhookEvent = (
  payload: Buffer,
  signature: string
): any => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new AppError('Stripe webhook secret not configured', 500);
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError(`Webhook signature verification failed: ${message}`, 400);
  }
};

/**
 * Retrieve a Checkout Session by ID.
 * Used for manual verification when webhook is not available.
 */
export const getCheckoutSession = async (
  sessionId: string
): Promise<any> => {
  const stripe = getStripe();

  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError(`Stripe error: ${message}`, 500);
  }
};
