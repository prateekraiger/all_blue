"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.giftFinderRecommendations = exports.chatbotResponse = exports.updatePreferences = exports.getSimilarProducts = exports.getRecommendations = void 0;
const supabase_1 = __importDefault(require("../config/supabase"));
const errorHandler_1 = require("../middlewares/errorHandler");
const geminiService_1 = require("./geminiService");
// ─── Keyword → tag mapping for the rule-based chatbot ─────────────────────────
const KEYWORD_TAG_MAP = {
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
    // Extended keywords
    diwali: ['festival', 'diwali', 'celebration'],
    holi: ['festival', 'holi', 'celebration'],
    christmas: ['christmas', 'celebration', 'festival'],
    valentine: ['romantic', 'love', 'anniversary'],
    teacher: ['appreciation', 'thank you', 'corporate'],
    friend: ['birthday', 'celebration', 'personalized'],
    mom: ['love', 'personalized', 'floral'],
    dad: ['premium', 'corporate'],
    plant: ['plants', 'green', 'decor'],
    watch: ['luxury', 'premium', 'corporate'],
    chocolate: ['birthday', 'celebration', 'thank you'],
    jewellery: ['jewellery', 'jewelry', 'luxury'],
    decor: ['decor', 'home'],
    art: ['art', 'decor', 'personalized'],
    kitchen: ['kitchen', 'hamper', 'corporate'],
    travel: ['travel', 'luxury', 'premium'],
};
// ─── Chatbot quick replies ─────────────────────────────────────────────────────
const QUICK_REPLIES = [
    ['Birthday gifts', 'Anniversary gifts'],
    ['Under ₹500', 'Under ₹1000'],
    ['Personalized gifts', 'Luxury gifts'],
    ['Corporate gifting', 'Gift hampers'],
];
// ─── Recommendations ──────────────────────────────────────────────────────────
/**
 * Return personalised product recommendations for a user.
 */
const getRecommendations = async (userId, limit = 12) => {
    try {
        const { data: prefs } = await supabase_1.default
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();
        let products = [];
        if (prefs) {
            const tags = prefs.purchased_tags ?? [];
            const categories = prefs.viewed_categories ?? [];
            // 1. Tag-based matches
            if (tags.length > 0) {
                const { data: tagProducts } = await supabase_1.default
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .overlaps('tags', tags)
                    .order('created_at', { ascending: false })
                    .limit(limit);
                products = (tagProducts ?? []);
            }
            // 2. Category-based fill
            if (products.length < limit && categories.length > 0) {
                const existingIds = products.map((p) => p.id);
                const needed = limit - products.length;
                let catQuery = supabase_1.default
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .in('category', categories)
                    .order('created_at', { ascending: false })
                    .limit(needed);
                if (existingIds.length > 0) {
                    catQuery = catQuery.not('id', 'in', existingIds);
                }
                const { data: catProducts } = await catQuery;
                products = [...products, ...(catProducts ?? [])];
            }
        }
        // 3. Fallback — newest products
        if (products.length < limit) {
            const existingIds = products.map((p) => p.id);
            const needed = limit - products.length;
            let fallbackQuery = supabase_1.default
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(needed);
            if (existingIds.length > 0) {
                fallbackQuery = fallbackQuery.not('id', 'in', existingIds);
            }
            const { data: fallback } = await fallbackQuery;
            products = [...products, ...(fallback ?? [])];
        }
        return products.slice(0, limit);
    }
    catch (error) {
        console.error('[AI Service] getRecommendations fallback used');
        return MOCK_PRODUCTS.slice(0, limit);
    }
};
exports.getRecommendations = getRecommendations;
// ─── Similar Products ─────────────────────────────────────────────────────────
/**
 * Return products similar to the given product.
 */
const getSimilarProducts = async (productId, limit = 8) => {
    try {
        const { data: product, error } = await supabase_1.default
            .from('products')
            .select('id, tags, category')
            .eq('id', productId)
            .single();
        if (error || !product)
            throw new errorHandler_1.AppError('Product not found', 404);
        let similar = [];
        // 1. Tag overlap
        if (product.tags && product.tags.length > 0) {
            const { data: tagMatches } = await supabase_1.default
                .from('products')
                .select('*')
                .eq('is_active', true)
                .neq('id', productId)
                .overlaps('tags', product.tags)
                .order('created_at', { ascending: false })
                .limit(limit);
            similar = (tagMatches ?? []);
        }
        // 2. Same-category fill
        if (similar.length < limit && product.category) {
            const existingIds = [productId, ...similar.map((p) => p.id)];
            const needed = limit - similar.length;
            const { data: catProducts } = await supabase_1.default
                .from('products')
                .select('*')
                .eq('is_active', true)
                .eq('category', product.category)
                .not('id', 'in', existingIds)
                .limit(needed);
            similar = [...similar, ...(catProducts ?? [])];
        }
        return similar.slice(0, limit);
    }
    catch (error) {
        console.error('[AI Service] getSimilarProducts fallback used');
        return MOCK_PRODUCTS.filter(p => p.id !== productId).slice(0, limit);
    }
};
exports.getSimilarProducts = getSimilarProducts;
// ─── Preferences ─────────────────────────────────────────────────────────────
/**
 * Upsert user preference signals (viewed category, tags, last search).
 */
const updatePreferences = async (userId, { viewed_category, viewed_tags, last_search, }) => {
    try {
        const { data: existing } = await supabase_1.default
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
            const { data, error } = await supabase_1.default
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
            if (error)
                throw new errorHandler_1.AppError(error.message, 500);
            return data;
        }
        const { data, error } = await supabase_1.default
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
        if (error)
            throw new errorHandler_1.AppError(error.message, 500);
        return data;
    }
    catch (error) {
        console.error('[AI Service] updatePreferences failed (silent fail)');
        return {};
    }
};
exports.updatePreferences = updatePreferences;
// ─── Chatbot ──────────────────────────────────────────────────────────────────
/**
 * Detect intent from message for smarter chatbot replies.
 */
function detectIntent(msg) {
    if (/\b(hi|hello|hey|hola|namaste|howdy)\b/i.test(msg))
        return 'greeting';
    if (/\b(bye|goodbye|see you|later|thanks|thank you|thx)\b/i.test(msg))
        return 'farewell';
    if (/\b(help|what can you do|how|guide|support)\b/i.test(msg))
        return 'help';
    if (/\b(order|track|status|cancel|refund|return)\b/i.test(msg))
        return 'order_help';
    if (/\b(price|cost|how much|cheap|expensive|budget)\b/i.test(msg))
        return 'price_query';
    return 'product_search';
}
/**
 * Get a contextual greeting response.
 */
function getIntentReply(intent) {
    switch (intent) {
        case 'greeting':
            return "Hi there! 👋 I'm your AI Shopping Assistant. I can help you find the perfect gift! Try asking me things like:\n• \"Birthday gift under ₹1000\"\n• \"Romantic anniversary gift\"\n• \"Corporate gift hamper\"";
        case 'farewell':
            return "Thanks for chatting! 😊 Come back anytime you need help finding the perfect gift. Happy shopping! 🎁";
        case 'help':
            return "Here's what I can do for you:\n🎁 Find gifts by occasion (birthday, anniversary, etc.)\n💰 Filter by budget (e.g., \"under ₹500\")\n🤍 Suggest personalized gifts\n🏢 Corporate gifting ideas\n\nJust tell me what you're looking for!";
        case 'order_help':
            return "For order tracking and support, please visit your **Orders** page in your account. If you need further help, contact our support team. Is there anything else I can help you find?";
        default:
            return null;
    }
}
/**
 * Enhanced chatbot with Gemini 1.5 Flash AI + rule-based fallback.
 */
const chatbotResponse = async (message, userId) => {
    try {
        const msg = message.toLowerCase();
        // ── Try Gemini AI first ─────────────────────────────────────────────────
        const geminiResult = await (0, geminiService_1.geminiChatResponse)(message);
        let reply;
        let matchedTags = [];
        let maxPrice = null;
        let minPrice = null;
        let intent;
        if (geminiResult) {
            // Gemini succeeded — use its intelligent parsing
            reply = geminiResult.reply;
            matchedTags = geminiResult.suggestedTags;
            maxPrice = geminiResult.maxPrice;
            minPrice = geminiResult.minPrice;
            intent = geminiResult.intent;
            // For non-product intents, return Gemini's reply directly
            if (intent !== 'product_search' && intent !== 'price_query' && intent !== 'unknown') {
                return {
                    reply,
                    products: [],
                    quickReplies: QUICK_REPLIES[Math.floor(Math.random() * QUICK_REPLIES.length)],
                };
            }
        }
        else {
            // ── Fallback: rule-based intent detection ───────────────────────────
            intent = detectIntent(msg);
            const intentReply = getIntentReply(intent);
            if (intentReply && intent !== 'product_search' && intent !== 'price_query') {
                return {
                    reply: intentReply,
                    products: [],
                    quickReplies: QUICK_REPLIES[Math.floor(Math.random() * QUICK_REPLIES.length)],
                };
            }
            // Extract price constraints (rule-based)
            const priceMatch = msg.match(/under\s*[₹rs.]?\s*(\d+)/i) ??
                msg.match(/below\s*[₹rs.]?\s*(\d+)/i) ??
                msg.match(/less than\s*[₹rs.]?\s*(\d+)/i) ??
                msg.match(/max\s*[₹rs.]?\s*(\d+)/i);
            maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;
            const minPriceMatch = msg.match(/above\s*[₹rs.]?\s*(\d+)/i) ??
                msg.match(/over\s*[₹rs.]?\s*(\d+)/i) ??
                msg.match(/more than\s*[₹rs.]?\s*(\d+)/i);
            minPrice = minPriceMatch ? parseInt(minPriceMatch[1], 10) : null;
            // Collect matching tags (rule-based)
            for (const [keyword, tags] of Object.entries(KEYWORD_TAG_MAP)) {
                if (msg.includes(keyword))
                    matchedTags.push(...tags);
            }
            reply = ''; // Will be set after product fetch
        }
        // ── Fetch products from database ──────────────────────────────────────
        let products = [];
        try {
            let query = supabase_1.default
                .from('products')
                .select('id, name, price, images, category, tags, stock')
                .eq('is_active', true)
                .gt('stock', 0)
                .order('created_at', { ascending: false })
                .limit(6);
            if (maxPrice)
                query = query.lte('price', maxPrice);
            if (minPrice)
                query = query.gte('price', minPrice);
            if (matchedTags.length > 0)
                query = query.overlaps('tags', matchedTags);
            const { data } = await query;
            products = (data ?? []);
            // If tag-based search returned nothing, fall back to full catalog with price filter
            if (products.length === 0 && (maxPrice || minPrice)) {
                let fallback = supabase_1.default
                    .from('products')
                    .select('id, name, price, images, category, tags, stock')
                    .eq('is_active', true)
                    .gt('stock', 0)
                    .order('created_at', { ascending: false })
                    .limit(6);
                if (maxPrice)
                    fallback = fallback.lte('price', maxPrice);
                if (minPrice)
                    fallback = fallback.gte('price', minPrice);
                const { data: fallbackData } = await fallback;
                products = (fallbackData ?? []);
            }
        }
        catch {
            // Mock fallback for database query
            products = MOCK_PRODUCTS.filter(p => {
                const matchesMaxPrice = maxPrice ? p.price <= maxPrice : true;
                const matchesMinPrice = minPrice ? p.price >= minPrice : true;
                const matchesTags = matchedTags.length > 0
                    ? p.tags?.some(t => matchedTags.includes(t)) ?? false
                    : true;
                return matchesMaxPrice && matchesMinPrice && matchesTags;
            }).slice(0, 6);
        }
        // ── Build reply if rule-based (Gemini already set reply above) ────────
        if (!reply) {
            if (!products || products.length === 0) {
                const priceHint = maxPrice ? ` under ₹${maxPrice.toLocaleString('en-IN')}` : '';
                reply = `I couldn't find gifts${priceHint} matching that. Try browsing our full shop or adjusting your search! 🛍️`;
            }
            else {
                const topTag = matchedTags.length > 0 ? matchedTags[0] : null;
                const priceRange = maxPrice
                    ? ` under ₹${maxPrice.toLocaleString('en-IN')}`
                    : minPrice
                        ? ` above ₹${minPrice.toLocaleString('en-IN')}`
                        : '';
                if (topTag) {
                    reply = `Great choice! 🎁 Here are some **${topTag}** gift ideas${priceRange}:`;
                }
                else if (priceRange) {
                    reply = `Here are our top picks${priceRange}:`;
                }
                else {
                    reply = `Here are some gift ideas you might love:`;
                }
            }
        }
        // Update last_search preference (non-critical)
        if (userId) {
            (0, exports.updatePreferences)(userId, { last_search: message }).catch(() => { });
        }
        return {
            reply,
            products: products,
            quickReplies: products.length === 0
                ? ['Browse all gifts', 'Gift finder', 'Under ₹500']
                : undefined,
        };
    }
    catch (error) {
        return {
            reply: "I'm having a bit of trouble right now. Here are some featured items you might like! 🎁",
            products: MOCK_PRODUCTS.slice(0, 3),
        };
    }
};
exports.chatbotResponse = chatbotResponse;
// ─── Gift Finder ──────────────────────────────────────────────────────────────
/**
 * Persona → tag affinity map.
 */
const PERSONA_TAG_MAP = {
    Partner: ['romantic', 'love', 'luxury', 'premium', 'personalized', 'anniversary', 'perfume'],
    Colleague: ['corporate', 'hamper', 'premium', 'mug', 'book'],
    Friend: ['birthday', 'celebration', 'mug', 'personalized', 'photo', 'candle'],
    Parent: ['love', 'personalized', 'photo', 'premium', 'candle', 'floral'],
    Client: ['corporate', 'premium', 'luxury', 'hamper'],
};
/**
 * Occasion → tag affinity map.
 */
const OCCASION_TAG_MAP = {
    Birthday: ['birthday', 'celebration', 'surprise', 'personalized'],
    Anniversary: ['anniversary', 'romantic', 'love', 'luxury', 'premium'],
    'Thank You': ['personalized', 'candle', 'floral', 'photo', 'mug'],
    Corporate: ['corporate', 'premium', 'hamper', 'luxury'],
    'Just Because': ['personalized', 'celebration', 'candle', 'photo', 'mug'],
};
/**
 * Persona × occasion → category affinity map (fallback layer).
 */
const PERSONA_CATEGORY_MAP = {
    Partner: ['Decor', 'Luxury', 'Bedroom'],
    Colleague: ['Living Room', 'Decor'],
    Friend: ['Decor', 'Lighting', 'Living Room'],
    Parent: ['Living Room', 'Decor', 'Bedroom'],
    Client: ['Living Room', 'Decor'],
};
/**
 * Score a product based on how many of its tags overlap with the desired tags.
 */
function calculateMatchScore(product, targetTags) {
    if (!product.tags || product.tags.length === 0 || targetTags.length === 0) {
        return 50;
    }
    const productTagSet = new Set(product.tags.map((t) => t.toLowerCase()));
    const targetTagSet = new Set(targetTags.map((t) => t.toLowerCase()));
    let overlapCount = 0;
    for (const tag of targetTagSet) {
        if (productTagSet.has(tag))
            overlapCount++;
    }
    const ratio = overlapCount / targetTagSet.size;
    return Math.round(60 + ratio * 39);
}
/**
 * Generate a human-readable reason
 */
function generateReason(product, persona, occasion, budget) {
    const budgetFormatted = budget.toLocaleString('en-IN');
    const priceFormatted = product.price.toLocaleString('en-IN');
    const personaLower = persona.toLowerCase();
    const occasionLower = occasion.toLowerCase();
    if (product.price <= budget * 0.5) {
        return `An excellent value pick for your ${personaLower}'s ${occasionLower} gift at ₹${priceFormatted} — well within your ₹${budgetFormatted} budget.`;
    }
    if (product.price <= budget * 0.8) {
        return `A well-balanced choice for a ${occasionLower} gift for your ${personaLower}. Great quality at ₹${priceFormatted}.`;
    }
    return `A premium pick perfectly suited for your ${personaLower}'s ${occasionLower}. At ₹${priceFormatted}, it makes the most of your budget.`;
}
/**
 * Gift Finder — rule-based recommendation engine.
 */
const giftFinderRecommendations = async (input) => {
    const { persona, occasion, budget } = input;
    const RESULT_LIMIT = 6;
    const personaTags = PERSONA_TAG_MAP[persona] ?? [];
    const occasionTags = OCCASION_TAG_MAP[occasion] ?? [];
    const targetTags = [...new Set([...personaTags, ...occasionTags])];
    let allProducts = [];
    try {
        // 2. Tag-based query
        if (targetTags.length > 0) {
            const { data, error } = await supabase_1.default
                .from('products')
                .select('*')
                .eq('is_active', true)
                .gt('stock', 0)
                .lte('price', budget)
                .overlaps('tags', targetTags)
                .order('price', { ascending: false })
                .limit(RESULT_LIMIT * 2);
            if (!error)
                allProducts = (data ?? []);
        }
        // 3. Category-based fallback
        if (allProducts.length < RESULT_LIMIT) {
            const existingIds = allProducts.map((p) => p.id);
            const categories = PERSONA_CATEGORY_MAP[persona] ?? [];
            const needed = (RESULT_LIMIT * 2) - allProducts.length;
            if (categories.length > 0) {
                let catQuery = supabase_1.default
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .gt('stock', 0)
                    .lte('price', budget)
                    .in('category', categories)
                    .order('price', { ascending: false })
                    .limit(needed);
                if (existingIds.length > 0)
                    catQuery = catQuery.not('id', 'in', existingIds);
                const { data } = await catQuery;
                allProducts = [...allProducts, ...(data ?? [])];
            }
        }
        // 4. Final fallback
        if (allProducts.length < 3) {
            const existingIds = allProducts.map((p) => p.id);
            const needed = RESULT_LIMIT - allProducts.length;
            let fallbackQuery = supabase_1.default
                .from('products')
                .select('*')
                .eq('is_active', true)
                .gt('stock', 0)
                .lte('price', budget)
                .order('price', { ascending: false })
                .limit(needed);
            if (existingIds.length > 0)
                fallbackQuery = fallbackQuery.not('id', 'in', existingIds);
            const { data } = await fallbackQuery;
            allProducts = [...allProducts, ...(data ?? [])];
        }
    }
    catch {
        console.error('[AI Service] GiftFinder fallback used');
        allProducts = MOCK_PRODUCTS.filter(p => p.price <= budget).slice(0, RESULT_LIMIT);
    }
    // 5. Score, sort, and build response — use Gemini when available
    const scored = [];
    for (const product of allProducts) {
        let matchScore = calculateMatchScore(product, targetTags);
        let reason = generateReason(product, persona, occasion, budget);
        // Try Gemini for smarter personalised reasons (non-blocking)
        try {
            const geminiReason = await (0, geminiService_1.geminiGiftReason)(product.name, product.category ?? 'Gifts', product.tags ?? [], product.price, persona, occasion, budget);
            if (geminiReason) {
                reason = geminiReason.reason;
                matchScore = geminiReason.matchScore;
            }
        }
        catch {
            // Fallback to rule-based — already set above
        }
        scored.push({ ...product, matchScore, reason });
    }
    scored.sort((a, b) => {
        if (b.matchScore !== a.matchScore)
            return b.matchScore - a.matchScore;
        return b.price - a.price;
    });
    const finalProducts = scored.slice(0, RESULT_LIMIT);
    const message = finalProducts.length > 0
        ? `Found ${finalProducts.length} perfect gift${finalProducts.length > 1 ? 's' : ''} for your ${persona.toLowerCase()}'s ${occasion.toLowerCase()}!`
        : `We couldn't find products matching your criteria right now. Try adjusting your budget or browsing our full catalog.`;
    return {
        products: finalProducts,
        message,
    };
};
exports.giftFinderRecommendations = giftFinderRecommendations;
const MOCK_PRODUCTS = [
    {
        id: '1',
        name: "Classic Men's Watch",
        category: "Gifts for Him",
        price: 29900,
        tags: ['luxury', 'premium', 'corporate', 'anniversary'],
        images: ["/gift_watch.png"],
        stock: 10,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: "Designer Perfume",
        category: "Gifts for Her",
        price: 15900,
        tags: ['romantic', 'love', 'luxury', 'perfume'],
        images: ["/gift_perfume.png"],
        stock: 10,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        name: "Artisan Chocolates",
        category: "Gifts",
        price: 5900,
        tags: ['birthday', 'thank you', 'celebration'],
        images: ["/gift_chocolates.png"],
        stock: 10,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '4',
        name: "Elegant Floral Bouquet",
        category: "Gifts",
        price: 8900,
        tags: ['floral', 'love', 'romantic'],
        images: ["/gift_bouquet.png"],
        stock: 10,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
//# sourceMappingURL=aiService.js.map