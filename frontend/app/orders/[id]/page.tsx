"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { 
  Package, Clock, CheckCircle, Truck, 
  XCircle, CreditCard, MapPin, ArrowLeft,
  ChevronRight, Printer, HelpCircle,
  Calendar, Hash, Receipt
} from "lucide-react"
import { ordersApi, type Order } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

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
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 animate-pulse">
        <div className="h-4 bg-slate-100 w-32 mb-8 rounded" />
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-3">
            <div className="h-10 bg-slate-100 w-64 rounded-xl" />
            <div className="h-4 bg-slate-100 w-48 rounded" />
          </div>
          <div className="h-12 bg-slate-100 w-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-slate-50 rounded-[2.5rem]" />
            <div className="h-80 bg-slate-50 rounded-[2.5rem]" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-slate-50 rounded-[2rem]" />
            <div className="h-40 bg-slate-50 rounded-[2rem]" />
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-12">
        
        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <Link 
            href="/orders" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Orders
          </Link>
          
          <div className="flex items-center gap-3">
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
              <Printer className="w-4 h-4" />
            </button>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
                Order <span className="text-slate-300">#{order.id.slice(0, 8).toUpperCase()}</span>
              </h1>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isCancelled ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
              }`}>
                {order.status}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-300" />
                <span>{new Date(order.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-100 rounded-full hidden sm:block" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-300" />
                <span>{new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>

          {!isCancelled && order.status === "pending" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-white text-red-600 border-2 border-red-50 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
            >
              {cancelling ? "Processing..." : "Request Cancellation"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Status Timeline */}
            {!isCancelled ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32" />
                
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-10">Delivery Progress</h2>
                
                <div className="relative">
                  {/* Connection Line */}
                  <div className="absolute top-[1.375rem] left-0 w-full h-0.5 bg-slate-800">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                      style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                  
                  {/* Steps */}
                  <div className="relative flex justify-between gap-4">
                    {STATUS_STEPS.map((step, idx) => {
                      const StepIcon = step.icon
                      const isActive = idx <= currentStepIdx
                      const isUpcoming = idx > currentStepIdx
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center group">
                          <div className={`
                            w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 z-10
                            ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500'}
                          `}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div className="mt-6 text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                              {step.label}
                            </p>
                            <p className="text-[9px] font-medium text-slate-500 hidden sm:block whitespace-nowrap">
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
              <div className="bg-red-50 rounded-[2.5rem] p-8 border border-red-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-900 tracking-tight mb-1">Order Cancelled</h3>
                  <p className="text-red-600/70 text-sm font-medium">This order was cancelled on {new Date().toLocaleDateString()}. Refunds are usually processed within 5-7 days.</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
              <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-slate-300" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Order Summary</h2>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{order.items.length} items</span>
              </div>
              
              <div className="p-8 md:p-10 space-y-8">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-slate-100 transition-colors">
                        <Package className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{item.product_id.slice(0, 8).toUpperCase()}</p>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Product Item</h4>
                        <p className="text-xs text-slate-500 font-medium">Quantity: <span className="text-slate-900 font-bold">{item.qty}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">₹{item.price.toLocaleString("en-IN")} ea.</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-8 md:p-10 space-y-4">
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{order.total_amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-black uppercase tracking-widest text-[10px]">Free</span>
                </div>
                <div className="h-px bg-slate-200 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Total Amount</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">₹{order.total_amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Delivery Info */}
            {order.address && (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Shipping Details</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Customer</p>
                    <p className="text-sm font-bold text-slate-900">{order.address.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Contact</p>
                    <p className="text-sm font-bold text-slate-700">{order.address.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Address</p>
                    <div className="text-sm font-bold text-slate-700 space-y-0.5">
                      <p>{order.address.line1}</p>
                      {order.address.line2 && <p>{order.address.line2}</p>}
                      <p>{order.address.city}, {order.address.state}</p>
                      <p className="text-slate-400">{order.address.country} · {order.address.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-3xl rounded-full -mr-12 -mt-12" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Payment Info</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Method</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm font-bold text-slate-900">Online Payment</p>
                  </div>
                </div>
                
                {order.payment_id && (
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Transaction ID</p>
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <Hash className="w-3.5 h-3.5 text-slate-200" />
                      <p className="text-xs font-bold text-slate-500 font-mono break-all">{order.payment_id}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                  <p className={`text-sm font-black uppercase tracking-tight ${
                    order.status === "pending" ? "text-amber-500" : "text-green-600"
                  }`}>
                    {order.status === "pending" ? "Payment Awaiting" : "Payment Successful"}
                  </p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-slate-50 rounded-[2rem] p-8 text-center border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4 shadow-sm">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Need help with this order?</h4>
              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">Our support team is available 24/7 to assist with tracking or issues.</p>
              <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                Contact Concierge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
