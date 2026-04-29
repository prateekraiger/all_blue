"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const supabase_1 = __importDefault(require("../config/supabase"));
const errorHandler_1 = require("../middlewares/errorHandler");
/**
 * Get a user's cart with nested product details.
 * Filters out cart items referencing inactive or deleted products.
 */
const getCart = async (userId) => {
    const { data, error } = await supabase_1.default
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
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    // The join returns product as an object (not array) in Supabase v2
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawItems = data ?? [];
    // Only keep cart items whose product is still active
    const items = rawItems.filter((item) => item.product?.is_active);
    const subtotal = items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
    return {
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
};
exports.getCart = getCart;
/**
 * Add a product to the user's cart.
 * If the product is already in the cart, the quantity is incremented.
 */
const addToCart = async (userId, productId, quantity = 1) => {
    // Verify product exists, is active, and has sufficient stock
    const { data: product, error: pError } = await supabase_1.default
        .from('products')
        .select('id, stock, is_active')
        .eq('id', productId)
        .single();
    if (pError || !product)
        throw new errorHandler_1.AppError('Product not found', 404);
    if (!product.is_active)
        throw new errorHandler_1.AppError('Product is not available', 400);
    if (product.stock < quantity)
        throw new errorHandler_1.AppError('Insufficient stock', 400);
    // Check if product is already in the cart
    const { data: existing } = await supabase_1.default
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();
    if (existing) {
        const newQty = existing.quantity + quantity;
        if (product.stock < newQty)
            throw new errorHandler_1.AppError('Insufficient stock', 400);
        const { data, error } = await supabase_1.default
            .from('cart')
            .update({ quantity: newQty })
            .eq('id', existing.id)
            .select()
            .single();
        if (error)
            throw new errorHandler_1.AppError(error.message, 500);
        return data;
    }
    const { data, error } = await supabase_1.default
        .from('cart')
        .insert([{ user_id: userId, product_id: productId, quantity }])
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return data;
};
exports.addToCart = addToCart;
/**
 * Update the quantity of an existing cart item.
 * Verifies ownership and sufficient stock.
 */
const updateCartItem = async (userId, cartItemId, quantity) => {
    // Verify the cart item belongs to this user
    const { data: item } = await supabase_1.default
        .from('cart')
        .select('id, product_id')
        .eq('id', cartItemId)
        .eq('user_id', userId)
        .single();
    if (!item)
        throw new errorHandler_1.AppError('Cart item not found', 404);
    // Check available stock
    const { data: product } = await supabase_1.default
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();
    if (product && product.stock < quantity) {
        throw new errorHandler_1.AppError('Insufficient stock', 400);
    }
    const { data, error } = await supabase_1.default
        .from('cart')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return data;
};
exports.updateCartItem = updateCartItem;
/**
 * Remove a single item from the cart.
 * Only the owning user may remove their own items.
 */
const removeFromCart = async (userId, cartItemId) => {
    const { error } = await supabase_1.default
        .from('cart')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', userId);
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return { message: 'Item removed from cart' };
};
exports.removeFromCart = removeFromCart;
/**
 * Clear all items in a user's cart.
 * Used internally after a successful order is placed.
 */
const clearCart = async (userId) => {
    const { error } = await supabase_1.default.from('cart').delete().eq('user_id', userId);
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
};
exports.clearCart = clearCart;
//# sourceMappingURL=cartService.js.map