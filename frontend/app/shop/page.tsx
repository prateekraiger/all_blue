import { ProductGrid } from "@/components/product-grid"

export default function ShopPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-12">
      <h1 className="text-3xl font-extrabold tracking-tight uppercase px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mb-8">All Products</h1>
      <ProductGrid />
    </div>
  )
}
