"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.updateOrderStatus = exports.markOrderPaid = exports.cancelOrder = exports.getOrder = exports.getUserOrders = exports.createOrder = void 0;
const supabase_1 = __importDefault(require("../config/supabase"));
const errorHandler_1 = require("../middlewares/errorHandler");
const cartService_1 = require("./cartService");
const VALID_STATUSES = [
    'pending',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
];
/**
 * Create a new order.
 * Validates product existence and stock availability before inserting.
 */
const createOrder = async (userId, { items, address, total_amount }) => {
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: pErr } = await supabase_1.default
        .from('products')
        .select('id, stock, price, name')
        .in('id', productIds);
    if (pErr)
        throw new errorHandler_1.AppError(pErr.message, 500);
    const productMap = Object.fromEntries((products ?? []).map((p) => [p.id, p]));
    for (const item of items) {
        const product = productMap[item.product_id];
        if (!product)
            throw new errorHandler_1.AppError(`Product ${item.product_id} not found`, 404);
        if (product.stock < item.qty) {
            throw new errorHandler_1.AppError(`Insufficient stock for "${product.name}"`, 400);
        }
    }
    const { data: order, error } = await supabase_1.default
        .from('orders')
        .insert([{ user_id: userId, items, total_amount, address, status: 'pending' }])
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return order;
};
exports.createOrder = createOrder;
/**
 * Get a paginated list of orders for a specific user.
 */
const getUserOrders = async (userId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase_1.default
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return {
        orders: (data ?? []),
        total: count ?? 0,
        page: Number(page),
        totalPages: Math.ceil((count ?? 0) / limit),
    };
};
exports.getUserOrders = getUserOrders;
/**
 * Get a single order by ID for a specific user.
 * Users may only view their own orders.
 */
const getOrder = async (userId, orderId) => {
    const { data, error } = await supabase_1.default
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();
    if (error || !data)
        throw new errorHandler_1.AppError('Order not found', 404);
    return data;
};
exports.getOrder = getOrder;
/**
 * Cancel a pending order and restore product stock.
 */
const cancelOrder = async (userId, orderId) => {
    const { data: order } = await supabase_1.default
        .from('orders')
        .select('id, status, items')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();
    if (!order)
        throw new errorHandler_1.AppError('Order not found', 404);
    if (order.status !== 'pending') {
        throw new errorHandler_1.AppError('Only pending orders can be cancelled', 400);
    }
    const { data, error } = await supabase_1.default
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    // Restore stock for each cancelled item
    await restoreStock(order.items);
    return data;
};
exports.cancelOrder = cancelOrder;
/**
 * Mark an order as paid (called after payment verification).
 * Deducts stock and clears the user's cart.
 */
const markOrderPaid = async (orderId, stripeSessionId, stripePaymentId) => {
    const { data: order, error: oErr } = await supabase_1.default
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
    if (oErr || !order)
        throw new errorHandler_1.AppError('Order not found', 404);
    // If already marked as paid for this session (e.g., via webhook), just return it
    if (order.status === 'paid' && order.stripe_session_id === stripeSessionId) {
        return order;
    }
    if (order.status !== 'pending') {
        throw new errorHandler_1.AppError('Order already processed', 400);
    }
    const { data, error } = await supabase_1.default
        .from('orders')
        .update({
        status: 'paid',
        stripe_session_id: stripeSessionId,
        payment_id: stripePaymentId,
    })
        .eq('id', orderId)
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    // Deduct stock for each purchased item via Supabase RPC
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
        await supabase_1.default.rpc('decrement_stock', {
            product_id: item.product_id,
            qty: item.qty,
        });
    }
    // Update user AI preference signals (non-critical)
    try {
        await updatePurchasedPreferences(order.user_id, items);
    }
    catch {
        // Intentionally ignored — preference update failure must not block payment
    }
    // Clear the user's cart (non-critical)
    try {
        await (0, cartService_1.clearCart)(order.user_id);
    }
    catch {
        // Intentionally ignored
    }
    return data;
};
exports.markOrderPaid = markOrderPaid;
/**
 * Admin: Update an order's status.
 */
const updateOrderStatus = async (orderId, status) => {
    if (!VALID_STATUSES.includes(status)) {
        throw new errorHandler_1.AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
    const { data, error } = await supabase_1.default
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    if (!data)
        throw new errorHandler_1.AppError('Order not found', 404);
    return data;
};
exports.updateOrderStatus = updateOrderStatus;
/**
 * Admin: Get all orders with optional status filter and pagination.
 */
const getAllOrders = async ({ page = 1, limit = 20, status, }) => {
    const offset = (page - 1) * limit;
    let query = supabase_1.default
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (status)
        query = query.eq('status', status);
    const { data, error, count } = await query;
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return {
        orders: (data ?? []),
        total: count ?? 0,
        page: Number(page),
        totalPages: Math.ceil((count ?? 0) / limit),
    };
};
exports.getAllOrders = getAllOrders;
// ─── Private Helpers ─────────────────────────────────────────────────────────
async function restoreStock(items) {
    for (const item of items) {
        await supabase_1.default.rpc('increment_stock', {
            product_id: item.product_id,
            qty: item.qty,
        });
    }
}
async function updatePurchasedPreferences(userId, items) {
    const productIds = items.map((i) => i.product_id);
    const { data: products } = await supabase_1.default
        .from('products')
        .select('tags, category')
        .in('id', productIds);
    const tags = [
        ...new Set((products ?? []).flatMap((p) => p.tags ?? [])),
    ];
    const categories = [
        ...new Set((products ?? [])
            .map((p) => p.category)
            .filter((c) => Boolean(c))),
    ];
    const { data: existing } = await supabase_1.default
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
    const now = new Date().toISOString();
    if (existing) {
        await supabase_1.default
            .from('user_preferences')
            .update({
            purchased_tags: [...new Set([...(existing.purchased_tags ?? []), ...tags])],
            viewed_categories: [
                ...new Set([...(existing.viewed_categories ?? []), ...categories]),
            ],
            updated_at: now,
        })
            .eq('user_id', userId);
    }
    else {
        await supabase_1.default.from('user_preferences').insert([
            {
                user_id: userId,
                purchased_tags: tags,
                viewed_categories: categories,
                updated_at: now,
            },
        ]);
    }
}
//# sourceMappingURL=orderService.js.map