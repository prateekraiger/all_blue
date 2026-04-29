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

function MagneticButton({ children, className, onClick, disabled }: { children: React.ReactNode; className?: string; onClick?: () => void; disabled?: boolean }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}

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
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-24">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-neutral-100 w-1/4 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-neutral-100 rounded-[2.5rem]" />
              ))}
            </div>
            <div className="h-96 bg-neutral-100 rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-16 shadow-2xl border border-neutral-100 max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-neutral-900 uppercase">
            Your cart is empty
          </h1>
          <p className="text-neutral-500 text-lg mb-12 font-medium">
            Discover our curated collection and add something extraordinary to your repertoire.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-neutral-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], rotate: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[5%] -left-[5%] w-[35%] h-[35%] bg-primary/3 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 -right-[5%] w-[45%] h-[45%] bg-primary/2 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12 md:py-20">
        {/* Breadcrumb */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 text-xs md:text-[11px] text-neutral-400 mb-12 uppercase tracking-[0.3em] font-black"
        >
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 -mt-0.5" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <span className="text-neutral-900 font-bold">Shopping Bag</span>
        </motion.nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-neutral-900 uppercase leading-[0.9]">
              Cart <span className="text-primary/20">({itemCount})</span>
            </h1>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleClear}
            className="text-[10px] text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em] font-black flex items-center gap-2 group"
          >
            <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            Clear All Items
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {displayItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-[2.5rem] p-6 md:p-8 border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col sm:flex-row gap-8 items-center"
              >
                {/* Product Image */}
                <Link href={`/shop/${item.product?.id}`} className="shrink-0">
                  <div className="w-40 h-40 md:w-48 md:h-48 bg-neutral-50 rounded-3xl overflow-hidden p-6 relative flex items-center justify-center border border-neutral-100 group-hover:border-primary/10 transition-colors">
                    <Image
                      src={item.product?.images?.[0] || "/placeholder.jpg"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <Link href={`/shop/${item.product?.id}`} className="no-underline">
                        <h3 className="font-black text-2xl md:text-3xl text-neutral-900 tracking-tight hover:text-primary transition-colors line-clamp-1 uppercase">
                          {item.product?.name}
                        </h3>
                      </Link>
                      <p className="text-xs uppercase font-black tracking-widest text-primary/40 mt-1">{item.product?.category}</p>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tighter">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                  
                  {/* Gift Badge */}
                  {'is_gift' in item && (item as any).is_gift && (
                    <div className="mb-6 inline-flex flex-col items-center sm:items-start">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black bg-primary/5 text-primary uppercase tracking-widest border border-primary/10">
                        <CheckCircle2 className="w-3 h-3" />
                        Signature Gift Wrapping
                      </span>
                      {(item as any).gift_message && (
                        <p className="text-xs text-neutral-400 mt-2 italic font-medium px-2">
                          "{(item as any).gift_message}"
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto pt-6 border-t border-neutral-50">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-neutral-50 rounded-2xl p-1 border border-neutral-100 h-12">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingId === item.id}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all disabled:opacity-20 text-neutral-400"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-black text-neutral-900">
                        {updatingId === item.id ? "..." : item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id || (item.product?.stock != null && item.quantity >= item.product.stock)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all disabled:opacity-20 text-neutral-400"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] uppercase font-black tracking-widest text-neutral-300">Unit Price</div>
                        <div className="text-sm font-bold text-neutral-500">₹{(item.product?.price || 0).toLocaleString("en-IN")}</div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id, item.product?.name || "Item")}
                        disabled={updatingId === item.id}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-40"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3rem] p-8 md:p-10 border border-neutral-100 shadow-2xl sticky top-24"
            >
              <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-10 text-neutral-900">Order Summary</h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400 font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="font-black text-neutral-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400 font-bold uppercase tracking-widest">GST (18%)</span>
                  <span className="font-black text-neutral-900">₹{Math.round(tax).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400 font-bold uppercase tracking-widest">Shipping</span>
                  <span className={shipping === 0 ? "font-black text-green-500" : "font-black text-neutral-900"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
                      Complimentary shipping on orders over ₹999. Add ₹{(999 - subtotal).toLocaleString("en-IN")} more.
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-neutral-100 flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 mb-1">Total Amount</span>
                  <span className="text-4xl font-black text-neutral-900 tracking-tighter">₹{Math.round(total).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-4">
                <MagneticButton
                  onClick={handleCheckout}
                  className="w-full bg-neutral-900 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-95"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { icon: ShieldCheck, label: "Secure" },
                    { icon: Truck, label: "Express" },
                    { icon: RefreshCw, label: "Returns" }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                        <item.icon className="w-4 h-4 text-neutral-400" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-neutral-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
