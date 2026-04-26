"use client"

import { Search, ShoppingBag, User, Menu, X, LogOut, Package, LayoutDashboard, Mic, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
    <nav className="flex justify-between items-center py-4 md:py-5 lg:py-6 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 bg-white border-b border-neutral-100 sticky top-0 z-50 w-full transition-all duration-300 shadow-sm">
      <div className="max-w-[1920px] w-full mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden mr-4 cursor-pointer bg-transparent border-none text-foreground p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <div className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">
            <Link href="/" className="text-foreground no-underline">
              ALL BLUE
            </Link>
          </div>
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
          <Link href="/gift-finder" className="text-foreground text-sm lg:text-base font-bold uppercase tracking-widest hover:opacity-50 transition-opacity flex items-center gap-1 text-primary">
            <Sparkles className="w-4 h-4" /> AI Gift Finder
          </Link>
        </div>

        {/* Icons */}
        <div className="flex gap-4 md:gap-5 lg:gap-6 xl:gap-7 items-center">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <button
              className="cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity p-1"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-12 right-0 w-[90vw] md:w-96 bg-white border border-neutral-200 shadow-2xl z-50 rounded-2xl overflow-hidden"
                >
                  <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-neutral-100 px-4">
                    <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      placeholder="Search gifts..."
                      className="flex-1 py-4 px-3 outline-none text-sm bg-transparent"
                    />
                    <button type="button" onClick={startVoiceSearch} className="p-2 hover:opacity-60 transition-opacity">
                      <Mic className={`w-4 h-4 ${isListening ? "text-red-500 animate-pulse" : "text-neutral-400"}`} />
                    </button>
                  </form>
                  {searchLoading && (
                    <div className="px-5 py-4 text-sm text-neutral-400 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="max-h-[60vh] overflow-y-auto">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.id}`}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0"
                          onClick={() => { setSearchOpen(false); setSearchResults([]) }}
                        >
                          <div className="w-12 h-12 bg-neutral-100 rounded-lg shrink-0 overflow-hidden border border-neutral-100">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate text-foreground">{product.name}</div>
                            <div className="text-xs text-primary font-black mt-0.5">₹{product.price.toLocaleString("en-IN")}</div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        className="block text-center text-xs py-4 text-neutral-500 hover:text-primary font-black uppercase tracking-widest bg-neutral-50/50"
                        onClick={() => setSearchOpen(false)}
                      >
                        View all results
                      </Link>
                    </div>
                  )}
                  {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="px-5 py-8 text-center text-sm text-neutral-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div ref={userMenuRef} className="relative">
            <button
              className="cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity p-1"
              onClick={() => {
                if (!user) router.push("/sign-in")
                else setUserMenuOpen(!userMenuOpen)
              }}
            >
              <User className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {userMenuOpen && user && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-12 right-0 w-64 bg-white border border-neutral-200 shadow-2xl z-50 rounded-2xl overflow-hidden"
                >
                  <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Account</div>
                    <div className="text-sm font-bold truncate mt-1 text-foreground">{user.primaryEmail}</div>
                  </div>
                  <div className="py-2">
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-neutral-50 transition-colors">
                      <User className="w-4 h-4 text-neutral-400" /> Profile
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-neutral-50 transition-colors">
                      <Package className="w-4 h-4 text-neutral-400" /> My Orders
                    </Link>
                    {user?.clientMetadata?.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-neutral-50 transition-colors text-primary">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                  </div>
                  <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold hover:bg-red-50 text-red-500 transition-colors border-t border-neutral-100 mt-1">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative cursor-pointer hover:opacity-70 transition-opacity p-1">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                <div className="text-xl font-black tracking-tight uppercase">
                  ALL BLUE
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8">
                {/* Navigation Links */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Navigation</p>
                  <div className="flex flex-col gap-4">
                    {[
                      { name: "Shop", href: "/shop" },
                      { name: "Collections", href: "/collections" },
                      { name: "About", href: "/about" },
                      { name: "Corporate Gifting", href: "/corporate-gifting" },
                      { name: "Contact", href: "/contact" },
                    ].map((link) => (
                      <Link 
                        key={link.name}
                        href={link.href} 
                        className="text-2xl font-extrabold uppercase tracking-tight hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                    <Link 
                      href="/gift-finder" 
                      className="text-2xl font-extrabold uppercase tracking-tight text-primary flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Sparkles className="w-6 h-6" /> AI Gift Finder
                    </Link>
                  </div>
                </div>

                {/* Account Section */}
                <div className="pt-8 border-t border-neutral-100 space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Account</p>
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {user.primaryEmail?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{user.primaryEmail}</p>
                          <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Premium Member</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-2 py-2 text-sm font-bold hover:text-primary transition-colors">
                          <User className="w-5 h-5" /> My Profile
                        </Link>
                        <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-2 py-2 text-sm font-bold hover:text-primary transition-colors">
                          <Package className="w-5 h-5" /> My Orders
                        </Link>
                        {user?.clientMetadata?.role === "admin" && (
                          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-2 py-2 text-sm font-bold text-primary transition-colors">
                            <LayoutDashboard className="w-5 h-5" /> Admin Dashboard
                          </Link>
                        )}
                        <button onClick={handleSignOut} className="flex items-center gap-3 px-2 py-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                          <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      href="/sign-in" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-colors"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-neutral-100">
                <div className="flex justify-between items-center text-neutral-400">
                  <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest hover:text-foreground">Privacy</Link>
                  <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest hover:text-foreground">Terms</Link>
                  <div className="text-[10px] font-bold uppercase tracking-widest">© 2026</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
