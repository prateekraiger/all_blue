"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { productsApi, type Product } from "@/lib/api"
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

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setAdding(true)
      await addItem(product, 1)
      toast.success(`${product.name} added to cart`)
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart")
    } finally {
      setAdding(false)
    }
  }

  const imageUrl = imgError ? "/placeholder.svg" : (product.images?.[0] || "/placeholder.svg")
  const priceDisplay = `₹${(product.price).toLocaleString("en-IN")}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/shop/${product.id}`} className="text-[#111111] no-underline group block">
        {/* Product Image — square, no border radius, edge-to-edge */}
        <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6 transition-opacity duration-200"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={imageUrl.startsWith('http')}
          />

          {/* Sold Out badge */}
          {product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-[#111111] text-white text-[12px] font-medium px-3 py-1 z-10">
              Sold Out
            </div>
          )}

          {/* Quick Add — appears on hover (desktop), always visible (mobile) */}
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-100 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-20">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="nike-btn-primary w-full text-[14px] py-3"
            >
              <ShoppingBag className="w-4 h-4" />
              {product.stock === 0 ? "Unavailable" : adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Product Info — below image, tight spacing */}
        <div className="pt-3 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-[16px] font-medium text-[#111111] leading-tight line-clamp-1 group-hover:underline" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {product.name}
            </h3>
            <span className="text-[16px] font-medium text-[#111111] whitespace-nowrap" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {priceDisplay}
            </span>
          </div>
          <p className="text-[14px] text-[#707072] font-medium" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {product.category}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export function ProductGrid({
  title = "Featured Products",
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
    <section className="w-full">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <h2 className="nike-heading text-[24px] md:text-[32px] text-[#111111]">
            {title}
          </h2>
          {showViewAll && (
            <Link
              href="/shop"
              className="text-[14px] font-medium text-[#111111] hover:text-[#707072] transition-colors flex items-center gap-1"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-3">
            {Array.from({ length: limit > 4 ? 4 : limit }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#F5F5F5] aspect-square mb-3" />
                <div className="h-4 bg-[#F5F5F5] w-3/4 mb-2" />
                <div className="h-3 bg-[#F5F5F5] w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-3">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
