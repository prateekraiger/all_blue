import type { Request } from 'express';

// ─── Generic Auth User (Stack Auth JWT payload normalized shape) ──────────────
export interface AuthUser {
  id: string;
  email: string | null;
  user_metadata?: {
    full_name?: string | null;
    role?: string;
  };
}

// ─── Stack Auth JWT Payload ──────────────────────────────────────────────────
export interface StackPayload {
  sub: string;
  email?: string;
  displayName?: string;
  role?: string;
  [key: string]: any;
}

// ─── Auth User on Request ────────────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// ─── Product ─────────────────────────────────────────────────────────────────
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
  updated_at: string;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: number;
  category?: string;
  tags?: string[];
  images?: string[];
  stock?: number;
  is_active?: boolean;
}

export type ProductUpdateInput = Partial<ProductCreateInput>;

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product_id: string;
  qty: number;
  price: number;
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

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  payment_id?: string;
  stripe_session_id?: string;
  address: Address;
  created_at: string;
  updated_at: string;
}

export interface OrderCreateInput {
  items: OrderItem[];
  address: Address;
  total_amount: number;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ReviewCreateInput {
  product_id: string;
  rating: number;
  comment?: string;
}

// ─── User Preferences ────────────────────────────────────────────────────────
export interface UserPreferences {
  user_id: string;
  viewed_categories: string[];
  purchased_tags: string[];
  last_search?: string;
  updated_at: string;
}

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Chatbot ─────────────────────────────────────────────────────────────────
export interface ChatbotResponse {
  reply: string;
  products: Product[];
  /** Optional quick-reply suggestions to display below the message */
  quickReplies?: string[];
}

// ─── Gift Finder ─────────────────────────────────────────────────────────────
export type GiftFinderPersona = 'Partner' | 'Colleague' | 'Friend' | 'Parent' | 'Client';
export type GiftFinderOccasion = 'Birthday' | 'Anniversary' | 'Thank You' | 'Corporate' | 'Just Because';

export interface GiftFinderInput {
  persona: GiftFinderPersona;
  occasion: GiftFinderOccasion;
  budget: number;
}

export interface GiftFinderProduct extends Product {
  matchScore: number;
  reason: string;
}

export interface GiftFinderResult {
  products: GiftFinderProduct[];
  message: string;
}

// ─── Payment (Stripe) ────────────────────────────────────────────────────────
export interface StripeCheckoutResult {
  sessionId: string;
  url: string;
}

export interface PaymentVerifyInput {
  session_id: string;
  order_id: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface DashboardStats {
  stats: {
    totalRevenue: number;
    ordersToday: number;
    totalOrders: number;
    totalProducts: number;
  };
  ordersByStatus: Record<string, number>;
  lowStockProducts: Array<{ id: string; name: string; stock: number }>;
  recentOrders: Order[];
  popularProducts: Array<Product & { orders: number }>;
}

// ─── List / Search Params ────────────────────────────────────────────────────
export interface ProductListParams {
  category?: string;
  tag?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  sort?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
}
