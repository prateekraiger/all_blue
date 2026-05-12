"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { 
  Package, Clock, CheckCircle, Truck, 
  XCircle, CreditCard, MapPin, Home,
  ChevronRight, HelpCircle, Hash
} from "lucide-react"
import { ordersApi, type Order } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { motion } from "framer-motion"

const STATUS_STEPS = [
  { key: "pending", label: "Ordered", description: "Order received", icon: Package },
  { key: "paid", label: "Confirmed", description: "Payment verified", icon: CreditCard },
  { key: "shipped", label: "Shipped", description: "In transit", icon: Truck },
  { key: "delivered", label: "Delivered", description: "Package received", icon: CheckCircle },
]

const STATUS_ORDER = ["pending", "paid", "shipped", "delivered"]

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!token) return
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const data = await ordersApi.get(id, token)
        setOrder(data)
      } catch (err: any) {
        toast.error(err.message || "Order not found")
        router.push("/orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, token, router])

  // Poll for status updates
  useEffect(() => {
    if (!token || !order || order.status === "delivered" || order.status === "cancelled") return
    const interval = setInterval(async () => {
      try {
        const updated = await ordersApi.get(id, token)
        if (updated.status !== order.status) {
          setOrder(updated)
        }
      } catch {}
    }, 30000)
    return () => clearInterval(interval)
  }, [id, token, order])

  const handleCancel = async () => {
    if (!token || !order) return
    try {
      setCancelling(true)
      const updated = await ordersApi.cancel(id, token)
      setOrder(updated)
      toast.success("Order cancelled successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order")
    } finally {
      setCancelling(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 animate-pulse">
          <div className="h-5 bg-[#F5F5F5] w-48 mb-6" />
          <div className="h-12 bg-[#F5F5F5] w-80 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-[#F5F5F5]" />
              <div className="h-64 bg-[#F5F5F5]" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-[#F5F5F5]" />
              <div className="h-40 bg-[#F5F5F5]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) return null

  const currentStepIdx = STATUS_ORDER.indexOf(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#707072] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <Link href="/" className="hover:text-[#111111] transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#CACACB]" />
          <Link href="/orders" className="hover:text-[#111111] transition-colors">Orders</Link>
          <ChevronRight className="w-3 h-3 text-[#CACACB]" />
          <span className="text-[#111111] font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="nike-display text-[32px] md:text-[48px] text-[#111111] mb-2">
              ORDER #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              <span>{new Date(order.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span className="text-[#CACACB]">&middot;</span>
              <span>{new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          {!isCancelled && order.status === "pending" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="nike-btn-secondary text-[14px] px-6 py-2.5 text-[#D30005] border-[#D30005]/30 hover:bg-[#D30005]/5 hover:border-[#D30005] disabled:opacity-50"
            >
              {cancelling ? "Processing..." : "Cancel Order"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Status Timeline */}
            {!isCancelled ? (
              <div className="bg-[#111111] p-6 md:p-10">
                <h2 className="text-[12px] font-medium text-white/50 mb-8 uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  Delivery Progress
                </h2>
                
                <div className="relative">
                  {/* Connection Line */}
                  <div className="absolute top-5 left-0 w-full h-[2px] bg-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-white"
                    />
                  </div>
                  
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const StepIcon = step.icon
                      const isActive = idx <= currentStepIdx
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div className={`w-10 h-10 flex items-center justify-center z-10 transition-all ${
                            isActive ? 'bg-white text-[#111111]' : 'bg-[#39393B] text-[#707072]'
                          }`}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div className="mt-4 text-center">
                            <p className={`text-[12px] font-medium uppercase mb-0.5 ${isActive ? 'text-white' : 'text-white/30'}`} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                              {step.label}
                            </p>
                            <p className="text-[11px] text-white/30 hidden sm:block" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                              {step.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#D30005]/5 p-6 md:p-8 flex items-center gap-5" style={{ border: '1px solid rgba(211, 0, 5, 0.15)' }}>
                <div className="w-14 h-14 bg-[#D30005]/10 flex items-center justify-center shrink-0">
                  <XCircle className="w-7 h-7 text-[#D30005]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-[#111111] mb-1" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    Order Cancelled
                  </h3>
                  <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    This order was cancelled. Refunds are usually processed within 5-7 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-medium text-[#111111] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  Order Summary
                </h2>
                <span className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              
              <div className="space-y-0">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 py-5" style={{ borderBottom: '1px solid #E5E5E5' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center shrink-0">
                        <Package className="w-7 h-7 text-[#CACACB]" />
                      </div>
                      <div>
                        <p className="text-[12px] text-[#707072] mb-0.5 font-mono" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                          #{item.product_id.slice(0, 8).toUpperCase()}
                        </p>
                        <h4 className="text-[16px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                          Product Item
                        </h4>
                        <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                          Qty: {item.qty} &middot; ₹{item.price.toLocaleString("en-IN")} each
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[16px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                        ₹{(item.price * item.qty).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-[#F5F5F5] p-6 mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-[14px]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    <span className="text-[#707072]">Subtotal</span>
                    <span className="font-medium text-[#111111]">₹{order.total_amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[14px]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    <span className="text-[#707072]">Shipping</span>
                    <span className="font-medium text-[#007D48]">Free</span>
                  </div>
                  <div className="pt-3 flex justify-between items-baseline" style={{ borderTop: '1px solid #E5E5E5' }}>
                    <span className="text-[16px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Total</span>
                    <span className="text-[24px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      ₹{order.total_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Delivery Address */}
            {order.address && (
              <div className="bg-[#F5F5F5] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-[#111111]" />
                  <h3 className="text-[14px] font-medium text-[#111111] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    Shipping Details
                  </h3>
                </div>
                
                <div className="space-y-4" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  <div>
                    <p className="text-[12px] text-[#707072] mb-1 uppercase">Customer</p>
                    <p className="text-[14px] font-medium text-[#111111]">{order.address.name}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#707072] mb-1 uppercase">Contact</p>
                    <p className="text-[14px] font-medium text-[#111111]">{order.address.phone}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#707072] mb-1 uppercase">Address</p>
                    <div className="text-[14px] text-[#111111] space-y-0.5">
                      <p>{order.address.line1}</p>
                      {order.address.line2 && <p>{order.address.line2}</p>}
                      <p>{order.address.city}, {order.address.state}</p>
                      <p className="text-[#707072]">{order.address.country} &middot; {order.address.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-[#F5F5F5] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-[#111111]" />
                <h3 className="text-[14px] font-medium text-[#111111] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  Payment Info
                </h3>
              </div>

              <div className="space-y-4" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                <div>
                  <p className="text-[12px] text-[#707072] mb-1 uppercase">Method</p>
                  <p className="text-[14px] font-medium text-[#111111]">Online Payment</p>
                </div>
                
                {order.payment_id && (
                  <div>
                    <p className="text-[12px] text-[#707072] mb-1 uppercase">Transaction ID</p>
                    <p className="text-[12px] font-medium text-[#707072] font-mono break-all">{order.payment_id}</p>
                  </div>
                )}
                
                <div className="pt-4" style={{ borderTop: '1px solid #E5E5E5' }}>
                  <p className="text-[12px] text-[#707072] mb-1 uppercase">Status</p>
                  <p className={`text-[14px] font-medium ${
                    order.status === "pending" ? "text-[#FF5000]" : "text-[#007D48]"
                  }`}>
                    {order.status === "pending" ? "Payment Awaiting" : "Payment Successful"}
                  </p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-[#F5F5F5] p-6 md:p-8 text-center">
              <div className="w-12 h-12 bg-white flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-5 h-5 text-[#707072]" />
              </div>
              <h4 className="text-[16px] font-medium text-[#111111] mb-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Need help?
              </h4>
              <p className="text-[14px] text-[#707072] mb-6 leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Our support team is available 24/7 to assist you.
              </p>
              <Link href="/contact" className="nike-btn-secondary w-full text-[14px]">
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
