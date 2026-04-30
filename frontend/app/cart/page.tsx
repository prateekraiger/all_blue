"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Home, ChevronRight, CheckCircle2, ShieldCheck, Truck, RefreshCw } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function CartPage() {
  const { cart, localCart, itemCount, subtotal, updateItem, removeItem, clearCart, loading } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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

  const tax = subtotal * 0.18
  const shipping = subtotal >= 999 ? 0 : 99
  const total = subtotal + tax + shipping

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#F5F5F5] w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-[#F5F5F5]" />
              ))}
            </div>
            <div className="h-80 bg-[#F5F5F5]" />
          </div>
        </div>
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="w-20 h-20 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-8 h-8 text-[#CACACB]" />
          </div>
          <h1 className="nike-display text-[32px] md:text-[48px] text-[#111111] mb-4">
            YOUR BAG IS EMPTY
          </h1>
          <p className="text-[16px] text-[#707072] mb-10 leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Discover our curated collection and add something extraordinary.
          </p>
          <Link href="/shop" className="nike-btn-primary text-[16px] px-10 py-3.5">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#707072] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <Link href="/" className="hover:text-[#111111] transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#CACACB]" />
          <span className="text-[#111111] font-medium">Bag</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <h1 className="nike-display text-[32px] md:text-[48px] text-[#111111]">
            BAG ({itemCount})
          </h1>
          <button
            onClick={handleClear}
            className="text-[14px] text-[#707072] hover:text-[#D30005] transition-colors font-medium flex items-center gap-2"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="space-y-0">
              {displayItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex gap-4 sm:gap-6 py-6"
                  style={{ borderBottom: '1px solid #E5E5E5' }}
                >
                  {/* Product Image — no border radius */}
                  <Link href={`/shop/${item.product?.id}`} className="shrink-0">
                    <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] bg-[#F5F5F5] relative overflow-hidden">
                      <Image
                        src={item.product?.images?.[0] || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <Link href={`/shop/${item.product?.id}`} className="no-underline">
                          <h3 className="text-[16px] font-medium text-[#111111] line-clamp-1 hover:underline" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                            {item.product?.name}
                          </h3>
                        </Link>
                        <span className="text-[16px] font-medium text-[#111111] whitespace-nowrap" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-[14px] text-[#707072] mb-1" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                        {item.product?.category}
                      </p>
                      <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                        ₹{(item.product?.price || 0).toLocaleString("en-IN")} each
                      </p>

                      {/* Gift Badge */}
                      {'is_gift' in item && (item as any).is_gift && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#007D48]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Gift Wrapped
                          </span>
                          {(item as any).gift_message && (
                            <p className="text-[12px] text-[#707072] mt-1 italic">
                              &ldquo;{(item as any).gift_message}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-[#CACACB] rounded-full overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingId === item.id}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-30 text-[#111111]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-[14px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                          {updatingId === item.id ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingId === item.id || (item.product?.stock != null && item.quantity >= item.product.stock)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-30 text-[#111111]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id, item.product?.name || "Item")}
                        disabled={updatingId === item.id}
                        className="w-9 h-9 flex items-center justify-center text-[#707072] hover:text-[#D30005] transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F5F5F5] p-6 md:p-8 sticky top-24"
            >
              <h2 className="text-[24px] font-medium text-[#111111] mb-8" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[14px]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  <span className="text-[#707072]">Subtotal</span>
                  <span className="font-medium text-[#111111]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[14px]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  <span className="text-[#707072]">Estimated GST (18%)</span>
                  <span className="font-medium text-[#111111]">₹{Math.round(tax).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[14px]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  <span className="text-[#707072]">Estimated Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? "text-[#007D48]" : "text-[#111111]"}`}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>

                {shipping > 0 && (
                  <p className="text-[12px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    Free shipping on orders over ₹999. Add ₹{(999 - subtotal).toLocaleString("en-IN")} more.
                  </p>
                )}
              </div>

              <div className="pt-4 mb-8 flex justify-between items-baseline" style={{ borderTop: '1px solid #E5E5E5' }}>
                <span className="text-[16px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Total</span>
                <span className="text-[24px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>₹{Math.round(total).toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="nike-btn-primary w-full text-[16px] py-4 mb-4"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { icon: <ShieldCheck className="w-5 h-5" />, label: "Secure" },
                  { icon: <Truck className="w-5 h-5" />, label: "Express" },
                  { icon: <RefreshCw className="w-5 h-5" />, label: "Returns" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    <div className="text-[#707072]">{item.icon}</div>
                    <span className="text-[11px] font-medium text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
