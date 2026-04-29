"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const paymentService = __importStar(require("../services/paymentService"));
const orderService = __importStar(require("../services/orderService"));
const errorHandler_1 = require("../middlewares/errorHandler");
const router = (0, express_1.Router)();
// ─── POST /api/payment/create-checkout — Create a Stripe Checkout Session ────
/**
 * Create a Stripe Checkout Session for an internal order that is still 'pending'.
 * Returns the session ID and redirect URL so the frontend can redirect to Stripe.
 */
router.post('/create-checkout', auth_1.requireAuth, (0, validate_1.validate)(validate_1.schemas.paymentCreate), async (req, res) => {
    const { order_id, amount } = req.body;
    // Ensure the order belongs to this user and is still pending
    const order = await orderService.getOrder(req.user.id, order_id);
    if (order.status !== 'pending') {
        throw new errorHandler_1.AppError('Order is not in pending state', 400);
    }
    const session = await paymentService.createCheckoutSession(amount, order_id, req.user.email ?? undefined);
    res.json({
        success: true,
        data: {
            session_id: session.sessionId,
            checkout_url: session.url,
            order_id,
        },
    });
});
// ─── POST /api/payment/verify — Verify payment after Stripe Checkout ─────────
/**
 * Verify a completed Stripe Checkout Session and mark the order as paid.
 * This is the client-side fallback — a webhook should also be configured for reliability.
 */
router.post('/verify', auth_1.requireAuth, (0, validate_1.validate)(validate_1.schemas.paymentVerify), async (req, res) => {
    const { session_id, order_id } = req.body;
    const session = await paymentService.getCheckoutSession(session_id);
    if (session.payment_status !== 'paid') {
        throw new errorHandler_1.AppError('Payment not completed', 400);
    }
    // Ensure the metadata matches
    if (session.metadata?.order_id !== order_id) {
        throw new errorHandler_1.AppError('Order ID mismatch', 400);
    }
    const order = await orderService.markOrderPaid(order_id, session.id, session.payment_intent);
    res.json({
        success: true,
        data: { message: 'Payment verified successfully', order },
    });
});
// ─── POST /api/payment/webhook — Stripe webhook (no auth required) ───────────
/**
 * Handles Stripe webhook events.
 * NOTE: express.json() must NOT be applied to this route — it needs the raw body.
 * The raw body middleware is registered in index.ts.
 */
router.post('/webhook', async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        throw new errorHandler_1.AppError('Missing stripe-signature header', 400);
    }
    const event = paymentService.constructWebhookEvent(req.body, signature);
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        if (orderId && session.payment_status === 'paid') {
            try {
                await orderService.markOrderPaid(orderId, session.id, session.payment_intent);
            }
            catch {
                // Order may already be marked as paid via the /verify endpoint
            }
        }
    }
    res.json({ received: true });
});
// ─── GET /api/payment/config — Return the Stripe publishable key ─────────────
/**
 * Return the Stripe publishable key for the frontend.
 */
router.get('/config', (_req, res) => {
    res.json({
        success: true,
        data: { publishable_key: process.env.STRIPE_PUBLISHABLE_KEY ?? '' },
    });
});
exports.default = router;
//# sourceMappingURL=payment.js.map