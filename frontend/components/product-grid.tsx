"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingBag, Star, ArrowRight, Smartphone } from "lucide-react"
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
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/shop/${product.id}`} className="text-foreground no-underline group block mb-6 md:mb-8">
        <div className="relative aspect-[3/4] bg-neutral-50 mb-4 md:mb-5 overflow-hidden rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/5 border border-neutral-100/80">
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors duration-500" />
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6 sm:p-8 md:p-10 transition-all duration-700 ease-out group-hover:scale-110"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={imageUrl.startsWith('http')}
          />
          
          {/* Status Badge */}
          {product.stock === 0 && (
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full z-20">
              Sold Out
            </div>
          )}

          {/* AR Badge */}
          {product.stock > 0 && (
            <div className="absolute top-4 right-4 bg-primary/10 backdrop-blur-md text-primary text-[8px] uppercase font-bold tracking-wider px-2 py-1 rounded-full z-20 flex items-center gap-1 border border-primary/20">
              <Smartphone className="w-2.5 h-2.5" />
              AR
            </div>
          )}
          
          {/* Quick Add Button */}
          <div className="absolute inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 translate-y-0 opacity-100 md:translate-y-3 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 z-30">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="w-full bg-white/95 backdrop-blur-md text-black py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2 border border-neutral-100"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {product.stock === 0 ? "Unavailable" : adding ? "Adding..." : "Quick Add"}
            </button>
          </div>
        </div>

        <div className="px-1">
          <div className="flex justify-between items-start gap-3 mb-1.5">
            <h3 className="font-bold text-sm md:text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
            <span className="font-bold text-sm md:text-base whitespace-nowrap">{priceDisplay}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{product.category}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-semibold text-neutral-400">4.9</span>
            </div>
          </div>
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
      <div className="max-w-7xl mx-auto mb-16 md:mb-20 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-12 gap-4 pt-8 md:pt-12">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {title.split(' ')[0]} <span className="text-primary">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
          {showViewAll && (
            <Link
              href="/shop"
              className="group flex items-center gap-2 font-semibold text-sm text-neutral-600 hover:text-primary transition-colors"
            >
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {Array.from({ length: limit > 4 ? 4 : limit }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-100 aspect-[3/4] rounded-2xl mb-4" />
                <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
