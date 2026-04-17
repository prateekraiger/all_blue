"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, ArrowUp } from "lucide-react"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="w-full bg-black text-white pt-24 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-4">
            <Link href="/" className="text-3xl md:text-4xl font-black mb-8 block tracking-tighter uppercase whitespace-nowrap">
              ALL <span className="text-primary">BLUE</span>
            </Link>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-sm mb-10">
              Curating high-end gifting experiences that transcend the ordinary. Craftsmanship, elegance, and pure emotion in every piece.
            </p>
            <div className="flex gap-6">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <Link key={i} href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-neutral-500">Shop</h4>
            <ul className="space-y-4">
              {['All Products', 'For Him', 'For Her', 'Business', 'Custom Orders'].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-neutral-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-neutral-500">The Brand</h4>
            <ul className="space-y-4">
              {['Our Origin', 'Sustainability', 'Editorial', 'Partnerships'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-neutral-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-neutral-500">Concierge</h4>
            <ul className="space-y-4">
              {['Gifting Advice', 'Track Order', 'Returns', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-neutral-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 flex flex-col items-start lg:items-end">
             <button 
                onClick={scrollToTop}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
             >
                <ArrowUp className="w-6 h-6 text-white" />
             </button>
             <span className="text-[10px] uppercase font-black tracking-widest mt-4 text-neutral-500 text-center">Back to Top</span>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} <span className="text-white font-bold">ALL BLUE INTERIORS</span>. All Rights Reserved.
          </p>
          <div className="flex gap-12 text-sm font-bold text-neutral-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
