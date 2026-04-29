"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiGiftReason = exports.geminiChatResponse = exports.isGeminiAvailable = void 0;
const generative_ai_1 = require("@google/generative-ai");
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new generative_ai_1.GoogleGenerativeAI(API_KEY) : null;
// Use gemini-1.5-flash for state-of-the-art fast responses
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;
const isGeminiAvailable = () => {
    return !!genAI && !!model;
};
exports.isGeminiAvailable = isGeminiAvailable;
/**
 * Intelligent chat parsing using Gemini AI.
 */
const geminiChatResponse = async (message) => {
    if (!(0, exports.isGeminiAvailable)())
        return null;
    try {
        const prompt = `
      You are an AI Shopping Assistant for "ALL BLUE", a premium gift shop.
      Analyze the user's message and respond in JSON format.
      
      User message: "${message}"
      
      JSON schema:
      {
        "reply": "A friendly, helpful conversational reply",
        "suggestedTags": ["list", "of", "relevant", "gift", "tags", "like", "birthday", "luxury", "romantic"],
        "maxPrice": number or null,
        "minPrice": number or null,
        "intent": "greeting" | "farewell" | "help" | "product_search" | "price_query" | "order_help" | "unknown"
      }
      
      Constraints:
      - If searching for gifts, keep suggestedTags specific.
      - Extract price only if mentioned (e.g., "under 500" -> maxPrice: 500).
      - Keep the reply concise and professional.
    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Extract JSON from potential markdown blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error('[Gemini Service] Chat parsing failed:', error);
        return null;
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
      Tags: ${tags.join(', ')}
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error('[Gemini Service] Reason generation failed:', error);
        return null;
    }
};
exports.geminiGiftReason = geminiGiftReason;
//# sourceMappingURL=geminiService.js.map