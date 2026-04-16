"use client"

import { Search, ShoppingBag, User, Menu, X, LogOut, Package, LayoutDashboard, Mic } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"
import { useUser, useStackApp } from "@stackframe/stack"
import { useCart } from "@/context/CartContext"
import { searchApi } from "@/lib/api"
import type { Product } from "@/lib/api"
import { toast } from "sonner"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>(null!)
  const router = useRouter()
  const user = useUser()
  const stackApp = useStackApp()
  const { itemCount } = useCart()

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setSearchResults([])
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Debounced search
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)
    clearTimeout(debounceTimer.current)
    if (value.trim().length < 2) {
      setSearchResults([])
      return
    }
    debounceTimer.current = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const result = await searchApi.search({ q: value, limit: 5 })
        setSearchResults(result.products)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 350)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchResults([])
    }
  }

  // Voice Search
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
      setSearchQuery(transcript)
      handleSearchInput(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const handleSignOut = async () => {
    await stackApp.signOut()
    setUserMenuOpen(false)
    router.push("/")
    toast.success("Signed out successfully")
  }

  return (
    <nav className="flex justify-between items-center py-4 md:py-6 lg:py-7 xl:py-8 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 border-b border-neutral-100 bg-white sticky top-0 z-50 w-full">
      <div className="max-w-[1920px] w-full mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl md:text-2xl lg:text-3xl xl:text-3xl font-extrabold tracking-tight uppercase">
          <Link href="/" className="text-foreground no-underline">
            ALL BLUE
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
          <Link href="/shop" className="text-foreground text-sm lg:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity">
            Shop
          </Link>
          <Link href="/collections" className="text-foreground text-sm lg:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity">
            Collections
          </Link>
          <Link href="/about" className="text-foreground text-sm lg:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity">
            About
          </Link>
          <Link href="/corporate-gifting" className="text-foreground text-sm lg:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity">
            Corporate Gifting
          </Link>
          <Link href="/contact" className="text-foreground text-sm lg:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity">
            Contact
          </Link>
        </div>

        {/* Icons */}
        <div className="flex gap-4 md:gap-5 lg:gap-6 xl:gap-7 items-center">
          {/* Search */}
          <div ref={searchRef} className="relative hidden md:block">
            <button
              className="cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>
            {searchOpen && (
              <div className="absolute top-8 right-0 w-80 bg-white border border-neutral-200 shadow-lg z-50">
                <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-neutral-100 px-3">
                  <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Search gifts..."
                    className="flex-1 py-3 px-2 outline-none text-sm"
                  />
                  <button type="button" onClick={startVoiceSearch} className="p-1 hover:opacity-60">
                    <Mic className={`w-4 h-4 ${isListening ? "text-red-500 animate-pulse" : "text-neutral-400"}`} />
                  </button>
                </form>
                {searchLoading && (
                  <div className="px-4 py-3 text-sm text-neutral-400">Searching...</div>
                )}
                {searchResults.length > 0 && (
                  <div>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-50"
                        onClick={() => { setSearchOpen(false); setSearchResults([]) }}
                      >
                        <div className="w-10 h-10 bg-neutral-100 shrink-0 overflow-hidden">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{product.name}</div>
                          <div className="text-xs text-neutral-500">₹{product.price}</div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      className="block text-center text-xs py-3 text-neutral-500 hover:text-foreground font-semibold uppercase tracking-widest"
                      onClick={() => setSearchOpen(false)}
                    >
                      View all results
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div ref={userMenuRef} className="relative hidden md:block">
            <button
              className="cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity"
              onClick={() => {
                if (!user) router.push("/sign-in")
                else setUserMenuOpen(!userMenuOpen)
              }}
            >
              <User className="w-5 h-5" />
            </button>
            {userMenuOpen && user && (
              <div className="absolute top-8 right-0 w-52 bg-white border border-neutral-200 shadow-lg z-50">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Account</div>
                  <div className="text-sm font-medium truncate mt-1">{user.primaryEmail}</div>
                </div>
                <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50 transition-colors">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50 transition-colors">
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                {user?.clientMetadata?.role === "admin" && (
                  <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Link>
                )}
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50 transition-colors border-t border-neutral-100">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative cursor-pointer hover:opacity-70 transition-opacity">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden cursor-pointer bg-transparent border-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-100 py-6 px-4 z-40">
          <div className="flex flex-col gap-6">
            <Link href="/shop" className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </Link>
            <Link href="/collections" className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
              Collections
            </Link>
            <Link href="/about" className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link href="/corporate-gifting" className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
              Corporate Gifting
            </Link>
            <Link href="/contact" className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <div className="flex gap-6 pt-4 border-t border-neutral-100">
              <Link href="/search" className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
                <Search className="w-5 h-5" />
              </Link>
              {user ? (
                <button onClick={() => { setMobileMenuOpen(false); router.push("/profile") }} className="cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity">
                  <User className="w-5 h-5" />
                </button>
              ) : (
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="cursor-pointer hover:opacity-70 transition-opacity">
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
