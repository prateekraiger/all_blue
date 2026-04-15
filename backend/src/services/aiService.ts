import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import type { Product, UserPreferences, ChatbotResponse } from '../types';

// ─── Keyword → tag mapping for the rule-based chatbot ─────────────────────────
const KEYWORD_TAG_MAP: Record<string, string[]> = {
  birthday: ['birthday'],
  anniversary: ['anniversary'],
  wedding: ['wedding'],
  corporate: ['corporate'],
  love: ['love', 'romantic'],
  romantic: ['love', 'romantic'],
  baby: ['baby', 'newborn'],
  newborn: ['baby', 'newborn'],
  kids: ['kids', 'children'],
  mug: ['mug', 'drinkware'],
  candle: ['candle'],
  jewel: ['jewellery', 'jewelry'],
  jewelry: ['jewellery', 'jewelry'],
  flower: ['floral'],
  book: ['book'],
  personaliz: ['personalized', 'custom'],
  photo: ['photo', 'personalized'],
  luxury: ['luxury', 'premium'],
  premium: ['luxury', 'premium'],
  cheap: ['affordable', 'budget'],
  affordable: ['affordable', 'budget'],
  hamper: ['hamper'],
  perfume: ['perfume'],
};

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Return personalised product recommendations for a user.
 *
 * Priority:
 *  1. Products whose tags overlap with the user's purchased_tags
 *  2. Products in the user's viewed_categories
 *  3. Newest products as a fallback
 */
export const getRecommendations = async (
  userId: string,
  limit: number = 12
): Promise<Product[]> => {
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  let products: Product[] = [];

  if (prefs) {
    const tags: string[] = prefs.purchased_tags ?? [];
    const categories: string[] = prefs.viewed_categories ?? [];

    // 1. Tag-based matches
    if (tags.length > 0) {
      const { data: tagProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .overlaps('tags', tags)
        .order('created_at', { ascending: false })
        .limit(limit);

      products = (tagProducts ?? []) as Product[];
    }

    // 2. Category-based fill
    if (products.length < limit && categories.length > 0) {
      const existingIds = products.map((p) => p.id);
      const needed = limit - products.length;

      let catQuery = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .in('category', categories)
        .order('created_at', { ascending: false })
        .limit(needed);

      if (existingIds.length > 0) {
        catQuery = catQuery.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data: catProducts } = await catQuery;
      products = [...products, ...((catProducts ?? []) as Product[])];
    }
  }

  // 3. Fallback — newest products
  if (products.length < limit) {
    const existingIds = products.map((p) => p.id);
    const needed = limit - products.length;

    let fallbackQuery = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(needed);

    if (existingIds.length > 0) {
      fallbackQuery = fallbackQuery.not('id', 'in', `(${existingIds.join(',')})`);
    }

    const { data: fallback } = await fallbackQuery;
    products = [...products, ...((fallback ?? []) as Product[])];
  }

  return products.slice(0, limit);
};

// ─── Similar Products ─────────────────────────────────────────────────────────

/**
 * Return products similar to the given product.
 *
 * Priority:
 *  1. Products with overlapping tags
 *  2. Products in the same category
 */
export const getSimilarProducts = async (
  productId: string,
  limit: number = 8
): Promise<Product[]> => {
  const { data: product, error } = await supabase
    .from('products')
    .select('id, tags, category')
    .eq('id', productId)
    .single();

  if (error || !product) throw new AppError('Product not found', 404);

  let similar: Product[] = [];

  // 1. Tag overlap
  if (product.tags && product.tags.length > 0) {
    const { data: tagMatches } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('id', productId)
      .overlaps('tags', product.tags)
      .order('created_at', { ascending: false })
      .limit(limit);

    similar = (tagMatches ?? []) as Product[];
  }

  // 2. Same-category fill
  if (similar.length < limit && product.category) {
    const existingIds = [productId, ...similar.map((p) => p.id)];
    const needed = limit - similar.length;

    const { data: catProducts } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', product.category)
      .not('id', 'in', `(${existingIds.join(',')})`)
      .limit(needed);

    similar = [...similar, ...((catProducts ?? []) as Product[])];
  }

  return similar.slice(0, limit);
};

// ─── Preferences ─────────────────────────────────────────────────────────────

/**
 * Upsert user preference signals (viewed category, tags, last search).
 */
export const updatePreferences = async (
  userId: string,
  {
    viewed_category,
    viewed_tags,
    last_search,
  }: {
    viewed_category?: string;
    viewed_tags?: string[];
    last_search?: string;
  }
): Promise<UserPreferences> => {
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  const now = new Date().toISOString();

  if (existing) {
    const updatedCategories = viewed_category
      ? [...new Set([...(existing.viewed_categories ?? []), viewed_category])]
      : existing.viewed_categories;

    const updatedTags = viewed_tags
      ? [...new Set([...(existing.purchased_tags ?? []), ...viewed_tags])]
      : existing.purchased_tags;

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        viewed_categories: updatedCategories,
        purchased_tags: updatedTags,
        last_search: last_search ?? existing.last_search,
        updated_at: now,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data as UserPreferences;
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .insert([
      {
        user_id: userId,
        viewed_categories: viewed_category ? [viewed_category] : [],
        purchased_tags: viewed_tags ?? [],
        last_search: last_search ?? null,
        updated_at: now,
      },
    ])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data as UserPreferences;
};

// ─── Chatbot ──────────────────────────────────────────────────────────────────

/**
 * Rule-based chatbot: extracts keywords from the user message,
 * maps them to product tags, and returns matching products with a reply.
 */
export const chatbotResponse = async (
  message: string,
  userId: string | null
): Promise<ChatbotResponse> => {
  const msg = message.toLowerCase();

  // Extract optional price ceiling from message (e.g. "under ₹500", "below 1000")
  const priceMatch =
    msg.match(/under\s*[₹rs.]?\s*(\d+)/i) ?? msg.match(/below\s*[₹rs.]?\s*(\d+)/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

  // Collect all matching tags
  const matchedTags: string[] = [];
  for (const [keyword, tags] of Object.entries(KEYWORD_TAG_MAP)) {
    if (msg.includes(keyword)) matchedTags.push(...tags);
  }

  let query = supabase
    .from('products')
    .select('id, name, price, images, category, tags')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (maxPrice) query = query.lte('price', maxPrice);
  if (matchedTags.length > 0) query = query.overlaps('tags', matchedTags);

  const { data: products } = await query;

  let reply: string;

  if (!products || products.length === 0) {
    reply =
      "I couldn't find products matching your request. Try browsing our shop or searching for something specific!";
  } else {
    const greeting =
      matchedTags.length > 0
        ? `Great choice! Here are some ${matchedTags[0]} gift ideas`
        : 'Here are some products you might like';
    reply = maxPrice ? `${greeting} under ₹${maxPrice}:` : `${greeting}:`;
  }

  // Update last_search preference (non-critical)
  if (userId) {
    updatePreferences(userId, { last_search: message }).catch(() => {});
  }

  return {
    reply,
    products: (products ?? []) as Product[],
  };
};
