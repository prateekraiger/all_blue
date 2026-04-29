/**
 * GiftShop AI — API Client
 * Centralized fetch wrapper for all backend calls.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
tags?: string[];
  images?: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  created_at: string;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  product_id: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment_id?: string;
  stripe_session_id?: string;
  address: Address;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }

  return json.data as T;
}

// ─── Products API ─────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: {
    category?: string;
    tag?: string;
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.tag) qs.set('tag', params.tag);
    if (params?.q) qs.set('q', params.q);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.sort) qs.set('sort', params.sort);
    const query = qs.toString();
    return apiFetch<{ products: Product[]; total: number; page: number; totalPages: number }>(
      `/api/products${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => apiFetch<Product>(`/api/products/${id}`),

  trending: (limit = 8) => apiFetch<Product[]>(`/api/products/trending?limit=${limit}`),

  categories: () => apiFetch<string[]>('/api/products/categories'),

  create: (data: Partial<Product>, token: string) =>
    apiFetch<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (id: string, data: Partial<Product>, token: string) =>
    apiFetch<Product>(
      `/api/products/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      token
    ),

  delete: (id: string, token: string) =>
    apiFetch<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' }, token),
};

// ─── Cart API ─────────────────────────────────────────────────────────────────

export const cartApi = {
  get: (token: string) => apiFetch<Cart>('/api/cart', {}, token),

  add: (productId: string, quantity: number, token: string) =>
    apiFetch<CartItem>(
      '/api/cart',
      { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) },
      token
    ),

  update: (itemId: string, quantity: number, token: string) =>
    apiFetch<CartItem>(
      `/api/cart/${itemId}`,
      { method: 'PUT', body: JSON.stringify({ quantity }) },
      token
    ),

  remove: (itemId: string, token: string) =>
    apiFetch<{ message: string }>(`/api/cart/${itemId}`, { method: 'DELETE' }, token),

  clear: (token: string) =>
    apiFetch<{ message: string }>('/api/cart', { method: 'DELETE' }, token),
};

// ─── Orders API ───────────────────────────────────────────────────────────────

export const ordersApi = {
  create: (
    data: { items: OrderItem[]; address: Address; total_amount: number },
    token: string
  ) => apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }, token),

  list: (params: { page?: number; limit?: number }, token: string) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    return apiFetch<{ orders: Order[]; total: number; page: number; totalPages: number }>(
      `/api/orders?${qs.toString()}`,
      {},
      token
    );
  },

  get: (id: string, token: string) => apiFetch<Order>(`/api/orders/${id}`, {}, token),

  cancel: (id: string, token: string) =>
    apiFetch<Order>(`/api/orders/${id}/cancel`, { method: 'PATCH' }, token),
};

// ─── Payment API (Stripe) ─────────────────────────────────────────────────────

export const paymentApi = {
  createCheckout: (orderId: string, amount: number, token: string) =>
    apiFetch<{
      session_id: string;
      checkout_url: string;
      order_id: string;
    }>(
      '/api/payment/create-checkout',
      { method: 'POST', body: JSON.stringify({ order_id: orderId, amount }) },
      token
    ),

  verify: (
    data: {
      session_id: string;
      order_id: string;
    },
    token: string
  ) =>
    apiFetch<{ message: string; order: Order }>(
      '/api/payment/verify',
      { method: 'POST', body: JSON.stringify(data) },
      token
    ),

  getConfig: () =>
    apiFetch<{ publishable_key: string }>('/api/payment/config'),
};

// ─── AI API ───────────────────────────────────────────────────────────────────

export const aiApi = {
  recommendations: (token: string, limit = 12) =>
    apiFetch<Product[]>(`/api/ai/recommendations?limit=${limit}`, {}, token),

  similar: (productId: string, limit = 8) =>
    apiFetch<Product[]>(`/api/ai/similar/${productId}?limit=${limit}`),

  updatePreferences: (
    data: { viewed_category?: string; viewed_tags?: string[]; last_search?: string },
    token: string
  ) =>
    apiFetch('/api/ai/preferences', { method: 'POST', body: JSON.stringify(data) }, token),

  chat: (message: string, token?: string | null) =>
    apiFetch<{ reply: string; products: Product[]; quickReplies?: string[] }>(
      '/api/ai/chat',
      { method: 'POST', body: JSON.stringify({ message }) },
      token
    ),

  generateGiftSuggestions: (
    input: { persona: string; occasion: string; budget: number },
    token?: string | null
  ) =>
    apiFetch<{
      products: Array<Product & { matchScore: number; reason: string }>;
      message: string;
    }>(
      '/api/gift-finder',
      { method: 'POST', body: JSON.stringify(input) },
      token
    ),
};

// ─── AR API ───────────────────────────────────────────────────────────────────

export interface ARPreviewData {
  product_id: string;
  name: string;
  category: string;
  images: string[];
  arSupported: boolean;
  modelUrl: string | null;
  instructions: string[];
  previewMessage: string;
}

export const arApi = {
  preview: (productId: string) =>
    apiFetch<ARPreviewData>(`/api/ar/preview/${productId}`),

  supportedCategories: () =>
    apiFetch<string[]>('/api/ar/supported-categories'),
};

// ─── Reviews API ──────────────────────────────────────────────────────────────

export const reviewsApi = {
  get: (productId: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return apiFetch<{
      reviews: Review[];
      total: number;
      avgRating: number;
      ratingCount: number;
    }>(`/api/reviews/${productId}?${qs.toString()}`);
  },

  create: (data: { product_id: string; rating: number; comment?: string }, token: string) =>
    apiFetch<Review>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }, token),

  delete: (id: string, token: string) =>
    apiFetch<{ message: string }>(`/api/reviews/${id}`, { method: 'DELETE' }, token),
};

// ─── Search API ───────────────────────────────────────────────────────────────

export const searchApi = {
  search: (params: {
    q: string;
    page?: number;
    limit?: number;
    category?: string;
    maxPrice?: number;
    minPrice?: number;
    sort?: string;
  }) => {
    const qs = new URLSearchParams();
    qs.set('q', params.q);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.category) qs.set('category', params.category);
    if (params.maxPrice) qs.set('maxPrice', String(params.maxPrice));
    if (params.minPrice) qs.set('minPrice', String(params.minPrice));
    if (params.sort) qs.set('sort', params.sort);
    return apiFetch<{ products: Product[]; total: number; query: string; page: number; totalPages: number }>(
      `/api/search?${qs.toString()}`
    );
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  dashboard: (token: string) => apiFetch<unknown>('/api/admin/dashboard', {}, token),

  allOrders: (params: { page?: number; limit?: number; status?: string }, token: string) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    return apiFetch<{ orders: Order[]; total: number }>(
      `/api/orders/admin?${qs.toString()}`,
      {},
      token
    );
  },

  updateOrderStatus: (orderId: string, status: string, token: string) =>
    apiFetch<Order>(
      `/api/orders/admin/${orderId}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      token
    ),
};

export default apiFetch;
