import "dotenv/config";
export declare const isGeminiAvailable: () => boolean;
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
export declare const geminiChatResponse: (message: string, history?: Array<{
    role: "user" | "assistant";
    content: string;
}>, userName?: string | null, catalogContext?: string) => Promise<GeminiChatResult | null>;
interface GeminiReasonResult {
    reason: string;
    matchScore: number;
}
/**
 * Generate a personalized gift reason using Gemini AI.
 */
export declare const geminiGiftReason: (productName: string, category: string, tags: string[], price: number, persona: string, occasion: string, budget: number) => Promise<GeminiReasonResult | null>;
/**
 * Select the best gifts from the catalog using Gemini AI.
 */
export declare const geminiGiftFinderSelection: (persona: string, occasion: string, budget: number, catalogContext: string) => Promise<{
    productNames: string[];
} | null>;
/**
 * Categorize product tags into Personas and Occasions for the Gift Finder.
 */
export declare const geminiCategorizeTags: (tags: string[]) => Promise<{
    personas: Array<{
        name: string;
        description: string;
        icon: string;
    }>;
    occasions: Array<{
        name: string;
        emoji: string;
    }>;
} | null>;
/**
 * Generate a personalized intro message for Gift Finder results.
 */
export declare const geminiGiftFinderIntro: (persona: string, occasion: string, budget: number, productCount: number) => Promise<string | null>;
export {};
//# sourceMappingURL=geminiService.d.ts.map