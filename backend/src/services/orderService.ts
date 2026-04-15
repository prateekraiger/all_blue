import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import { clearCart } from './cartService';
import type { Order, OrderCreateInput, OrderListParams, OrderStatus } from '../types';

const VALID_STATUSES: OrderStatus[] = [
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
export const createOrder = async (
  userId: string,
  { items, address, total_amount }: OrderCreateInput
): Promise<Order> => {
  const productIds = items.map((i) => i.product_id);

  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, stock, price, name')
    .in('id', productIds);

  if (pErr) throw new AppError(pErr.message, 500);

  const productMap: Record<
    string,
    { id: string; stock: number; price: number; name: string }
  > = Object.fromEntries((products ?? []).map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap[item.product_id];
    if (!product) throw new AppError(`Product ${item.product_id} not found`, 404);
    if (product.stock < item.qty) {
      throw new AppError(`Insufficient stock for "${product.name}"`, 400);
    }
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert([{ user_id: userId, items, total_amount, address, status: 'pending' }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return order as Order;
};

/**
 * Get a paginated list of orders for a specific user.
 */
export const getUserOrders = async (
  userId: string,
  { page = 1, limit = 10 }: Pick<OrderListParams, 'page' | 'limit'>
): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new AppError(error.message, 500);

  return {
    orders: (data ?? []) as Order[],
    total: count ?? 0,
    page: Number(page),
    totalPages: Math.ceil((count ?? 0) / limit),
  };
};

/**
 * Get a single order by ID for a specific user.
 * Users may only view their own orders.
 */
export const getOrder = async (userId: string, orderId: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new AppError('Order not found', 404);
  return data as Order;
};

/**
 * Cancel a pending order and restore product stock.
 */
export const cancelOrder = async (userId: string, orderId: string): Promise<Order> => {
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, items')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'pending') {
    throw new AppError('Only pending orders can be cancelled', 400);
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  // Restore stock for each cancelled item
  await restoreStock(order.items);

  return data as Order;
};

/**
 * Mark an order as paid (called after payment verification).
 * Deducts stock and clears the user's cart.
 */
export const markOrderPaid = async (
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<Order> => {
  const { data: order, error: oErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (oErr || !order) throw new AppError('Order not found', 404);
  if (order.status !== 'pending') {
    throw new AppError('Order already processed', 400);
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      razorpay_order_id: razorpayOrderId,
      payment_id: razorpayPaymentId,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  // Deduct stock for each purchased item via Supabase RPC
  const items = Array.isArray(order.items) ? order.items : [];
  for (const item of items as { product_id: string; qty: number }[]) {
    await supabase.rpc('decrement_stock', {
      product_id: item.product_id,
      qty: item.qty,
    });
  }

  // Update user AI preference signals (non-critical)
  try {
    await updatePurchasedPreferences(order.user_id, items);
  } catch {
    // Intentionally ignored — preference update failure must not block payment
  }

  // Clear the user's cart (non-critical)
  try {
    await clearCart(order.user_id);
  } catch {
    // Intentionally ignored
  }

  return data as Order;
};

/**
 * Admin: Update an order's status.
 */
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<Order> => {
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Order not found', 404);
  return data as Order;
};

/**
 * Admin: Get all orders with optional status filter and pagination.
 */
export const getAllOrders = async ({
  page = 1,
  limit = 20,
  status,
}: OrderListParams): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  return {
    orders: (data ?? []) as Order[],
    total: count ?? 0,
    page: Number(page),
    totalPages: Math.ceil((count ?? 0) / limit),
  };
};

// ─── Private Helpers ─────────────────────────────────────────────────────────

async function restoreStock(
  items: Array<{ product_id: string; qty: number }>
): Promise<void> {
  for (const item of items) {
    await supabase.rpc('increment_stock', {
      product_id: item.product_id,
      qty: item.qty,
    });
  }
}

async function updatePurchasedPreferences(
  userId: string,
  items: Array<{ product_id: string; qty: number }>
): Promise<void> {
  const productIds = items.map((i) => i.product_id);

  const { data: products } = await supabase
    .from('products')
    .select('tags, category')
    .in('id', productIds);

  const tags = [
    ...new Set(
      (products ?? []).flatMap((p: { tags?: string[] }) => p.tags ?? [])
    ),
  ];
  const categories = [
    ...new Set(
      (products ?? [])
        .map((p: { category?: string }) => p.category)
        .filter((c): c is string => Boolean(c))
    ),
  ];

  const { data: existing } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  const now = new Date().toISOString();

  if (existing) {
    await supabase
      .from('user_preferences')
      .update({
        purchased_tags: [...new Set([...(existing.purchased_tags ?? []), ...tags])],
        viewed_categories: [
          ...new Set([...(existing.viewed_categories ?? []), ...categories]),
        ],
        updated_at: now,
      })
      .eq('user_id', userId);
  } else {
    await supabase.from('user_preferences').insert([
      {
        user_id: userId,
        purchased_tags: tags,
        viewed_categories: categories,
        updated_at: now,
      },
    ]);
  }
}
