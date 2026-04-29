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
      <div className="flex whitespace-nowrap overflow-x-hidden">
        <motion.div 
          animate={{ x: [0, "-50%"] }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-8 sm:gap-12 items-center px-2 sm:px-4"
        >
          {/* Content duplicated for seamless loop */}
          {[1, 2].map((group) => (
            <div key={group} className="flex gap-8 sm:gap-12 items-center">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-1 sm:gap-2 opacity-80 whitespace-nowrap">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary flex-shrink-0" /> 
                <span className="truncate">Free shipping above ₹999</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-1 sm:gap-2 opacity-80 whitespace-nowrap">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary flex-shrink-0" /> 
                <span className="truncate">New: Summer Blue</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-1 sm:gap-2 opacity-80 whitespace-nowrap">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary flex-shrink-0" /> 
                <span className="truncate">Code: BLUE10</span>
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

  // Close menus on outside click & body scroll lock
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

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [mobileMenuOpen])

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
      className="sticky top-0 z-[70] w-full"
    >
      <AnnouncementBar />
      <motion.nav 
        style={{ 
          backgroundColor,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid rgba(0, 0, 0, ${borderOpacity.get() * 0.05})`
        }}
        className="w-full transition-all duration-300 shadow-sm overflow-x-hidden"
      >
      <div className="max-w-[1920px] w-full mx-auto flex justify-between items-center py-2 md:py-4 px-2 md:px-6 lg:px-12 overflow-x-hidden">
        <div className="flex items-center gap-2 md:gap-6 min-w-0 flex-shrink-0">
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-50 hover:bg-neutral-100 transition-all border border-neutral-100 flex-shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu className="w-5 h-5 text-neutral-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          
          {/* Logo */}
          <Link href="/" className="relative group">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="ALL BLUE" 
                className="h-5 sm:h-6 md:h-7 lg:h-9 w-auto object-contain"
              />
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-tighter uppercase text-foreground">
                ALL BLUE
              </span>
            </div>
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

        <div className="flex gap-1 md:gap-3 items-center flex-shrink-0">
          <Link href="/gift-finder" className="hidden lg:flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-primary transition-all hover:shadow-lg hover:shadow-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            AI Finder
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100 flex-shrink-0"
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
                   className="absolute top-14 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 w-[95vw] md:w-[600px] lg:w-[800px] bg-white border border-neutral-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] z-50 rounded-[2.5rem] overflow-hidden p-2"
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
          <div 
            ref={userMenuRef} 
            className="relative"
            onMouseEnter={() => user && setUserMenuOpen(true)}
            onMouseLeave={() => setUserMenuOpen(false)}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100 text-foreground flex-shrink-0"
              onClick={() => {
                if (!user) {
                  router.push("/sign-in")
                } else {
                  router.push("/profile")
                  setUserMenuOpen(false)
                }
              }}
            >
              <User className="w-4 h-4 text-neutral-500" />
            </motion.button>
            <AnimatePresence>
              {userMenuOpen && user && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-14 right-0 w-80 bg-white/95 backdrop-blur-xl border border-neutral-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] z-50 rounded-[2.5rem] overflow-hidden p-3"
                >
                  <div className="px-6 py-6 bg-neutral-900 rounded-[2rem] mb-3 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary font-black text-xl border border-white/10">
                        {user.primaryEmail?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">Exclusive Member</div>
                        <div className="text-sm font-bold truncate opacity-90">{user.primaryEmail}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link 
                      href="/profile" 
                      onClick={() => setUserMenuOpen(false)} 
                      className="flex items-center justify-between px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] hover:bg-neutral-50 rounded-2xl transition-all group/link"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center group-hover/link:bg-white border border-transparent group-hover/link:border-neutral-100 transition-all">
                          <User className="w-4 h-4 text-neutral-400 group-hover/link:text-primary" />
                        </div>
                        <span>Personal Profile</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-200 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
                    </Link>

                    <Link 
                      href="/orders" 
                      onClick={() => setUserMenuOpen(false)} 
                      className="flex items-center justify-between px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] hover:bg-neutral-50 rounded-2xl transition-all group/link"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center group-hover/link:bg-white border border-transparent group-hover/link:border-neutral-100 transition-all">
                          <Package className="w-4 h-4 text-neutral-400 group-hover/link:text-primary" />
                        </div>
                        <span>Order Collections</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-200 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
                    </Link>

                    {user?.clientMetadata?.role === "admin" && (
                      <Link 
                        href="/admin" 
                        onClick={() => setUserMenuOpen(false)} 
                        className="flex items-center justify-between px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl transition-all group/link"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover/link:bg-white transition-all">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <span>Management Console</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-all" />
                      </Link>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <button 
                      onClick={handleSignOut} 
                      className="w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all group/logout"
                    >
                      <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                      Secure Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/cart" className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-900 hover:bg-primary transition-all text-white shadow-lg shadow-black/10 flex-shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] sm:text-[9px] font-black min-w-[14px] sm:min-w-[16px] h-[14px] sm:h-[16px] flex items-center justify-center rounded-full border-2 border-white">
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[320px] bg-white z-[50] md:hidden shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-8">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="relative group">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/logo.png" 
                      alt="ALL BLUE" 
                      className="h-6 w-auto object-contain"
                    />
                    <span className="text-lg font-black tracking-tighter uppercase text-foreground">
                      ALL BLUE
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-neutral-50 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-12">
                <div className="space-y-12">
                  {/* Navigation Links */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-6">Explore Store</p>
                    <div className="flex flex-col">
                      {navLinks.map((link, idx) => (
                        <motion.div
                          key={link.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                        >
                          <Link 
                            href={link.href} 
                            className="group flex items-center justify-between py-4 border-b border-neutral-100 text-3xl font-black uppercase tracking-tight hover:text-primary transition-all"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span>{link.name}</span>
                            <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Action */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link 
                      href="/gift-finder" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col gap-4 p-6 bg-neutral-900 rounded-[2.5rem] text-white relative overflow-hidden group shadow-xl shadow-neutral-200"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-16 -mt-16 group-hover:bg-primary/40 transition-colors" />
                      <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-1">AI Gift Finder</h3>
                        <p className="text-white/60 text-xs font-medium leading-relaxed">Let our AI curator find the perfect blue essential for your space.</p>
                      </div>
                      <div className="relative z-10 flex items-center justify-between mt-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Start Discovery</span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>

                  {/* Account Section */}
                  <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Account Access</p>
                    {user ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-5 bg-neutral-50 rounded-3xl border border-neutral-100">
                          <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                            {user.primaryEmail?.[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate">{user.primaryEmail}</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Verified Client</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 text-xs font-black uppercase tracking-widest hover:bg-neutral-50 rounded-2xl transition-all">
                            <span className="flex items-center gap-3"><User className="w-4 h-4 text-neutral-400" /> Settings</span>
                            <ArrowRight className="w-3 h-3 text-neutral-300" />
                          </Link>
                          <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 text-xs font-black uppercase tracking-widest hover:bg-neutral-50 rounded-2xl transition-all">
                            <span className="flex items-center gap-3"><Package className="w-4 h-4 text-neutral-400" /> Orders</span>
                            <ArrowRight className="w-3 h-3 text-neutral-300" />
                          </Link>
                          {user?.clientMetadata?.role === "admin" && (
                            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 text-xs font-black uppercase tracking-widest bg-primary/5 text-primary rounded-2xl transition-all">
                              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4" /> Dashboard</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          <button onClick={handleSignOut} className="flex items-center gap-3 p-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all mt-2">
                            <LogOut className="w-4 h-4" /> Terminate Session
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link 
                        href="/sign-in" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center w-full py-5 bg-neutral-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-neutral-200"
                      >
                        Sign In / Register
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-neutral-50 border-t border-neutral-100 mt-auto">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Link href="/privacy" className="text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary">Privacy</Link>
                    <Link href="/terms" className="text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary">Terms</Link>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-neutral-300">© 2026 AB CORP</div>
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
