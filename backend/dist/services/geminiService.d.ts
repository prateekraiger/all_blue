export declare const isGeminiAvailable: () => boolean;
interface GeminiChatResult {
    reply: string;
    suggestedTags: string[];
    maxPrice: number | null;
    minPrice: number | null;
    intent: string;
}
/**
 * Intelligent chat parsing using Gemini AI.
 */
export declare const geminiChatResponse: (message: string) => Promise<GeminiChatResult | null>;
interface GeminiReasonResult {
    reason: string;
    matchScore: number;
}
/**
 * Generate a personalized gift reason using Gemini AI.
 */
export declare const geminiGiftReason: (productName: string, category: string, tags: string[], price: number, persona: string, occasion: string, budget: number) => Promise<GeminiReasonResult | null>;
export {};
//# sourceMappingURL=geminiService.d.ts.map