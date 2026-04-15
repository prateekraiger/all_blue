const supabase = require('../config/supabase');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Get reviews for a product with average rating.
 */
const getProductReviews = async (productId, { page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('reviews')
    .select('*, user:auth.users(id, email, user_metadata)', { count: 'exact' })
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Fallback if join on auth.users doesn't work (RLS may block)
  let reviews = data || [];
  if (error) {
    const { data: basicData, count: basicCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    reviews = basicData || [];
  }

  // Calculate average rating
  const { data: ratingData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  const ratings = (ratingData || []).map((r) => r.rating);
  const avgRating =
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return {
    reviews,
    total: count || reviews.length,
    avgRating: parseFloat(avgRating.toFixed(1)),
    ratingCount: ratings.length,
    page: Number(page),
    totalPages: Math.ceil((count || reviews.length) / limit),
  };
};

/**
 * Submit a review. One review per user per product.
 */
const createReview = async (userId, { product_id, rating, comment }) => {
  // Check if user has already reviewed this product
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', product_id)
    .single();

  if (existing) {
    throw new AppError('You have already reviewed this product', 400);
  }

  // Check if user has purchased this product (optional but recommended)
  const { data: orders } = await supabase
    .from('orders')
    .select('items')
    .eq('user_id', userId)
    .eq('status', 'delivered');

  const hasPurchased =
    !orders ||
    orders.length === 0 ||
    orders.some((o) =>
      (Array.isArray(o.items) ? o.items : []).some((i) => i.product_id === product_id)
    );

  // We allow review without purchase for now (remove above check if strict)

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ user_id: userId, product_id, rating, comment }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
};

/**
 * Delete a review (user can only delete their own).
 */
const deleteReview = async (userId, reviewId) => {
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

module.exports = { getProductReviews, createReview, deleteReview };
