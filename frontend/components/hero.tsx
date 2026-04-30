"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="w-full relative overflow-hidden bg-white">
      {/* Full-bleed hero image — edge-to-edge, no border radius */}
      <div className="relative w-full h-[70vh] min-h-[500px] md:h-[85vh] lg:h-[90vh]">
        <Image
          src="/images/hero.png"
          alt="Hero — curated luxury gifts collection"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark gradient scrim for text readability */}
        <div className="absolute inset-0 nike-hero-scrim" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-12 pb-12 md:pb-16 lg:pb-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white/70 text-[12px] md:text-[14px] font-medium mb-3 md:mb-4 uppercase tracking-wider"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              Spring Summer 2026
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="nike-display text-white text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] mb-4 md:mb-6 max-w-4xl"
            >
              THE ART OF
              <br />
              PERFECT GIFTING
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white/80 text-[16px] md:text-[18px] font-normal mb-8 md:mb-10 max-w-lg leading-relaxed"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              Curated elegance for every occasion. Experience the next generation of personalized luxury.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/shop"
                className="nike-btn-primary-inverted text-[16px] px-8 py-3"
              >
                Shop Collection
              </Link>
              <Link
                href="/gift-finder"
                className="nike-btn-secondary text-[16px] px-8 py-3 text-white border-white/40 hover:bg-white/10 hover:border-white/70"
              >
                AI Gift Finder
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
