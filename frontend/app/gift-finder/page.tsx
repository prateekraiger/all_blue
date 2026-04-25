"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, Gift, Target, User, Heart, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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

        {/* Wizard */}
        <div className="max-w-[700px] mx-auto glass rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-500 hover:shadow-primary/10">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                Who are you shopping for?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(["Partner", "Colleague", "Friend", "Parent", "Client"] as Persona[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${persona === p ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.02]" : "border-border hover:border-primary/40 hover:bg-primary/5"}`}
                  >
                    <span className={`font-semibold relative z-10 ${persona === p ? "text-primary" : "text-foreground"}`}>{p}</span>
                    {persona === p && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
                  </button>
                ))}
              </div>
              <div className="mt-12 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!persona}
                  className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Gift className="w-6 h-6 text-primary" />
                What's the occasion?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {(["Birthday", "Anniversary", "Thank You", "Corporate", "Just Because"] as Occasion[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOccasion(o)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${occasion === o ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.02]" : "border-border hover:border-primary/40 hover:bg-primary/5"}`}
                  >
                    <span className={`font-semibold relative z-10 ${occasion === o ? "text-primary" : "text-foreground"}`}>{o}</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 font-semibold text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!occasion}
                  className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                Set your budget
              </h2>
              <div className="py-8">
                <div className="text-6xl font-black text-center mb-10 text-gradient tabular-nums">
                  ₹{budget.toLocaleString("en-IN")}
                </div>
                <div className="px-4">
                  <input
                    type="range"
                    min="500"
                    max="25000"
                    step="500"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-6 font-bold uppercase tracking-widest">
                    <span>₹500</span>
                    <span>₹12,500</span>
                    <span>₹25,000+</span>
                  </div>
                </div>
              </div>
              <div className="mt-12 flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 font-semibold text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 relative overflow-hidden group shadow-xl shadow-primary/30"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" /> Thinking...
                    </>
                  ) : (
                    <>
                      Find Perfect Gifts <Sparkles className="w-5 h-5" />
                    </>
                  )}
                  {/* Sweep animation */}
                  <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[sweep_1.5s_ease-in-out_infinite]" />
                </button>
              </div>

              {/* Error display */}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in zoom-in-95">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {step === 4 && results && (
            <div className="animate-in fade-in zoom-in-95 duration-700">
              <div className="text-center mb-10 pb-10 border-b border-border/50">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-rose-500 animate-bounce" />
                </div>
                <h2 className="text-3xl font-black mb-3">
                  {results.length > 0 ? "Handpicked for You" : "No matches found"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {results.length > 0
                    ? `Curated gifts for your ${persona}'s ${occasion}.`
                    : "Try adjusting your budget or selecting different preferences."}
                </p>
              </div>
              
              <div className="space-y-4">
                {results.map((product) => {
                  const imgSrc = product.images && product.images.length > 0
                    ? product.images[0]
                    : "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop"

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex gap-6 p-5 rounded-2xl border border-border bg-card/50 hover:border-primary/50 hover:bg-primary/[0.02] hover:translate-x-1 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="w-28 h-28 bg-muted rounded-xl shrink-0 relative overflow-hidden shadow-inner">
                        <Image
                          src={imgSrc}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                            {product.matchScore}% Match
                          </span>
                          {product.category && (
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-2 leading-relaxed">{product.reason}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-2xl font-black text-foreground">₹{product.price.toLocaleString("en-IN")}</div>
                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold uppercase tracking-tighter">
                            View Details <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <button
                  onClick={() => {
                    setStep(1); setPersona(null); setOccasion(null); setResults(null); setError(null);
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-3 h-3" /> Start New Search
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
