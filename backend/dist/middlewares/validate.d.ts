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
export declare const validate: (schema: ZodSchema, target?: RequestTarget) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const productSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    stock: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    is_active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const cartItemSchema: z.ZodObject<{
    product_id: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const cartUpdateSchema: z.ZodObject<{
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const addressSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    pincode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const orderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        product_id: z.ZodString;
        qty: z.ZodNumber;
        price: z.ZodNumber;
    }, z.core.$strip>>;
    address: z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        pincode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    total_amount: z.ZodNumber;
}, z.core.$strip>;
export declare const reviewSchema: z.ZodObject<{
    product_id: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const paymentVerifySchema: z.ZodObject<{
    session_id: z.ZodString;
    order_id: z.ZodString;
}, z.core.$strip>;
export declare const preferencesSchema: z.ZodObject<{
    viewed_category: z.ZodOptional<z.ZodString>;
    viewed_tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    last_search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const chatSchema: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
export declare const paymentCreateSchema: z.ZodObject<{
    order_id: z.ZodString;
    amount: z.ZodNumber;
}, z.core.$strip>;
export declare const orderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        pending: "pending";
        paid: "paid";
        shipped: "shipped";
        delivered: "delivered";
        cancelled: "cancelled";
    }>;
}, z.core.$strip>;
export declare const giftFinderSchema: z.ZodObject<{
    persona: z.ZodEnum<{
        Partner: "Partner";
        Colleague: "Colleague";
        Friend: "Friend";
        Parent: "Parent";
        Client: "Client";
    }>;
    occasion: z.ZodEnum<{
        Birthday: "Birthday";
        Anniversary: "Anniversary";
        "Thank You": "Thank You";
        Corporate: "Corporate";
        "Just Because": "Just Because";
    }>;
    budget: z.ZodNumber;
}, z.core.$strip>;
export declare const schemas: {
    readonly product: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
        category: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        stock: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        is_active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>;
    readonly cartItem: z.ZodObject<{
        product_id: z.ZodString;
        quantity: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    readonly cartUpdate: z.ZodObject<{
        quantity: z.ZodNumber;
    }, z.core.$strip>;
    readonly order: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            product_id: z.ZodString;
            qty: z.ZodNumber;
            price: z.ZodNumber;
        }, z.core.$strip>>;
        address: z.ZodObject<{
            name: z.ZodString;
            phone: z.ZodString;
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodString;
            pincode: z.ZodString;
            country: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>;
        total_amount: z.ZodNumber;
    }, z.core.$strip>;
    readonly review: z.ZodObject<{
        product_id: z.ZodString;
        rating: z.ZodNumber;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly paymentVerify: z.ZodObject<{
        session_id: z.ZodString;
        order_id: z.ZodString;
    }, z.core.$strip>;
    readonly paymentCreate: z.ZodObject<{
        order_id: z.ZodString;
        amount: z.ZodNumber;
    }, z.core.$strip>;
    readonly preferences: z.ZodObject<{
        viewed_category: z.ZodOptional<z.ZodString>;
        viewed_tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        last_search: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly chat: z.ZodObject<{
        message: z.ZodString;
    }, z.core.$strip>;
    readonly orderStatus: z.ZodObject<{
        status: z.ZodEnum<{
            pending: "pending";
            paid: "paid";
            shipped: "shipped";
            delivered: "delivered";
            cancelled: "cancelled";
        }>;
    }, z.core.$strip>;
    readonly giftFinder: z.ZodObject<{
        persona: z.ZodEnum<{
            Partner: "Partner";
            Colleague: "Colleague";
            Friend: "Friend";
            Parent: "Parent";
            Client: "Client";
        }>;
        occasion: z.ZodEnum<{
            Birthday: "Birthday";
            Anniversary: "Anniversary";
            "Thank You": "Thank You";
            Corporate: "Corporate";
            "Just Because": "Just Because";
        }>;
        budget: z.ZodNumber;
    }, z.core.$strip>;
};
export {};
//# sourceMappingURL=validate.d.ts.map