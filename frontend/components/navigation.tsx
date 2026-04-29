"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { NavbarSimple } from "@/components/Navbar-simple"

function AnnouncementBar() {
  return (
    <div className="bg-neutral-900 text-white py-2 overflow-hidden relative border-b border-white/5">
      <div className="flex whitespace-nowrap overflow-x-hidden">
        <motion.div 
          animate={{ x: [0, "-50%"] }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-8 sm:gap-12 items-center px-2 sm:px-4"
        >
          {[1, 2].map((group) => (
            <div key={group} className="flex gap-8 sm:gap-12 items-center">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-1 sm:gap-2 opacity-80 whitespace-nowrap">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary flex-shrink-0" /> 
                <span className="truncate">Free shipping above ₹999</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-1 sm:gap-2 opacity-80 whitespace-nowrap">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary flex-shrink-0" /> 
                <span className="truncate">New: Summer Blue</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] flex items-center gap-1 sm:gap-2 opacity-80 whitespace-nowrap">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary flex-shrink-0" /> 
                <span className="truncate">Code: BLUE10</span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export function Navigation() {
  return (
    <>
      <AnnouncementBar />
      <NavbarSimple />
    </>
  )
}
