const supabase = require('../config/supabase');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Get user's cart with product details.
 */
const getCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart')
    .select(`
      id,
      quantity,
      created_at,
      product:products (
        id, name, price, images, category, stock, is_active
      )
    `)
    .eq('user_id', userId);

  if (error) throw new AppError(error.message, 500);

  // Filter out inactive products
  const items = (data || []).filter((item) => item.product?.is_active);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

/**
 * Add item to cart. If product already exists, increment quantity.
 */
const addToCart = async (userId, productId, quantity = 1) => {
  // Verify product exists and has stock
  const { data: product, error: pError } = await supabase
    .from('products')
    .select('id, stock, is_active')
    .eq('id', productId)
    .single();

  if (pError || !product) throw new AppError('Product not found', 404);
  if (!product.is_active) throw new AppError('Product is not available', 400);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  // Check if already in cart
  const { data: existing } = await supabase
    .from('cart')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (product.stock < newQty) throw new AppError('Insufficient stock', 400);

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: newQty })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  const { data, error } = await supabase
    .from('cart')
    .insert([{ user_id: userId, product_id: productId, quantity }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
};

/**
 * Update quantity of a cart item.
 */
const updateCartItem = async (userId, cartItemId, quantity) => {
  // Verify ownership
  const { data: item } = await supabase
    .from('cart')
    .select('id, product_id')
    .eq('id', cartItemId)
    .eq('user_id', userId)
    .single();

  if (!item) throw new AppError('Cart item not found', 404);

  // Check stock
  const { data: product } = await supabase
    .from('products')
    .select('stock')
    .eq('id', item.product_id)
    .single();

  if (product && product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  const { data, error } = await supabase
    .from('cart')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
};

/**
 * Remove an item from cart.
 */
const removeFromCart = async (userId, cartItemId) => {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', userId);

  if (error) throw new AppError(error.message, 500);
  return { message: 'Item removed from cart' };
};

/**
 * Clear all items from user's cart (used after successful order).
 */
const clearCart = async (userId) => {
  const { error } = await supabase.from('cart').delete().eq('user_id', userId);
  if (error) throw new AppError(error.message, 500);
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
