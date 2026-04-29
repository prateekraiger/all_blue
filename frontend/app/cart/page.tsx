"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function CartPage() {
  const { cart, localCart, itemCount, subtotal, updateItem, removeItem, clearCart, loading } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Unified cart items view
  const displayItems = user && cart
    ? cart.items
    : localCart.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        created_at: new Date().toISOString(),
        product: i.product,
        is_gift: i.is_gift,
        gift_message: i.gift_message,
      }))

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return
    try {
      setUpdatingId(itemId)
      await updateItem(itemId, newQty)
    } catch (err: any) {
      toast.error(err.message || "Failed to update quantity")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (itemId: string, name: string) => {
    try {
      setUpdatingId(itemId)
      await removeItem(itemId)
      toast.success(`${name} removed from cart`)
    } catch (err: any) {
      toast.error(err.message || "Failed to remove item")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleClear = async () => {
    try {
      await clearCart()
      toast.success("Cart cleared")
    } catch (err: any) {
      toast.error(err.message || "Failed to clear cart")
    }
  }

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to checkout")
      router.push("/sign-in")
      return
    }
    router.push("/checkout")
  }

  const tax = subtotal * 0.18 // 18% GST
  const shipping = subtotal >= 999 ? 0 : 99
  const total = subtotal + tax + shipping

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-100 w-1/3 mb-8" />
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-24 h-24 bg-neutral-100" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-neutral-100 w-1/2" />
                <div className="h-4 bg-neutral-100 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-neutral-200 mb-6" />
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-3">
          Your cart is empty
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Discover our collection and add something you'll love.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-foreground text-background px-10 py-4 font-semibold text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
          Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>
        <button
          onClick={handleClear}
          className="text-xs text-neutral-500 hover:text-foreground transition-colors uppercase tracking-widest underline"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-0">
          {displayItems.map((item, idx) => (
            <div
              key={item.id}
              className={`flex gap-5 py-6 ${idx < displayItems.length - 1 ? "border-b border-neutral-100" : ""}`}
            >
              {/* Product Image */}
              <Link href={`/shop/${item.product?.id}`} className="shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-neutral-100 overflow-hidden p-2">
                  <Image
                    src={item.product?.images?.[0] || "/placeholder.jpg"}
                    alt={item.product?.name || "Product"}
                    width={120}
                    height={120}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
                  />
                </div>
              </Link>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.product?.id}`} className="no-underline">
                  <h3 className="font-semibold text-base mb-1 hover:opacity-70 transition-opacity line-clamp-2">
                    {item.product?.name}
                  </h3>
                </Link>
                <p className="text-sm text-neutral-500 mb-1">{item.product?.category}</p>
                
                {/* Gift Badge */}
                {'is_gift' in item && (item as any).is_gift && (
                  <div className="mb-3 space-y-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                      Gift Wrapping (+₹150)
                    </span>
                    {(item as any).gift_message && (
                      <p className="text-[11px] text-neutral-400 italic font-medium leading-tight">
                        "{(item as any).gift_message}"
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-neutral-200">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingId === item.id}
                      className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">
                      {updatingId === item.id ? "..." : item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingId === item.id || (item.product?.stock != null && item.quantity >= item.product.stock)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="font-extrabold text-base">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-neutral-400">
                      ₹{(item.product?.price || 0).toLocaleString("en-IN")} each
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item.id, item.product?.name || "Item")}
                disabled={updatingId === item.id}
                className="shrink-0 self-start text-neutral-300 hover:text-red-400 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-neutral-100 p-6 sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">GST (18%)</span>
                <span className="font-medium">₹{Math.round(tax).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className={shipping === 0 ? "font-medium text-green-600" : "font-medium"}>
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-neutral-400">
                  Add ₹{(999 - subtotal).toLocaleString("en-IN")} more for free shipping
                </p>
              )}
              <div className="border-t border-neutral-100 pt-3 flex justify-between font-extrabold text-base">
                <span>Total</span>
                <span>₹{Math.round(total).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-foreground text-background py-4 font-semibold text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/shop"
              className="block text-center mt-4 text-xs text-neutral-500 hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
