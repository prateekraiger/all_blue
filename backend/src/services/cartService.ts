import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import type { Cart, CartItem } from '../types';

/**
 * Get a user's cart with nested product details.
 * Filters out cart items referencing inactive or deleted products.
 */
export const getCart = async (userId: string): Promise<Cart> => {
  const { data, error } = await supabase
    .from('cart')
    .select(
      `
      id,
      quantity,
      created_at,
      product:products (
        id, name, price, images, category, stock, is_active
      )
    `
    )
    .eq('user_id', userId);

  if (error) throw new AppError(error.message, 500);

  // The join returns product as an object (not array) in Supabase v2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawItems: any[] = data ?? [];

  // Only keep cart items whose product is still active
  const items = rawItems.filter((item) => item.product?.is_active) as CartItem[];

  const subtotal = items.reduce(
    (sum, item) =>
      sum + ((item.product as unknown as { price: number })?.price ?? 0) * item.quantity,
    0
  );

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

/**
 * Add a product to the user's cart.
 * If the product is already in the cart, the quantity is incremented.
 */
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<CartItem> => {
  // Verify product exists, is active, and has sufficient stock
  const { data: product, error: pError } = await supabase
    .from('products')
    .select('id, stock, is_active')
    .eq('id', productId)
    .single();

  if (pError || !product) throw new AppError('Product not found', 404);
  if (!product.is_active) throw new AppError('Product is not available', 400);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  // Check if product is already in the cart
  const { data: existing } = await supabase
    .from('cart')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    const newQty: number = existing.quantity + quantity;
    if (product.stock < newQty) throw new AppError('Insufficient stock', 400);

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: newQty })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data as CartItem;
  }

  const { data, error } = await supabase
    .from('cart')
    .insert([{ user_id: userId, product_id: productId, quantity }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data as CartItem;
};

/**
 * Update the quantity of an existing cart item.
 * Verifies ownership and sufficient stock.
 */
export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<CartItem> => {
  // Verify the cart item belongs to this user
  const { data: item } = await supabase
    .from('cart')
    .select('id, product_id')
    .eq('id', cartItemId)
    .eq('user_id', userId)
    .single();

  if (!item) throw new AppError('Cart item not found', 404);

  // Check available stock
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
  return data as CartItem;
};

/**
 * Remove a single item from the cart.
 * Only the owning user may remove their own items.
 */
export const removeFromCart = async (
  userId: string,
  cartItemId: string
): Promise<{ message: string }> => {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', userId);

  if (error) throw new AppError(error.message, 500);
  return { message: 'Item removed from cart' };
};

/**
 * Clear all items in a user's cart.
 * Used internally after a successful order is placed.
 */
export const clearCart = async (userId: string): Promise<void> => {
  const { error } = await supabase.from('cart').delete().eq('user_id', userId);
  if (error) throw new AppError(error.message, 500);
};
