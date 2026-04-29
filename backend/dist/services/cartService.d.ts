import type { Cart, CartItem } from '../types';
/**
 * Get a user's cart with nested product details.
 * Filters out cart items referencing inactive or deleted products.
 */
export declare const getCart: (userId: string) => Promise<Cart>;
/**
 * Add a product to the user's cart.
 * If the product is already in the cart, the quantity is incremented.
 */
export declare const addToCart: (userId: string, productId: string, quantity?: number) => Promise<CartItem>;
/**
 * Update the quantity of an existing cart item.
 * Verifies ownership and sufficient stock.
 */
export declare const updateCartItem: (userId: string, cartItemId: string, quantity: number) => Promise<CartItem>;
/**
 * Remove a single item from the cart.
 * Only the owning user may remove their own items.
 */
export declare const removeFromCart: (userId: string, cartItemId: string) => Promise<{
    message: string;
}>;
/**
 * Clear all items in a user's cart.
 * Used internally after a successful order is placed.
 */
export declare const clearCart: (userId: string) => Promise<void>;
//# sourceMappingURL=cartService.d.ts.map