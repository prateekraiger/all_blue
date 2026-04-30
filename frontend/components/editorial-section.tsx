"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function EditorialSection() {
  return (
    <section className="w-full relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
        alt="Luxury lifestyle"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="nike-display text-white text-[40px] sm:text-[60px] md:text-[80px] lg:text-[100px] leading-[0.9] mb-8">
            BEYOND <br />
            ORDINARY <br />
            <span className="text-white/40 italic">GIFTING</span>
          </h2>
          <p className="text-white/90 text-[16px] md:text-[20px] max-w-2xl mx-auto font-normal leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            We believe that every gift should be a story. A moment captured in time, 
            wrapped in elegance, and delivered with passion.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
