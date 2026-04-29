"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.getTrendingProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.listProducts = void 0;
const supabase_1 = __importDefault(require("../config/supabase"));
const errorHandler_1 = require("../middlewares/errorHandler");
/**
 * List products with optional filters, full-text search, pagination, and sorting.
 */
const listProducts = async ({ category, tag, q, page = 1, limit = 20, sort = 'created_at', }) => {
    const offset = (page - 1) * limit;
    let query = supabase_1.default
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1);
    if (category)
        query = query.eq('category', category);
    if (tag)
        query = query.contains('tags', [tag]);
    if (q)
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    // Sorting
    if (sort === 'price_asc') {
        query = query.order('price', { ascending: true });
    }
    else if (sort === 'price_desc') {
        query = query.order('price', { ascending: false });
    }
    else {
        query = query.order('created_at', { ascending: false });
    }
    const { data, error, count } = await query;
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return {
        products: (data ?? []),
        total: count ?? 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count ?? 0) / limit),
    };
};
exports.listProducts = listProducts;
/**
 * Get a single active product by ID.
 */
const getProduct = async (id) => {
    const { data, error } = await supabase_1.default
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
    if (error || !data)
        throw new errorHandler_1.AppError('Product not found', 404);
    return data;
};
exports.getProduct = getProduct;
/**
 * Create a new product. Admin-only.
 */
const createProduct = async (input) => {
    const { data, error } = await supabase_1.default
        .from('products')
        .insert([input])
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return data;
};
exports.createProduct = createProduct;
/**
 * Update a product. Admin-only.
 */
const updateProduct = async (id, input) => {
    const { data, error } = await supabase_1.default
        .from('products')
        .update(input)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    if (!data)
        throw new errorHandler_1.AppError('Product not found', 404);
    return data;
};
exports.updateProduct = updateProduct;
/**
 * Soft-delete a product by marking is_active = false. Admin-only.
 */
const deleteProduct = async (id) => {
    const { error } = await supabase_1.default
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return { message: 'Product deleted successfully' };
};
exports.deleteProduct = deleteProduct;
/**
 * Return trending products (most ordered in the last 7 days).
 * Falls back to newest products if no qualifying orders exist.
 */
const getTrendingProducts = async (limit = 8) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: orders } = await supabase_1.default
        .from('orders')
        .select('items')
        .eq('status', 'paid')
        .gte('created_at', sevenDaysAgo);
    if (orders && orders.length > 0) {
        const countMap = {};
        for (const order of orders) {
            const items = Array.isArray(order.items) ? order.items : [];
            for (const item of items) {
                countMap[item.product_id] = (countMap[item.product_id] ?? 0) + item.qty;
            }
        }
        const topIds = Object.entries(countMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);
        if (topIds.length > 0) {
            const { data } = await supabase_1.default
                .from('products')
                .select('*')
                .in('id', topIds)
                .eq('is_active', true);
            return (data ?? []);
        }
    }
    // Fallback: return newest active products
    const { data } = await supabase_1.default
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
    return (data ?? []);
};
exports.getTrendingProducts = getTrendingProducts;
/**
 * Get all distinct categories from active products.
 */
const getCategories = async () => {
    const { data, error } = await supabase_1.default
        .from('products')
        .select('category')
        .eq('is_active', true);
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    const categories = [
        ...new Set((data ?? []).map((p) => p.category).filter(Boolean)),
    ];
    return categories;
};
exports.getCategories = getCategories;
//# sourceMappingURL=productService.js.map