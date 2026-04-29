"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.createReview = exports.getProductReviews = void 0;
const supabase_1 = __importDefault(require("../config/supabase"));
const errorHandler_1 = require("../middlewares/errorHandler");
/**
 * Get all reviews for a product, including the average rating.
 */
const getProductReviews = async (productId, { page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    const { data, count, error } = await supabase_1.default
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    const reviews = (error ? [] : data ?? []);
    // Compute average rating across ALL reviews for this product (not just current page)
    const { data: ratingData } = await supabase_1.default
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);
    const ratings = (ratingData ?? []).map((r) => r.rating);
    const avgRating = ratings.length > 0
        ? ratings.reduce((acc, val) => acc + val, 0) / ratings.length
        : 0;
    return {
        reviews,
        total: count ?? reviews.length,
        avgRating: parseFloat(avgRating.toFixed(1)),
        ratingCount: ratings.length,
        page: Number(page),
        totalPages: Math.ceil((count ?? reviews.length) / limit),
    };
};
exports.getProductReviews = getProductReviews;
/**
 * Submit a review.
 * One review per user per product is enforced at the DB level (unique constraint).
 */
const createReview = async (userId, { product_id, rating, comment }) => {
    // Check if the user has already reviewed this product
    const { data: existing } = await supabase_1.default
        .from('reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();
    if (existing) {
        throw new errorHandler_1.AppError('You have already reviewed this product', 400);
    }
    const { data, error } = await supabase_1.default
        .from('reviews')
        .insert([{ user_id: userId, product_id, rating, comment }])
        .select()
        .single();
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return data;
};
exports.createReview = createReview;
/**
 * Delete a review.
 * Users may only delete their own reviews.
 */
const deleteReview = async (userId, reviewId) => {
    const { data: review } = await supabase_1.default
        .from('reviews')
        .select('id')
        .eq('id', reviewId)
        .eq('user_id', userId)
        .single();
    if (!review)
        throw new errorHandler_1.AppError('Review not found or not authorized', 404);
    const { error } = await supabase_1.default.from('reviews').delete().eq('id', reviewId);
    if (error)
        throw new errorHandler_1.AppError(error.message, 500);
    return { message: 'Review deleted successfully' };
};
exports.deleteReview = deleteReview;
//# sourceMappingURL=reviewService.js.map