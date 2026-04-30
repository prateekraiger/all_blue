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
    <section className="w-full bg-[#111111]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="nike-display text-white text-[32px] md:text-[48px] lg:text-[64px] mb-4">
            STAY IN THE LOOP
          </h2>
          <p className="text-[16px] text-[#707072] mb-8 md:mb-10 leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Be the first to secure limited-edition drops and artisan collaborations. Our inner circle never misses a masterpiece.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="flex-1 bg-[#28282A] border-none rounded-full px-6 py-3.5 text-[16px] text-white outline-none placeholder:text-[#707072] focus:ring-2 focus:ring-white/20 transition-all"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            />
            <button
              type="submit"
              disabled={subscribed}
              className="nike-btn-primary-inverted text-[16px] px-8 py-3.5 shrink-0"
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
              <span key={item} className="text-[12px] text-[#707072] font-medium" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
