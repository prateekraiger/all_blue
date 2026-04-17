"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingBag, Star, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { productsApi, type Product } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"

// Fallback static products (shown when API is unavailable)
const FALLBACK_PRODUCTS: Product[] = [
  { id: "1", name: "Classic Men's Watch", category: "Gifts for Him", price: 29900, tags: [], images: ["/gift_watch.png"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "2", name: "Designer Perfume", category: "Gifts for Her", price: 15900, tags: [], images: ["/gift_perfume.png"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "3", name: "Artisan Chocolates", category: "Gifts", price: 5900, tags: [], images: ["/gift_chocolates.png"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "4", name: "Elegant Floral Bouquet", category: "Gifts", price: 8900, tags: [], images: ["/gift_bouquet.png"], stock: 10, is_active: true, created_at: new Date().toISOString() }
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

  const imageUrl = product.images?.[0] || "/placeholder.jpg"
  const priceDisplay = `₹${(product.price).toLocaleString("en-IN")}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/shop/${product.id}`} className="text-foreground no-underline group block mb-8">
        <div className="relative aspect-[3/4] bg-[#F7F7F7] mb-6 overflow-hidden rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-12 transition-all duration-700 ease-out group-hover:scale-110 group-hover:drop-shadow-2xl"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Status Badge */}
          {product.stock === 0 && (
            <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full z-20">
              Sold Out
            </div>
          )}
          
          {/* Interactive Button Overlay */}
          <div className="absolute inset-x-6 bottom-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-30">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="w-full bg-white/90 backdrop-blur-md text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {product.stock === 0 ? "Unavailable" : adding ? "Adding..." : "Quick Add"}
            </button>
          </div>
        </div>

        <div className="px-2">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="font-bold text-lg md:text-xl leading-tight group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
            <span className="font-black text-lg whitespace-nowrap">{priceDisplay}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">{product.category}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold opacity-60">4.9</span>
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
      <div className="max-w-[1920px] mx-auto mb-16 md:mb-24 lg:mb-28 xl:mb-32 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6 pt-12 md:pt-20">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">
            {title.split(' ')[0]} <span className="text-primary italic">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
          {showViewAll && (
            <Link
              href="/shop"
              className="group flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors"
            >
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10 xl:gap-10 2xl:gap-12">
            {Array.from({ length: limit > 4 ? 4 : limit }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-100 h-[300px] md:h-[350px] lg:h-[400px] xl:h-[420px] mb-4" />
                <div className="h-5 bg-neutral-100 w-3/4 mb-2" />
                <div className="h-4 bg-neutral-100 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10 xl:gap-10 2xl:gap-12">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
