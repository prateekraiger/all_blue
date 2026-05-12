"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Package, ChevronRight, Clock, CheckCircle, 
  Truck, XCircle, CreditCard, ShoppingBag,
  Home, ArrowRight
} from "lucide-react"
import { ordersApi, type Order } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { motion } from "framer-motion"

const STATUS_CONFIG: Record<string, { label: string, color: string, bg: string, icon: any }> = {
  pending: { label: "Pending", color: "text-[#FF5000]", bg: "bg-[#FF5000]/10", icon: Clock },
  paid: { label: "Paid", color: "text-[#1151FF]", bg: "bg-[#1151FF]/10", icon: CreditCard },
  shipped: { label: "Shipped", color: "text-[#707072]", bg: "bg-[#F5F5F5]", icon: Truck },
  delivered: { label: "Delivered", color: "text-[#007D48]", bg: "bg-[#007D48]/10", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-[#D30005]", bg: "bg-[#D30005]/10", icon: XCircle },
}

export default function OrdersPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!token) return
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const result = await ordersApi.list({ page, limit: 10 }, token)
        setOrders(result.orders)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [token, page])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <div className="animate-pulse">
            <div className="h-5 bg-[#F5F5F5] w-32 mb-6" />
            <div className="h-12 bg-[#F5F5F5] w-64 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-[#F5F5F5]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white">
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
              NO ORDERS YET
            </h1>
            <p className="text-[16px] text-[#707072] mb-10 leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              When you place an order, it will appear here for you to track and manage.
            </p>
            <Link href="/shop" className="nike-btn-primary text-[16px] px-10 py-3.5">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
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
          <Link href="/profile" className="hover:text-[#111111] transition-colors">Profile</Link>
          <ChevronRight className="w-3 h-3 text-[#CACACB]" />
          <span className="text-[#111111] font-medium">Orders</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="nike-display text-[32px] md:text-[48px] text-[#111111]">
              MY ORDERS
            </h1>
            <p className="text-[14px] text-[#707072] mt-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {total} {total === 1 ? 'order' : 'orders'} placed
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-0">
          {orders.map((order, idx) => {
            const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const StatusIcon = statusConf.icon
            const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link
                  href={`/orders/${order.id}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 no-underline transition-colors hover:bg-[#FAFAFA] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12"
                  style={{ borderBottom: '1px solid #E5E5E5' }}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#F5F5F5] flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-[#707072] group-hover:text-[#111111] transition-colors" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[12px] font-medium text-[#707072] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <div className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium uppercase ${statusConf.bg} ${statusConf.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </div>
                      </div>
                      
                      <h3 className="text-[16px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                        {itemCount} {itemCount === 1 ? "Item" : "Items"} &middot; ₹{order.total_amount.toLocaleString("en-IN")}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-[12px] text-[#707072] mt-1" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                        <span>{new Date(order.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
                        {order.address && (
                          <>
                            <span className="text-[#CACACB]">&middot;</span>
                            <span>{order.address.city}, {order.address.state}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[14px] font-medium text-[#707072] group-hover:text-[#111111] transition-colors ml-[76px] md:ml-0" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    View Details
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 mb-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="nike-btn-secondary text-[14px] px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-full text-[14px] font-medium transition-all ${
                    page === p
                    ? "bg-[#111111] text-white"
                    : "border border-[#CACACB] text-[#111111] hover:border-[#111111]"
                  }`}
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="nike-btn-secondary text-[14px] px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
