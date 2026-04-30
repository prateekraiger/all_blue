"use client"

import Link from "next/link"
import { ArrowUp } from "lucide-react"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="w-full bg-[#111111] text-white">
      {/* Main Footer */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 pt-16 md:pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <img
                src="/logo.png"
                alt="ALL BLUE"
                className="h-6 w-auto object-contain brightness-0 invert"
              />
              <span className="text-[16px] font-medium tracking-tight uppercase text-white" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                ALL BLUE
              </span>
            </Link>
            <p className="text-[14px] text-[#707072] leading-relaxed max-w-xs" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Curating high-end gifting experiences that transcend the ordinary.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[14px] font-medium text-white mb-6 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Shop</h4>
            <ul className="space-y-3">
              {['All Products', 'For Him', 'For Her', 'Business', 'Custom Orders'].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-[14px] text-[#707072] hover:text-white transition-colors duration-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[14px] font-medium text-white mb-6 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Corporate Gifting', href: '/corporate-gifting' },
                { label: 'Contact', href: '/contact' },
                { label: 'Careers', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[14px] text-[#707072] hover:text-white transition-colors duration-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[14px] font-medium text-white mb-6 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Help</h4>
            <ul className="space-y-3">
              {['Track Order', 'Returns', 'Shipping', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[14px] text-[#707072] hover:text-white transition-colors duration-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Back to Top */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 flex lg:flex-col items-center lg:items-end justify-center lg:justify-start">
            <button
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Bottom Bar — divider with 1px inset */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-[12px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            &copy; {new Date().getFullYear()} ALL BLUE INTERIORS. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <Link key={item} href="#" className="text-[12px] text-[#707072] hover:text-white transition-colors duration-200" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
