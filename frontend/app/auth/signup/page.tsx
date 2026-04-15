"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      setLoading(true)
      await signUp(email, password, name)
      toast.success("Account created! Please check your email to verify.")
      router.push("/auth/login")
    } catch (err: any) {
      toast.error(err.message || "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-2">
          Create Account
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Join ALL BLUE for exclusive access
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
              placeholder="Min. 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-4 font-semibold text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-foreground font-semibold underline hover:opacity-70">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
