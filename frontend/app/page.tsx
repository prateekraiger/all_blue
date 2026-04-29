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
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [aiProducts, setAiProducts] = useState<Product[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)

  // Fetch trending products
  useEffect(() => {
    productsApi.trending(8).then((products) => {
      setTrendingProducts(products)
    }).catch(() => {}).finally(() => setTrendingLoading(false))
  }, [])

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
    <div className="flex flex-col gap-32 md:gap-48 overflow-x-hidden">
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

      {/* Trending Products */}
      <ProductGrid
        title="Trending Now"
        products={trendingProducts}
        loading={trendingLoading}
        showViewAll={true}
      />

      <Collections />
      
      <div className="pb-32">
        <Newsletter />
      </div>
      

    </div>
  )
}
