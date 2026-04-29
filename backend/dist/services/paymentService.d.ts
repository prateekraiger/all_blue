/**
 * Create a Stripe Checkout Session.
 *
 * @param amount   - Amount in INR (converted to paise internally)
 * @param orderId  - Your internal UUID order ID, used as the metadata reference
 * @param customerEmail - The customer's email for receipt
 */
export declare const createCheckoutSession: (amount: number, orderId: string, customerEmail?: string) => Promise<{
    sessionId: string;
    url: string;
}>;
/**
 * Verify a Stripe webhook event to mark the order as paid.
 * Used by the /api/payment/webhook endpoint.
 */
export declare const constructWebhookEvent: (payload: Buffer, signature: string) => any;
/**
 * Retrieve a Checkout Session by ID.
 * Used for manual verification when webhook is not available.
 */
export declare const getCheckoutSession: (sessionId: string) => Promise<any>;
//# sourceMappingURL=paymentService.d.ts.map