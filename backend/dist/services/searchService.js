"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = void 0;
const supabase_1 = __importDefault(require("../config/supabase"));
const errorHandler_1 = require("../middlewares/errorHandler");
// Common stopwords to exclude from tag tokenisation
const STOP_WORDS = new Set(['for', 'the', 'and', 'gift', 'gifts', 'with', 'that', 'this', 'from', 'under', 'over', 'best', 'top', 'good', 'great']);
/**
 * Full-text search across product names, descriptions, and tags.
 * Merges name/description matches with tag-overlap results,
 * deduplicates, and returns a relevance-sorted list.
 */
const searchProducts = async (q, { page = 1, limit = 20, category, maxPrice, minPrice, sort = 'relevance', }) => {
    if (!q || q.trim().length === 0) {
        throw new errorHandler_1.AppError('Search query is required', 400);
    }
    const offset = (page - 1) * limit;
    const searchTerm = q.trim();
    // Tokenise query for tag matching (tokens longer than 2 chars, not stopwords)
    const tokens = searchTerm
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
    // ── Name + Description search ──────────────────────────────────────────────
    let query = supabase_1.default
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .range(offset, offset + limit - 1);
    if (category)
        query = query.eq('category', category);
    if (minPrice !== undefined)
        query = query.gte('price', minPrice);
    if (maxPrice !== undefined)
        query = query.lte('price', maxPrice);
    if (sort === 'price_asc')
        query = query.order('price', { ascending: true });
    else if (sort === 'price_desc')
        query = query.order('price', { ascending: false });
    else
        query = query.order('created_at', { ascending: false });
    const { data: nameResults, error, count } = await query;
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    // ── Tag overlap search ─────────────────────────────────────────────────────
    let tagResults = [];
    if (tokens.length > 0) {
        let tagQuery = supabase_1.default
            .from('products')
            .select('*')
            .eq('is_active', true)
            .overlaps('tags', tokens)
            .limit(limit);
        if (category)
            tagQuery = tagQuery.eq('category', category);
        if (minPrice !== undefined)
            tagQuery = tagQuery.gte('price', minPrice);
        if (maxPrice !== undefined)
            tagQuery = tagQuery.lte('price', maxPrice);
        const { data: tagData } = await tagQuery;
        tagResults = (tagData ?? []);
    }
    // Merge and deduplicate (name/desc results take precedence)
    const existingIds = new Set((nameResults ?? []).map((p) => p.id));
    const merged = [
        ...(nameResults ?? []),
        ...tagResults.filter((p) => !existingIds.has(p.id)),
    ];
    // Simple relevance score: exact name match ranks highest
    if (sort === 'relevance') {
        const termLower = searchTerm.toLowerCase();
        merged.sort((a, b) => {
            const aExact = a.name.toLowerCase().includes(termLower) ? 2 : 0;
            const bExact = b.name.toLowerCase().includes(termLower) ? 2 : 0;
            const aTag = (a.tags ?? []).some(t => tokens.includes(t.toLowerCase())) ? 1 : 0;
            const bTag = (b.tags ?? []).some(t => tokens.includes(t.toLowerCase())) ? 1 : 0;
            return (bExact + bTag) - (aExact + aTag);
        });
    }
    // Generate search suggestions based on category distribution
    const categorySet = new Set(merged.map(p => p.category).filter(Boolean));
    const suggestions = categorySet.size > 0
        ? Array.from(categorySet).slice(0, 4).map(cat => `${searchTerm} in ${cat}`)
        : undefined;
    return {
        products: merged.slice(0, limit),
        total: count ?? merged.length,
        query: searchTerm,
        page: Number(page),
        totalPages: Math.ceil((count ?? merged.length) / limit),
        suggestions,
    };
};
exports.searchProducts = searchProducts;
//# sourceMappingURL=searchService.js.map