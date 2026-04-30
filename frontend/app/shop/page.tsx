"use client"

import { Suspense } from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronDown, ShoppingBag, Search, X, SlidersHorizontal, CheckCircle2 } from "lucide-react"
import { productsApi, type Product } from "@/lib/api"
import { getLikedProductIds, toggleLikedProduct } from "@/lib/wishlist"
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

function ProductCard({
  product,
  isLiked,
  onToggleLike,
}: {
  product: Product
  isLiked: boolean
  onToggleLike: (productId: string) => void
}) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || "/placeholder.svg")

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSuccess) return

    try {
      setAdding(true)
      await addItem(product, 1)
      setIsSuccess(true)
      toast.success(`${product.name} added to cart`)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart")
    } finally {
      setAdding(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full"
    >
      <Link href={`/shop/${product.id}`} className="block flex-1 no-underline">
        {/* Product Image Container */}
        <div className="relative aspect-[4/5] bg-[#F5F5F5] overflow-hidden contain-layout">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-contain p-2 sm:p-6 transition-transform duration-700 ease-out group-hover:scale-110"
            onError={() => setImgSrc("/placeholder.svg")}
            unoptimized={imgSrc.startsWith('http')}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges — Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.stock > 0 && product.stock < 10 && (
              <div className="bg-[#D30005] text-white text-[11px] font-bold px-2.5 py-1 uppercase tracking-tight">
                Only {product.stock} left
              </div>
            )}
            {product.stock === 0 && (
              <div className="bg-[#707072] text-white text-[11px] font-bold px-2.5 py-1 uppercase tracking-tight">
                Sold Out
              </div>
            )}
          </div>

          {/* Wishlist — Top Right */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleLike(product.id)
            }}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10 hover:bg-white shadow-sm active:scale-90"
          >
            <Heart 
              className={`w-4.5 h-4.5 transition-colors ${isLiked ? "fill-[#D30005] text-[#D30005]" : "text-[#111111]"}`} 
              strokeWidth={1.5} 
            />
          </button>

          {/* Action Overlay (Desktop) / Quick Add (Mobile) */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:block">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0 || isSuccess}
              className={`nike-btn-primary w-full text-[14px] py-3 shadow-xl transition-all ${
                isSuccess ? "bg-[#007D48] hover:bg-[#007D48]" : ""
              }`}
            >
              {isSuccess ? (
                <><CheckCircle2 className="w-4 h-4" /> Added to Bag</>
              ) : (
                <><ShoppingBag className="w-4 h-4" /> {adding ? "Adding..." : "Add to Bag"}</>
              )}
            </button>
          </div>

          {/* Mobile Quick Add Button */}
          <div className="absolute right-3 bottom-3 md:hidden">
             <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0 || isSuccess}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 ${
                isSuccess ? "bg-[#007D48] text-white" : "bg-white text-[#111111]"
              } disabled:opacity-50`}
            >
              {isSuccess ? <CheckCircle2 className="w-5.5 h-5.5" /> : <ShoppingBag className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* Info — Proper Nike Hierarchy */}
        <div className="pt-4 flex flex-col gap-1">
          <div className="flex flex-col">
            <h3 className="text-[15px] sm:text-[16px] font-medium text-[#111111] leading-tight">
              {product.name}
            </h3>
            <p className="text-[14px] text-[#707072] font-normal">
              {product.category}
            </p>
          </div>
          <div className="mt-1">
            <p className="text-[15px] sm:text-[16px] font-medium text-[#111111]">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
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
  const [likedProductIds, setLikedProductIds] = useState<string[]>([])

  useEffect(() => {
    setLikedProductIds(getLikedProductIds())
  }, [])

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

  const toggleLike = (productId: string) => {
    const next = toggleLikedProduct(productId)
    setLikedProductIds(next)
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
          <motion.div 
            layout 
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-10 sm:gap-x-4 md:gap-x-6 md:gap-y-12"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isLiked={likedProductIds.includes(product.id)}
                  onToggleLike={toggleLike}
                />
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
