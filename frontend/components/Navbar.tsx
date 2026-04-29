"use client"

import { Search, ShoppingBag, User, Menu, X, LogOut, Package, LayoutDashboard, Mic, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, useStackApp } from "@stackframe/stack"
import { useCart } from "@/context/CartContext"
import { searchApi } from "@/lib/api"
import type { Product } from "@/lib/api"
import { toast } from "sonner"

export function Navbar() {
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
    <header className="sticky top-0 z-[70] w-full bg-white/95 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm">
      {/* Desktop Navigation */}
      <nav className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="ALL BLUE" 
                  className="h-8 w-auto object-contain"
                />
                <span className="text-xl font-bold tracking-tighter uppercase text-gray-900">
                  ALL BLUE
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-8">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive ? "text-primary" : "text-gray-700"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* AI Finder */}
              <Link 
                href="/gift-finder" 
                className="hidden xl:flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
              >
                <img src="/logo.png" alt="" className="w-4 h-4 brightness-0 invert" />
                AI Finder
              </Link>

              {/* Search */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                    >
                      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchInput(e.target.value)}
                          placeholder="Search products..."
                          className="flex-1 outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={startVoiceSearch}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Mic className={`w-4 h-4 ${isListening ? "text-primary animate-pulse" : ""}`} />
                        </button>
                      </form>
                      
                      {searchLoading && (
                        <div className="py-4 text-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/shop/${product.id}`}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                              onClick={() => {
                                setSearchOpen(false)
                                setSearchResults([])
                              }}
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                                {product.images?.[0] && (
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                                <div className="text-xs text-gray-500">₹{product.price.toLocaleString("en-IN")}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => {
                    if (!user) {
                      router.push("/sign-in")
                    } else {
                      setUserMenuOpen(!userMenuOpen)
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {userMenuOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-12 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {user.primaryEmail?.[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate">{user.primaryEmail}</div>
                          <div className="text-xs text-gray-500">Premium Member</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Orders
                        </Link>
                        {user?.clientMetadata?.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="ALL BLUE" 
                  className="h-7 w-auto object-contain"
                />
                <span className="text-lg font-bold tracking-tighter uppercase text-gray-900">
                  ALL BLUE
                </span>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-3">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={startVoiceSearch}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Mic className={`w-4 h-4 ${isListening ? "text-primary animate-pulse" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
                
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => {
                          setSearchOpen(false)
                          setSearchResults([])
                        }}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-gray-500">₹{product.price.toLocaleString("en-IN")}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40] lg:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-sm bg-white z-[50] lg:hidden shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <img 
                    src="/logo.png" 
                    alt="ALL BLUE" 
                    className="h-6 w-auto object-contain"
                  />
                  <span className="text-lg font-bold tracking-tighter uppercase text-gray-900">
                    ALL BLUE
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Navigation Links */}
                <div className="space-y-1 mb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        pathname === link.href
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* AI Finder */}
                <Link
                  href="/gift-finder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 bg-primary text-white text-center font-medium rounded-lg hover:bg-primary/90 transition-colors mb-6"
                >
                  <div className="flex items-center justify-center gap-2">
                    <img src="/logo.png" alt="" className="w-4 h-4 brightness-0 invert" />
                    AI Gift Finder
                  </div>
                </Link>

                {/* User Section */}
                {user ? (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {user.primaryEmail?.[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate">{user.primaryEmail}</div>
                        <div className="text-xs text-gray-500">Premium Member</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Orders
                      </Link>
                      {user?.clientMetadata?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-6">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 bg-gray-900 text-white text-center font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
