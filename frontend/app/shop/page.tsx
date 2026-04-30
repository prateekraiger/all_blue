"use client"

import { Suspense } from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronDown, ShoppingBag, Search, X, SlidersHorizontal } from "lucide-react"
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
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative group"
    >
      <Link href={`/shop/${product.id}`} className="block no-underline">
        {/* Product Image — square, no border radius, Nike grey background */}
        <div className="relative aspect-square overflow-hidden bg-[#F5F5F5]">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-contain p-6 transition-opacity duration-200"
            onError={() => setImgSrc("/placeholder.svg")}
            unoptimized={imgSrc.startsWith('http')}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Badges */}
          {product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-[#111111] text-white text-[12px] font-medium px-3 py-1 z-10">
              Sold Out
            </div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute top-3 left-3 bg-[#D30005] text-white text-[12px] font-medium px-3 py-1 z-10">
              Only {product.stock} left
            </div>
          )}

          {/* Heart icon */}
          <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#CACACB] hover:text-[#D30005] transition-colors z-10">
            <Heart className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {/* Quick Add on hover */}
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-100 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-20">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="nike-btn-primary w-full text-[14px] py-3"
            >
              <ShoppingBag className="w-4 h-4" />
              {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-3 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-[15px] font-medium text-[#111111] leading-tight line-clamp-1 group-hover:underline" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {product.name}
            </h3>
            <span className="text-[15px] font-medium text-[#111111] whitespace-nowrap" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-[14px] text-[#707072] font-normal" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {product.category}
          </p>
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
    if (key !== "page") params.delete("page")
    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/shop")
  }

  const hasFilters = currentCategory || currentSearch
  const pageTitle = currentCategory || "All Products"

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #E5E5E5' }}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-3">
                <Link href="/" className="text-[12px] font-medium text-[#707072] hover:text-[#111111] transition-colors" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Home</Link>
                <span className="text-[#CACACB]">/</span>
                <span className="text-[12px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Shop</span>
                {currentCategory && (
                  <>
                    <span className="text-[#CACACB]">/</span>
                    <span className="text-[12px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{currentCategory}</span>
                  </>
                )}
              </div>
              <h1 className="nike-display text-[32px] md:text-[48px] text-[#111111]">
                {pageTitle}
              </h1>
              {total > 0 && (
                <p className="text-[14px] text-[#707072] font-normal mt-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  {total} {total === 1 ? 'Product' : 'Products'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`nike-btn-secondary text-[14px] px-5 py-2.5 ${showFilters || hasFilters ? 'border-[#111111] bg-[#111111] text-white' : ''}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>

              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="appearance-none bg-white border border-[#CACACB] px-5 py-2.5 pr-10 rounded-full text-[14px] font-medium text-[#111111] hover:border-[#707072] transition-all outline-none cursor-pointer"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#707072]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-6 md:py-10">
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-[#F5F5F5] p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[14px] font-medium text-[#111111] mb-4 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Category</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateFilter("category", "")}
                        className={`text-[14px] font-medium px-5 py-2.5 rounded-full transition-all duration-200 ${
                          !currentCategory
                          ? "bg-[#111111] text-white"
                          : "bg-white text-[#111111] border border-[#CACACB] hover:border-[#707072]"
                        }`}
                        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                      >
                        All
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => updateFilter("category", cat)}
                          className={`text-[14px] font-medium px-5 py-2.5 rounded-full transition-all duration-200 ${
                            currentCategory === cat
                            ? "bg-[#111111] text-white"
                            : "bg-white text-[#111111] border border-[#CACACB] hover:border-[#707072]"
                          }`}
                          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-[14px] font-medium text-[#111111] mb-4 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Search</h3>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707072]" strokeWidth={1.5} />
                        <input
                          type="text"
                          placeholder="Search products..."
                          defaultValue={currentSearch}
                          className="nike-search-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateFilter("q", (e.target as HTMLInputElement).value)
                          }}
                        />
                      </div>
                    </div>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-[14px] font-medium text-[#707072] hover:text-[#111111] transition-colors mt-4"
                        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                      >
                        <X className="w-4 h-4" /> Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Quick-Filter Chips — pill shaped (30px radius) */}
        {!showFilters && categories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 pb-6 scrollbar-hide">
            <button
              onClick={() => updateFilter("category", "")}
              className={`shrink-0 text-[14px] font-medium px-5 py-2.5 rounded-full transition-all duration-200 ${
                !currentCategory
                ? "bg-[#111111] text-white"
                : "bg-[#F5F5F5] text-[#707072] hover:bg-[#E5E5E5] hover:text-[#111111]"
              }`}
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat)}
                className={`shrink-0 text-[14px] font-medium px-5 py-2.5 rounded-full transition-all duration-200 ${
                  currentCategory === cat
                  ? "bg-[#111111] text-white"
                  : "bg-[#F5F5F5] text-[#707072] hover:bg-[#E5E5E5] hover:text-[#111111]"
                }`}
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid — tight gaps */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#F5F5F5] aspect-square mb-3" />
                <div className="h-4 bg-[#F5F5F5] w-3/4 mb-2" />
                <div className="h-3 bg-[#F5F5F5] w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-[#CACACB]" />
            </div>
            <h2 className="text-[24px] font-medium mb-2 text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>No products found</h2>
            <p className="text-[16px] text-[#707072] mb-6 max-w-md mx-auto" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="nike-btn-primary text-[14px]">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-3">
            <AnimatePresence>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination — pill buttons */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 mb-4">
            <button
              onClick={() => updateFilter("page", String(currentPage - 1))}
              disabled={currentPage <= 1}
              className="nike-btn-secondary text-[14px] px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className={`w-10 h-10 rounded-full text-[14px] font-medium transition-all ${
                      currentPage === page
                      ? "bg-[#111111] text-white"
                      : "border border-[#CACACB] text-[#111111] hover:border-[#111111]"
                    }`}
                    style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => updateFilter("page", String(currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="nike-btn-secondary text-[14px] px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
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
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 animate-pulse">
        <div className="h-10 bg-[#F5F5F5] w-1/3 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square bg-[#F5F5F5]" />)}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
