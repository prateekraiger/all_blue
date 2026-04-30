"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, User, Menu, X, LogOut, Package, LayoutDashboard, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, useStackApp } from "@stackframe/stack"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"

const navLinks = [
  { name: "New & Featured", href: "/shop" },
  { name: "Collections", href: "/collections" },
  { name: "Gift Finder", href: "/gift-finder" },
  { name: "Corporate", href: "/corporate-gifting" },
  { name: "About", href: "/about" },
]

export function NavbarSimple() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const user = useUser()
  const stackApp = useStackApp()
  const { itemCount } = useCart()

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
    <nav className="sticky top-0 z-50 w-full bg-white" style={{ boxShadow: '0px -1px 0px 0px #E5E5E5 inset' }}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-[60px]">
          {/* Logo — Left */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="ALL BLUE"
                className="h-6 w-auto object-contain"
              />
              <span className="text-[16px] font-medium tracking-tight text-[#111111] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                ALL BLUE
              </span>
            </Link>
          </div>

          {/* Desktop Navigation — Center */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[16px] font-medium transition-colors duration-200 ${
                    isActive ? "text-[#111111]" : "text-[#111111] hover:text-[#707072]"
                  }`}
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search icon */}
            <Link href="/search" className="p-2 text-[#111111] hover:text-[#707072] transition-colors">
              <Search className="w-6 h-6" strokeWidth={1.5} />
            </Link>

            {/* Favorites */}
            <button className="p-2 text-[#111111] hover:text-[#707072] transition-colors hidden sm:block">
              <Heart className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-[#111111] hover:text-[#707072] transition-colors">
              <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#111111] text-white text-[10px] font-medium min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <Link href="/profile" className="p-2 text-[#111111] hover:text-[#707072] transition-colors hidden sm:block">
                <User className="w-6 h-6" strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="hidden sm:flex items-center gap-2 px-5 py-2 bg-[#111111] text-white text-[14px] font-medium rounded-full hover:bg-[#707072] transition-colors duration-200"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#111111] hover:text-[#707072] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu — full screen overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 z-[40] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[50] lg:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-[60px]" style={{ boxShadow: '0px -1px 0px 0px #E5E5E5 inset' }}>
                <span className="text-[16px] font-medium text-[#111111] uppercase">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#111111] hover:text-[#707072] transition-colors"
                >
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-0">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block py-4 text-[24px] font-medium transition-colors ${
                          isActive ? "text-[#111111]" : "text-[#111111] hover:text-[#707072]"
                        }`}
                        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', borderBottom: '1px solid #E5E5E5' }}
                      >
                        {link.name}
                      </Link>
                    )
                  })}
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 text-[24px] font-medium text-[#111111] hover:text-[#707072] transition-colors"
                    style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', borderBottom: '1px solid #E5E5E5' }}
                  >
                    Contact
                  </Link>
                </div>

                {/* User Section */}
                <div className="mt-8 space-y-3">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="nike-btn-secondary w-full text-[14px]"
                      >
                        <User className="w-5 h-5" />
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="nike-btn-secondary w-full text-[14px]"
                      >
                        <Package className="w-5 h-5" />
                        Orders
                      </Link>
                      {user?.clientMetadata?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="nike-btn-secondary w-full text-[14px]"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="nike-btn-secondary w-full text-[14px] text-[#D30005] border-[#D30005]/30 hover:bg-[#D30005]/5"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="nike-btn-primary w-full text-[14px]"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
