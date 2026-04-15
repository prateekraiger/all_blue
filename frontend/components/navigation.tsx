"use client"

import { Search, ShoppingBag, User, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="flex justify-between items-center py-4 md:py-6 lg:py-7 xl:py-8 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 border-b border-neutral-100 bg-white sticky top-0 z-50 w-full">
      <div className="max-w-[1920px] w-full mx-auto flex justify-between items-center">
        <div className="text-xl md:text-2xl lg:text-3xl xl:text-3xl font-extrabold tracking-tight uppercase">
          <Link href="/" className="text-foreground no-underline">
            ALL BLUE
          </Link>
        </div>

        <div className="hidden md:flex gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
          <Link
            href="/shop"
            className="text-foreground text-sm lg:text-base xl:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity"
          >
            Shop
          </Link>
          <Link
            href="/collections"
            className="text-foreground text-sm lg:text-base xl:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity"
          >
            Collections
          </Link>
          <Link
            href="/about"
            className="text-foreground text-sm lg:text-base xl:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-foreground text-sm lg:text-base xl:text-base font-normal uppercase tracking-widest hover:opacity-50 transition-opacity"
          >
            Contact
          </Link>
        </div>

        <div className="flex gap-4 md:gap-5 lg:gap-6 xl:gap-7 items-center">
          <button className="hidden md:block cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity">
            <Search className="w-5 h-5 lg:w-5 lg:h-5" />
          </button>
          <button className="hidden md:block cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity">
            <User className="w-5 h-5 lg:w-5 lg:h-5" />
          </button>
          <button className="cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity">
            <ShoppingBag className="w-5 h-5 lg:w-5 lg:h-5" />
          </button>
          <button
            className="md:hidden cursor-pointer bg-transparent border-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-100 py-6 px-4">
          <div className="flex flex-col gap-6">
            <Link
              href="/shop"
              className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/collections"
              className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>
            <Link
              href="/about"
              className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-foreground text-sm font-normal uppercase tracking-widest hover:opacity-50 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex gap-6 pt-4 border-t border-neutral-100">
              <button className="cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity">
                <Search className="w-5 h-5" />
              </button>
              <button className="cursor-pointer bg-transparent border-none hover:opacity-70 transition-opacity">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
