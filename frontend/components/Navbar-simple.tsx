"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, User, Menu, X, LogOut, Package, LayoutDashboard, Gift } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, useStackApp } from "@stackframe/stack"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Collections", href: "/collections" },
  { name: "About", href: "/about" },
  { name: "Corporate", href: "/corporate-gifting" },
  { name: "Contact", href: "/contact" }
]

export function NavbarSimple() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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

  const handleSignOut = async () => {
    await stackApp.signOut()
    router.push("/")
    toast.success("Signed out successfully")
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 w-full bg-white border-b ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
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

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
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
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              <Gift className="w-4 h-4" />
              AI Finder
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">Profile</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Sign In</span>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-primary transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>
            
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-2 space-y-2">
                <Link
                  href="/gift-finder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  AI Gift Finder
                </Link>
                
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Orders
                    </Link>
                    {user?.clientMetadata?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
