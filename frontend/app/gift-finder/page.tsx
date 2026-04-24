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
    <div className="min-h-screen bg-neutral-50 py-12 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-neutral-200/50 px-4 py-2 rounded-full border border-neutral-300 mb-6">
            <Sparkles className="w-4 h-4 text-foreground" />
            <span className="text-xs font-semibold uppercase tracking-widest">Powered by AI Recommendation Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            AI Gift Finder
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            Let our intelligent recommendation engine find the perfect gift based on personality, occasion, and your budget.
          </p>
        </div>

        {/* Wizard */}
        <div className="max-w-[700px] mx-auto bg-white border border-neutral-200 shadow-xl p-8 md:p-12">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <User className="w-6 h-6 text-neutral-400" />
                Who are you shopping for?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(["Partner", "Colleague", "Friend", "Parent", "Client"] as Persona[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`p-4 border-2 transition-all ${persona === p ? "border-foreground bg-foreground/5 shadow-md" : "border-neutral-200 hover:border-neutral-300"}`}
                  >
                    <span className="font-medium">{p}</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!persona}
                  className="bg-foreground text-background px-8 py-3 font-semibold uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Gift className="w-6 h-6 text-neutral-400" />
                What's the occasion?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {(["Birthday", "Anniversary", "Thank You", "Corporate", "Just Because"] as Occasion[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOccasion(o)}
                    className={`p-4 border-2 transition-all ${occasion === o ? "border-foreground bg-foreground/5 shadow-md" : "border-neutral-200 hover:border-neutral-300"}`}
                  >
                    <span className="font-medium">{o}</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 font-semibold text-sm hover:bg-neutral-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!occasion}
                  className="bg-foreground text-background px-8 py-3 font-semibold uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Target className="w-6 h-6 text-neutral-400" />
                Set your budget
              </h2>
              <div className="py-8">
                <div className="text-5xl font-extrabold text-center mb-8">
                  ₹{budget.toLocaleString("en-IN")}
                </div>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-4 font-medium uppercase tracking-widest">
                  <span>₹500</span>
                  <span>₹25,000+</span>
                </div>
              </div>
              <div className="mt-12 flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 font-semibold text-sm hover:bg-neutral-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-foreground text-background px-8 py-3 font-semibold uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors flex items-center gap-2 relative overflow-hidden group"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      Find Gifts <Sparkles className="w-4 h-4" />
                    </>
                  )}
                  {/* Sweep animation */}
                  <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[sweep_1.5s_ease-in-out_infinite]" />
                </button>
              </div>

              {/* Error display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 4 && results && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-8 border-b border-neutral-100 pb-8">
                <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">
                  {results.length > 0 ? "We found the perfect gifts!" : "No matches found"}
                </h2>
                <p className="text-neutral-500">
                  {results.length > 0
                    ? `Based on your preferences for a ${persona}'s ${occasion}.`
                    : "Try adjusting your budget or selecting different preferences."}
                </p>
              </div>
              
              <div className="space-y-6">
                {results.map((product) => {
                  const imgSrc = product.images && product.images.length > 0
                    ? product.images[0]
                    : "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop"

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex gap-6 p-4 border border-neutral-200 hover:border-foreground transition-colors group cursor-pointer"
                    >
                      <div className="w-32 h-32 bg-neutral-100 shrink-0 relative overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 font-bold uppercase tracking-wider">
                            {product.matchScore}% Match
                          </span>
                          {product.category && (
                            <span className="text-neutral-400 text-xs uppercase tracking-wider">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold">{product.name}</h3>
                        <p className="text-neutral-500 text-sm mt-1">{product.reason}</p>
                        <div className="mt-3 font-extrabold">₹{product.price.toLocaleString("en-IN")}</div>
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
                  className="text-sm font-semibold uppercase tracking-widest underline underline-offset-4 hover:opacity-50 transition-opacity"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
