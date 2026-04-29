import type { Review, ReviewCreateInput } from '../types';
/**
 * Get all reviews for a product, including the average rating.
 */
export declare const getProductReviews: (productId: string, { page, limit }: {
    page?: number;
    limit?: number;
}) => Promise<{
    reviews: Review[];
    total: number;
    avgRating: number;
    ratingCount: number;
    page: number;
    totalPages: number;
}>;
/**
 * Submit a review.
 * One review per user per product is enforced at the DB level (unique constraint).
 */
export declare const createReview: (userId: string, { product_id, rating, comment }: ReviewCreateInput) => Promise<Review>;
/**
 * Delete a review.
 * Users may only delete their own reviews.
 */
export declare const deleteReview: (userId: string, reviewId: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=reviewService.d.ts.map