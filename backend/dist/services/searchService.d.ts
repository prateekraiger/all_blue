import type { Product, SearchParams } from '../types';
/**
 * Full-text search across product names, descriptions, and tags.
 * Merges name/description matches with tag-overlap results,
 * deduplicates, and returns a relevance-sorted list.
 */
export declare const searchProducts: (q: string | undefined, { page, limit, category, maxPrice, minPrice, sort, }: SearchParams) => Promise<{
    products: Product[];
    total: number;
    query: string;
    page: number;
    totalPages: number;
    suggestions?: string[];
}>;
//# sourceMappingURL=searchService.d.ts.map