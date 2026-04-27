"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ShoppingBag, Star, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Box, X, Gift, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Home } from "lucide-react"
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

  // Gifting & Personalization States
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
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12">
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
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/shop" className="text-foreground underline font-semibold">
          Back to Shop
        </Link>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            rotate: [0, 45, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 120, 0],
            rotate: [0, -30, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-primary/3 rounded-full blur-[150px]"
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-16">
      {/* Breadcrumb */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 text-xs md:text-[13px] text-neutral-400 mb-12 md:mb-16 uppercase tracking-[0.2em] font-black"
      >
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 -mt-0.5" />
          Home
        </Link>
        <ChevronRight className="w-3 h-3 opacity-20" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3 opacity-20" />
            <Link href={`/shop?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 opacity-20" />
        <span className="text-neutral-900 font-bold truncate max-w-[150px] md:max-w-none">{product.name}</span>
      </motion.nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-16">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative bg-white shadow-2xl rounded-3xl mb-6 h-[400px] md:h-[550px] lg:h-[700px] flex items-center justify-center p-8 md:p-12 overflow-hidden group border border-neutral-100">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full relative"
            >
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                priority
                className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" }}
              />
            </motion.div>
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="bg-white/90 p-3 rounded-full shadow-lg pointer-events-auto backdrop-blur-md border border-neutral-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="bg-white/90 p-3 rounded-full shadow-lg pointer-events-auto backdrop-blur-md border border-neutral-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl bg-white p-2 border-2 transition-all flex-shrink-0 ${selectedImage === idx ? "border-primary shadow-lg" : "border-neutral-100 hover:border-neutral-300"}`}
                >
                  <Image src={img} alt="" fill className="object-contain p-2" />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xs md:text-sm uppercase font-black tracking-[0.4em] text-primary mb-6 block"
          >
            {product.category}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter mb-8 leading-[0.9] text-neutral-900 break-words"
          >
            {product.name}
          </motion.h1>

          {/* Rating */}
          {ratingCount > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 mb-10 bg-neutral-50 self-start px-6 py-3 rounded-full border border-neutral-100"
            >
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-xs md:text-sm font-black uppercase tracking-widest text-neutral-500">
                {avgRating} <span className="opacity-30 mx-2">|</span> {ratingCount} verified reviews
              </span>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="text-5xl lg:text-6xl font-black mb-12 flex items-baseline gap-3 text-neutral-900"
          >
            <span className="text-2xl lg:text-3xl opacity-30 font-medium tracking-normal">₹</span>
            {product.price.toLocaleString("en-IN")}
          </motion.div>

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
            <div className="flex gap-4 mb-10">
              <div className="flex border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-14 flex items-center justify-center hover:bg-neutral-50 transition-colors font-bold text-xl"
                >
                  −
                </button>
                <div className="w-14 h-14 flex items-center justify-center text-base font-black border-x border-neutral-100">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-12 h-14 flex items-center justify-center hover:bg-neutral-50 transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>
              <MagneticButton
                onClick={handleAddToCart}
                disabled={adding || isSuccess}
                className={`flex-1 ${isSuccess ? 'bg-green-600' : 'bg-neutral-900'} text-white py-4 rounded-xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-black transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98]`}
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

          {/* Gift Wrapping */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-base text-neutral-900">Luxury Gifting</h3>
                  <p className="text-neutral-400 text-xs uppercase font-bold tracking-widest mt-1">Available for all items</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-primary">₹150</span>
                <button
                  onClick={() => setIsGiftWrap(!isGiftWrap)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isGiftWrap ? 'bg-primary' : 'bg-neutral-200'}`}
                >
                  <motion.div
                    animate={{ x: isGiftWrap ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {isGiftWrap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    placeholder="Add a personalized message..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full p-4 rounded-2xl border-neutral-100 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm resize-none h-24 mb-2"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* AR Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-3xl bg-neutral-900 p-8 flex items-center justify-between shadow-2xl mb-8"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2">Visualise in AR</h3>
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">See it in your space before you buy</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
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
              className="relative z-10 bg-white text-black p-4 rounded-2xl shadow-xl font-black flex items-center gap-2 group/btn disabled:opacity-50"
            >
              <Box className={`w-5 h-5 ${arLoading ? "animate-spin text-primary" : ""}`} />
              <span className="text-xs uppercase tracking-widest">{arLoading ? "..." : "Launch AR"}</span>
            </motion.button>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Truck className="w-5 h-5" />, label: "Express", sub: "2-4 Days" },
              { icon: <ShieldCheck className="w-5 h-5" />, label: "Authentic", sub: "Certified" },
              { icon: <RefreshCw className="w-5 h-5" />, label: "Returns", sub: "7 Days" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                viewport={{ once: true }}
                className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-lg transition-all duration-500"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  {feature.icon}
                </div>
                <span className="text-xs uppercase font-black tracking-widest text-neutral-900 mb-1">{feature.label}</span>
                <span className="text-[10px] uppercase font-bold tracking-tighter text-neutral-400">{feature.sub}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Narrative Section */}
      <div className="mt-32 mb-32">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-4xl font-black tracking-tighter mb-10 uppercase text-neutral-900">The Narrative</h2>
            <div className="prose prose-neutral max-w-none">
              <p className="text-xl text-neutral-500 leading-relaxed italic border-l-4 border-primary/20 pl-8 py-4 mb-10">
                "Every All Blue piece is curated with the intention of creating a legacy. This {product.name} represents our commitment to timeless elegance and unmatched craftsmanship."
              </p>
              <p className="text-neutral-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:w-[400px] bg-neutral-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group self-start"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
              Technical Specs
            </h3>
            <div className="space-y-8">
              {[
                { label: "Material", value: "High Grade" },
                { label: "Category", value: product.category },
                { label: "Origin", value: "Artisan Crafted" },
                { label: "Status", value: "In Stock", color: "text-green-400" }
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/10 pb-6 last:border-0 group/spec">
                  <span className="text-xs uppercase font-bold tracking-[0.2em] text-neutral-500 group-hover/spec:text-neutral-300 transition-colors">{spec.label}</span>
                  <span className={`text-sm font-black uppercase tracking-widest ${spec.color || "text-white"}`}>{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-neutral-100 pt-20 mb-24">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-12 text-neutral-900">
          Client Reviews {ratingCount > 0 && <span className="text-primary ml-2">({ratingCount})</span>}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Write review form */}
          <div>
            <h3 className="text-base font-black uppercase tracking-widest mb-6">Write a Review</h3>
            {!user ? (
              <p className="text-sm md:text-base text-neutral-500 bg-neutral-50 p-6 rounded-2xl border border-dashed border-neutral-200">
                <Link href="/auth/login" className="text-primary underline font-black uppercase tracking-widest text-xs">Sign in</Link> to share your experience with this piece.
              </p>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <div className="text-xs uppercase font-black tracking-widest text-neutral-400 mb-3">Your rating</div>
                  <StarRating rating={reviewRating} onRate={setReviewRating} interactive />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={5}
                  className="w-full border border-neutral-100 bg-neutral-50 rounded-2xl px-6 py-4 text-base outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-neutral-900 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:bg-neutral-200 disabled:text-neutral-400"
                >
                  {submittingReview ? "Publishing..." : "Publish Review"}
                </button>
              </form>
            )}
          </div>

          {/* Reviews list */}
          <div className="space-y-10">
            {reviews.length === 0 ? (
              <p className="text-base text-neutral-400 italic">No reviews yet. Be the first to share your experience!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-neutral-50 pb-8 last:border-0">
                  <div className="flex items-center gap-4 mb-4">
                    <StarRating rating={review.rating} />
                    <span className="text-[10px] uppercase font-black tracking-widest text-neutral-300">
                      {new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {review.comment && <p className="text-base md:text-lg text-neutral-600 leading-relaxed font-medium">{review.comment}</p>}
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
    </div>

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
            <div className="flex items-center gap-4">
              <div className="hidden md:flex border border-neutral-200 rounded-lg overflow-hidden h-11 bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 hover:bg-neutral-50 font-bold text-lg transition-colors">−</button>
                <div className="w-10 flex items-center justify-center text-sm font-black border-x border-neutral-100">{quantity}</div>
                <button onClick={() => setQuantity(q => Math.min(product?.stock || 1, q+1))} className="w-10 hover:bg-neutral-50 font-bold text-lg transition-colors">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding || isSuccess}
                className={`px-10 h-11 rounded-lg ${isSuccess ? 'bg-green-600' : 'bg-neutral-900'} text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg flex items-center gap-3 active:scale-95`}
              >
                {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                {isSuccess ? "Success" : "Add to Cart"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
