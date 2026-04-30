"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ShoppingBag, Star, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Gift, CheckCircle2, Home } from "lucide-react"
import { productsApi, reviewsApi, aiApi, type Product, type Review } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { ProductGrid } from "@/components/product-grid"
import { ARViewerButton } from "@/components/ARViewerButton"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${(interactive ? hover || rating : rating) >= star ? "fill-[#111111] text-[#111111]" : "text-[#CACACB]"} ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()
  const { user, token } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [similar, setSimilar] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  const [isGiftWrap, setIsGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 800)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [productData, reviewData, similarData] = await Promise.allSettled([
          productsApi.get(id),
          reviewsApi.get(id),
          aiApi.similar(id, 4),
        ])
        if (productData.status === "fulfilled") {
          setProduct(productData.value)
          if (token && productData.value.category) {
            aiApi.updatePreferences(
              { viewed_category: productData.value.category, viewed_tags: productData.value.tags },
              token
            ).catch(() => {})
          }
        }
        if (reviewData.status === "fulfilled") {
          setReviews(reviewData.value.reviews)
          setAvgRating(reviewData.value.avgRating)
          setRatingCount(reviewData.value.ratingCount)
        }
        if (similarData.status === "fulfilled") setSimilar(similarData.value)
      } catch {
        toast.error("Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id, token])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      setAdding(true)
      await addItem(product, quantity, isGiftWrap, giftMessage)
      setIsSuccess(true)
      toast.success(`${product.name} added to cart`)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart")
    } finally {
      setAdding(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) { toast.error("Please sign in to leave a review"); return }
    if (reviewRating === 0) { toast.error("Please select a rating"); return }
    try {
      setSubmittingReview(true)
      const review = await reviewsApi.create({ product_id: id, rating: reviewRating, comment: reviewComment }, token)
      setReviews((prev) => [review, ...prev])
      setReviewRating(0)
      setReviewComment("")
      toast.success("Review submitted!")
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-[#F5F5F5] aspect-square" />
          <div className="space-y-4 py-8">
            <div className="h-8 bg-[#F5F5F5] w-3/4" />
            <div className="h-6 bg-[#F5F5F5] w-1/3" />
            <div className="h-20 bg-[#F5F5F5]" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-24 text-center">
        <h1 className="text-[24px] font-medium mb-4 text-[#111111]">Product not found</h1>
        <Link href="/shop" className="text-[16px] font-medium text-[#111111] underline">Back to Shop</Link>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"]

  return (
    <div className="relative min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#707072] mb-6 md:mb-8" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <Link href="/" className="hover:text-[#111111] transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3 h-3 text-[#CACACB]" />
          <Link href="/shop" className="hover:text-[#111111] transition-colors">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3 text-[#CACACB]" />
              <Link href={`/shop?category=${product.category}`} className="hover:text-[#111111] transition-colors">{product.category}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-[#CACACB]" />
          <span className="text-[#111111] font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 mb-16">
          {/* Images — no border radius, edge-to-edge */}
          <div className="md:sticky md:top-24 self-start">
            <div className="relative bg-[#F5F5F5] aspect-square flex items-center justify-center overflow-hidden group">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                priority
                className="object-contain p-8 md:p-12"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" }}
              />
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-1 mt-1 overflow-x-auto scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 bg-[#F5F5F5] shrink-0 transition-all ${selectedImage === idx ? "ring-2 ring-[#111111]" : "opacity-60 hover:opacity-100"}`}
                  >
                    <Image src={img} alt="" fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col py-2">
            <p className="text-[14px] text-[#707072] font-medium mb-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {product.category}
            </p>

            <h1 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-4">
              {product.name}
            </h1>

            <p className="text-[24px] md:text-[32px] font-medium text-[#111111] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            {product.description && (
              <p className="text-[16px] text-[#707072] leading-relaxed mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <Link key={tag} href={`/shop?tag=${tag}`}
                    className="text-[12px] font-medium border border-[#CACACB] px-3 py-1.5 rounded-full text-[#707072] hover:border-[#111111] hover:text-[#111111] transition-colors"
                    style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Stock status */}
            <div className="mb-6">
              {product.stock === 0 ? (
                <span className="text-[14px] text-[#D30005] font-medium">Out of Stock</span>
              ) : product.stock < 10 ? (
                <span className="text-[14px] text-[#D30005] font-medium">Only {product.stock} left in stock</span>
              ) : (
                <span className="text-[14px] text-[#007D48] font-medium">In Stock</span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="flex gap-3 mb-8">
                <div className="flex border border-[#CACACB] rounded-full overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors text-[18px] font-medium text-[#111111]">−</button>
                  <div className="w-12 h-12 flex items-center justify-center text-[16px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{quantity}</div>
                  <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-12 h-12 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors text-[18px] font-medium text-[#111111]">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding || isSuccess}
                  className={`flex-1 rounded-full py-3.5 font-medium text-[16px] transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSuccess ? 'bg-[#007D48] text-white' : 'bg-[#111111] text-white hover:bg-[#707072]'
                  } disabled:cursor-not-allowed`}
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  {isSuccess ? <><CheckCircle2 className="w-5 h-5" /> Added!</> : <><ShoppingBag className="w-5 h-5" /> {adding ? "Adding..." : "Add to Bag"}</>}
                </button>
              </div>
            )}

            {/* Gift Wrapping */}
            <div className="bg-[#F5F5F5] p-6 mb-6" style={{ borderBottom: '1px solid #E5E5E5' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-[#111111]" />
                  <div>
                    <h3 className="text-[16px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Gift Wrapping</h3>
                    <p className="text-[12px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Available for ₹150</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGiftWrap(!isGiftWrap)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${isGiftWrap ? 'bg-[#111111]' : 'bg-[#CACACB]'}`}
                >
                  <motion.div animate={{ x: isGiftWrap ? 20 : 0 }} className="w-5 h-5 bg-white rounded-full" />
                </button>
              </div>
              <AnimatePresence>
                {isGiftWrap && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <textarea
                      placeholder="Add a personalized message..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="nike-input resize-none h-20 mt-2"
                      style={{ borderRadius: '8px' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AR Preview */}
            <div className="mb-6">
              <ARViewerButton product={product} />
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Truck className="w-5 h-5" />, label: "Free Delivery", sub: "On orders over ₹999" },
                { icon: <Shield className="w-5 h-5" />, label: "Authentic", sub: "100% Certified" },
                { icon: <RefreshCw className="w-5 h-5" />, label: "Returns", sub: "7-day policy" }
              ].map((feature, i) => (
                <div key={i} className="bg-[#F5F5F5] p-4 flex flex-col items-center text-center">
                  <div className="text-[#111111] mb-2">{feature.icon}</div>
                  <span className="text-[12px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{feature.label}</span>
                  <span className="text-[11px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{feature.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description Section */}
        {product.description && (
          <div className="py-16 md:py-20 max-w-3xl mx-auto text-center" style={{ borderTop: '1px solid #E5E5E5' }}>
            <h2 className="nike-display text-[32px] md:text-[48px] text-[#111111] mb-8">THE STORY</h2>
            <p className="text-[18px] md:text-[20px] text-[#707072] leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {product.description}
            </p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="py-16 md:py-20" style={{ borderTop: '1px solid #E5E5E5' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-2">Reviews</h2>
              <div className="flex items-center gap-3">
                <StarRating rating={Math.round(avgRating || 5)} />
                <span className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  {ratingCount || 0} Reviews
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Write review */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 bg-[#F5F5F5] p-6 md:p-8">
                <h3 className="text-[16px] font-medium text-[#111111] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Write a Review</h3>
                {!user ? (
                  <div>
                    <p className="text-[14px] text-[#707072] mb-4" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Sign in to leave a review.</p>
                    <Link href="/sign-in" className="nike-btn-primary w-full text-[14px]">Sign In</Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div>
                      <label className="text-[12px] font-medium text-[#707072] mb-2 block uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Rating</label>
                      <StarRating rating={reviewRating} onRate={setReviewRating} interactive />
                    </div>
                    <div>
                      <label className="text-[12px] font-medium text-[#707072] mb-2 block uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Comment</label>
                      <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience..." rows={4} className="nike-input resize-none" style={{ borderRadius: '8px' }} />
                    </div>
                    <button type="submit" disabled={submittingReview} className="nike-btn-primary w-full text-[14px]">
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Reviews list */}
            <div className="lg:col-span-8 space-y-6">
              {reviews.length === 0 ? (
                <div className="bg-[#F5F5F5] p-12 text-center">
                  <p className="text-[16px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>No reviews yet. Be the first!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="pb-6" style={{ borderBottom: '1px solid #E5E5E5' }}>
                    <div className="flex items-center justify-between mb-3">
                      <StarRating rating={review.rating} />
                      <span className="text-[12px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                        {new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {review.comment && <p className="text-[16px] text-[#111111] leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{review.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <ProductGrid title="You Might Also Like" products={similar} loading={false} showViewAll={false} />
        )}
      </div>

      {/* Sticky CTA Bar */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white px-4 sm:px-6 lg:px-12 py-3"
            style={{ borderTop: '1px solid #E5E5E5' }}
          >
            <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 bg-[#F5F5F5] shrink-0 hidden sm:block">
                  <Image src={product?.images?.[0] || "/placeholder.svg"} alt="" fill className="object-contain p-1" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#111111] truncate" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{product?.name}</div>
                  <div className="text-[14px] font-medium text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>₹{product?.price?.toLocaleString("en-IN")}</div>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding || isSuccess}
                className="nike-btn-primary text-[14px] px-8 py-3 shrink-0"
              >
                {isSuccess ? "Added!" : "Add to Bag"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
