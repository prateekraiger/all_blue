"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, CreditCard } from "lucide-react"
import { ordersApi, type Order } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-600 bg-amber-50", icon: Clock },
  paid: { label: "Paid", color: "text-blue-600 bg-blue-50", icon: CreditCard },
  shipped: { label: "Shipped", color: "text-purple-600 bg-purple-50", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-600 bg-green-50", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50", icon: XCircle },
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-12">
        <div className="h-8 bg-neutral-100 w-1/3 mb-8 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-24 text-center">
        <Package className="w-16 h-16 mx-auto text-neutral-200 mb-6" />
        <h1 className="text-2xl font-extrabold uppercase tracking-tight mb-3">No orders yet</h1>
        <p className="text-neutral-500 text-sm mb-8">Start shopping to see your orders here.</p>
        <Link
          href="/shop"
          className="inline-block bg-foreground text-background px-10 py-4 font-semibold text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">My Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">{total} orders total</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
          const StatusIcon = statusConf.icon
          const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block border border-neutral-100 hover:border-neutral-300 transition-colors p-5 md:p-6 no-underline group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 ${statusConf.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConf.label}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-500 mb-1">
                    {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  {order.address && (
                    <div className="text-xs text-neutral-400">
                      {order.address.city}, {order.address.state}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-extrabold text-base">
                      ₹{order.total_amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border border-neutral-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-neutral-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
