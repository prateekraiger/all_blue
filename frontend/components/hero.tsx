"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { useRef } from "react";
import { InteractiveHero } from "@/components/ui/interactive-hero-backgrounds";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 200]);
  const y2 = useTransform(scrollY, [0, 800], [0, -100]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <InteractiveHero 
      className="bg-white text-[#111111] selection:bg-black selection:text-white h-[100svh]"
      ballpitConfig={{
        count: 120,
        minSize: 0.4,
        maxSize: 1.0,
        gravity: 0.15,
        friction: 0.99,
        wallBounce: 0.5,
      }}
    >
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
      {/* Dynamic 2D/3D Background Elements using CSS and Framer Motion */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft elegant gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-gray-200/50 to-transparent blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-gradient-to-tl from-gray-300/40 to-transparent blur-[120px]" />

        {/* Abstract floating shapes for that "sexy" premium vibe */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[15%] w-64 h-64 border-[1px] border-black/5 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] left-[10%] w-96 h-96 border-[1px] border-black/5 rounded-full"
        />
      </div>

      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-transparent pointer-events-none" />

      {/* Massive Background Typography */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute top-[15%] w-full text-center z-20 select-none pointer-events-none mix-blend-multiply"
      >
        <h1
          className="text-[18vw] leading-[0.8] tracking-tighter text-[#003366]/10 font-serif italic whitespace-nowrap"
          style={{ fontFamily: '"Playfair Display", "Times New Roman", Times, serif' }}
        >
          ALL BLUE
        </h1>
      </motion.div>

      {/* Foreground Content */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-16 px-6 md:px-12 flex flex-col items-center text-center max-w-[1920px] mx-auto w-full gap-8 pointer-events-none">
        <motion.div
          style={{ y: y2 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-black/50 text-[11px] uppercase tracking-[0.4em] font-medium" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              The Luxury Experience
            </span>
          </div>

          <h2
            className="text-[48px] sm:text-[64px] md:text-[80px] leading-[1] tracking-tight mb-6 font-serif text-[#111111]"
            style={{ fontFamily: '"Playfair Display", "Times New Roman", Times, serif' }}
          >
            Curated <i className="italic text-black/70">Elegance.</i>
          </h2>

          <p className="text-black/60 text-[16px] md:text-[18px] max-w-lg font-light leading-relaxed mb-10" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Elevating the art of gifting through immersive design and AI curation.
            Discover a collection tailored to sophistication.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pointer-events-auto">
            <Link
              href="/shop"
              className="bg-[#111111] text-white font-medium text-[13px] uppercase tracking-widest px-10 py-5 hover:bg-black transition-transform hover:scale-105 active:scale-95 duration-300 shadow-xl shadow-black/10"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              Shop Collection
            </Link>
            <Link
              href="/gift-finder"
              className="bg-white text-[#111111] border border-black/10 font-medium text-[13px] uppercase tracking-widest px-10 py-5 hover:bg-gray-50 hover:border-black/20 transition-all flex items-center gap-3 shadow-lg shadow-black/5"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              <Sparkles className="w-4 h-4" /> AI Finder
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
      >
        <ArrowDown className="w-4 h-4 text-black/30" />
      </motion.div>
    </InteractiveHero>
  );
}
