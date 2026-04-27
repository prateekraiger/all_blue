"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, Gift, Target, User, Heart, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { aiApi, type Product } from "@/lib/api"

type Persona = "Partner" | "Colleague" | "Friend" | "Parent" | "Client"
type Occasion = "Birthday" | "Anniversary" | "Thank You" | "Corporate" | "Just Because"

interface GiftResult extends Product {
  matchScore: number
  reason: string
}

export default function GiftFinderPage() {
  const [step, setStep] = useState(1)
  const [persona, setPersona] = useState<Persona | null>(null)
  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [budget, setBudget] = useState(5000)
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<GiftResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!persona || !occasion) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await aiApi.generateGiftSuggestions({
        persona,
        occasion,
        budget,
      })

      setResults(response.products as GiftResult[])
      setStep(4)
    } catch (err: any) {
      console.error('[GiftFinder] API error:', err)
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden py-12 md:py-24">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 relative">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Powered by AI Recommendation Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-gradient">
            AI Gift Finder
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Let our intelligent recommendation engine find the perfect gift based on personality, occasion, and your budget.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-[700px] mx-auto mb-12 px-4">
          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-full flex-1 transition-all duration-1000 ease-out rounded-full ${step >= i ? "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : "bg-neutral-200"}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {["Recipient", "Occasion", "Budget", "Matches"].map((label, i) => (
              <span key={label} className={`text-[10px] font-black uppercase tracking-widest ${step === i + 1 ? "text-primary" : "text-neutral-400"}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Wizard */}
        <div className="max-w-[800px] mx-auto relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-neutral-100 shadow-2xl p-10 md:p-16"
              >
                <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Who is the Recipient?</h2>
                  <p className="text-neutral-500 font-medium">Every great gift starts with understanding the person.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {(["Partner", "Colleague", "Friend", "Parent", "Client"] as Persona[]).map((p, i) => (
                    <motion.button
                      key={p}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setPersona(p)}
                      className={`group relative aspect-square rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center gap-4 ${
                        persona === p 
                        ? "border-primary bg-primary text-white shadow-2xl shadow-primary/30" 
                        : "border-neutral-100 bg-neutral-50 hover:border-primary/30 hover:bg-white"
                      }`}
                    >
                      <div className={`p-4 rounded-2xl transition-colors ${persona === p ? "bg-white/20" : "bg-white"}`}>
                        {p === "Partner" && <Heart className="w-6 h-6" />}
                        {p === "Colleague" && <Briefcase className="w-6 h-6" />}
                        {p === "Friend" && <Sparkles className="w-6 h-6" />}
                        {p === "Parent" && <User className="w-6 h-6" />}
                        {p === "Client" && <Target className="w-6 h-6" />}
                      </div>
                      <span className="font-black text-xs uppercase tracking-widest">{p}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-16 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(2)}
                    disabled={!persona}
                    className="bg-neutral-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-4 shadow-2xl hover:bg-primary"
                  >
                    Set Occasion <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-neutral-100 shadow-2xl p-10 md:p-16"
              >
                <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3">
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">The Occasion?</h2>
                  <p className="text-neutral-500 font-medium">Timing is everything in the art of gifting.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["Birthday", "Anniversary", "Thank You", "Corporate", "Just Because"] as Occasion[]).map((o, i) => (
                    <motion.button
                      key={o}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setOccasion(o)}
                      className={`relative p-8 rounded-2xl border-2 transition-all duration-500 flex items-center justify-between group ${
                        occasion === o 
                        ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" 
                        : "border-neutral-100 bg-neutral-50 hover:border-primary/30"
                      }`}
                    >
                      <span className="font-black text-xs uppercase tracking-widest">{o}</span>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${occasion === o ? "border-white bg-white/20" : "border-neutral-200"}`}>
                        {occasion === o && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-16 flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-primary transition-colors">
                    Back to Recipient
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(3)}
                    disabled={!occasion}
                    className="bg-neutral-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs disabled:opacity-20 transition-all flex items-center gap-4 shadow-2xl hover:bg-primary"
                  >
                    Define Budget <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-neutral-100 shadow-2xl p-10 md:p-16"
              >
                <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Investment Range</h2>
                  <p className="text-neutral-500 font-medium">Quality has no price, but planning helps.</p>
                </div>

                <div className="py-12">
                  <div className="text-7xl font-black text-center mb-12 tracking-tighter tabular-nums text-neutral-900">
                    ₹{budget.toLocaleString("en-IN")}
                  </div>
                  <div className="relative h-12 flex items-center">
                    <input
                      type="range"
                      min="500"
                      max="25000"
                      step="500"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-2 bg-neutral-100 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="absolute top-8 left-0 right-0 flex justify-between text-[8px] font-black uppercase tracking-widest text-neutral-400">
                      <span>Min: ₹500</span>
                      <span>Mid: ₹12,500</span>
                      <span>Max: ₹25,000+</span>
                    </div>
                  </div>
                </div>

                <div className="mt-16 flex justify-between items-center">
                  <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-primary transition-colors">
                    Back to Occasion
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-primary text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center gap-4 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden group"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        Analysing Archive...
                      </>
                    ) : (
                      <>
                        Find Perfection <Sparkles className="w-5 h-5" />
                      </>
                    )}
                    <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[sweep_2s_ease-in-out_infinite]" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 4 && results && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="text-center mb-16">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Selection Curated</span>
                  <h2 className="text-6xl font-black tracking-tight uppercase mb-4">Masterpiece Matches</h2>
                  <p className="text-neutral-500 font-medium">Selected for a {persona} celebrating a {occasion}.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                  {results.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <Link
                        href={`/shop/${product.id}`}
                        className="group flex flex-col md:flex-row gap-10 p-8 rounded-[3rem] bg-white border border-neutral-100 shadow-xl hover:shadow-2xl transition-all duration-700"
                      >
                        <div className="w-full md:w-64 aspect-square bg-neutral-50 rounded-[2rem] relative overflow-hidden shrink-0 shadow-inner">
                          <Image
                            src={product.images?.[0] || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="object-contain p-8 group-hover:scale-110 transition-transform duration-1000 ease-out"
                          />
                          <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{product.matchScore}% Match</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{product.category}</span>
                            {product.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">{tag}</span>
                            ))}
                          </div>
                          <h3 className="text-4xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors">{product.name}</h3>
                          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 mb-8">
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary mb-2 block">AI Analysis</span>
                            <p className="text-neutral-600 text-sm font-medium leading-relaxed italic">"{product.reason}"</p>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                            <div className="text-3xl font-black">₹{product.price.toLocaleString("en-IN")}</div>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                              View Masterpiece <ArrowRight className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-16 text-center"
                >
                  <button
                    onClick={() => { setStep(1); setPersona(null); setOccasion(null); setResults(null); setError(null); }}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-primary transition-all hover:tracking-[0.5em]"
                  >
                    Start New Curation
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
