"use client"

import { useState, useEffect, useCallback } from "react"
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp,
  LogOut, Plus, Edit2, Trash2, Eye, EyeOff, X, Check,
  AlertTriangle, Search, ChevronLeft, ChevronRight,
  BarChart3, Users, ArrowUpRight, ArrowDownRight, Save,
  RefreshCw, ShieldCheck, Lock, Mail,
} from "lucide-react"
import { toast } from "sonner"

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@gmail.com"
const ADMIN_PASSWORD = "admin123"
const ADMIN_TOKEN = "local-admin-secret-token-allblue-2024"
const STORAGE_KEY = "allblue_admin_session"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

// ─── API helper ───────────────────────────────────────────────────────────────
async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...(options.headers as Record<string, string>),
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
  return json.data as T
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  tags?: string[]
  images?: string[]
  stock: number
  is_active: boolean
  created_at: string
}

interface Order {
  id: string
  user_id: string
  items: { product_id: string; qty: number; price: number }[]
  total_amount: number
  status: string
  created_at: string
  address: { name: string; city: string; state: string }
}

interface DashboardStats {
  stats: { totalRevenue: number; ordersToday: number; totalOrders: number; totalProducts: number }
  ordersByStatus: Record<string, number>
  lowStockProducts: { id: string; name: string; stock: number }[]
  recentOrders: Order[]
  popularProducts: (Product & { orders: number })[]
}

type Tab = "overview" | "products" | "orders"

// ─── Empty product form ───────────────────────────────────────────────────────
const emptyProduct = (): Partial<Product> => ({
  name: "", description: "", price: 0, category: "", tags: [], images: [], stock: 0, is_active: true,
})

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600)) // slight delay for UX
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "1")
      onLogin()
    } else {
      setError("Invalid email or password.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">ALL BLUE</h1>
          <p className="text-neutral-400 mt-1 text-sm tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-1">Sign in</h2>
          <p className="text-neutral-500 text-sm mb-6">Enter your admin credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all text-sm tracking-wide disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCT MODAL (Add / Edit)
// ══════════════════════════════════════════════════════════════════════════════
function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Partial<Product> | null
  onClose: () => void
  onSave: () => void
}) {
  const isNew = !product?.id
  const [form, setForm] = useState<Partial<Product>>(product ?? emptyProduct())
  const [saving, setSaving] = useState(false)
  const [tagsInput, setTagsInput] = useState((product?.tags ?? []).join(", "))
  const [imagesInput, setImagesInput] = useState((product?.images ?? []).join("\n"))

  const set = (key: keyof Product, value: any) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        images: imagesInput.split("\n").map((i) => i.trim()).filter(Boolean),
      }
      if (isNew) {
        await adminFetch("/api/products", { method: "POST", body: JSON.stringify(payload) })
        toast.success("Product created!")
      } else {
        await adminFetch(`/api/products/${product!.id}`, { method: "PUT", body: JSON.stringify(payload) })
        toast.success("Product updated!")
      }
      onSave()
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{isNew ? "Add New Product" : "Edit Product"}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{isNew ? "Fill in the details below" : `Editing: ${product?.name}`}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">Product Name *</label>
            <input
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="e.g. Luxury Gift Hamper"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Product description…"
              rows={3}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition resize-none"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price ?? 0}
                onChange={(e) => set("price", e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">Stock *</label>
              <input
                type="number"
                min="0"
                value={form.stock ?? 0}
                onChange={(e) => set("stock", e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">Category</label>
            <input
              value={form.category ?? ""}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Hampers, Jewellery, Home Decor"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">Tags <span className="font-normal text-neutral-400">(comma separated)</span></label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="luxury, birthday, handmade"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-1.5">Image URLs <span className="font-normal text-neutral-400">(one per line)</span></label>
            <textarea
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows={3}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition resize-none font-mono"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-neutral-800">Active / Visible</p>
              <p className="text-xs text-neutral-500 mt-0.5">Inactive products are hidden from the store</p>
            </div>
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-green-500" : "bg-neutral-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-neutral-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> {isNew ? "Create Product" : "Save Changes"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ stats, onTabChange }: { stats: DashboardStats; onTabChange: (t: Tab) => void }) {
  const statCards = [
    {
      label: "Total Revenue", value: `₹${stats.stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%",
    },
    {
      label: "Orders Today", value: stats.stats.ordersToday,
      icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", trend: "+5%",
    },
    {
      label: "Total Orders", value: stats.stats.totalOrders,
      icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50", trend: "+8%",
    },
    {
      label: "Products", value: stats.stats.totalProducts,
      icon: Package, color: "text-amber-600", bg: "bg-amber-50", trend: "+2",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="w-3 h-3" />{card.trend}
                </span>
              </div>
              <div className="text-2xl font-black text-neutral-900">{card.value}</div>
              <div className="text-xs text-neutral-500 mt-1 font-medium">{card.label}</div>
            </div>
          )
        })}
      </div>

      {/* Orders by status + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Status */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Orders by Status</h3>
          <div className="space-y-2">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => {
              const total = Object.values(stats.ordersByStatus).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold capitalize text-neutral-700">{status}</span>
                    <span className="text-xs text-neutral-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status === "delivered" ? "bg-green-500" :
                        status === "paid" ? "bg-blue-500" :
                        status === "shipped" ? "bg-purple-500" :
                        status === "pending" ? "bg-amber-500" :
                        "bg-red-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Low Stock Alert</h3>
          {stats.lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <Check className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-neutral-500">All products well-stocked!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <span className="text-sm font-medium text-neutral-800 truncate mr-3">{p.name}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Recent Orders</h3>
          <button onClick={() => onTabChange("orders")} className="text-xs font-semibold text-neutral-900 underline underline-offset-2 hover:opacity-70">
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {["Order ID", "Customer", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs text-neutral-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-3 px-2 text-neutral-700">{order.address?.name || "—"}</td>
                  <td className="py-3 px-2 font-bold text-neutral-900">₹{order.total_amount.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${STATUS_COLORS[order.status] || "bg-neutral-100"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-neutral-500 text-xs">{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Products */}
      {stats.popularProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Top Selling Products</h3>
            <button onClick={() => onTabChange("products")} className="text-xs font-semibold text-neutral-900 underline underline-offset-2 hover:opacity-70">
              Manage →
            </button>
          </div>
          <div className="space-y-3">
            {stats.popularProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                <span className="text-lg font-black text-neutral-200 w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">{p.name}</p>
                  <p className="text-xs text-neutral-400">{p.category || "Uncategorised"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">₹{p.price.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-neutral-500">{p.orders} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await adminFetch<{ products: Product[]; total: number }>(
        `/api/admin/products`
      )
      setProducts(result.products)
      setTotalPages(Math.ceil(result.total / 20) || 1)
    } catch (err: any) {
      toast.error(err.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will hide it from the store.`)) return
    setDeletingId(id)
    try {
      await adminFetch(`/api/products/${id}`, { method: "DELETE" })
      toast.success("Product deleted")
      fetchProducts()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (p: Product) => { setEditProduct(p); setShowModal(true) }
  const openNew = () => { setEditProduct(emptyProduct()); setShowModal(true) }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q)
    const matchFilter = filter === "all" || (filter === "active" ? p.is_active : !p.is_active)
    return matchSearch && matchFilter
  })

  return (
    <div>
      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSave={fetchProducts}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="all">All Products</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={fetchProducts} className="p-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition">
          <RefreshCw className="w-4 h-4 text-neutral-600" />
        </button>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No products found</p>
          <button onClick={openNew} className="mt-4 text-sm font-semibold text-neutral-900 underline underline-offset-2">
            Add your first product →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-neutral-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-neutral-100 shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg shrink-0 flex items-center justify-center">
                            <Package className="w-4 h-4 text-neutral-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-neutral-900 line-clamp-1">{product.name}</p>
                          {product.tags && product.tags.length > 0 && (
                            <p className="text-[11px] text-neutral-400 mt-0.5">{product.tags.slice(0, 2).join(", ")}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 capitalize">{product.category || "—"}</td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900">₹{product.price.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-amber-600" : "text-green-600"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${product.is_active ? "bg-green-100 text-green-700 border border-green-200" : "bg-neutral-100 text-neutral-500 border border-neutral-200"}`}>
                        {product.is_active ? <><Check className="w-3 h-3" /> Active</> : <><X className="w-3 h-3" /> Inactive</>}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <a
                          href={`/shop/${product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
                          title="View in store"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-neutral-400 hover:text-blue-600 transition"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition disabled:opacity-50"
                          title="Delete product"
                        >
                          {deletingId === product.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
              <span className="text-xs text-neutral-500">{filtered.length} products shown</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ORDERS TAB
// ══════════════════════════════════════════════════════════════════════════════
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ limit: "100" })
      if (statusFilter) qs.set("status", statusFilter)
      const result = await adminFetch<{ orders: Order[]; total: number }>(
        `/api/orders/admin?${qs.toString()}`
      )
      setOrders(result.orders)
    } catch (err: any) {
      toast.error(err.message || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingId(orderId)
    try {
      await adminFetch(`/api/orders/admin/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      toast.success("Order status updated")
      fetchOrders()
    } catch (err: any) {
      toast.error(err.message || "Failed to update")
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    return !q || o.id.toLowerCase().includes(q) || (o.address?.name || "").toLowerCase().includes(q)
  })

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer…"
            className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="">All Statuses</option>
          {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button onClick={fetchOrders} className="p-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition">
          <RefreshCw className="w-4 h-4 text-neutral-600" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {["Order ID", "Customer", "Items", "Amount", "Status", "Date", "Update Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-neutral-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-neutral-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-neutral-800">{order.address?.name || "—"}</p>
                      <p className="text-xs text-neutral-400">{order.address?.city}, {order.address?.state}</p>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">{(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}</td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900">₹{order.total_amount.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${STATUS_COLORS[order.status] || "bg-neutral-100"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="border border-neutral-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50 cursor-pointer"
                      >
                        {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-500">{filtered.length} order{filtered.length !== 1 ? "s" : ""} shown</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    adminFetch<DashboardStats>("/api/admin/dashboard")
      .then(setStats)
      .catch(() => toast.error("Failed to load dashboard stats"))
      .finally(() => setStatsLoading(false))
  }, [])

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-neutral-900 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-neutral-900 tracking-tight">ALL BLUE</span>
              <span className="ml-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest hidden sm:inline">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tab === id
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-neutral-900">admin@gmail.com</p>
              <p className="text-[10px] text-neutral-400">Administrator</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-red-600 font-semibold border border-neutral-200 px-3 py-2 rounded-xl hover:border-red-200 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-neutral-900">
            {tab === "overview" && "Dashboard Overview"}
            {tab === "products" && "Product Management"}
            {tab === "orders" && "Order Management"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {tab === "overview" && "Store performance at a glance"}
            {tab === "products" && "Add, edit, delete and manage all products"}
            {tab === "orders" && "View and update order statuses"}
          </p>
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          statsLoading ? (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : stats ? (
            <OverviewTab stats={stats} onTabChange={setTab} />
          ) : (
            <div className="text-center py-16 text-neutral-500">Failed to load dashboard data.</div>
          )
        )}
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
      </main>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT: Admin Entry Point
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem(STORAGE_KEY)
    if (session === "1") setIsLoggedIn(true)
    setChecking(false)
  }, [])

  const handleLogin = () => setIsLoggedIn(true)
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsLoggedIn(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />
  return <AdminDashboard onLogout={handleLogout} />
}
