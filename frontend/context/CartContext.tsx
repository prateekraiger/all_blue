"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Cart, CartItem, Product } from "@/lib/api";
import { cartApi } from "@/lib/api";
import { useAuth } from "./AuthContext";

// Local cart item (for guests)
interface LocalCartItem {
  id: string; // product.id + gift options key
  product: Product;
  quantity: number;
  is_gift?: boolean;
  gift_message?: string;
}

interface CartContextType {
  cart: Cart | null;
  localCart: LocalCartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (product: Product, quantity?: number, isGift?: boolean, message?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  localCart: [],
  itemCount: 0,
  subtotal: 0,
  loading: false,
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
});

const LOCAL_CART_KEY = "giftshop_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load local cart from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LOCAL_CART_KEY);
        if (saved) setLocalCart(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Persist local cart to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localCart));
    }
  }, [localCart]);

  // Fetch server cart when user logs in
  const refreshCart = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const serverCart = await cartApi.get(token);
      setCart(serverCart);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user, token, refreshCart]);

  const addItem = useCallback(
    async (product: Product, quantity = 1, isGift = false, message = "") => {
      if (token) {
        // Authenticated: sync with server
        try {
          await cartApi.add(product.id, quantity, token); // Backend doesn't support gift info yet
          await refreshCart();
        } catch (err) {
          throw err;
        }
      } else {
        // Guest: use localStorage
        setLocalCart((prev) => {
          // Unique key for gift combinations
          const itemKey = `${product.id}-${isGift ? 'gift' : 'std'}-${message.length}`;
          const existing = prev.find((i) => i.id === itemKey);
          if (existing) {
            return prev.map((i) =>
              i.id === itemKey ? { ...i, quantity: i.quantity + quantity } : i
            );
          }
          return [...prev, { id: itemKey, product, quantity, is_gift: isGift, gift_message: message }];
        });
      }
    },
    [token, refreshCart]
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (token) {
        try {
          await cartApi.update(itemId, quantity, token);
          await refreshCart();
        } catch (err) {
          throw err;
        }
      } else {
        setLocalCart((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        );
      }
    },
    [token, refreshCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (token) {
        try {
          await cartApi.remove(itemId, token);
          await refreshCart();
        } catch (err) {
          throw err;
        }
      } else {
        setLocalCart((prev) => prev.filter((i) => i.id !== itemId));
      }
    },
    [token, refreshCart]
  );

  const clearCart = useCallback(async () => {
    if (token) {
      try {
        await cartApi.clear(token);
        setCart(null);
      } catch (err) {
        throw err;
      }
    } else {
      setLocalCart([]);
    }
  }, [token]);

  // Computed values
  const itemCount = token
    ? cart?.itemCount ?? 0
    : localCart.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = token
    ? cart?.subtotal ?? 0
    : localCart.reduce((sum, i) => sum + (i.product.price + (i.is_gift ? 150 : 0)) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        localCart,
        itemCount,
        subtotal,
        loading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
