"use client"

import dynamic from "next/dynamic"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { ExperienceSection } from "@/components/experience"

// ─── Lazy-loaded below-fold sections ────────────────────────────────────────
const Collections = dynamic(
  () => import("@/components/collections").then((m) => ({ default: m.Collections })),
  {
    loading: () => <div className="w-full h-[600px] bg-white" />,
    ssr: true,
  }
)

const Newsletter = dynamic(
  () => import("@/components/newsletter").then((m) => ({ default: m.Newsletter })),
  {
    loading: () => <div className="w-full h-[300px] bg-[#FAFAFA]" />,
    ssr: true,
  }
)

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden min-h-screen bg-white">
      <Hero />

      <ExperienceSection />

      <ProductGrid title="Featured Products" />

      <Collections />

      <Newsletter />
    </div>
  )
}
