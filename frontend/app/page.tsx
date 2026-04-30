"use client"

import { useEffect, useState } from "react"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { Collections } from "@/components/collections"
import { Newsletter } from "@/components/newsletter"

import { productsApi, aiApi, type Product } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function Home() {
  const { token, user } = useAuth()
  const [aiProducts, setAiProducts] = useState<Product[]>([])
  const [aiLoading, setAiLoading] = useState(false)

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

      <Collections />

      <Newsletter />
    </div>
  )
}
