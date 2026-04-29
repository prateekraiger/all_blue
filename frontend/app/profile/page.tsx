"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User, Package, Heart, Settings, LogOut, ChevronRight,
  ShoppingBag, MapPin, ShieldCheck, Clock, CreditCard,
  Gift, Bell, HelpCircle, UserCheck
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { ordersApi, type Order } from "@/lib/api"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, signOut, loading, token } = useAuth()
  const router = useRouter()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [fetchingOrders, setFetchingOrders] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (token && user) {
      const fetchRecentOrders = async () => {
        try {
          setFetchingOrders(true)
          const result = await ordersApi.list({ page: 1, limit: 3 }, token)
          setRecentOrders(result.orders)
        } catch (err) {
          console.error("Failed to fetch recent orders:", err)
        } finally {
          setFetchingOrders(false)
        }
      }
      fetchRecentOrders()
    }
  }, [token, user])

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
    router.push("/")
  }

  if (loading || !user) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 animate-pulse">
        <div className="flex items-center gap-6 mb-12">
          <div className="h-20 w-20 bg-slate-100 rounded-[2rem]" />
          <div className="space-y-3 flex-1">
            <div className="h-10 bg-slate-100 w-1/4 rounded-xl" />
            <div className="h-4 bg-slate-100 w-1/3 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-64 bg-slate-50 rounded-[2.5rem]" />
          <div className="h-64 bg-slate-50 rounded-[2.5rem]" />
          <div className="h-64 bg-slate-50 rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const memberSince = new Date(user.created_at || "").toLocaleDateString("en-IN", { year: "numeric", month: "long" })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-12">

        {/* Profile Header */}
        <div className="relative mb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 relative z-10">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-900 text-white flex items-center justify-center text-5xl font-black rounded-[3rem] shadow-2xl shadow-slate-900/20 uppercase ring-8 ring-white">
              {name.charAt(0)}
            </div>

            <div className="flex-1 text-center md:text-left pb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-blue-100">
                  <UserCheck className="w-3.5 h-3.5" /> Premium Member
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-slate-500 font-medium text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 opacity-50" /> Joined {memberSince}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Account Verified
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 px-6 py-3 rounded-2xl text-xs font-black transition-all border border-slate-100 hover:border-red-100 uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Background Highlight */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Orders", value: recentOrders.length || 0, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
                { label: "Rewards", value: "240", icon: Gift, color: "bg-amber-50 text-amber-600" },
                { label: "Wishlist", value: "12", icon: Heart, color: "bg-rose-50 text-rose-600" },
                { label: "Saved", value: "3", icon: MapPin, color: "bg-emerald-50 text-emerald-600" },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 hover:border-blue-100 transition-colors">
                  <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders Section */}
            <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                <Link href="/orders" className="text-[10px] font-black text-slate-900 hover:text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 group transition-colors">
                  Full History <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {fetchingOrders ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-28 bg-slate-50 rounded-[2rem] border border-slate-100 animate-pulse" />)}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="group block bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                            <Package className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                              ₹{order.total_amount.toLocaleString("en-IN")}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              {new Date(order.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric" })} · {order.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {order.status}
                          </div>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                            Manage Order
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50/50 rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No orders yet</h3>
                  <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto font-medium">Your collection starts with your first purchase. Explore our latest drops.</p>
                  <Link href="/shop" className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                    Start Shopping
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar / Settings Area */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Account Settings</h3>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { label: "Profile Information", icon: User, href: "/profile", color: "bg-blue-50 text-blue-600" },
                  { label: "Delivery Addresses", icon: MapPin, href: "/profile", color: "bg-emerald-50 text-emerald-600", disabled: true },
                  { label: "Payment Methods", icon: CreditCard, href: "/profile", color: "bg-indigo-50 text-indigo-600", disabled: true },
                  { label: "Notifications", icon: Bell, href: "/profile", color: "bg-amber-50 text-amber-600", disabled: true },
                  { label: "Privacy & Security", icon: Settings, href: "/profile", color: "bg-slate-100 text-slate-600", disabled: true },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer group'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 ${item.color} rounded-xl group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </div>
                    {!item.disabled && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />}
                    {item.disabled && <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded-full uppercase text-slate-400">Soon</span>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
