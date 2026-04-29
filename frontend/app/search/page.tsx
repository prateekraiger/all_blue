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
    <Link href={`/shop/${product.id}`} className="text-foreground no-underline group block">
      <div className="relative bg-neutral-100 p-4 mb-3 h-[200px] sm:h-[240px] flex items-center justify-center overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc("/placeholder.jpg")}
          unoptimized={imgSrc.startsWith('http')}
        />
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="absolute bottom-3 left-3 right-3 bg-foreground text-background py-2 text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-700 disabled:bg-neutral-400 flex items-center justify-center gap-1"
        >
          <ShoppingBag className="w-3 h-3" />
          {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 mr-2">
          <div className="font-semibold text-sm mb-0.5 truncate">{product.name}</div>
          <div className="text-xs text-neutral-500">{product.category}</div>
        </div>
        <div className="font-extrabold text-sm shrink-0">₹{product.price.toLocaleString("en-IN")}</div>
      </div>
    </Link>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
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
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
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
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="flex items-center border-b-2 border-foreground pb-3">
          <Search className="w-6 h-6 text-neutral-400 shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search for gifts, occasions, products..."
            className="flex-1 text-lg md:text-2xl font-medium outline-none placeholder:text-neutral-300 bg-transparent"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setProducts([]); setTotal(0) }} className="p-1 hover:opacity-60 mr-2">
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          )}
          <button type="button" onClick={startVoiceSearch} className={`p-2 border transition-colors ${isListening ? "border-red-300 bg-red-50" : "border-neutral-200 hover:border-foreground"}`}>
            <Mic className={`w-5 h-5 ${isListening ? "text-red-500 animate-pulse" : "text-neutral-400"}`} />
          </button>
        </div>
      </form>

      {query && !loading && (
        <p className="text-sm text-neutral-500 mb-6">
          {total > 0 ? `${total} results for "${query}"` : `No results for "${query}"`}
        </p>
      )}

      {!query && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {["Birthday Gift", "Anniversary", "Corporate Gift", "Personalized", "Under ₹500", "Luxury Gift"].map((s) => (
              <button key={s} onClick={() => { setQuery(s); handleSearch(s) }} className="text-sm border border-neutral-200 px-4 py-2 hover:border-foreground hover:bg-neutral-50 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-neutral-100 h-[200px] sm:h-[240px] mb-3" />
              <div className="h-4 bg-neutral-100 w-3/4 mb-2" />
              <div className="h-4 bg-neutral-100 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && query && products.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto text-neutral-200 mb-4" />
          <p className="text-lg font-semibold mb-2">No products found</p>
          <p className="text-neutral-500 text-sm mb-6">Try different keywords or browse our collections</p>
          <Link href="/shop" className="bg-foreground text-background px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-neutral-700 transition-colors">
            Browse All Products
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => <ProductCard key={`${product.id}-${product.name}`} product={product} />)}
          </div>
          
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => handleSearch(query, page + 1)}
                disabled={loadingMore}
                className="group relative px-10 py-4 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:bg-neutral-800 disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center gap-3">
                  {loadingMore ? (
                    <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                  ) : (
                    <span>Load More</span>
                  )}
                </div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1200px] mx-auto px-4 py-12 animate-pulse">
        <div className="h-12 bg-neutral-100 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-neutral-100" />)}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
