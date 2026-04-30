"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

/**
 * Lightweight page transition — uses only opacity + translateY (GPU-composited).
 * Blur filters are intentionally removed to avoid layout thrashing on mid-range devices.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
