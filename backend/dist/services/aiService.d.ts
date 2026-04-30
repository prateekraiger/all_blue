import type { Product, UserPreferences, ChatbotResponse, ChatHistoryItem, GiftFinderInput, GiftFinderResult } from "../types";
/**
 * Return personalised product recommendations for a user.
 */
export declare const getRecommendations: (userId: string, limit?: number) => Promise<Product[]>;
/**
 * Return products similar to the given product.
 */
export declare const getSimilarProducts: (productId: string, limit?: number) => Promise<Product[]>;
/**
 * Upsert user preference signals (viewed category, tags, last search).
 */
export declare const updatePreferences: (userId: string, { viewed_category, viewed_tags, last_search, }: {
    viewed_category?: string;
    viewed_tags?: string[];
    last_search?: string;
}) => Promise<UserPreferences>;
/**
 * Get a summarized product catalog for AI context.
 */
export declare const getProductCatalogContext: () => Promise<string>;
/**
 * Enhanced chatbot with Gemini 2.5 Flash AI + rule-based fallback.
 */
export declare const chatbotResponse: (message: string, userId: string | null, history?: ChatHistoryItem[], userName?: string) => Promise<ChatbotResponse>;
/**
 * Get dynamic personas and occasions from current product tags/categories.
 */
export declare const getGiftFinderMetadata: () => Promise<{
    personas: {
        name: string;
        description: string;
        icon: string;
    }[];
    occasions: {
        name: string;
        emoji: string;
    }[];
    budgetRange: {
        min: number;
        max: number;
    };
}>;
/**
 * Gift Finder — Intelligent AI recommendation engine.
 */
export declare const giftFinderRecommendations: (input: GiftFinderInput) => Promise<GiftFinderResult>;
//# sourceMappingURL=aiService.d.ts.map