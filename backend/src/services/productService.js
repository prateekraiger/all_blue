const supabase = require('../config/supabase');
const { AppError } = require('../middlewares/errorHandler');

/**
 * List products with optional filters, search, pagination, sorting.
 */
const listProducts = async ({ category, tag, q, page = 1, limit = 20, sort = 'created_at' }) => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);
  if (tag) query = query.contains('tags', [tag]);

  if (q) {
    // Full-text search across name, description
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // Sorting
  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else if (sort === 'trending') query = query.order('created_at', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  return {
    products: data || [],
    total: count || 0,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Get a single product by ID.
 */
const getProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) throw new AppError('Product not found', 404);
  return data;
};

/**
 * Create a new product (admin only).
 */
const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
};

/**
 * Update a product (admin only).
 */
const updateProduct = async (id, productData) => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Product not found', 404);
  return data;
};

/**
 * Soft delete a product (admin only).
 */
const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
  return { message: 'Product deleted successfully' };
};

/**
 * Get trending products (most ordered in last 7 days).
 * Falls back to latest products if no orders exist yet.
 */
const getTrendingProducts = async (limit = 8) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch recent paid orders
  const { data: orders } = await supabase
    .from('orders')
    .select('items')
    .eq('status', 'paid')
    .gte('created_at', sevenDaysAgo);

  if (orders && orders.length > 0) {
    // Count product_id occurrences
    const countMap = {};
    for (const order of orders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        countMap[item.product_id] = (countMap[item.product_id] || 0) + item.qty;
      }
    }

    const topIds = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topIds.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', topIds)
        .eq('is_active', true);
      return data || [];
    }
  }

  // Fallback: return newest products
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
};

/**
 * Get categories list (distinct values).
 */
const getCategories = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);

  if (error) throw new AppError(error.message, 500);

  const categories = [...new Set((data || []).map((p) => p.category).filter(Boolean))];
  return categories;
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
  getCategories,
};
