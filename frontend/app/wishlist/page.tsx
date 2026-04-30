"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Search, ShoppingBag, Trash2 } from "lucide-react"
import { productsApi, type Product } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import { toast } from "sonner"
import { getLikedProductIds, toggleLikedProduct, wishlistUpdatedEventName } from "@/lib/wishlist"

export default function WishlistPage() {
  const [likedProducts, setLikedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  const loadLikedProducts = async () => {
    try {
      setLoading(true)
      const ids = getLikedProductIds()

      if (ids.length === 0) {
        setLikedProducts([])
        return
      }

      const products = await Promise.all(
        ids.map(async (id) => {
          try {
            return await productsApi.get(id)
          } catch {
            return null
          }
        })
      )

      setLikedProducts(products.filter((product): product is Product => Boolean(product)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLikedProducts()

    const handleWishlistUpdate = () => {
      loadLikedProducts()
    }

    window.addEventListener(wishlistUpdatedEventName(), handleWishlistUpdate)
    window.addEventListener("storage", handleWishlistUpdate)

    return () => {
      window.removeEventListener(wishlistUpdatedEventName(), handleWishlistUpdate)
      window.removeEventListener("storage", handleWishlistUpdate)
    }
  }, [])

  const removeFromWishlist = (productId: string, productName: string) => {
    toggleLikedProduct(productId)
    setLikedProducts((prev) => prev.filter((product) => product.id !== productId))
    toast.success(`${productName} removed from wishlist`)
  }

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product, 1)
      toast.success(`${product.name} added to cart`)
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-[#D30005] fill-current" />
          <div>
            <h1 className="nike-display text-[30px] md:text-[42px] text-[#111111]">My Wishlist</h1>
            <p className="text-[14px] text-[#707072] mt-1">{likedProducts.length} saved items</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#F5F5F5] aspect-square mb-3" />
                <div className="h-4 bg-[#F5F5F5] w-3/4 mb-2" />
                <div className="h-3 bg-[#F5F5F5] w-1/2" />
              </div>
            ))}
          </div>
        ) : likedProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5 rounded-full">
              <Heart className="w-7 h-7 text-[#CACACB]" />
            </div>
            <h2 className="text-[24px] font-medium mb-2 text-[#111111]">No liked items yet</h2>
            <p className="text-[16px] text-[#707072] mb-6 max-w-md mx-auto">
              Click the heart button on any product to save it here.
            </p>
            <Link href="/shop" className="nike-btn-primary text-[14px] inline-flex">
              <Search className="w-4 h-4" />
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {likedProducts.map((product) => (
              <div key={product.id} className="group">
                <Link href={`/shop/${product.id}`} className="block no-underline">
                  <div className="relative aspect-square overflow-hidden bg-[#F5F5F5]">
                    <Image
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain p-6"
                      unoptimized={Boolean(product.images?.[0]?.startsWith("http"))}
                    />
                  </div>
                </Link>
                <div className="pt-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/shop/${product.id}`} className="text-[15px] font-medium text-[#111111] leading-tight line-clamp-1 hover:underline">
                      {product.name}
                    </Link>
                    <span className="text-[15px] font-medium text-[#111111] whitespace-nowrap">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#707072]">{product.category}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="nike-btn-primary text-[13px] py-2 px-3 flex-1"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id, product.name)}
                      className="nike-btn-secondary text-[13px] py-2 px-3"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

