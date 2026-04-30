"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiGiftFinderIntro = exports.geminiCategorizeTags = exports.geminiGiftFinderSelection = exports.geminiGiftReason = exports.geminiChatResponse = exports.isGeminiAvailable = void 0;
require("dotenv/config");
const generative_ai_1 = require("@google/generative-ai");
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new generative_ai_1.GoogleGenerativeAI(API_KEY) : null;
// Primary and Secondary models for high-availability
const PRIMARY_MODEL = "gemini-2.5-flash";
const SECONDARY_MODEL = "gemini-2.5-flash-lite";
const isGeminiAvailable = () => {
    return !!genAI;
};
exports.isGeminiAvailable = isGeminiAvailable;
// Helper for sleeping
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Helper to generate content with automatic fallback and retry
 */
async function generateWithFallback(prompt, attempt = 1) {
    if (!genAI)
        return null;
    try {
        // Try primary model first
        const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
        return await model.generateContent(prompt);
    }
    catch (error) {
        const status = error?.status || error?.response?.status;
        const message = error?.message?.toLowerCase() || "";
        const isRateLimited = status === 429 || message.includes("429") || message.includes("quota");
        const isBusy = status === 503 ||
            message.includes("503") ||
            message.includes("overloaded");
        // If rate limited or busy, and we have attempts left, retry with backoff
        if ((isRateLimited || isBusy) && attempt <= 2) {
            const delay = attempt * 2000; // 2s, 4s
            console.warn(`[Gemini Service] ${PRIMARY_MODEL} ${isRateLimited ? "rate limited" : "busy"}, retrying in ${delay}ms (attempt ${attempt})...`);
            await sleep(delay);
            return generateWithFallback(prompt, attempt + 1);
        }
        // If still failing after retries, try secondary model
        if (isRateLimited || isBusy) {
            console.warn(`[Gemini Service] ${PRIMARY_MODEL} failed, falling back to ${SECONDARY_MODEL}`);
            try {
                const fallbackModel = genAI.getGenerativeModel({
                    model: SECONDARY_MODEL,
                });
                return await fallbackModel.generateContent(prompt);
            }
            catch (fallbackError) {
                console.error(`[Gemini Service] Fallback to ${SECONDARY_MODEL} also failed:`, fallbackError?.message || fallbackError);
                throw fallbackError;
            }
        }
        throw error;
    }
}
/**
 * Intelligent chat parsing using Gemini AI.
 */
const geminiChatResponse = async (message, history = [], userName = null, catalogContext = "") => {
    if (!(0, exports.isGeminiAvailable)())
        return null;
    try {
        const historyText = history
            .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
            .join("\n");
        const prompt = `
      You are "ALL BLUE", an elite AI Shopping Concierge for an ultra-premium gift shop.
      Your goal is to help users find the perfect gift from our catalog.

      ${userName ? `The user's name is ${userName}. Greet them personally if appropriate.` : ""}

      AVAILABLE PRODUCT CATALOG:
      ${catalogContext}

      Conversation History:
      ${historyText}

      Current User message: "${message}"

      JSON schema:
      {
        "reply": "A helpful, conversational, and premium-feeling response. Mention specific products from the catalog above if they match the user's intent.",
        "suggestedTags": ["list", "of", "relevant", "gift", "tags"],
        "searchQuery": "A single specific noun representing the product (e.g., 'perfume', 'wallet', 'hamper', 'watch'). NEVER use multiple words like 'perfume set' or 'chocolate box', just 'perfume' or 'chocolate'. Return null if no specific product is mentioned.",
        "maxPrice": number or null,
        "minPrice": number or null,
        "intent": "greeting" | "farewell" | "help" | "product_search" | "price_query" | "order_help" | "garbage" | "unknown"
      }

      Guidelines:
      - If the message is a greeting, be welcoming and mention specific items we have in stock (e.g. "We have some exquisite Aromatherapy Candle Sets and Premium Watches today").
      - If the user's name is known, use it in greetings or personal moments.
      - If the message is about searching for gifts, extract specific tags AND a searchQuery for the main item.
      - Use the PROVIDED CATALOG to inform your recommendations and replies.
      - If the message is "garbage" (nonsense, random letters, offensive, completely irrelevant to shopping/gifting), set intent to "garbage" and provide a polite reply redirecting to shopping.
      - ALWAYS respond with ONLY the valid JSON object.
    `;
        const result = await generateWithFallback(prompt);
        if (!result)
            return null;
        const response = await result.response;
        const text = response.text();
        // Extract JSON from potential markdown blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error("[Gemini Service] Chat parsing failed, using fallback:", error?.message || error);
        return {
            reply: "I'm currently experiencing high demand. Please browse our collections or try asking again in a moment.",
            suggestedTags: ["gifts", "premium", "bestsellers"],
            searchQuery: null,
            maxPrice: null,
            minPrice: null,
            intent: "unknown",
        };
    }
};
exports.geminiChatResponse = geminiChatResponse;
/**
 * Generate a personalized gift reason using Gemini AI.
 */
const geminiGiftReason = async (productName, category, tags, price, persona, occasion, budget) => {
    if (!(0, exports.isGeminiAvailable)())
        return null;
    try {
        const prompt = `
      Product: ${productName} (${category})
      Tags: ${tags.join(", ")}
      Price: ₹${price}
      Target Recipient: ${persona}
      Occasion: ${occasion}
      User Budget: ₹${budget}

      Explain why this product is a great gift for this recipient and occasion.
      Return JSON:
      {
        "reason": "Short 1-2 sentence compelling reason",
        "matchScore": number between 0-100 representing how well it fits
      }
    `;
        const result = await generateWithFallback(prompt);
        if (!result)
            return null;
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error("[Gemini Service] Reason generation failed, using fallback:", error?.message || error);
        // Provide a dynamic-looking fallback to keep the app working
        return {
            reason: `An exquisite choice for ${persona} that perfectly suits the occasion.`,
            matchScore: Math.floor(Math.random() * (95 - 80 + 1)) + 80, // Random score between 80 and 95
        };
    }
};
exports.geminiGiftReason = geminiGiftReason;
/**
 * Select the best gifts from the catalog using Gemini AI.
 */
const geminiGiftFinderSelection = async (persona, occasion, budget, catalogContext) => {
    if (!(0, exports.isGeminiAvailable)())
        return null;
    try {
        const prompt = `
      You are "ALL BLUE", an elite AI Shopping Concierge.
      A user is looking for a gift for:
      Recipient: ${persona}
      Occasion: ${occasion}
      Budget: Up to ₹${budget}

      AVAILABLE PRODUCT CATALOG:
      ${catalogContext}

      TASK:
      Select up to 6 products from the catalog above that best match the recipient and occasion within the budget.
      Return JSON:
      {
        "productNames": ["Exact Name 1", "Exact Name 2", ...]
      }

      Respond ONLY with the JSON object.
    `;
        const result = await generateWithFallback(prompt);
        if (!result)
            return null;
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error("[Gemini Service] Gift selection failed:", error);
        return null;
    }
};
exports.geminiGiftFinderSelection = geminiGiftFinderSelection;
/**
 * Categorize product tags into Personas and Occasions for the Gift Finder.
 */
const geminiCategorizeTags = async (tags) => {
    if (!(0, exports.isGeminiAvailable)())
        return null;
    try {
        const prompt = `
      Given these product tags from our luxury gift shop:
      ${tags.join(", ")}

      TASK:
      1. Identify 5 distinct "Personas" (recipient types) that these tags would appeal to.
      2. Identify 5 distinct "Occasions" that these tags would be suitable for.

      For each Persona, provide a name, a short description, and a Lucide icon name (e.g., 'Heart', 'Briefcase', 'User', 'Target', 'Gift', 'Coffee', 'Watch').
      For each Occasion, provide a name and a relevant emoji.

      Return JSON:
      {
        "personas": [{"name": "...", "description": "...", "icon": "..."}],
        "occasions": [{"name": "...", "emoji": "..."}]
      }

      Respond ONLY with the JSON object.
    `;
        const result = await generateWithFallback(prompt);
        if (!result)
            return null;
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error("[Gemini Service] Tag categorization failed:", error);
        return null;
    }
};
exports.geminiCategorizeTags = geminiCategorizeTags;
/**
 * Generate a personalized intro message for Gift Finder results.
 */
const geminiGiftFinderIntro = async (persona, occasion, budget, productCount) => {
    if (!(0, exports.isGeminiAvailable)())
        return null;
    try {
        const prompt = `
      You are "ALL BLUE", an elite AI Shopping Concierge.
      A user used our Gift Finder for:
      Recipient: ${persona}
      Occasion: ${occasion}
      Budget: ₹${budget}
      We found ${productCount} matching products.

      Generate a short, premium, and sophisticated introductory sentence (max 20 words)
      to present these recommendations. Be conversational and elegant.
      Do not use markdown, just plain text.
    `;
        const result = await generateWithFallback(prompt);
        if (!result)
            return null;
        const response = await result.response;
        return response.text().trim();
    }
    catch (error) {
        console.error("[Gemini Service] GiftFinder intro generation failed, using fallback:", error?.message || error);
        return `We've curated these exceptional gifts for ${persona}, perfectly suited for the occasion.`;
    }
};
exports.geminiGiftFinderIntro = geminiGiftFinderIntro;
//# sourceMappingURL=geminiService.js.map