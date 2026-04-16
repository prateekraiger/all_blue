"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingBag, Star } from "lucide-react"
import { productsApi, type Product } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"

// Fallback static products (shown when API is unavailable)
const FALLBACK_PRODUCTS: Product[] = [
  { id: "1", name: "Modern Lounge Chair", category: "Furniture", price: 29900, tags: [], images: ["/product_chair.png"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "2", name: "Solid Walnut Dining Table", category: "Furniture", price: 59900, tags: [], images: ["/product_table.png"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "3", name: "Minimalist Sofa", category: "Furniture", price: 89900, tags: [], images: ["/product_sofa.png"], stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: "4", name: "Matte Pendant Lamp", category: "Lighting", price: 15900, tags: [], images: ["/product_lamp.png"], stock: 10, is_active: true, created_at: new Date().toISOString() }
]

interface ProductGridProps {
  title?: string
  products?: Product[]
  loading?: boolean
  category?: string
  limit?: number
  showViewAll?: boolean
}

function ProductCard({ product }: { product: Product }) {
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
    <Link href={`/shop/${product.id}`} className="text-foreground no-underline group block">
      <div className="relative bg-neutral-100 p-6 md:p-8 lg:p-10 xl:p-10 mb-4 md:mb-5 lg:mb-6 overflow-hidden h-[300px] md:h-[350px] lg:h-[400px] xl:h-[420px] 2xl:h-[450px] flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={product.name}
          width={500}
          height={500}
          className="w-full h-full object-contain group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
        />
        {/* Add to cart overlay */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="absolute bottom-4 left-4 right-4 bg-foreground text-background py-3 text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-700 disabled:bg-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </button>
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-neutral-900 text-white text-[10px] uppercase tracking-widest px-2 py-1">
            Out of Stock
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-base md:text-lg mb-1">{product.name}</div>
          <div className="text-xs md:text-sm text-neutral-500">{product.category}</div>
        </div>
        <div className="font-extrabold text-base md:text-lg">{priceDisplay}</div>
      </div>
    </Link>
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
        <div className="flex justify-between items-end mb-8 md:mb-12 lg:mb-14 xl:mb-16 pt-8 md:pt-12 lg:pt-16 xl:pt-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-5xl font-extrabold uppercase tracking-tight">
            {title}
          </h2>
          {showViewAll && (
            <Link
              href="/shop"
              className="text-foreground underline font-semibold text-xs md:text-sm lg:text-base hover:opacity-70 transition-opacity"
            >
              View All
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
