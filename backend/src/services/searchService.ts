import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import type { Product, SearchParams } from '../types';

/**
 * Full-text search across product names, descriptions, and tags.
 * Merges name/description matches with tag-overlap results and deduplicates.
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
}> => {
  if (!q || q.trim().length === 0) {
    throw new AppError('Search query is required', 400);
  }

  const offset = (page - 1) * limit;
  const searchTerm = q.trim();

  // Tokenise query for tag matching (tokens longer than 2 chars)
  const tokens = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

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
    const { data: tagData } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .overlaps('tags', tokens)
      .limit(limit);

    tagResults = (tagData ?? []) as Product[];
  }

  // Merge and deduplicate (name/desc results take precedence)
  const existingIds = new Set((nameResults ?? []).map((p: Product) => p.id));
  const merged: Product[] = [
    ...((nameResults ?? []) as Product[]),
    ...tagResults.filter((p) => !existingIds.has(p.id)),
  ];

  return {
    products: merged.slice(0, limit),
    total: count ?? merged.length,
    query: searchTerm,
    page: Number(page),
    totalPages: Math.ceil((count ?? merged.length) / limit),
  };
};
