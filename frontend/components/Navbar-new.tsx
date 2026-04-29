"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, ShoppingBag, User, Menu, X, LogOut, Package, LayoutDashboard, Mic, Sparkles, ChevronDown, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, useStackApp } from "@stackframe/stack"
import { useCart } from "@/context/CartContext"
import { searchApi } from "@/lib/api"
import type { Product } from "@/lib/api"
import { toast } from "sonner"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavLinkItem {
  name: string
  path: string
  isDropdown?: boolean
}

const navLinks: NavLinkItem[] = [
  { name: 'Shop', path: '/shop' },
  { name: 'Collections', path: '/collections', isDropdown: true },
  { name: 'About', path: '/about' },
  { name: 'Corporate', path: '/corporate-gifting' },
  { name: 'Contact', path: '/contact' },
]

const categories = [
  { name: 'Wedding Gifts', slug: 'wedding-gifts', icon: Sparkles },
  { name: 'Corporate Gifts', slug: 'corporate-gifts', icon: Package },
  { name: 'Personal Gifts', slug: 'personal-gifts', icon: User },
  { name: 'Luxury Items', slug: 'luxury-items', icon: Sparkles },
  { name: 'Custom Gifts', slug: 'custom-gifts', icon: Package },
  { name: 'Seasonal', slug: 'seasonal', icon: Sparkles },
]

export function NavbarNew() {
  const [isScrolled, setIsScrolled] = useState(false)
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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full border-b ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-black/5 py-2 px-4 sm:px-6 shadow-sm'
            : 'bg-white border-transparent py-3 px-6 sm:px-8'
        }`}
      >
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          {/* Logo */}
          <Link
            href="/"
            className="inline-block transition-transform hover:scale-105"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/logo.png" 
                alt="ALL BLUE" 
                className="h-7 sm:h-8 md:h-9 w-auto object-contain"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tighter uppercase text-gray-900">
                ALL BLUE
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.map((link) => {
                  if (link.isDropdown) {
                    return (
                      <NavigationMenuItem key={link.name}>
                        <NavigationMenuTrigger
                          className={`
                            px-4 sm:px-6 py-2 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative group flex items-center gap-2 h-10
                            ${pathname.includes('/collections') ? 'text-primary' : 'text-foreground/60 hover:text-foreground'}
                          `}
                        >
                          {link.name}
                          <ChevronDown className="w-4 h-4 opacity-50" />
                          <span
                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-primary transition-all duration-500 ${
                              pathname.includes('/collections') ? 'w-6' : 'w-0 group-hover:w-6'
                            }`}
                          />
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-72 rounded-2xl border border-slate-200 shadow-2xl p-2 mt-2 bg-white/95 backdrop-blur-xl">
                            <NavigationMenuLink
                              href="/collections"
                              className="flex items-center gap-3 px-4 py-4 rounded-xl cursor-pointer font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-primary transition-colors mb-2 shadow-lg shadow-black/10"
                            >
                               <ShoppingBag className="w-4 h-4" />
                              Full Collections Catalog
                            </NavigationMenuLink>
                            <div className="border-t border-slate-100 my-2" />
                            <div className="px-3 py-1 text-[9px] font-black text-black/30 uppercase tracking-[0.3em]">
                              Categories
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {categories.slice(0, 6).map((cat) => (
                                <NavigationMenuLink
                                  key={cat.slug}
                                  href={`/collections/${cat.slug}`}
                                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer font-bold text-[10px] uppercase tracking-wider text-slate-500 hover:text-black hover:bg-slate-50 focus:bg-slate-50 transition-colors"
                                >
                                  <cat.icon className="w-4 h-4 opacity-40" />
                                  {cat.name}
                                </NavigationMenuLink>
                              ))}
                            </div>
                            <div className="border-t border-slate-100 my-2" />
                            <NavigationMenuLink
                              href="/collections"
                              className="flex items-center justify-center p-2 rounded-xl cursor-pointer font-black text-[9px] uppercase tracking-[0.2em] text-primary hover:bg-primary/5 focus:bg-primary/5"
                            >
                              View Full Category Catalog
                            </NavigationMenuLink>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )
                  }
                  return (
                    <NavigationMenuItem key={link.name}>
                      <NavigationMenuLink
                        href={link.path}
                        className={`
                          px-4 sm:px-6 py-2 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative group h-10 flex items-center
                          ${pathname === link.path ? 'text-primary' : 'text-foreground/60 hover:text-foreground'}
                        `}
                      >
                        {link.name}
                        <span
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-primary transition-all duration-500 ${
                            pathname === link.path ? 'w-6' : 'w-0 group-hover:w-6'
                          }`}
                        />
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* AI Finder */}
            <Link
              href="/gift-finder"
              className="hidden xl:flex items-center gap-2 px-3 py-2 bg-primary text-white text-xs sm:text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              AI Finder
            </Link>

            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-50"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
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
                              <div className="text-xs text-gray-500">Rs. {product.price.toLocaleString("en-IN")}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
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

            {/* Auth section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-2 h-11 px-4 bg-black/5 hover:bg-black/10 border border-black/5 text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95">
                    <div className="w-5 h-5 rounded bg-black flex items-center justify-center text-white text-[9px] font-black">
                      {user.primaryEmail?.[0].toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate">{user.primaryEmail?.split('@')[0]}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl border border-slate-200 shadow-lg p-1 mt-2">
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="font-black text-xs text-black">{user.primaryEmail}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">Premium Member</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />

                  {user?.clientMetadata?.role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer font-black text-xs text-primary hover:bg-primary/5 focus:bg-primary/5"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer font-black text-xs hover:bg-slate-50 focus:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push('/orders')}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer font-black text-xs hover:bg-slate-50 focus:bg-slate-50"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    Orders
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-100" />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer font-black text-xs text-red-500 hover:bg-red-50 focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                className="hidden sm:block h-11 px-6 bg-black hover:bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all duration-500 hover:scale-[1.02] active:scale-95"
                onClick={() => router.push('/sign-in')}
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-black/5 border border-black/5 text-foreground transition-all active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop background blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] lg:hidden bg-white/80 backdrop-blur-2xl"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Content slide */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 top-0 h-full bg-white flex flex-col p-6 sm:p-12 pt-24 z-[70] lg:hidden"
            >
              {/* Close trigger in top corner */}
              <div className="absolute top-6 right-6">
                <button
                  className="h-11 w-11 rounded-2xl bg-black/5 border border-black/5 text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-2 sm:space-y-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">
                  Navigation
                </p>
                {navLinks.map((link, i) => {
                  if (link.isDropdown) {
                    return (
                      <div key={link.name} className="flex flex-col space-y-4">
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            router.push(link.path)
                          }}
                          className={`group flex items-baseline gap-4 transition-all duration-700 ${
                            pathname.includes('/collections') ? "translate-x-4" : "hover:translate-x-4"
                          }`}
                          style={{
                            transitionDelay: `${i * 100}ms`,
                          }}
                        >
                          <span className="text-primary font-black text-xs sm:text-sm italic pr-2 opacity-30 select-none">
                            0{i + 1}
                          </span>
                          <span
                            className={`text-3xl sm:text-5xl font-black tracking-tighter ${
                              pathname.includes('/collections') ? "text-primary" : "text-black"
                            }`}
                          >
                            {link.name}
                          </span>
                        </button>

                        <div className="grid grid-cols-2 gap-2 pl-12 pb-4">
                          {/* Catalog Link */}
                          <button
                            onClick={() => {
                              setMobileMenuOpen(false)
                              router.push('/collections')
                            }}
                            className="col-span-2 flex items-center justify-between py-4 px-5 rounded-2xl bg-black text-white hover:bg-primary transition-all group/cat mb-1"
                          >
                            <div className="flex items-center gap-3">
                              <ShoppingBag className="w-4 h-4 text-white/50 group-hover/cat:text-white" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">Collections</span>
                            </div>
                            <ArrowRight className="w-4 h-4 opacity-30 group-hover/cat:opacity-100 group-hover/cat:translate-x-1 transition-all" />
                          </button>

                          <div className="col-span-2 text-[9px] font-black text-black/20 uppercase tracking-[0.2em] py-2">
                            Categories
                          </div>

                          {categories.slice(0, 4).map((cat) => (
                            <button
                              key={cat.slug}
                              onClick={() => {
                                setMobileMenuOpen(false)
                                router.push(`/collections/${cat.slug}`)
                              }}
                              className="flex flex-col items-start gap-1 py-3 px-4 rounded-2xl bg-black/5 hover:bg-primary/5 transition-colors group/cat"
                            >
                              <cat.icon className="w-4 h-4 text-black/40 group-hover/cat:text-primary transition-colors" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-black/60 truncate w-full text-left">{cat.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <button
                      key={link.name}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        router.push(link.path)
                      }}
                      className={`group flex items-baseline gap-4 transition-all duration-700 ${
                        pathname === link.path ? "translate-x-4" : "hover:translate-x-4"
                      }`}
                      style={{
                        transitionDelay: `${i * 100}ms`,
                      }}
                    >
                      <span className="text-primary font-black text-xs sm:text-sm italic pr-2 opacity-30 select-none">
                        0{i + 1}
                      </span>
                      <span
                        className={`text-3xl sm:text-5xl font-black tracking-tighter ${
                          pathname === link.path ? "text-primary" : "text-black"
                        }`}
                      >
                        {link.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="pt-10 border-t border-black/5 space-y-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-black/5">
                      <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white font-black text-xl">
                        {user.primaryEmail?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-black truncate">{user.primaryEmail}</h4>
                        <p className="text-xs text-black/40 font-bold uppercase tracking-widest truncate">Premium Member</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {user?.clientMetadata?.role === "admin" && (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            router.push('/admin')
                          }}
                          className="h-14 bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          router.push('/profile')
                        }}
                        className="h-14 bg-black/5 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          router.push('/orders')
                        }}
                        className="h-14 bg-black/5 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" /> Orders
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="h-14 border border-red-200 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      router.push('/sign-in')
                    }}
                    className="w-full h-16 sm:h-20 bg-black text-white font-black text-xl uppercase tracking-widest rounded-[2rem] hover:bg-primary transition-colors active:scale-95 duration-500 flex items-center justify-center gap-3"
                  >
                    Sign In
                    <ArrowRight className="w-6 h-6" />
                  </button>
                )}

                <div className="flex justify-between items-center px-4 pt-4">
                  <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} ALL BLUE</p>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-black/40 uppercase tracking-[0.2em]">Service Online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
