import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { Collections } from "@/components/collections"
import { Newsletter } from "@/components/newsletter"

export default function Home() {
  return (
    <>
      <div className="max-w-[1200px] mx-auto">
        <Hero />
        <ProductGrid />
        <Collections />
      </div>

      <Newsletter />
    </>
  )
}
