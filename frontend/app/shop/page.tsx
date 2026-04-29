"use client"

import { Suspense } from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Filter, ChevronDown, ShoppingBag, Search, X } from "lucide-react"
import { productsApi, type Product } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"

const SORT_OPTIONS = [
  { value: "created_at", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "trending", label: "Trending" },
]

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || "/placeholder.jpg")

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <Link href={`/shop/${product.id}`} className="block no-underline">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-neutral-50 mb-6 border border-neutral-100 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:border-primary/10">
          {/* Main Image */}
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className={`object-contain p-8 transition-all duration-1000 ease-out ${isHovered ? "scale-110 -rotate-2 blur-[2px] opacity-40" : "scale-100 rotate-0"}`}
            onError={() => setImgSrc("/placeholder.jpg")}
            unoptimized={imgSrc.startsWith('http')}
          />

          {/* Secondary Image or Details on Hover */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">Quick View</span>
              <p className="text-neutral-600 text-xs line-clamp-3 mb-6 font-medium leading-relaxed px-4">
                {product.description}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                product.stock === 0 
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed" 
                : "bg-primary text-white hover:bg-neutral-800"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
            </motion.button>
          </div>

          {/* Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {product.stock === 0 && (
              <div className="bg-neutral-900 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                Sold Out
              </div>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <div className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                Limited: {product.stock} left
              </div>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.2, rotate: 15 }}
            className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/50 text-neutral-400 hover:text-primary transition-colors"
          >
            <Heart className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="px-2">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
            <span className="font-black text-lg">₹{product.price.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{product.category}</span>
            <div className="flex gap-1">
              {product.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const currentCategory = searchParams.get("category") || ""
  const currentSort = searchParams.get("sort") || "created_at"
  const currentPage = parseInt(searchParams.get("page") || "1")
  const currentSearch = searchParams.get("q") || ""

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const result = await productsApi.list({
        category: currentCategory || undefined,
        q: currentSearch || undefined,
        sort: currentSort,
        page: currentPage,
        limit: 12,
      })
      setProducts(result.products)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [currentCategory, currentSort, currentPage, currentSearch])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    productsApi.categories().then(setCategories).catch(() => {})
  }, [])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    
    if (key !== "page") {
      params.delete("page")
    }
    
    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/shop")
  }

  const hasFilters = currentCategory || currentSearch

  return (
    <div className="max-w-[1200px] mx-auto py-8 md:py-12 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      {/* Header & Controls */}
      <div className="mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Curated Collection</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] mb-6">
              {currentCategory || "The Archive"}
            </h1>
            {total > 0 && (
              <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">
                Showing {products.length} of {total} masterpieces
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border-2 ${
                showFilters || hasFilters 
                ? "bg-primary text-white border-primary shadow-2xl" 
                : "bg-white text-neutral-900 border-neutral-100 hover:border-primary/30"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter {hasFilters && `(1)`}
            </motion.button>

            <div className="relative group">
              <select
                value={currentSort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="appearance-none bg-neutral-50 border-2 border-neutral-100 px-8 py-4 pr-12 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary/30 transition-all outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-neutral-400 group-hover:text-primary transition-colors" />
            </div>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 mb-6">By Category</h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => updateFilter("category", "")}
                        className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-500 border-2 ${
                          !currentCategory 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        All Pieces
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => updateFilter("category", cat)}
                          className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-500 border-2 ${
                            currentCategory === cat 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 mb-6">Search Archive</h3>
                      <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input 
                          type="text" 
                          placeholder="Search for perfection..."
                          className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-neutral-600"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateFilter("q", (e.target as HTMLInputElement).value)
                          }}
                        />
                      </div>
                    </div>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors mt-8"
                      >
                        <X className="w-4 h-4" /> Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Chips (Luxury Version) */}
        {!showFilters && categories.length > 0 && (
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            <button
              onClick={() => updateFilter("category", "")}
              className={`shrink-0 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl transition-all duration-500 ${
                !currentCategory 
                ? "bg-neutral-900 text-white shadow-xl translate-y-[-2px]" 
                : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              All Pieces
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat)}
                className={`shrink-0 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl transition-all duration-500 ${
                  currentCategory === cat 
                  ? "bg-neutral-900 text-white shadow-xl translate-y-[-2px]" 
                  : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-neutral-100 h-[280px] md:h-[320px] lg:h-[360px] mb-4" />
              <div className="h-5 bg-neutral-100 w-3/4 mb-2" />
              <div className="h-4 bg-neutral-100 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <Search className="w-12 h-12 mx-auto text-neutral-200 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-neutral-500 text-sm mb-6">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="bg-foreground text-background px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-neutral-700 transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12"
        >
          <AnimatePresence>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => updateFilter("page", String(currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-4 py-2 border border-neutral-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground transition-colors"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => updateFilter("page", String(page))}
                  className={`w-9 h-9 border text-sm font-medium transition-colors ${currentPage === page ? "border-foreground bg-foreground text-background" : "border-neutral-200 hover:border-foreground"}`}
                >
                  {page}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => updateFilter("page", String(currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 border border-neutral-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1200px] mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-neutral-100 w-1/3 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 bg-neutral-100" />)}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
