"use client"

import { Gift } from "lucide-react"
import { NavbarSimple } from "@/components/Navbar-simple"

function AnnouncementBar() {
  return (
    <div className="bg-[#111111] text-white py-2 overflow-hidden relative">
      <div className="flex whitespace-nowrap overflow-x-hidden">
        <div className="flex gap-12 items-center px-4 animate-marquee">
          {[1, 2].map((group) => (
            <div key={group} className="flex gap-12 items-center">
              <span className="text-[12px] font-medium flex items-center gap-2 whitespace-nowrap" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Free shipping above ₹999
              </span>
              <span className="text-[12px] font-medium flex items-center gap-2 whitespace-nowrap" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                New: Summer Collection 2026
              </span>
              <span className="text-[12px] font-medium flex items-center gap-2 whitespace-nowrap" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Code: BLUE10 — 10% Off First Order
              </span>
              <span className="text-[12px] font-medium flex items-center gap-2 whitespace-nowrap" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Members Get Early Access
              </span>
            </div>
          ))}
        </div>
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
