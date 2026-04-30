import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Use gemini-2.5-flash as requested by user
const model = genAI
  ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  : null;

export const isGeminiAvailable = (): boolean => {
  return !!genAI && !!model;
};

interface GeminiChatResult {
  reply: string;
  suggestedTags: string[];
  searchQuery: string | null;
  maxPrice: number | null;
  minPrice: number | null;
  intent: string;
}

/**
 * Intelligent chat parsing using Gemini AI.
 */
export const geminiChatResponse = async (
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  userName: string | null = null,
): Promise<GeminiChatResult | null> => {
  if (!isGeminiAvailable()) return null;

  try {
    const historyText = history
      .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
      .join("\n");

    const prompt = `
      You are "ALL BLUE", an elite AI Shopping Concierge for an ultra-premium gift shop.
      Your goal is to help users find the perfect gift from our catalog.

      ${userName ? `The user's name is ${userName}. Greet them personally if appropriate.` : ""}

      Conversation History:
      ${historyText}

      Current User message: "${message}"

      JSON schema:
      {
        "reply": "A helpful, conversational, and premium-feeling response.",
        "suggestedTags": ["list", "of", "relevant", "gift", "tags"],
        "searchQuery": "A single specific noun representing the product (e.g., 'perfume', 'wallet', 'hamper', 'watch'). NEVER use multiple words like 'perfume set' or 'chocolate box', just 'perfume' or 'chocolate'. Return null if no specific product is mentioned.",
        "maxPrice": number or null,
        "minPrice": number or null,
        "intent": "greeting" | "farewell" | "help" | "product_search" | "price_query" | "order_help" | "garbage" | "unknown"
      }

      Guidelines:
      - If the message is a greeting, be welcoming and mention what we sell (gifts, hampers, luxury items).
      - If the user's name is known, use it in greetings or personal moments.
      - If the message is about searching for gifts, extract specific tags AND a searchQuery for the main item.
      - Even if you are asking a clarifying question, try to set a searchQuery if the user mentioned a specific item.
      - Extract price only if mentioned (e.g., "within 1000" -> maxPrice: 1000).
      - If the message is "garbage" (nonsense, random letters, offensive, completely irrelevant to shopping/gifting, e.g. "ajskhfasdf" or "write me a poem"), set intent to "garbage" and provide a polite reply redirecting to shopping.
      - ALWAYS respond with ONLY the valid JSON object.
    `;

    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from potential markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as GeminiChatResult;
  } catch (error) {
    console.error("[Gemini Service] Chat parsing failed:", error);
    return null;
  }
};

interface GeminiReasonResult {
  reason: string;
  matchScore: number;
}

/**
 * Generate a personalized gift reason using Gemini AI.
 */
export const geminiGiftReason = async (
  productName: string,
  category: string,
  tags: string[],
  price: number,
  persona: string,
  occasion: string,
  budget: number,
): Promise<GeminiReasonResult | null> => {
  if (!isGeminiAvailable()) return null;

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

    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as GeminiReasonResult;
  } catch (error) {
    console.error("[Gemini Service] Reason generation failed:", error);
    return null;
  }
};

/**
 * Generate a personalized intro message for Gift Finder results.
 */
export const geminiGiftFinderIntro = async (
  persona: string,
  occasion: string,
  budget: number,
  productCount: number,
): Promise<string | null> => {
  if (!isGeminiAvailable()) return null;

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

    const result = await model!.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("[Gemini Service] GiftFinder intro generation failed:", error);
    return null;
  }
};
