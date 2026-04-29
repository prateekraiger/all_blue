"use client"

import { Suspense } from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Filter, ChevronDown, ShoppingBag, Search, X, SlidersHorizontal, Grid3X3, LayoutGrid } from "lucide-react"
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
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || "/placeholder.svg")

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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <Link href={`/shop/${product.id}`} className="block no-underline">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-50 mb-5 border border-neutral-100/80 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:border-primary/10">
          {/* Main Image */}
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className={`object-contain p-6 md:p-8 transition-all duration-700 ease-out ${isHovered ? "scale-110 blur-[2px] opacity-30" : "scale-100"}`}
            onError={() => setImgSrc("/placeholder.svg")}
            unoptimized={imgSrc.startsWith('http')}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Hover Overlay */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-400 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2 block">Quick View</span>
              <p className="text-neutral-600 text-xs line-clamp-3 font-medium leading-relaxed px-2">
                {product.description}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 ${
                product.stock === 0 
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed" 
                : "bg-neutral-900 text-white hover:bg-primary"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
            </motion.button>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.stock === 0 && (
              <div className="bg-neutral-900 text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                Sold Out
              </div>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <div className="bg-amber-500 text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                Only {product.stock} left
              </div>
            )}
          </div>

          <button 
            className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-white/50 text-neutral-300 hover:text-red-400 transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="px-1">
          <div className="flex justify-between items-start mb-1.5 gap-2">
            <h3 className="font-bold text-[15px] tracking-tight group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
            <span className="font-bold text-[15px] whitespace-nowrap">₹{product.price.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{product.category}</span>
            <div className="flex gap-1">
              {product.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[8px] font-semibold uppercase tracking-wider text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
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

  // Derive the page title
  const pageTitle = currentCategory || "All Products"

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link href="/" className="text-xs font-medium text-neutral-400 hover:text-primary transition-colors">Home</Link>
                <span className="text-neutral-300">/</span>
                <span className="text-xs font-medium text-neutral-600">Shop</span>
                {currentCategory && (
                  <>
                    <span className="text-neutral-300">/</span>
                    <span className="text-xs font-medium text-primary">{currentCategory}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
                {pageTitle}
              </h1>
              {total > 0 && (
                <p className="text-neutral-400 font-medium text-sm mt-2">
                  Showing {products.length} of {total} products
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-semibold transition-all duration-300 border ${
                  showFilters || hasFilters 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {hasFilters && <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">1</span>}
              </motion.button>

              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="appearance-none bg-white border border-neutral-200 px-5 py-3 pr-10 rounded-xl text-xs font-semibold text-neutral-700 hover:border-neutral-300 transition-all outline-none cursor-pointer hover:shadow-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-neutral-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-neutral-900 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-4">Category</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateFilter("category", "")}
                        className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300 border ${
                          !currentCategory 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        All
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => updateFilter("category", cat)}
                          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300 border ${
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
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-4">Search</h3>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input 
                          type="text" 
                          placeholder="Search products..."
                          defaultValue={currentSearch}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-neutral-600"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateFilter("q", (e.target as HTMLInputElement).value)
                          }}
                        />
                      </div>
                    </div>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-white transition-colors mt-6"
                      >
                        <X className="w-3.5 h-3.5" /> Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Quick-Filter Chips */}
        {!showFilters && categories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 pb-6 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => updateFilter("category", "")}
              className={`shrink-0 text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-300 ${
                !currentCategory 
                ? "bg-neutral-900 text-white shadow-md" 
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat)}
                className={`shrink-0 text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-300 ${
                  currentCategory === cat 
                  ? "bg-neutral-900 text-white shadow-md" 
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-100 aspect-[3/4] rounded-2xl mb-4" />
                <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-neutral-300" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-neutral-900">No products found</h2>
            <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
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
          <div className="flex justify-center items-center gap-2 mt-12 mb-4">
            <button
              onClick={() => updateFilter("page", String(currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
            >
              Previous
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => updateFilter("page", String(page))}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${currentPage === page ? "bg-neutral-900 text-white shadow-md" : "border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"}`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => updateFilter("page", String(currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-10 bg-neutral-100 rounded-lg w-1/3 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-2xl" />)}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
