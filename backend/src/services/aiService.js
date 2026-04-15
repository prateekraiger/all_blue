const supabase = require('../config/supabase');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Get personalized product recommendations for a user.
 * Logic: Tag-based matching from user preferences → category frequency → trending fallback.
 */
const getRecommendations = async (userId, limit = 12) => {
  // 1. Fetch user preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  let products = [];

  if (prefs && (prefs.purchased_tags?.length || prefs.viewed_categories?.length)) {
    const tags = prefs.purchased_tags || [];
    const categories = prefs.viewed_categories || [];

    // 2a. Tag-based: find products matching purchased tags
    if (tags.length > 0) {
      const { data: tagProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .overlaps('tags', tags)
        .order('created_at', { ascending: false })
        .limit(limit);

      products = tagProducts || [];
    }

    // 2b. Category-based: fill remaining slots
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
      products = [...products, ...(catProducts || [])];
    }
  }

  // 3. Fallback: trending / newest products if not enough recs
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
    products = [...products, ...(fallback || [])];
  }

  return products.slice(0, limit);
};

/**
 * Get similar products based on overlapping tags.
 */
const getSimilarProducts = async (productId, limit = 8) => {
  // Get the reference product's tags and category
  const { data: product, error } = await supabase
    .from('products')
    .select('id, tags, category')
    .eq('id', productId)
    .single();

  if (error || !product) throw new AppError('Product not found', 404);

  let similar = [];

  // Tag overlap matching
  if (product.tags && product.tags.length > 0) {
    const { data: tagMatches } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('id', productId)
      .overlaps('tags', product.tags)
      .order('created_at', { ascending: false })
      .limit(limit);

    similar = tagMatches || [];
  }

  // Fill with same-category products if needed
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

    similar = [...similar, ...(catProducts || [])];
  }

  return similar.slice(0, limit);
};

/**
 * Update user preference signals.
 */
const updatePreferences = async (userId, { viewed_category, viewed_tags, last_search }) => {
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  const now = new Date().toISOString();

  if (existing) {
    const updatedCategories = viewed_category
      ? [...new Set([...(existing.viewed_categories || []), viewed_category])]
      : existing.viewed_categories;

    const updatedTags = viewed_tags
      ? [...new Set([...(existing.purchased_tags || []), ...viewed_tags])]
      : existing.purchased_tags;

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        viewed_categories: updatedCategories,
        purchased_tags: updatedTags,
        last_search: last_search || existing.last_search,
        updated_at: now,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  } else {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert([
        {
          user_id: userId,
          viewed_categories: viewed_category ? [viewed_category] : [],
          purchased_tags: viewed_tags || [],
          last_search: last_search || null,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }
};

/**
 * Simple rule-based chatbot response.
 * Returns filtered products based on keywords in the message.
 */
const chatbotResponse = async (message, userId) => {
  const msg = message.toLowerCase();

  // Extract price limit
  const priceMatch = msg.match(/under\s*[₹rs.]?\s*(\d+)/i) || msg.match(/below\s*[₹rs.]?\s*(\d+)/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;

  // Keyword → category/tag mapping
  const keywordMap = {
    birthday: ['birthday'],
    anniversary: ['anniversary'],
    wedding: ['wedding'],
    corporate: ['corporate'],
    love: ['love', 'romantic'],
    baby: ['baby', 'newborn'],
    kids: ['kids', 'children'],
    mug: ['mug', 'drinkware'],
    candle: ['candle'],
    jewel: ['jewellery', 'jewelry'],
    flower: ['floral'],
    book: ['book'],
    personaliz: ['personalized', 'custom'],
    photo: ['photo', 'personalized'],
    luxury: ['luxury', 'premium'],
    cheap: ['affordable', 'budget'],
  };

  const matchedTags = [];
  for (const [keyword, tags] of Object.entries(keywordMap)) {
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

  let reply = '';

  if (!products || products.length === 0) {
    reply = "I couldn't find products matching your request. Try browsing our shop or searching for something specific!";
  } else {
    const greeting = matchedTags.length > 0 ? `Great choice! Here are some ${matchedTags[0]} gift ideas` : 'Here are some products you might like';
    reply = maxPrice
      ? `${greeting} under ₹${maxPrice}:`
      : `${greeting}:`;
  }

  // Update last_search preference
  if (userId) {
    try {
      await updatePreferences(userId, { last_search: message });
    } catch (_) {}
  }

  return {
    reply,
    products: products || [],
  };
};

module.exports = { getRecommendations, getSimilarProducts, updatePreferences, chatbotResponse };
