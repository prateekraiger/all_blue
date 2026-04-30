"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { useRef } from "react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="w-full relative overflow-hidden bg-white"
    >
      {/* Full-bleed hero image — edge-to-edge, no border radius */}
      <div className="relative w-full h-[75vh] min-h-[600px] md:h-[90vh] lg:h-[95vh]">
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src="/images/hero.png"
            alt="Hero — curated luxury gifts collection"
            fill
            priority
            className="object-cover scale-105"
            sizes="100vw"
          />
        </motion.div>

        {/* Dark gradient scrim for text readability */}
        <div className="absolute inset-0 nike-hero-scrim" />

        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute top-24 right-4 md:right-12 z-20 hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-white text-[12px] font-medium tracking-wide uppercase">
            Limited Edition 2026
          </span>
        </motion.div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-12 pb-16 md:pb-24 lg:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.p
                className="text-white/70 text-[14px] md:text-[16px] font-medium mb-4 md:mb-6 uppercase tracking-[0.2em]"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Spring Summer 2026
              </motion.p>

              <motion.h1 className="nike-display text-white text-[56px] sm:text-[72px] md:text-[96px] lg:text-[120px] mb-6 md:mb-8 max-w-5xl leading-[0.85] tracking-tighter">
                THE ART OF
                <br />
                <span className="text-white/40">PERFECT</span> GIFTING
              </motion.h1>

              <motion.p
                className="text-white/80 text-[18px] md:text-[20px] font-normal mb-10 md:mb-12 max-w-xl leading-relaxed"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Curated elegance for every occasion. Experience the next
                generation of personalized luxury.
              </motion.p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="nike-btn-primary-inverted text-[16px] px-10 py-4 min-w-[180px]"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/gift-finder"
                  className="nike-btn-secondary text-[16px] px-10 py-4 text-white border-white/30 hover:bg-white/10 hover:border-white/60 min-w-[180px] backdrop-blur-sm"
                >
                  AI Gift Finder
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-[10px] uppercase tracking-widest font-medium">
            Scroll
          </span>
          <ArrowDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </div>
    </section>
  );
}
