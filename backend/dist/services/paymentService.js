"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckoutSession = exports.constructWebhookEvent = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const errorHandler_1 = require("../middlewares/errorHandler");
// Lazy-initialised singleton — avoids crashing at startup if env vars are absent
let stripeInstance = null;
const getStripe = () => {
    if (!stripeInstance) {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            throw new errorHandler_1.AppError('Stripe credentials not configured', 500);
        }
        stripeInstance = new stripe_1.default(secretKey, {
            apiVersion: '2025-01-27.acacia'
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
const createCheckoutSession = async (amount, orderId, customerEmail) => {
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
            throw new errorHandler_1.AppError('Stripe did not return a checkout URL', 500);
        }
        return { sessionId: session.id, url: session.url };
    }
    catch (err) {
        if (err instanceof errorHandler_1.AppError)
            throw err;
        const message = err instanceof Error ? err.message : String(err);
        throw new errorHandler_1.AppError(`Stripe error: ${message}`, 500);
    }
};
exports.createCheckoutSession = createCheckoutSession;
/**
 * Verify a Stripe webhook event to mark the order as paid.
 * Used by the /api/payment/webhook endpoint.
 */
const constructWebhookEvent = (payload, signature) => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new errorHandler_1.AppError('Stripe webhook secret not configured', 500);
    }
    try {
        return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new errorHandler_1.AppError(`Webhook signature verification failed: ${message}`, 400);
    }
};
exports.constructWebhookEvent = constructWebhookEvent;
/**
 * Retrieve a Checkout Session by ID.
 * Used for manual verification when webhook is not available.
 */
const getCheckoutSession = async (sessionId) => {
    const stripe = getStripe();
    try {
        return await stripe.checkout.sessions.retrieve(sessionId);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new errorHandler_1.AppError(`Stripe error: ${message}`, 500);
    }
};
exports.getCheckoutSession = getCheckoutSession;
//# sourceMappingURL=paymentService.js.map