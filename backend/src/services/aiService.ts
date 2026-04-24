import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import type {
  Product,
  UserPreferences,
  ChatbotResponse,
  GiftFinderInput,
  GiftFinderProduct,
  GiftFinderResult,
  GiftFinderPersona,
  GiftFinderOccasion,
} from '../types';

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

// ─── Gift Finder ──────────────────────────────────────────────────────────────

/**
 * Persona → tag affinity map.
 * Each persona type has a set of tags that are likely relevant.
 */
const PERSONA_TAG_MAP: Record<GiftFinderPersona, string[]> = {
  Partner: ['romantic', 'love', 'luxury', 'premium', 'personalized', 'anniversary', 'perfume'],
  Colleague: ['corporate', 'hamper', 'premium', 'mug', 'book'],
  Friend: ['birthday', 'celebration', 'mug', 'personalized', 'photo', 'candle'],
  Parent: ['love', 'personalized', 'photo', 'premium', 'candle', 'floral'],
  Client: ['corporate', 'premium', 'luxury', 'hamper'],
};

/**
 * Occasion → tag affinity map.
 */
const OCCASION_TAG_MAP: Record<GiftFinderOccasion, string[]> = {
  Birthday: ['birthday', 'celebration', 'surprise', 'personalized'],
  Anniversary: ['anniversary', 'romantic', 'love', 'luxury', 'premium'],
  'Thank You': ['personalized', 'candle', 'floral', 'photo', 'mug'],
  Corporate: ['corporate', 'premium', 'hamper', 'luxury'],
  'Just Because': ['personalized', 'celebration', 'candle', 'photo', 'mug'],
};

/**
 * Persona × occasion → category affinity map (fallback layer).
 */
const PERSONA_CATEGORY_MAP: Record<GiftFinderPersona, string[]> = {
  Partner: ['Decor', 'Luxury', 'Bedroom'],
  Colleague: ['Living Room', 'Decor'],
  Friend: ['Decor', 'Lighting', 'Living Room'],
  Parent: ['Living Room', 'Decor', 'Bedroom'],
  Client: ['Living Room', 'Decor'],
};

/**
 * Score a product based on how many of its tags overlap with the desired tags.
 * Returns a 0–100 score.
 */
function calculateMatchScore(product: Product, targetTags: string[]): number {
  if (!product.tags || product.tags.length === 0 || targetTags.length === 0) {
    return 50; // Neutral score for tagless products
  }

  const productTagSet = new Set(product.tags.map((t) => t.toLowerCase()));
  const targetTagSet = new Set(targetTags.map((t) => t.toLowerCase()));

  let overlapCount = 0;
  for (const tag of targetTagSet) {
    if (productTagSet.has(tag)) overlapCount++;
  }

  // Ratio of matched target tags, scaled to 60–99 range
  const ratio = overlapCount / targetTagSet.size;
  return Math.round(60 + ratio * 39);
}

/**
 * Generate a human-readable reason for why a product was recommended.
 */
function generateReason(
  product: Product,
  persona: GiftFinderPersona,
  occasion: GiftFinderOccasion,
  budget: number
): string {
  const budgetFormatted = budget.toLocaleString('en-IN');
  const priceFormatted = product.price.toLocaleString('en-IN');

  const personaLower = persona.toLowerCase();
  const occasionLower = occasion.toLowerCase();

  if (product.price <= budget * 0.5) {
    return `An excellent value pick for your ${personaLower}'s ${occasionLower} gift at ₹${priceFormatted} — well within your ₹${budgetFormatted} budget, leaving room to add more.`;
  }

  if (product.price <= budget * 0.8) {
    return `A well-balanced choice for a ${occasionLower} gift for your ${personaLower}. Great quality at ₹${priceFormatted}.`;
  }

  return `A premium pick perfectly suited for your ${personaLower}'s ${occasionLower}. At ₹${priceFormatted}, it makes the most of your budget.`;
}

/**
 * Gift Finder — rule-based recommendation engine.
 *
 * 1. Combines persona + occasion tags to build a target tag set.
 * 2. Queries Supabase for active, in-stock products within budget.
 * 3. Scores and ranks results by tag overlap.
 * 4. Falls back to category matching if tag matches are insufficient.
 * 5. Final fallback: cheapest products within budget.
 */
export const giftFinderRecommendations = async (
  input: GiftFinderInput
): Promise<GiftFinderResult> => {
  const { persona, occasion, budget } = input;
  const RESULT_LIMIT = 6;

  // 1. Build target tag set from persona + occasion
  const personaTags = PERSONA_TAG_MAP[persona] ?? [];
  const occasionTags = OCCASION_TAG_MAP[occasion] ?? [];
  const targetTags = [...new Set([...personaTags, ...occasionTags])];

  let allProducts: Product[] = [];

  // 2. Tag-based query
  if (targetTags.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .gt('stock', 0)
      .lte('price', budget)
      .overlaps('tags', targetTags)
      .order('price', { ascending: false })
      .limit(RESULT_LIMIT * 2); // Fetch extra to allow scoring/ranking

    if (error) {
      console.error('[GiftFinder] Tag query error:', error.message);
    } else {
      allProducts = (data ?? []) as Product[];
    }
  }

  // 3. Category-based fallback
  if (allProducts.length < RESULT_LIMIT) {
    const existingIds = allProducts.map((p) => p.id);
    const categories = PERSONA_CATEGORY_MAP[persona] ?? [];
    const needed = (RESULT_LIMIT * 2) - allProducts.length;

    if (categories.length > 0) {
      let catQuery = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock', 0)
        .lte('price', budget)
        .in('category', categories)
        .order('price', { ascending: false })
        .limit(needed);

      if (existingIds.length > 0) {
        catQuery = catQuery.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data } = await catQuery;
      allProducts = [...allProducts, ...((data ?? []) as Product[])];
    }
  }

  // 4. Final fallback — any product within budget
  if (allProducts.length < 3) {
    const existingIds = allProducts.map((p) => p.id);
    const needed = RESULT_LIMIT - allProducts.length;

    let fallbackQuery = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .gt('stock', 0)
      .lte('price', budget)
      .order('price', { ascending: false })
      .limit(needed);

    if (existingIds.length > 0) {
      fallbackQuery = fallbackQuery.not('id', 'in', `(${existingIds.join(',')})`);
    }

    const { data } = await fallbackQuery;
    allProducts = [...allProducts, ...((data ?? []) as Product[])];
  }

  // 5. Score, sort, and build response
  const scored: GiftFinderProduct[] = allProducts.map((product) => ({
    ...product,
    matchScore: calculateMatchScore(product, targetTags),
    reason: generateReason(product, persona, occasion, budget),
  }));

  // Sort by match score descending, then price descending (prefer higher-value items)
  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.price - a.price;
  });

  const finalProducts = scored.slice(0, RESULT_LIMIT);

  const message =
    finalProducts.length > 0
      ? `Found ${finalProducts.length} perfect gift${finalProducts.length > 1 ? 's' : ''} for your ${persona.toLowerCase()}'s ${occasion.toLowerCase()}!`
      : `We couldn't find products matching your criteria right now. Try adjusting your budget or browsing our full catalog.`;

  return {
    products: finalProducts,
    message,
  };
};
