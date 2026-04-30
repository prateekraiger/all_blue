"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback, memo } from "react"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { productsApi, type Product } from "@/lib/api"
import { prefetch } from "@/lib/cache"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"

// Fallback static products (shown when API is unavailable)
const FALLBACK_PRODUCTS: Product[] = [
  { id: "1", name: "Classic Men's Watch", category: "Gifts for Him", price: 29900, tags: [], images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "2", name: "Designer Perfume", category: "Gifts for Her", price: 15900, tags: [], images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "3", name: "Artisan Chocolates", category: "Gifts", price: 5900, tags: [], images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80&w=800"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "4", name: "Elegant Floral Bouquet", category: "Gifts", price: 8900, tags: [], images: ["https://images.unsplash.com/photo-1587334274328-64186a80aeee?auto=format&fit=crop&q=80&w=800"], stock: 10, is_active: true, created_at: new Date().toISOString() }
]

interface ProductGridProps {
  title?: string
  products?: Product[]
  loading?: boolean
  category?: string
  limit?: number
  showViewAll?: boolean
}

/** Memoized product card with 3D tilt effect */
const ProductCard = memo(function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  // 3D Tilt effect values
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    // Calculate mouse position relative to center of card
    const mouseX = event.clientX - rect.left - width / 2
    const mouseY = event.clientY - rect.top - height / 2
    
    x.set(mouseX)
    y.set(mouseY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setAdding(true)
      await addItem(product, 1)
      toast.success(`${product.name} added to cart`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add to cart"
      toast.error(message)
    } finally {
      setAdding(false)
    }
  }, [addItem, product])

  /** Prefetch product detail data on hover for instant page loads */
  const handlePrefetch = useCallback(() => {
    prefetch(
      `products:detail:${product.id}`,
      () => productsApi.get(product.id),
    )
  }, [product.id])

  const imageUrl = imgError ? "/placeholder.svg" : (product.images?.[0] || "/placeholder.svg")
  const priceDisplay = `₹${(product.price).toLocaleString("en-IN")}`

  const isEven = index % 2 === 0
  const staggeredClass = !isEven ? "md:mt-16 lg:mt-24" : ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.1 }}
      className={`${staggeredClass} perspective-1000`}
    >
      <Link
        href={`/shop/${product.id}`}
        className="text-[#111111] no-underline group block"
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        prefetch={false}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden contain-layout transition-transform duration-500 shadow-sm group-hover:shadow-2xl"
        >
          <motion.div style={{ translateZ: 50 }} className="w-full h-full relative">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 mix-blend-multiply"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={imageUrl.startsWith('http')}
            />
          </motion.div>

          {/* Sold Out badge */}
          {product.stock === 0 && (
            <div className="absolute top-4 left-4 bg-black text-white text-[10px] tracking-widest uppercase font-medium px-4 py-2 z-10" style={{ transform: "translateZ(80px)" }}>
              Sold Out
            </div>
          )}

          {/* Quick Add — minimal slide up */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-100 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 flex justify-center" style={{ transform: "translateZ(80px)" }}>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="bg-black/90 backdrop-blur-md text-white text-[12px] uppercase tracking-widest px-8 py-4 hover:bg-black transition-colors w-full sm:w-auto"
            >
              {product.stock === 0 ? "Unavailable" : adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </motion.div>

        {/* Product Info — separated, elegant typography */}
        <div className="pt-8 space-y-2 text-center">
          <p className="text-[11px] text-[#707072] font-medium uppercase tracking-[0.2em]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {product.category}
          </p>
          <h3 className="text-[18px] md:text-[20px] font-serif italic text-[#111111] leading-tight line-clamp-1 group-hover:text-gray-600 transition-colors" style={{ fontFamily: '"Playfair Display", "Times New Roman", Times, serif' }}>
            {product.name}
          </h3>
          <p className="text-[14px] font-light text-[#111111] tracking-wide" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {priceDisplay}
          </p>
        </div>
      </Link>
    </motion.div>
  )
})

export function ProductGrid({
  title = "Curated Selection",
  products: propProducts,
  loading: propLoading,
  category,
  limit = 8,
  showViewAll = true,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(propProducts || [])
  const [loading, setLoading] = useState(propLoading ?? true)

  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts.length > 0 ? propProducts : FALLBACK_PRODUCTS)
      setLoading(propLoading ?? false)
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const result = await productsApi.list({ category, limit })
        setProducts(result.products.length > 0 ? result.products : FALLBACK_PRODUCTS)
      } catch {
        setProducts(FALLBACK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, limit, propProducts, propLoading])

  return (
    <section className="w-full bg-[#FAFAFA]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-24 md:py-32">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-[0.3em] mb-4">Discover</span>
          <h2 className="text-[32px] md:text-[48px] font-serif italic text-[#111111] mb-6" style={{ fontFamily: '"Playfair Display", "Times New Roman", Times, serif' }}>
            {title}
          </h2>
          {showViewAll && (
            <Link
              href="/shop"
              className="group flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-[#111111] hover:text-gray-500 transition-colors"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              <span className="border-b border-black group-hover:border-gray-500 pb-1 transition-colors">Explore All</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-y-0">
            {Array.from({ length: limit > 4 ? 4 : limit }).map((_, i) => (
              <div key={i} className={`animate-pulse ${i % 2 !== 0 ? 'md:mt-16 lg:mt-24' : ''}`}>
                <div className="bg-[#E5E5E5] aspect-[3/4] mb-6" />
                <div className="flex flex-col items-center">
                  <div className="h-3 bg-[#E5E5E5] w-1/4 mb-3" />
                  <div className="h-5 bg-[#E5E5E5] w-3/4 mb-3" />
                  <div className="h-4 bg-[#E5E5E5] w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-y-0">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

