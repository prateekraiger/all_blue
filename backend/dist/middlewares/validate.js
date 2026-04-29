"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.giftFinderSchema = exports.orderStatusSchema = exports.paymentCreateSchema = exports.chatSchema = exports.preferencesSchema = exports.paymentVerifySchema = exports.reviewSchema = exports.orderSchema = exports.addressSchema = exports.cartUpdateSchema = exports.cartItemSchema = exports.productSchema = exports.validate = void 0;
const zod_1 = require("zod");
/**
 * validate — Middleware factory for Zod schema validation.
 *
 * Usage:
 *   router.post('/', validate(mySchema), handler)
 *   router.get('/', validate(mySchema, 'query'), handler)
 */
const validate = (schema, target = 'body') => (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
        return next(result.error); // ZodError is caught by errorHandler
    }
    // Replace input with the parsed (and potentially transformed) data
    req[target] = result.data;
    next();
};
exports.validate = validate;
// ─── Reusable Zod Schemas ─────────────────────────────────────────────────────
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(200),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().nonnegative('Price must be zero or positive'),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    images: zod_1.z.array(zod_1.z.string()).optional().default([]),
    stock: zod_1.z.number().int().min(0).optional().default(0),
    is_active: zod_1.z.boolean().optional().default(true),
});
exports.cartItemSchema = zod_1.z.object({
    product_id: zod_1.z.string().uuid('Invalid product ID'),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1').default(1),
});
exports.cartUpdateSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
});
exports.addressSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    phone: zod_1.z.string().min(10, 'Valid phone number is required'),
    line1: zod_1.z.string().min(1, 'Address line 1 is required'),
    line2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    pincode: zod_1.z.string().min(6, 'Valid pincode is required'),
    country: zod_1.z.string().default('India'),
});
exports.orderSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        product_id: zod_1.z.string().uuid('Invalid product ID'),
        qty: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
        price: zod_1.z.number().positive('Price must be positive'),
    }))
        .min(1, 'Order must have at least one item'),
    address: exports.addressSchema,
    total_amount: zod_1.z.number().positive('Total amount must be positive'),
});
exports.reviewSchema = zod_1.z.object({
    product_id: zod_1.z.string().uuid('Invalid product ID'),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional(),
});
exports.paymentVerifySchema = zod_1.z.object({
    session_id: zod_1.z.string().min(1, 'Stripe session ID is required'),
    order_id: zod_1.z.string().uuid('Invalid order ID'),
});
exports.preferencesSchema = zod_1.z.object({
    viewed_category: zod_1.z.string().optional(),
    viewed_tags: zod_1.z.array(zod_1.z.string()).optional(),
    last_search: zod_1.z.string().optional(),
});
exports.chatSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(500),
});
exports.paymentCreateSchema = zod_1.z.object({
    order_id: zod_1.z.string().uuid('Invalid order ID'),
    amount: zod_1.z.number().positive('Amount must be positive'),
});
exports.orderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
});
exports.giftFinderSchema = zod_1.z.object({
    persona: zod_1.z.enum(['Partner', 'Colleague', 'Friend', 'Parent', 'Client']),
    occasion: zod_1.z.enum(['Birthday', 'Anniversary', 'Thank You', 'Corporate', 'Just Because']),
    budget: zod_1.z
        .number()
        .int('Budget must be a whole number')
        .min(500, 'Budget must be at least ₹500')
        .max(100000, 'Budget cannot exceed ₹1,00,000'),
});
// Export all schemas as a named bundle for convenience
exports.schemas = {
    product: exports.productSchema,
    cartItem: exports.cartItemSchema,
    cartUpdate: exports.cartUpdateSchema,
    order: exports.orderSchema,
    review: exports.reviewSchema,
    paymentVerify: exports.paymentVerifySchema,
    paymentCreate: exports.paymentCreateSchema,
    preferences: exports.preferencesSchema,
    chat: exports.chatSchema,
    orderStatus: exports.orderStatusSchema,
    giftFinder: exports.giftFinderSchema,
};
//# sourceMappingURL=validate.js.map