"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ShoppingBag, Star, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Box, X, Gift, CheckCircle2 } from "lucide-react"
import { productsApi, reviewsApi, aiApi, arApi, type Product, type Review, type ARPreviewData } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { ProductGrid } from "@/components/product-grid"
import { ARPreview } from "@/components/ARPreview"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

function MagneticButton({ children, className, onClick, disabled }: { children: React.ReactNode; className?: string; onClick?: () => void; disabled?: boolean }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${(interactive ? hover || rating : rating) >= star ? "fill-amber-400 text-amber-400" : "text-neutral-200"} ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
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
  const [showARPreview, setShowARPreview] = useState(false)
  const [arData, setArData] = useState<ARPreviewData | null>(null)
  const [arLoading, setArLoading] = useState(false)

  // Review form
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  // Premium Features States
  const [isGiftWrap, setIsGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past the main buy section
      if (window.scrollY > 800) {
        setShowSticky(true)
      } else {
        setShowSticky(false)
      }
    }
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
          // Update AI preferences
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
        if (similarData.status === "fulfilled") {
          setSimilar(similarData.value)
        }
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
    if (!token) {
      toast.error("Please sign in to leave a review")
      return
    }
    if (reviewRating === 0) {
      toast.error("Please select a rating")
      return
    }
    try {
      setSubmittingReview(true)
      const review = await reviewsApi.create(
        { product_id: id, rating: reviewRating, comment: reviewComment },
        token
      )
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-neutral-100 h-[500px]" />
          <div className="space-y-4">
            <div className="h-8 bg-neutral-100 w-3/4" />
            <div className="h-6 bg-neutral-100 w-1/3" />
            <div className="h-20 bg-neutral-100" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/shop" className="text-foreground underline font-semibold">
          Back to Shop
        </Link>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"]

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 uppercase tracking-widest">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors">{product.category}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-16">
        {/* Images */}
        <div>
          <div className="relative bg-neutral-100 mb-4 h-[350px] md:h-[500px] lg:h-[600px] flex items-center justify-center p-6 md:p-8 overflow-hidden group">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 bg-neutral-100 p-1 border-2 transition-colors ${selectedImage === idx ? "border-foreground" : "border-transparent hover:border-neutral-300"}`}
                >
                  <Image src={img} alt="" width={60} height={60} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">{product.category}</div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">{product.name}</h1>

          {/* Rating */}
          {ratingCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-neutral-500">{avgRating} ({ratingCount} reviews)</span>
            </div>
          )}

          <div className="text-2xl md:text-3xl font-extrabold mb-5">
            ₹{product.price.toLocaleString("en-IN")}
          </div>

          {product.description && (
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/shop?tag=${tag}`}
                  className="text-xs uppercase tracking-widest border border-neutral-200 px-3 py-1.5 text-neutral-500 hover:border-foreground hover:text-foreground transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Stock status */}
          <div className="mb-6">
            {product.stock === 0 ? (
              <span className="text-sm text-red-500 font-medium">Out of Stock</span>
            ) : product.stock < 10 ? (
              <span className="text-sm text-amber-600 font-medium">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex gap-3 mb-8">
              <div className="flex border border-neutral-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-12 flex items-center justify-center hover:bg-neutral-50 transition-colors font-medium text-lg"
                >
                  −
                </button>
                <div className="w-12 h-12 flex items-center justify-center text-sm font-semibold border-x border-neutral-200">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-12 flex items-center justify-center hover:bg-neutral-50 transition-colors font-medium text-lg"
                >
                  +
                </button>
              </div>
              <MagneticButton
                onClick={handleAddToCart}
                disabled={adding || isSuccess}
                className={`flex-1 ${isSuccess ? 'bg-green-600' : 'bg-foreground'} text-background py-3 font-semibold text-sm uppercase tracking-widest hover:bg-neutral-700 transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative`}
              >
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Success!
                    </motion.div>
                  ) : (
                    <motion.div
                      key="normal"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {adding ? "Adding..." : "Add to Cart"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </MagneticButton>
            </div>
          )}

          {/* Gift Wrap Section */}
          <div className="mb-8 border border-blue-100 bg-blue-50/30 p-4 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isGiftWrap}
                onChange={(e) => setIsGiftWrap(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-neutral-800">Make it a Gift (+₹150)</span>
              </div>
            </label>
            <AnimatePresence>
              {isGiftWrap && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4">
                    <textarea
                      placeholder="Write a personalized gift message..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-blue-100 p-3 text-sm rounded outline-none focus:border-blue-400 transition-colors resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AR Preview Button */}
          <MagneticButton
            onClick={async () => {
              if (arData) {
                setShowARPreview(true)
                return
              }
              setArLoading(true)
              try {
                const data = await arApi.preview(id)
                setArData(data)
                setShowARPreview(true)
              } catch {
                // Fallback: show with product data
                if (product) {
                  setArData({
                    product_id: product.id,
                    name: product.name,
                    category: product.category ?? "",
                    images: product.images ?? [],
                    arSupported: false,
                    modelUrl: null,
                    instructions: ["Browse product images below to get a detailed view."],
                    previewMessage: `Explore "${product.name}" with our HD image gallery.`,
                  })
                  setShowARPreview(true)
                }
              } finally {
                setArLoading(false)
              }
            }}
            disabled={arLoading}
            className="w-full mb-8 bg-neutral-100 text-foreground py-3 font-semibold text-sm uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 border border-neutral-300 disabled:opacity-60"
          >
            <Box className={`w-4 h-4 ${arLoading ? "animate-spin" : ""}`} />
            {arLoading ? "Loading Preview..." : "View in AR / 360°"}
          </MagneticButton>

          {/* Shipping info */}
          <div className="border-t border-neutral-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <Truck className="w-4 h-4 shrink-0" />
              <span>Free shipping on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <Shield className="w-4 h-4 shrink-0" />
              <span>100% authentic products</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>Easy 7-day returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-neutral-100 pt-12 mb-16">
        <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight mb-8">
          Reviews {ratingCount > 0 && `(${ratingCount})`}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Write review form */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4">Write a Review</h3>
            {!user ? (
              <p className="text-sm text-neutral-500">
                <Link href="/auth/login" className="text-foreground underline font-semibold">Sign in</Link> to leave a review.
              </p>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <div className="text-xs text-neutral-500 mb-2">Your rating</div>
                  <StarRating rating={reviewRating} onRate={setReviewRating} interactive />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-foreground text-background px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-700 transition-colors disabled:bg-neutral-400"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>

          {/* Reviews list */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-sm text-neutral-500">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-neutral-100 pb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-neutral-400">
                      {new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {review.comment && <p className="text-sm text-neutral-600">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <ProductGrid
          title="You May Also Like"
          products={similar}
          loading={false}
          showViewAll={false}
        />
      )}

      {/* AR Preview */}
      {showARPreview && arData && (
        <ARPreview data={arData} onClose={() => setShowARPreview(false)} />
      )}

      {/* Sticky CTA Bar */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-neutral-200 px-6 py-4 md:px-12 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 bg-neutral-100 rounded overflow-hidden hidden sm:block">
                <Image src={product?.images?.[0] || "/placeholder.svg"} alt="" fill className="object-contain p-1" />
              </div>
              <div className="hidden min-[400px]:block">
                <div className="text-sm font-bold truncate max-w-[150px] md:max-w-[300px]">{product?.name}</div>
                <div className="text-sm font-medium">₹{product?.price?.toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex border border-neutral-200 h-10">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="px-3 hover:bg-neutral-50">−</button>
                <div className="px-3 flex items-center text-xs font-bold border-x border-neutral-200">{quantity}</div>
                <button onClick={() => setQuantity(q => Math.min(product?.stock || 1, q+1))} className="px-3 hover:bg-neutral-50">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding || isSuccess}
                className={`px-8 h-10 ${isSuccess ? 'bg-green-600' : 'bg-foreground'} text-background text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-2`}
              >
                {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                {isSuccess ? "Added" : "Add to Cart"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
