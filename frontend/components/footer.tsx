"use client"

import Link from "next/link"
import { ArrowUp } from "lucide-react"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="w-full bg-[#FAFAFA] text-[#111111]">
      {/* Main Footer */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 pt-16 md:pt-20 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8 mb-16">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <img
                src="/logo.png"
                alt="ALL BLUE"
                className="h-6 w-auto object-contain"
              />
              <span className="text-[16px] font-medium tracking-tight uppercase text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                ALL BLUE
              </span>
            </Link>
            <p className="text-[14px] text-black/60 leading-relaxed max-w-xs" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Curating high-end gifting experiences that transcend the ordinary.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h4 className="text-[14px] font-medium text-[#111111] uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Shop</h4>
            <ul className="space-y-3">
              {['All Products', 'For Him', 'For Her', 'Business', 'Custom Orders'].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-[14px] text-black/60 hover:text-[#111111] transition-colors duration-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="text-[14px] font-medium text-[#111111] uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Corporate Gifting', href: '/corporate-gifting' },
                { label: 'Contact', href: '/contact' },
                { label: 'Careers', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[14px] text-black/60 hover:text-[#111111] transition-colors duration-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-6">
            <h4 className="text-[14px] font-medium text-[#111111] uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Help</h4>
            <ul className="space-y-3">
              {['Track Order', 'Returns', 'Shipping', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[14px] text-black/60 hover:text-[#111111] transition-colors duration-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Back to Top - Removed from grid, moving to bottom bar */}
        </div>

        {/* Bottom Bar — divider with 1px inset */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-t border-black/10">
          <p className="text-[12px] text-black/60" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            &copy; {new Date().getFullYear()} ALL BLUE INTERIORS. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {['Terms', 'Privacy', 'Cookies'].map((item) => (
                <Link key={item} href="#" className="text-[12px] text-black/60 hover:text-[#111111] transition-colors duration-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  {item}
                </Link>
              ))}
            </div>
            
            <button
              onClick={scrollToTop}
              className="group w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/5 border border-black/10 hover:bg-black/10 flex items-center justify-center transition-all duration-300 ml-0 md:ml-4"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4 md:w-5 md:h-5 text-black/50 group-hover:text-black transition-colors duration-300" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
