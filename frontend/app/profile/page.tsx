"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User, Package, Heart, LogOut, ChevronRight,
  ShoppingBag, Clock, Home, ArrowRight
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { ordersApi, type Order } from "@/lib/api"
import { toast } from "sonner"
import { motion } from "framer-motion"

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
      <div className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 animate-pulse">
          <div className="h-5 bg-[#F5F5F5] w-32 mb-6" />
          <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 bg-[#F5F5F5]" />
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-[#F5F5F5] w-48" />
              <div className="h-4 bg-[#F5F5F5] w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-[#F5F5F5]" />
            <div className="h-48 bg-[#F5F5F5]" />
            <div className="h-48 bg-[#F5F5F5]" />
          </div>
        </div>
      </div>
    )
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const memberSince = new Date(user.created_at || "").toLocaleDateString("en-IN", { year: "numeric", month: "long" })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#707072] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <Link href="/" className="hover:text-[#111111] transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#CACACB]" />
          <span className="text-[#111111] font-medium">Profile</span>
        </nav>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8" style={{ borderBottom: '1px solid #E5E5E5' }}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#111111] text-white flex items-center justify-center text-[32px] md:text-[40px] font-medium uppercase shrink-0" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {name.charAt(0)}
            </div>
            <div>
              <h1 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-1">
                {name}
              </h1>
              <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[12px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                <Clock className="w-3.5 h-3.5" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="nike-btn-secondary text-[14px] px-6 py-2.5 text-[#D30005] border-[#D30005]/30 hover:bg-[#D30005]/5 hover:border-[#D30005] self-start md:self-center"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Orders", icon: Package, href: "/orders" },
                { label: "Wishlist", icon: Heart, href: "/wishlist" },
                { label: "Shop", icon: ShoppingBag, href: "/shop" },
                { label: "Account", icon: User, href: "/profile" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group bg-[#F5F5F5] p-5 flex flex-col items-center text-center gap-3 hover:bg-[#E5E5E5] transition-colors no-underline"
                >
                  <item.icon className="w-6 h-6 text-[#111111]" />
                  <span className="text-[14px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Recent Orders */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="nike-heading text-[20px] md:text-[24px] text-[#111111]">
                  Recent Orders
                </h2>
                <Link
                  href="/orders"
                  className="text-[14px] font-medium text-[#111111] hover:text-[#707072] transition-colors flex items-center gap-1"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {fetchingOrders ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-[#F5F5F5] animate-pulse" />
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-0">
                  {recentOrders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <Link
                        href={`/orders/${order.id}`}
                        className="group flex items-center justify-between gap-4 py-5 no-underline hover:bg-[#FAFAFA] -mx-4 px-4 transition-colors"
                        style={{ borderBottom: '1px solid #E5E5E5' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#F5F5F5] flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-[#707072] group-hover:text-[#111111] transition-colors" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[12px] font-medium text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span className={`text-[11px] font-medium uppercase px-2 py-0.5 ${
                                order.status === 'delivered' ? 'bg-[#007D48]/10 text-[#007D48]' :
                                order.status === 'cancelled' ? 'bg-[#D30005]/10 text-[#D30005]' :
                                'bg-[#F5F5F5] text-[#707072]'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <h3 className="text-[16px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                              ₹{order.total_amount.toLocaleString("en-IN")}
                            </h3>
                            <p className="text-[12px] text-[#707072] mt-0.5" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                              {new Date(order.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#CACACB] group-hover:text-[#111111] group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#F5F5F5] p-12 text-center">
                  <div className="w-16 h-16 bg-white flex items-center justify-center mx-auto mb-5">
                    <ShoppingBag className="w-7 h-7 text-[#CACACB]" />
                  </div>
                  <h3 className="text-[18px] font-medium text-[#111111] mb-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    No orders yet
                  </h3>
                  <p className="text-[14px] text-[#707072] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    Your order history will appear here once you make your first purchase.
                  </p>
                  <Link href="/shop" className="nike-btn-primary text-[14px]">
                    Start Shopping <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Account Info */}
            <div className="bg-[#F5F5F5] p-6 md:p-8">
              <h3 className="text-[14px] font-medium text-[#111111] mb-6 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Account Information
              </h3>
              <div className="space-y-4" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                <div>
                  <p className="text-[12px] text-[#707072] mb-1 uppercase">Name</p>
                  <p className="text-[14px] font-medium text-[#111111]">{name}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#707072] mb-1 uppercase">Email</p>
                  <p className="text-[14px] font-medium text-[#111111]">{user.email}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#707072] mb-1 uppercase">Member Since</p>
                  <p className="text-[14px] font-medium text-[#111111]">{memberSince}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#F5F5F5] p-6 md:p-8">
              <h3 className="text-[14px] font-medium text-[#111111] mb-4 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Quick Actions
              </h3>
              <div className="space-y-1">
                {[
                  { label: "My Orders", icon: Package, href: "/orders" },
                  { label: "Wishlist", icon: Heart, href: "/wishlist" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex items-center justify-between py-3 px-2 -mx-2 hover:bg-white transition-colors no-underline"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-[#707072]" />
                      <span className="text-[14px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#CACACB] group-hover:text-[#111111] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-[#111111] p-6 md:p-8 text-center">
              <h3 className="text-[16px] font-medium text-white mb-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Need Help?
              </h3>
              <p className="text-[14px] text-white/60 mb-6 leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Our concierge team is ready to assist you with any questions.
              </p>
              <Link href="/contact" className="nike-btn-primary-inverted w-full text-[14px]">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
