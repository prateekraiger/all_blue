"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Package, ChevronRight, Clock, CheckCircle, 
  Truck, XCircle, CreditCard, Search, Filter,
  ArrowLeft, ShoppingBag
} from "lucide-react"
import { ordersApi, type Order } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any, bg: string }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  paid: { label: "Paid", color: "text-blue-600", bg: "bg-blue-50", icon: CreditCard },
  shipped: { label: "Shipped", color: "text-purple-600", bg: "bg-purple-50", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center gap-4 mb-12 animate-pulse">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-8 bg-slate-100 w-48 rounded-lg" />
            <div className="h-4 bg-slate-100 w-32 rounded-md" />
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-200">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">No orders yet</h1>
        <p className="text-slate-500 font-medium mb-10 max-w-sm">When you place an order, it will appear here for you to track and manage.</p>
        <Link
          href="/shop"
          className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
        >
          Explore the Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/profile" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">My Orders</h1>
            </div>
            <p className="text-slate-500 font-medium ml-14">You have placed <span className="text-slate-900 font-black">{total} orders</span> in total.</p>
          </div>

          <div className="flex gap-3 ml-14 md:ml-0">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100">
              <Search className="w-3.5 h-3.5" /> Search
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const StatusIcon = statusConf.icon
            const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="group block bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all relative overflow-hidden"
              >
                {/* Visual accent */}
                <div className={`absolute top-0 left-0 w-2 h-full ${statusConf.bg.replace('bg-', 'bg-')}`} />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                      <Package className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-500">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConf.bg} ${statusConf.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {itemCount} {itemCount === 1 ? "Item" : "Items"} · ₹{order.total_amount.toLocaleString("en-IN")}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                        <span>{new Date(order.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
                        {order.address && (
                          <>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span>{order.address.city}, {order.address.state}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                    <div className="text-left md:text-right hidden sm:block">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Payment</p>
                      <p className="text-xs font-bold text-slate-700">Credit Card</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 group-hover:bg-slate-900 px-6 py-3 rounded-2xl transition-all duration-300">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">View Details</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-8 mt-16">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Prev
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                    page === p 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
