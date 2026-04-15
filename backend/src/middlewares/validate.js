const { z } = require('zod');
const { AppError } = require('./errorHandler');

/**
 * Middleware factory for Zod schema validation.
 * Usage: validate(schema, 'body' | 'query' | 'params')
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[target]);
      if (!result.success) {
        const error = new Error('Validation failed');
        error.name = 'ZodError';
        error.errors = result.error.errors;
        return next(error);
      }
      req[target] = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// ─── Schemas ───────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string().url()).optional().default([]),
  stock: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

const cartItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

const cartUpdateSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        qty: z.number().int().min(1),
        price: z.number().positive(),
      })
    )
    .min(1, 'Order must have at least one item'),
  address: z.object({
    name: z.string().min(1),
    phone: z.string().min(10),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(6),
    country: z.string().default('India'),
  }),
  total_amount: z.number().positive(),
});

const reviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const paymentVerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  order_id: z.string().uuid(),
});

const preferencesSchema = z.object({
  viewed_category: z.string().optional(),
  viewed_tags: z.array(z.string()).optional(),
  last_search: z.string().optional(),
});

module.exports = {
  validate,
  schemas: {
    product: productSchema,
    cartItem: cartItemSchema,
    cartUpdate: cartUpdateSchema,
    order: orderSchema,
    review: reviewSchema,
    paymentVerify: paymentVerifySchema,
    preferences: preferencesSchema,
  },
};
