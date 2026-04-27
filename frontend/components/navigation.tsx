"use client"

import { Search, ShoppingBag, User, Menu, X, LogOut, Package, LayoutDashboard, Mic, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useUser, useStackApp } from "@stackframe/stack"
import { useCart } from "@/context/CartContext"
import { searchApi } from "@/lib/api"
import type { Product } from "@/lib/api"
import { toast } from "sonner"

function AnnouncementBar() {
  return (
    <div className="bg-neutral-900 text-white py-1.5 overflow-hidden relative border-b border-white/5">
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, "-50%"] }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-12 items-center px-4"
        >
          {/* Content duplicated for seamless loop */}
          {[1, 2].map((group) => (
            <div key={group} className="flex gap-12 items-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 opacity-80">
                <Sparkles className="w-2.5 h-2.5 text-primary" /> Free shipping on orders above ₹999
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 opacity-80">
                <Sparkles className="w-2.5 h-2.5 text-primary" /> New Collection: Summer Blue is out now!
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 opacity-80">
                <Sparkles className="w-2.5 h-2.5 text-primary" /> Use code BLUE10 for 10% off
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

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
  const pathname = usePathname()
  const user = useUser()
  const stackApp = useStackApp()
  const { itemCount } = useCart()

  const { scrollY } = useScroll()
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
  )
  const borderOpacity = useTransform(scrollY, [0, 50], [0, 1])
  const yOffset = useTransform(scrollY, [0, 50], [0, -4])

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

  const navLinks = useMemo(() => [
    { name: "Shop", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
    { name: "Corporate", href: "/corporate-gifting" },
    { name: "Contact", href: "/contact" }
  ], [])

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full"
    >
      <AnnouncementBar />
      <motion.nav 
        style={{ 
          backgroundColor,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid rgba(0, 0, 0, ${borderOpacity.get() * 0.05})`
        }}
        className="w-full transition-all duration-300 shadow-sm overflow-hidden"
      >
      <div className="max-w-[1920px] w-full mx-auto flex justify-between items-center py-4 md:py-5 px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-8">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden cursor-pointer bg-transparent border-none text-foreground p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Logo */}
          <Link href="/" className="relative group">
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-foreground flex items-center gap-2">
              ALL BLUE
              <motion.div 
                className="w-1.5 h-1.5 bg-primary rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-1 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="group relative px-4 py-2"
                >
                  <span className={`relative z-10 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${isActive ? "text-primary" : "text-neutral-500 group-hover:text-primary"}`}>
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-1 left-4 right-4 h-[2px] bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3 md:gap-4 items-center">
          <Link href="/gift-finder" className="hidden lg:flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-primary transition-all hover:shadow-lg hover:shadow-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            AI Finder
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-4 h-4 text-neutral-500" />
            </motion.button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div 
                   initial={{ opacity: 0, y: 15, scale: 0.98 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 15, scale: 0.98 }}
                   className="absolute top-14 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 w-[90vw] md:w-[600px] lg:w-[800px] bg-white border border-neutral-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] z-50 rounded-[2rem] overflow-hidden p-2"
                >
                  <form onSubmit={handleSearchSubmit} className="flex items-center bg-neutral-50 rounded-2xl px-5 border border-neutral-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      placeholder="What are you looking for?"
                      className="flex-1 py-5 px-4 outline-none text-sm bg-transparent font-medium"
                    />
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={startVoiceSearch} className="p-2 hover:bg-white rounded-lg transition-all group/voice">
                        <Mic className={`w-4 h-4 ${isListening ? "text-primary animate-pulse" : "text-neutral-400 group-hover/voice:text-neutral-600"}`} />
                      </button>
                      <button type="button" onClick={() => setSearchOpen(false)} className="p-2 hover:bg-white rounded-lg transition-all">
                        <X className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                  </form>
                  {searchLoading && (
                    <div className="px-6 py-8 text-center">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Curating results...</p>
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="p-2">
                      <div className="px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Featured Discoveries</p>
                      </div>
                      <div className="space-y-1">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/shop/${product.id}`}
                            className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-2xl transition-all group/item"
                            onClick={() => { setSearchOpen(false); setSearchResults([]) }}
                          >
                            <div className="w-14 h-14 bg-neutral-100 rounded-xl shrink-0 overflow-hidden border border-neutral-100 p-2 group-hover/item:scale-105 transition-transform">
                              {product.images?.[0] && (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-foreground group-hover/item:text-primary transition-colors">{product.name}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-1">{product.category}</div>
                            </div>
                            <div className="text-sm font-black text-neutral-900">₹{product.price.toLocaleString("en-IN")}</div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        className="flex items-center justify-center gap-2 w-full py-4 mt-2 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                        onClick={() => setSearchOpen(false)}
                      >
                        Explore all matches <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                  {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="px-5 py-12 text-center">
                      <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-neutral-200" />
                      </div>
                      <p className="text-sm font-bold text-neutral-900">No matches found</p>
                      <p className="text-xs text-neutral-400 mt-1">Try different keywords or browse collections</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div ref={userMenuRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100 text-foreground"
              onClick={() => {
                if (!user) router.push("/sign-in")
                else setUserMenuOpen(!userMenuOpen)
              }}
            >
              <User className="w-4 h-4 text-neutral-500" />
            </motion.button>
            <AnimatePresence>
              {userMenuOpen && user && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.98 }}
                  className="absolute top-14 right-0 w-72 bg-white border border-neutral-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] z-50 rounded-[2rem] overflow-hidden p-2"
                >
                  <div className="px-5 py-5 bg-neutral-900 rounded-[1.5rem] mb-2 text-white">
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/80 mb-1">Store Member</div>
                    <div className="text-sm font-bold truncate">{user.primaryEmail}</div>
                  </div>
                  <div className="p-1">
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-neutral-50 rounded-xl transition-all group/link">
                      <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover/link:bg-white transition-colors">
                        <User className="w-3.5 h-3.5 text-neutral-400 group-hover/link:text-primary" />
                      </div>
                      Profile Settings
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-neutral-50 rounded-xl transition-all group/link">
                      <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover/link:bg-white transition-colors">
                        <Package className="w-3.5 h-3.5 text-neutral-400 group-hover/link:text-primary" />
                      </div>
                      Order History
                    </Link>
                    {user?.clientMetadata?.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all group/link text-primary">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/link:bg-primary/20 transition-colors">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                        </div>
                        Admin Dashboard
                      </Link>
                    )}
                  </div>
                  <button onClick={handleSignOut} className="w-full flex items-center gap-4 px-5 py-4 mt-1 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 hover:bg-primary transition-all text-white shadow-lg shadow-black/10">
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </motion.div>
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
                          <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Store Member</p>
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
      </motion.nav>
    </motion.header>
  )
}
