"use client"

import { type FormEvent, useState } from "react"
import { ArrowRight } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
    setTimeout(() => {
      setEmail("")
      setSubscribed(false)
    }, 3000)
  }

  return (
    <section className="w-full bg-[#FAFAFA]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-[32px] md:text-[48px] lg:text-[64px] mb-4 text-[#111111]">
            STAY IN THE LOOP
          </h2>
          <p className="text-[16px] text-black/60 mb-8 md:mb-10 leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Be the first to secure limited-edition drops and artisan collaborations. Our inner circle never misses a masterpiece.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="flex-1 bg-white border border-black/10 rounded-full px-6 py-3.5 text-[16px] text-[#111111] outline-none placeholder:text-black/40 focus:ring-2 focus:ring-black/10 transition-all"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            />
            <button
              type="submit"
              disabled={subscribed}
              className="bg-[#111111] text-white hover:bg-black rounded-full flex items-center justify-center gap-2 font-medium transition-colors text-[16px] px-8 py-3.5 shrink-0"
            >
              {subscribed ? "Subscribed" : (
                <>
                  Sign Up <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {["10k+ Members", "Weekly Drops", "Exclusive Access"].map((item) => (
              <span key={item} className="text-[12px] text-black/60 font-medium" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
