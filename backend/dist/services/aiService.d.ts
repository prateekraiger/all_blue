import type { Product, UserPreferences, ChatbotResponse, GiftFinderInput, GiftFinderResult } from '../types';
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
 * Enhanced chatbot with Gemini 1.5 Flash AI + rule-based fallback.
 */
export declare const chatbotResponse: (message: string, userId: string | null) => Promise<ChatbotResponse>;
/**
 * Gift Finder — rule-based recommendation engine.
 */
export declare const giftFinderRecommendations: (input: GiftFinderInput) => Promise<GiftFinderResult>;
//# sourceMappingURL=aiService.d.ts.map