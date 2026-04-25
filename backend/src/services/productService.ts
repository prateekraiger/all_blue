import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import type {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductListParams,
} from '../types';
import mockProducts from '../data/products.json';

const useLocalDB = process.env.USE_LOCAL_DB === 'true';


/**
 * List products with optional filters, full-text search, pagination, and sorting.
 */
export const listProducts = async ({
  category,
  tag,
  q,
  page = 1,
  limit = 20,
  sort = 'created_at',
}: ProductListParams): Promise<{
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  if (useLocalDB) {
    let filtered = [...mockProducts] as Product[];

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (tag) {
      filtered = filtered.filter((p) => p.tags?.includes(tag));
    }
    if (q) {
      const lowerQ = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQ) ||
          p.description?.toLowerCase().includes(lowerQ)
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const products = filtered.slice(offset, offset + limit);

    return {
      products,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  const offset = (page - 1) * limit;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .range(offset, offset + limit - 1);


  if (category) query = query.eq('category', category);
  if (tag) query = query.contains('tags', [tag]);
  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

  // Sorting
  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  return {
    products: (data ?? []) as Product[],
    total: count ?? 0,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil((count ?? 0) / limit),
  };
};

/**
 * Get a single active product by ID.
 */
export const getProduct = async (id: string): Promise<Product> => {
  if (useLocalDB) {
    const product = (mockProducts as Product[]).find((p) => p.id === id && p.is_active);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) throw new AppError('Product not found', 404);
  return data as Product;
};


/**
 * Create a new product. Admin-only.
 */
export const createProduct = async (input: ProductCreateInput): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([input])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data as Product;
};

/**
 * Update a product. Admin-only.
 */
export const updateProduct = async (
  id: string,
  input: ProductUpdateInput
): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Product not found', 404);
  return data as Product;
};

/**
 * Soft-delete a product by marking is_active = false. Admin-only.
 */
export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
  return { message: 'Product deleted successfully' };
};

/**
 * Return trending products (most ordered in the last 7 days).
 * Falls back to newest products if no qualifying orders exist.
 */
export const getTrendingProducts = async (limit: number = 8): Promise<Product[]> => {
  if (useLocalDB) {
    return (mockProducts as Product[])
      .filter((p) => p.is_active)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();


  const { data: orders } = await supabase
    .from('orders')
    .select('items')
    .eq('status', 'paid')
    .gte('created_at', sevenDaysAgo);

  if (orders && orders.length > 0) {
    const countMap: Record<string, number> = {};
    for (const order of orders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items as { product_id: string; qty: number }[]) {
        countMap[item.product_id] = (countMap[item.product_id] ?? 0) + item.qty;
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
      return (data ?? []) as Product[];
    }
  }

  // Fallback: return newest active products
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as Product[];
};

/**
 * Get all distinct categories from active products.
 */
export const getCategories = async (): Promise<string[]> => {
  if (useLocalDB) {
    return [...new Set(mockProducts.map((p) => p.category).filter(Boolean))] as string[];
  }

  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);


  if (error) throw new AppError(error.message, 500);

  const categories = [
    ...new Set(
      (data ?? []).map((p: { category: string | null }) => p.category).filter(Boolean) as string[]
    ),
  ];
  return categories;
};
