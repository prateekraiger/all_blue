"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { useInView } from "@/hooks/useInView"

import { aiApi, type Product } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

// ─── Lazy-loaded below-fold sections ────────────────────────────────────────
const Collections = dynamic(
  () => import("@/components/collections").then((m) => ({ default: m.Collections })),
  {
    loading: () => (
      <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-[1920px] mx-auto">
          <div className="h-8 bg-[#F5F5F5] w-1/4 mb-10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 md:row-span-2 bg-[#F5F5F5] h-[400px] animate-pulse" />
            <div className="bg-[#F5F5F5] h-[300px] animate-pulse" />
            <div className="bg-[#F5F5F5] h-[300px] animate-pulse" />
          </div>
        </div>
      </section>
    ),
  },
)

const Newsletter = dynamic(
  () => import("@/components/newsletter").then((m) => ({ default: m.Newsletter })),
  {
    loading: () => <section className="w-full bg-[#111111] h-[300px]" />,
  },
)

export default function Home() {
  const { token, user } = useAuth()
  const [aiProducts, setAiProducts] = useState<Product[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  // Lazy-load triggers for below-fold sections
  const { ref: collectionsRef, inView: collectionsInView } = useInView({
    rootMargin: "400px",
    triggerOnce: true,
  })
  const { ref: newsletterRef, inView: newsletterInView } = useInView({
    rootMargin: "300px",
    triggerOnce: true,
  })

  // Fetch personalized AI recommendations when user is logged in
  useEffect(() => {
    if (!token) {
      setAiProducts([])
      return
    }
    setAiLoading(true)
    aiApi.recommendations(token, 8).then((products) => {
      setAiProducts(products)
    }).catch(() => {}).finally(() => setAiLoading(false))
  }, [token])

  return (
    <div className="flex flex-col overflow-x-hidden min-h-screen bg-white">
      <Hero />

      {/* AI Personalized Feed (for logged-in users) */}
      {user && (
        <ProductGrid
          title="Picked For You"
          products={aiProducts}
          loading={aiLoading}
          showViewAll={false}
        />
      )}

      <ProductGrid title="Featured Products" />

      {/* Lazy-loaded Collections */}
      <div ref={collectionsRef}>
        {collectionsInView ? <Collections /> : (
          <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-white">
            <div className="max-w-[1920px] mx-auto">
              <div className="h-8 bg-[#F5F5F5] w-1/4 mb-10 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 md:row-span-2 bg-[#F5F5F5] h-[400px] animate-pulse" />
                <div className="bg-[#F5F5F5] h-[300px] animate-pulse" />
                <div className="bg-[#F5F5F5] h-[300px] animate-pulse" />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Lazy-loaded Newsletter */}
      <div ref={newsletterRef}>
        {newsletterInView ? <Newsletter /> : (
          <section className="w-full bg-[#111111] h-[300px]" />
        )}
      </div>
    </div>
  )
}
