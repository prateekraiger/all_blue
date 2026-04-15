"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Package, ShoppingCart, TrendingUp, Plus, Edit, Trash2, Eye, Check, X } from "lucide-react"
import { adminApi, productsApi, type Order } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

interface DashboardStats {
  stats: {
    totalRevenue: number
    ordersToday: number
    totalOrders: number
    totalProducts: number
  }
  ordersByStatus: Record<string, number>
  lowStockProducts: Array<{ id: string; name: string; stock: number }>
  recentOrders: Order[]
  popularProducts: Array<{ id: string; name: string; price: number; stock: number; orders: number }>
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminDashboard() {
  const { user, token, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "products">("overview")

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Admin access required")
      router.push("/")
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    if (!token || !isAdmin) return
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const data = await adminApi.dashboard(token) as DashboardStats
        setDashboard(data)
      } catch (err: any) {
        toast.error(err.message || "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [token, isAdmin])

  if (authLoading || loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 animate-pulse">
        <div className="h-8 bg-neutral-100 w-1/3 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-neutral-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  const statCards = [
    { label: "Total Revenue", value: `₹${dashboard.stats.totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-green-600" },
    { label: "Orders Today", value: dashboard.stats.ordersToday, icon: ShoppingCart, color: "text-blue-600" },
    { label: "Total Orders", value: dashboard.stats.totalOrders, icon: Package, color: "text-purple-600" },
    { label: "Products", value: dashboard.stats.totalProducts, icon: BarChart3, color: "text-amber-600" },
  ]

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Welcome back, {user?.email}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-semibold uppercase tracking-widest hover:bg-neutral-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-neutral-200 mb-8">
        {(["overview", "orders", "products"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-neutral-400 hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="border border-neutral-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{card.label}</span>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className="text-2xl font-extrabold">{card.value}</div>
                </div>
              )
            })}
          </div>

          {/* Order Status Breakdown */}
          <div className="border border-neutral-100 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5">Orders by Status</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(dashboard.ordersByStatus).map(([status, count]) => (
                <div key={status} className={`px-3 py-2 text-sm font-semibold ${STATUS_COLORS[status] || "bg-neutral-100"}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="border border-neutral-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold uppercase tracking-widest">Recent Orders</h3>
                <button onClick={() => setActiveTab("orders")} className="text-xs text-neutral-500 hover:text-foreground transition-colors underline">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {dashboard.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-neutral-50">
                    <div>
                      <div className="text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-xs text-neutral-400">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">₹{order.total_amount.toLocaleString("en-IN")}</div>
                      <span className={`text-[10px] px-2 py-0.5 ${STATUS_COLORS[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="border border-neutral-100 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-5">Low Stock Alert</h3>
              {dashboard.lowStockProducts.length === 0 ? (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Check className="w-4 h-4" /> All products are well-stocked
                </p>
              ) : (
                <div className="space-y-3">
                  {dashboard.lowStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-50">
                      <div className="text-sm font-medium truncate mr-4">{p.name}</div>
                      <span className={`text-xs font-semibold px-2 py-1 shrink-0 ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {p.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular Products */}
          {dashboard.popularProducts.length > 0 && (
            <div className="border border-neutral-100 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-5">Top Selling Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left py-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Product</th>
                      <th className="text-right py-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Price</th>
                      <th className="text-right py-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Orders</th>
                      <th className="text-right py-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.popularProducts.map((product) => (
                      <tr key={product.id} className="border-b border-neutral-50">
                        <td className="py-3 font-medium">{product.name}</td>
                        <td className="py-3 text-right">₹{product.price.toLocaleString("en-IN")}</td>
                        <td className="py-3 text-right font-semibold">{product.orders}</td>
                        <td className={`py-3 text-right font-semibold ${product.stock < 10 ? "text-red-600" : "text-green-600"}`}>{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && <AdminOrdersTab token={token!} />}

      {/* Products Tab */}
      {activeTab === "products" && <AdminProductsTab token={token!} />}
    </div>
  )
}

function AdminOrdersTab({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const result = await adminApi.allOrders({ limit: 50, status: statusFilter || undefined }, token) as { orders: Order[]; total: number }
      setOrders(result.orders)
    } catch (err: any) {
      toast.error(err.message || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId)
      await adminApi.updateOrderStatus(orderId, status, token)
      toast.success("Status updated")
      fetchOrders()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-neutral-200 px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">All Statuses</option>
          {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-neutral-100" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                {["Order ID", "Amount", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="py-3 px-2 font-mono text-xs">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-3 px-2 font-semibold">₹{order.total_amount.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 ${STATUS_COLORS[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 px-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="border border-neutral-200 px-2 py-1 text-xs outline-none bg-white disabled:opacity-50"
                    >
                      {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AdminProductsTab({ token }: { token: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const result = await productsApi.list({ limit: 50 })
      setProducts(result.products)
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await productsApi.delete(id, token)
      toast.success("Product deleted")
      fetchProducts()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-semibold hover:bg-neutral-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-neutral-100" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                {["Product", "Category", "Price", "Stock", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="py-3 px-2 font-medium">{product.name}</td>
                  <td className="py-3 px-2 text-neutral-500">{product.category}</td>
                  <td className="py-3 px-2">₹{product.price.toLocaleString("en-IN")}</td>
                  <td className={`py-3 px-2 font-semibold ${product.stock < 10 ? "text-red-600" : "text-green-600"}`}>{product.stock}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/shop/${product.id}`} className="p-1 text-neutral-400 hover:text-foreground transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1 text-neutral-400 hover:text-foreground transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
