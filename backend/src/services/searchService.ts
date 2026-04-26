import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import type { Product, SearchParams } from '../types';

// Common stopwords to exclude from tag tokenisation
const STOP_WORDS = new Set(['for', 'the', 'and', 'gift', 'gifts', 'with', 'that', 'this', 'from', 'under', 'over', 'best', 'top', 'good', 'great']);

/**
 * Full-text search across product names, descriptions, and tags.
 * Merges name/description matches with tag-overlap results,
 * deduplicates, and returns a relevance-sorted list.
 */
export const searchProducts = async (
  q: string | undefined,
  {
    page = 1,
    limit = 20,
    category,
    maxPrice,
    minPrice,
    sort = 'relevance',
  }: SearchParams
): Promise<{
  products: Product[];
  total: number;
  query: string;
  page: number;
  totalPages: number;
  suggestions?: string[];
}> => {
  if (!q || q.trim().length === 0) {
    throw new AppError('Search query is required', 400);
  }

  const offset = (page - 1) * limit;
  const searchTerm = q.trim();

  // Tokenise query for tag matching (tokens longer than 2 chars, not stopwords)
  const tokens = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  // ── Name + Description search ──────────────────────────────────────────────
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);
  if (minPrice !== undefined) query = query.gte('price', minPrice);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data: nameResults, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  // ── Tag overlap search ─────────────────────────────────────────────────────
  let tagResults: Product[] = [];
  if (tokens.length > 0) {
    let tagQuery = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .overlaps('tags', tokens)
      .limit(limit);

    if (category) tagQuery = tagQuery.eq('category', category);
    if (minPrice !== undefined) tagQuery = tagQuery.gte('price', minPrice);
    if (maxPrice !== undefined) tagQuery = tagQuery.lte('price', maxPrice);

    const { data: tagData } = await tagQuery;
    tagResults = (tagData ?? []) as Product[];
  }

  // Merge and deduplicate (name/desc results take precedence)
  const existingIds = new Set((nameResults ?? []).map((p: Product) => p.id));
  const merged: Product[] = [
    ...((nameResults ?? []) as Product[]),
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
  const categorySet = new Set(merged.map(p => p.category).filter(Boolean) as string[]);
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
