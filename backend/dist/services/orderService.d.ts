import type { Order, OrderCreateInput, OrderListParams } from '../types';
/**
 * Create a new order.
 * Validates product existence and stock availability before inserting.
 */
export declare const createOrder: (userId: string, { items, address, total_amount }: OrderCreateInput) => Promise<Order>;
/**
 * Get a paginated list of orders for a specific user.
 */
export declare const getUserOrders: (userId: string, { page, limit }: Pick<OrderListParams, "page" | "limit">) => Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
}>;
/**
 * Get a single order by ID for a specific user.
 * Users may only view their own orders.
 */
export declare const getOrder: (userId: string, orderId: string) => Promise<Order>;
/**
 * Cancel a pending order and restore product stock.
 */
export declare const cancelOrder: (userId: string, orderId: string) => Promise<Order>;
/**
 * Mark an order as paid (called after payment verification).
 * Deducts stock and clears the user's cart.
 */
export declare const markOrderPaid: (orderId: string, stripeSessionId: string, stripePaymentId: string) => Promise<Order>;
/**
 * Admin: Update an order's status.
 */
export declare const updateOrderStatus: (orderId: string, status: string) => Promise<Order>;
/**
 * Admin: Get all orders with optional status filter and pagination.
 */
export declare const getAllOrders: ({ page, limit, status, }: OrderListParams) => Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
}>;
//# sourceMappingURL=orderService.d.ts.map