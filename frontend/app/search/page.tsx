"use client"

import { Suspense } from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Mic, X, ShoppingBag } from "lucide-react"
import { searchApi, type Product } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"

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
    <Link href={`/shop/${product.id}`} className="text-[#111111] no-underline group block">
      {/* Product Image — no border radius, Nike grey bg */}
      <div className="relative bg-[#F5F5F5] aspect-square overflow-hidden mb-3">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className="object-contain p-6 transition-opacity duration-200"
          onError={() => setImgSrc("/placeholder.svg")}
          unoptimized={imgSrc.startsWith('http')}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {/* Quick Add on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-100 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-20">
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="nike-btn-primary w-full text-[14px] py-2.5"
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
      {/* Product Info */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium text-[#111111] truncate group-hover:underline" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {product.name}
          </h3>
          <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {product.category}
          </p>
        </div>
        <span className="text-[15px] font-medium text-[#111111] shrink-0" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          ₹{product.price.toLocaleString("en-IN")}
        </span>
      </div>
    </Link>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const LIMIT = 10

  const handleSearch = useCallback(async (q: string, p = 1) => {
    if (!q.trim()) {
      setProducts([])
      setTotal(0)
      setHasMore(false)
      return
    }
    try {
      if (p === 1) setLoading(true)
      else setLoadingMore(true)

      const result = await searchApi.search({ q, limit: LIMIT, offset: (p - 1) * LIMIT })

      if (p === 1) {
        setProducts(result.products)
      } else {
        setProducts(prev => [...prev, ...result.products])
      }

      setTotal(result.total)
      setHasMore(result.products.length === LIMIT && (p * LIMIT) < result.total)
      setPage(p)
    } catch (err) {
      if (p === 1) setProducts([])
      console.error("Search error:", err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    const q = searchParams.get("q") || ""
    setQuery(q)
    if (q) {
      handleSearch(q, 1)
    } else {
      setProducts([])
      setTotal(0)
      setHasMore(false)
    }
  }, [searchParams, handleSearch])

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value.trim()) params.set("q", value.trim())
      router.replace(`/search?${params.toString()}`, { scroll: false })
    }, 400)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) handleSearch(query.trim())
  }

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in this browser")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false
    setIsListening(true)
    recognition.start()
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      handleSearch(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        {/* Search Input — Nike style */}
        <form onSubmit={handleSubmit} className="relative mb-8">
          <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '2px solid #111111' }}>
            <Search className="w-6 h-6 text-[#707072] shrink-0" strokeWidth={1.5} />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search for gifts, occasions, products..."
              className="flex-1 text-[18px] md:text-[24px] font-medium outline-none bg-transparent placeholder:text-[#CACACB] text-[#111111]"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setProducts([]); setTotal(0) }}
                className="p-1 text-[#707072] hover:text-[#111111] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`w-10 h-10 flex items-center justify-center border transition-colors ${
                isListening ? "border-[#D30005] bg-[#D30005]/5" : "border-[#CACACB] hover:border-[#111111]"
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? "text-[#D30005] animate-pulse" : "text-[#707072]"}`} />
            </button>
          </div>
        </form>

        {/* Results count */}
        {query && !loading && (
          <p className="text-[14px] text-[#707072] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {total > 0 ? `${total} results for "${query}"` : `No results for "${query}"`}
          </p>
        )}

        {/* Popular searches */}
        {!query && (
          <div className="mb-8">
            <p className="text-[12px] font-medium text-[#707072] mb-3 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {["Birthday Gift", "Anniversary", "Corporate Gift", "Personalized", "Under ₹500", "Luxury Gift"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s) }}
                  className="text-[14px] font-medium px-5 py-2.5 rounded-full bg-[#F5F5F5] text-[#707072] hover:bg-[#E5E5E5] hover:text-[#111111] transition-all duration-200"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#F5F5F5] aspect-square mb-3" />
                <div className="h-4 bg-[#F5F5F5] w-3/4 mb-2" />
                <div className="h-3 bg-[#F5F5F5] w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && query && products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-[#CACACB]" />
            </div>
            <h2 className="text-[24px] font-medium text-[#111111] mb-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>No products found</h2>
            <p className="text-[14px] text-[#707072] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Try different keywords or browse our collections
            </p>
            <Link href="/shop" className="nike-btn-primary text-[14px]">
              Browse All Products
            </Link>
          </div>
        )}

        {/* Results grid */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-3">
              {products.map((product) => (
                <ProductCard key={`${product.id}-${product.name}`} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => handleSearch(query, page + 1)}
                  disabled={loadingMore}
                  className="nike-btn-secondary text-[14px] px-10 py-3"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 animate-pulse">
        <div className="h-10 bg-[#F5F5F5] mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-[#F5F5F5]" />)}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
