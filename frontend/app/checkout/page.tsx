"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { ordersApi, paymentApi, type Address, type OrderItem } from "@/lib/api"
import { toast } from "sonner"
import { Shield, CreditCard } from "lucide-react"

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Puducherry", "Chandigarh",
]

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token } = useAuth()
  const { cart, localCart, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<Address>({
    name: user?.user_metadata?.full_name || "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })

  useEffect(() => {
    if (searchParams.get("payment") === "cancelled") {
      toast.error("Payment was cancelled. You can try again.")
    }
  }, [searchParams])

  useEffect(() => {
    if (!user) {
      router.push("/sign-in")
      return
    }
    if (address.name === "" && user.user_metadata?.full_name) {
      setAddress((prev) => ({ ...prev, name: user.user_metadata?.full_name as string }))
    }
  }, [user, router])

  const displayItems = cart?.items || []
  if (!user && localCart.length === 0 && displayItems.length === 0) {
    router.push("/cart")
  }

  const tax = subtotal * 0.18
  const shipping = subtotal >= 999 ? 0 : 99
  const total = subtotal + tax + shipping

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const validateAddress = () => {
    if (!address.name.trim()) return "Full name is required"
    if (!address.phone || address.phone.length < 10) return "Valid phone number is required"
    if (!address.line1.trim()) return "Address line 1 is required"
    if (!address.city.trim()) return "City is required"
    if (!address.state.trim()) return "State is required"
    if (!address.pincode || address.pincode.length < 6) return "Valid pincode is required"
    return null
  }

  const handlePayment = async () => {
    const validationError = validateAddress()
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (!token) {
      toast.error("Please sign in to continue")
      return
    }

    const items: OrderItem[] = displayItems.map((item) => ({
      product_id: item.product.id,
      qty: item.quantity,
      price: item.product.price,
    }))

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    try {
      setLoading(true)
      const order = await ordersApi.create({ items, address, total_amount: Math.round(total) }, token)
      const checkoutData = await paymentApi.createCheckout(order.id, Math.round(total), token)

      if (checkoutData.checkout_url) {
        window.location.href = checkoutData.checkout_url
      } else {
        toast.error("Failed to create checkout session")
        setLoading(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        <h1 className="nike-display text-[32px] md:text-[48px] text-[#111111] mb-8">
          CHECKOUT
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Address Form */}
          <div className="lg:col-span-2">
            <h2 className="text-[14px] font-medium text-[#111111] mb-6 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Delivery Address
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#707072] mb-2 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => handleAddressChange("name", e.target.value)}
                    className="nike-input"
                    placeholder="Your Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#707072] mb-2 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    className="nike-input"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#707072] mb-2 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={address.line1}
                  onChange={(e) => handleAddressChange("line1", e.target.value)}
                  className="nike-input"
                  placeholder="House No., Street Name"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#707072] mb-2 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={address.line2}
                  onChange={(e) => handleAddressChange("line2", e.target.value)}
                  className="nike-input"
                  placeholder="Apartment, Landmark (optional)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#707072] mb-2 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="nike-input"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#707072] mb-2 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    State *
                  </label>
                  <select
                    value={address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    className="nike-input"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#707072] mb-2 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => handleAddressChange("pincode", e.target.value)}
                    className="nike-input"
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-[#F5F5F5] p-6 md:p-8 sticky top-24">
              <h2 className="text-[14px] font-medium text-[#111111] mb-6 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-5 pb-5" style={{ borderBottom: '1px solid #E5E5E5' }}>
                {displayItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-[14px]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    <span className="text-[#707072] line-clamp-1 flex-1 mr-2">
                      {item.product?.name} &times; {item.quantity}
                    </span>
                    <span className="font-medium text-[#111111] shrink-0">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-[14px] mb-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                <div className="flex justify-between">
                  <span className="text-[#707072]">Subtotal</span>
                  <span className="font-medium text-[#111111]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#707072]">GST (18%)</span>
                  <span className="font-medium text-[#111111]">₹{Math.round(tax).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#707072]">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? "text-[#007D48]" : "text-[#111111]"}`}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="pt-3 flex justify-between font-medium text-[16px]" style={{ borderTop: '1px solid #E5E5E5' }}>
                  <span className="text-[#111111]">Total</span>
                  <span className="text-[#111111]">₹{Math.round(total).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || displayItems.length === 0}
                className="nike-btn-primary w-full text-[16px] py-4"
              >
                <CreditCard className="w-4 h-4" />
                {loading ? "Redirecting to Stripe..." : "Pay Now"}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-[12px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                <Shield className="w-3.5 h-3.5" />
                Secured by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
