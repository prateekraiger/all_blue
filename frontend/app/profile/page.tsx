"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Package, Heart, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in")
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
    router.push("/")
  }

  if (loading || !user) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-12 animate-pulse">
        <div className="h-24 w-24 bg-neutral-100 rounded-full mb-4" />
        <div className="h-6 bg-neutral-100 w-1/3 mb-2" />
        <div className="h-4 bg-neutral-100 w-1/4" />
      </div>
    )
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-foreground text-background flex items-center justify-center text-2xl font-extrabold uppercase">
          {name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">{name}</h1>
          <p className="text-sm text-neutral-500 mt-1">{user.email}</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Member since {new Date(user.created_at || "").toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/orders"
          className="flex items-center gap-4 border border-neutral-100 hover:border-neutral-300 transition-colors p-6 no-underline group"
        >
          <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-base">My Orders</div>
            <div className="text-sm text-neutral-500">View order history</div>
          </div>
        </Link>

        <Link
          href="/shop"
          className="flex items-center gap-4 border border-neutral-100 hover:border-neutral-300 transition-colors p-6 no-underline group"
        >
          <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-base">Wishlist</div>
            <div className="text-sm text-neutral-500">Saved products</div>
          </div>
        </Link>

        <div className="flex items-center gap-4 border border-neutral-100 p-6 opacity-50 cursor-not-allowed">
          <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-base">Settings</div>
            <div className="text-sm text-neutral-500">Coming soon</div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="border border-neutral-100 p-6 mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-5">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Name</div>
            <div className="text-sm font-medium">{name}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Email</div>
            <div className="text-sm font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Account ID</div>
            <div className="text-sm font-mono text-neutral-500">{user.id.slice(0, 16)}...</div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Email Verified</div>
            <div className={`text-sm font-medium ${user.email_confirmed_at ? "text-green-600" : "text-amber-600"}`}>
              {user.email_confirmed_at ? "Verified" : "Not verified"}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="mt-8 flex items-center gap-2 border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-600 hover:border-foreground hover:text-foreground transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  )
}
