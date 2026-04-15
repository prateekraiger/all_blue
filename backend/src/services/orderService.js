const supabase = require('../config/supabase');
const { AppError } = require('../middlewares/errorHandler');
const { clearCart } = require('./cartService');

/**
 * Create a new order.
 */
const createOrder = async (userId, { items, address, total_amount }) => {
  // Validate stock for each item
  const productIds = items.map((i) => i.product_id);
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, stock, price, name')
    .in('id', productIds);

  if (pErr) throw new AppError(pErr.message, 500);

  const productMap = Object.fromEntries((products || []).map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap[item.product_id];
    if (!product) throw new AppError(`Product ${item.product_id} not found`, 404);
    if (product.stock < item.qty) {
      throw new AppError(`Insufficient stock for "${product.name}"`, 400);
    }
  }

  // Create order
  const { data: order, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        items,
        total_amount,
        address,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return order;
};

/**
 * Get orders for a specific user.
 */
const getUserOrders = async (userId, { page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new AppError(error.message, 500);

  return {
    orders: data || [],
    total: count || 0,
    page: Number(page),
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Get single order by ID (user can only see their own).
 */
const getOrder = async (userId, orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new AppError('Order not found', 404);
  return data;
};

/**
 * Cancel an order (only if status is 'pending').
 */
const cancelOrder = async (userId, orderId) => {
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
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

  // Restore stock
  await restoreStock(order);

  return data;
};

/**
 * Mark order as paid and deduct stock.
 */
const markOrderPaid = async (orderId, razorpayOrderId, razorpayPaymentId) => {
  const { data: order, error: oErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (oErr || !order) throw new AppError('Order not found', 404);
  if (order.status !== 'pending') {
    throw new AppError('Order already processed', 400);
  }

  // Update order status
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

  // Deduct stock for each item
  const items = Array.isArray(order.items) ? order.items : [];
  for (const item of items) {
    await supabase.rpc('decrement_stock', {
      product_id: item.product_id,
      qty: item.qty,
    });
  }

  // Update user preferences (purchased tags)
  try {
    await updatePurchasedPreferences(order.user_id, items);
  } catch (_) {
    // Non-critical — don't fail payment on preference error
  }

  // Clear cart
  try {
    await clearCart(order.user_id);
  } catch (_) {}

  return data;
};

/**
 * Admin: Update order status.
 */
const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Order not found', 404);
  return data;
};

/**
 * Admin: Get all orders with pagination.
 */
const getAllOrders = async ({ page = 1, limit = 20, status }) => {
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
    orders: data || [],
    total: count || 0,
    page: Number(page),
    totalPages: Math.ceil((count || 0) / limit),
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const restoreStock = async (order) => {
  const items = Array.isArray(order.items) ? order.items : [];
  for (const item of items) {
    await supabase.rpc('increment_stock', {
      product_id: item.product_id,
      qty: item.qty,
    });
  }
};

const updatePurchasedPreferences = async (userId, items) => {
  const productIds = items.map((i) => i.product_id);
  const { data: products } = await supabase
    .from('products')
    .select('tags, category')
    .in('id', productIds);

  const tags = [...new Set((products || []).flatMap((p) => p.tags || []))];
  const categories = [...new Set((products || []).map((p) => p.category).filter(Boolean))];

  const { data: existing } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const mergedTags = [...new Set([...(existing.purchased_tags || []), ...tags])];
    const mergedCats = [...new Set([...(existing.viewed_categories || []), ...categories])];
    await supabase
      .from('user_preferences')
      .update({ purchased_tags: mergedTags, viewed_categories: mergedCats, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  } else {
    await supabase.from('user_preferences').insert([
      {
        user_id: userId,
        purchased_tags: tags,
        viewed_categories: categories,
        updated_at: new Date().toISOString(),
      },
    ]);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  markOrderPaid,
  updateOrderStatus,
  getAllOrders,
};
