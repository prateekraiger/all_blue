import type { Product, ProductCreateInput, ProductUpdateInput, ProductListParams } from '../types';
/**
 * List products with optional filters, full-text search, pagination, and sorting.
 */
export declare const listProducts: ({ category, tag, q, page, limit, sort, }: ProductListParams) => Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
/**
 * Get a single active product by ID.
 */
export declare const getProduct: (id: string) => Promise<Product>;
/**
 * Create a new product. Admin-only.
 */
export declare const createProduct: (input: ProductCreateInput) => Promise<Product>;
/**
 * Update a product. Admin-only.
 */
export declare const updateProduct: (id: string, input: ProductUpdateInput) => Promise<Product>;
/**
 * Soft-delete a product by marking is_active = false. Admin-only.
 */
export declare const deleteProduct: (id: string) => Promise<{
    message: string;
}>;
/**
 * Return trending products (most ordered in the last 7 days).
 * Falls back to newest products if no qualifying orders exist.
 */
export declare const getTrendingProducts: (limit?: number) => Promise<Product[]>;
/**
 * Get all distinct categories from active products.
 */
export declare const getCategories: () => Promise<string[]>;
//# sourceMappingURL=productService.d.ts.map