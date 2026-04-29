"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Package, Clock, CheckCircle, Truck, XCircle, CreditCard, MapPin, ChevronLeft } from "lucide-react"
import { ordersApi, type Order } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "paid", label: "Payment Confirmed", icon: CreditCard },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
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
    }, 30000) // Poll every 30s
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-12 animate-pulse">
        <div className="h-8 bg-neutral-100 w-1/2 mb-4" />
        <div className="h-4 bg-neutral-100 w-1/3 mb-12" />
        <div className="h-24 bg-neutral-100 mb-6" />
        <div className="h-48 bg-neutral-100" />
      </div>
    )
  }

  if (!order) return null

  const currentStepIdx = STATUS_ORDER.indexOf(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
      {/* Back */}
      <Link href="/orders" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-foreground transition-colors uppercase tracking-widest mb-6">
        <ChevronLeft className="w-3 h-3" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
        {order.status === "pending" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="shrink-0 border border-red-200 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>

      {/* Order Timeline */}
      {!isCancelled && (
        <div className="border border-neutral-100 p-6 md:p-8 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-6">Order Status</h2>
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-neutral-100">
              <div
                className="h-full bg-foreground transition-all duration-700"
                style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
            {/* Steps */}
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const StepIcon = step.icon
                const isDone = idx <= currentStepIdx
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all ${isDone ? "bg-foreground border-foreground text-background" : "bg-white border-neutral-200 text-neutral-300"}`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-medium text-center hidden sm:block ${isDone ? "text-foreground" : "text-neutral-400"}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="border border-red-100 bg-red-50 p-4 mb-6 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-red-700">Order Cancelled</div>
            <div className="text-xs text-red-500">This order has been cancelled. Refund will be processed within 5-7 business days.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="border border-neutral-100 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-5">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-neutral-50">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.product_id.slice(0, 8)}...</div>
                    <div className="text-xs text-neutral-400">Qty: {item.qty}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-extrabold text-base pt-4">
              <span>Total</span>
              <span>₹{order.total_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Delivery Address */}
          {order.address && (
            <div className="border border-neutral-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-semibold uppercase tracking-widest">Delivery Address</h3>
              </div>
              <div className="text-sm text-neutral-600 space-y-0.5">
                <div className="font-medium">{order.address.name}</div>
                <div>{order.address.phone}</div>
                <div>{order.address.line1}</div>
                {order.address.line2 && <div>{order.address.line2}</div>}
                <div>{order.address.city}, {order.address.state} - {order.address.pincode}</div>
                <div>{order.address.country}</div>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="border border-neutral-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold uppercase tracking-widest">Payment</h3>
            </div>
            <div className="text-sm text-neutral-600 space-y-1">
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-medium ${order.status === "paid" || order.status === "shipped" || order.status === "delivered" ? "text-green-600" : "text-amber-600"}`}>
                  {order.status === "pending" ? "Awaiting Payment" : "Paid"}
                </span>
              </div>
              {order.payment_id && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment ID</span>
                  <span className="font-mono text-xs">{order.payment_id.slice(0, 15)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
