import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

type RequestTarget = 'body' | 'query' | 'params';

/**
 * validate — Middleware factory for Zod schema validation.
 *
 * Usage:
 *   router.post('/', validate(mySchema), handler)
 *   router.get('/', validate(mySchema, 'query'), handler)
 */
export const validate =
  (schema: ZodSchema, target: RequestTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(result.error); // ZodError is caught by errorHandler
    }
    // Replace input with the parsed (and potentially transformed) data
    req[target] = result.data;
    next();
  };

// ─── Reusable Zod Schemas ─────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  price: z.number().nonnegative('Price must be zero or positive'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  stock: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const cartItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
  country: z.string().default('India'),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid('Invalid product ID'),
        qty: z.number().int().min(1, 'Quantity must be at least 1'),
        price: z.number().positive('Price must be positive'),
      })
    )
    .min(1, 'Order must have at least one item'),
  address: addressSchema,
  total_amount: z.number().positive('Total amount must be positive'),
});

export const reviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const paymentVerifySchema = z.object({
  session_id: z.string().min(1, 'Stripe session ID is required'),
  order_id: z.string().uuid('Invalid order ID'),
});

export const preferencesSchema = z.object({
  viewed_category: z.string().optional(),
  viewed_tags: z.array(z.string()).optional(),
  last_search: z.string().optional(),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(500),
});

export const paymentCreateSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  amount: z.number().positive('Amount must be positive'),
});

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
});

export const giftFinderSchema = z.object({
  persona: z.enum(['Partner', 'Colleague', 'Friend', 'Parent', 'Client']),
  occasion: z.enum(['Birthday', 'Anniversary', 'Thank You', 'Corporate', 'Just Because']),
  budget: z
    .number()
    .int('Budget must be a whole number')
    .min(500, 'Budget must be at least ₹500')
    .max(100000, 'Budget cannot exceed ₹1,00,000'),
});

// Export all schemas as a named bundle for convenience
export const schemas = {
  product: productSchema,
  cartItem: cartItemSchema,
  cartUpdate: cartUpdateSchema,
  order: orderSchema,
  review: reviewSchema,
  paymentVerify: paymentVerifySchema,
  paymentCreate: paymentCreateSchema,
  preferences: preferencesSchema,
  chat: chatSchema,
  orderStatus: orderStatusSchema,
  giftFinder: giftFinderSchema,
} as const;
