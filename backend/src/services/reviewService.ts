import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';
import type { Review, ReviewCreateInput } from '../types';

/**
 * Get all reviews for a product, including the average rating.
 */
export const getProductReviews = async (
  productId: string,
  { page = 1, limit = 20 }: { page?: number; limit?: number }
): Promise<{
  reviews: Review[];
  total: number;
  avgRating: number;
  ratingCount: number;
  page: number;
  totalPages: number;
}> => {
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const reviews = (error ? [] : data ?? []) as Review[];

  // Compute average rating across ALL reviews for this product (not just current page)
  const { data: ratingData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  const ratings = ((ratingData ?? []) as { rating: number }[]).map((r) => r.rating);
  const avgRating =
    ratings.length > 0
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

/**
 * Submit a review.
 * One review per user per product is enforced at the DB level (unique constraint).
 */
export const createReview = async (
  userId: string,
  { product_id, rating, comment }: ReviewCreateInput
): Promise<Review> => {
  // Check if the user has already reviewed this product
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', product_id)
    .single();

  if (existing) {
    throw new AppError('You have already reviewed this product', 400);
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ user_id: userId, product_id, rating, comment }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data as Review;
};

/**
 * Delete a review.
 * Users may only delete their own reviews.
 */
export const deleteReview = async (
  userId: string,
  reviewId: string
): Promise<{ message: string }> => {
  const { data: review } = await supabase
    .from('reviews')
    .select('id')
    .eq('id', reviewId)
    .eq('user_id', userId)
    .single();

  if (!review) throw new AppError('Review not found or not authorized', 404);

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw new AppError(error.message, 500);

  return { message: 'Review deleted successfully' };
};
