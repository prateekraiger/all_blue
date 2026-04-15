const supabase = require('../config/supabase');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Full-text search across products.
 * Uses ilike on name + description, and array overlap for tags.
 */
const searchProducts = async (q, { page = 1, limit = 20, category, maxPrice, minPrice, sort = 'relevance' }) => {
  if (!q || q.trim().length === 0) {
    throw new AppError('Search query is required', 400);
  }

  const offset = (page - 1) * limit;
  const searchTerm = q.trim();

  // Split query into tokens for broader tag matching
  const tokens = searchTerm.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data: nameResults, error, count } = await query;
  if (error) throw new AppError(error.message, 500);

  // Also search by tags if tokens exist
  let tagResults = [];
  if (tokens.length > 0) {
    const { data: tagData } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .overlaps('tags', tokens)
      .limit(limit);

    tagResults = tagData || [];
  }

  // Merge and deduplicate
  const existingIds = new Set((nameResults || []).map((p) => p.id));
  const merged = [
    ...(nameResults || []),
    ...tagResults.filter((p) => !existingIds.has(p.id)),
  ];

  return {
    products: merged.slice(0, limit),
    total: count || merged.length,
    query: searchTerm,
    page: Number(page),
    totalPages: Math.ceil((count || merged.length) / limit),
  };
};

module.exports = { searchProducts };
