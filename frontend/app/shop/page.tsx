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

const SORT_OPTIONS = [
  { value: "created_at", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "trending", label: "Trending" },
]

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

  return (
    <Link href={`/shop/${product.id}`} className="text-foreground no-underline group block">
      <div className="relative bg-neutral-100 p-6 md:p-8 mb-4 overflow-hidden h-[280px] md:h-[320px] lg:h-[360px] flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-contain group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
        />
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
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] uppercase tracking-widest px-2 py-1">
            Only {product.stock} left
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-base mb-1">{product.name}</div>
          <div className="text-xs text-neutral-500">{product.category}</div>
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] uppercase tracking-widest border border-neutral-200 px-2 py-0.5 text-neutral-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="font-extrabold text-base">₹{product.price.toLocaleString("en-IN")}</div>
      </div>
    </Link>
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
    params.delete("page")
    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/shop")
  }

  const hasFilters = currentCategory || currentSearch

  return (
    <div className="max-w-[1200px] mx-auto py-8 md:py-12 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase">
            {currentCategory || "All Products"}
          </h1>
          {total > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{total} products</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-neutral-200 px-4 py-2 text-sm font-medium hover:border-foreground transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-foreground rounded-full" />}
          </button>
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="appearance-none border border-neutral-200 px-4 py-2 pr-8 text-sm font-medium hover:border-foreground transition-colors outline-none bg-white cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border border-neutral-200 p-6 mb-8 bg-neutral-50">
          <div className="flex flex-wrap gap-4 items-start">
            {/* Category filter */}
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs font-semibold uppercase tracking-widest mb-3">Category</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter("category", "")}
                  className={`text-xs px-3 py-1.5 border transition-colors ${!currentCategory ? "border-foreground bg-foreground text-background" : "border-neutral-200 hover:border-foreground"}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter("category", cat)}
                    className={`text-xs px-3 py-1.5 border transition-colors ${currentCategory === cat ? "border-foreground bg-foreground text-background" : "border-neutral-200 hover:border-foreground"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-foreground transition-colors self-end"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide">
          <button
            onClick={() => updateFilter("category", "")}
            className={`shrink-0 text-xs px-4 py-2 border uppercase tracking-widest transition-colors ${!currentCategory ? "border-foreground bg-foreground text-background" : "border-neutral-200 hover:border-foreground"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter("category", cat)}
              className={`shrink-0 text-xs px-4 py-2 border uppercase tracking-widest transition-colors ${currentCategory === cat ? "border-foreground bg-foreground text-background" : "border-neutral-200 hover:border-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
