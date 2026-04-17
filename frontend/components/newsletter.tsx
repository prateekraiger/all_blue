"use client"

import { type FormEvent, useState } from "react"
import { motion } from "framer-motion"
import { Mail, Send, Sparkles, ArrowRight } from "lucide-react"

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
    <section className="w-full px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mb-32">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-[1920px] mx-auto rounded-[2.5rem] md:rounded-[4rem] bg-[#0A0A0A] py-16 md:py-32 px-6 flex flex-col items-center text-center overflow-hidden relative shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5"
      >
        {/* Immersive Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[150px] rounded-full" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-full mb-8 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-blue-400">The Global Elite List</span>
          </motion.div>
          
          <h2 className="text-[clamp(2.5rem,10vw,6rem)] font-black text-white mb-8 tracking-tighter uppercase leading-[0.9] flex flex-col">
            <span>Redefine</span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-600 italic">Your Gifting</span>
          </h2>
          
          <p className="text-neutral-400 text-base md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Be the first to secure limited-edition drops and artisan collaborations. Our inner circle never misses a masterpiece.
          </p>

          <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto w-full group">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-full p-2 transition-all duration-500 group-focus-within:border-primary/40 group-focus-within:bg-white/[0.05] group-focus-within:shadow-[0_0_50px_rgba(37,99,235,0.15)]">
              <div className="flex-1 flex items-center px-4">
                <Mail className="w-5 h-5 text-neutral-500 mr-3 hidden sm:block" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="bg-transparent border-none py-4 px-2 text-white w-full text-base md:text-lg outline-none placeholder:text-neutral-600 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={subscribed}
                className={`relative overflow-hidden group/btn px-10 py-4 rounded-xl sm:rounded-full font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl ${subscribed ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-white hover:text-black hover:scale-[1.02] active:scale-95'}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {subscribed ? (
                    <>Subscribed <Sparkles className="w-4 h-4" /></>
                  ) : (
                    <>Join Matrix <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" /></>
                  )}
                </span>
                {!subscribed && (
                  <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 opacity-40">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">10k+ Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Weekly Curation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Private Events</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
