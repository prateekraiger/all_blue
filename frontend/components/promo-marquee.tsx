"use client";

import { motion } from "framer-motion";

const promoItems = [
  "Free shipping above ₹999",
  "New: Summer Collection 2026",
  "Code: BLUE10 — 10% Off First Order",
  "Members Get Early Access",
];

export function PromoMarquee() {
  return (
    <div className="w-full bg-[#111111] py-2.5 overflow-hidden border-b border-white/10 relative">
      {/* Subtle glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-[#111111] z-10 pointer-events-none w-20 md:w-40" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#111111] via-transparent to-[#111111] z-10 pointer-events-none w-20 md:w-40 right-0 left-auto" />

      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
          className="flex gap-12 items-center"
        >
          {[...promoItems, ...promoItems, ...promoItems, ...promoItems].map(
            (item, index) => (
              <div key={index} className="flex items-center gap-12">
                <span className="text-white text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] hover:text-white/70 transition-colors cursor-default">
                  {item}
                </span>
                <span className="text-white/20 text-[10px]">✦</span>
              </div>
            ),
          )}
        </motion.div>
      </div>
    </div>
  );
}
