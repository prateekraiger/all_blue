"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, ArrowLeft, Gift, Target, User, Heart, Briefcase, Zap, RotateCcw } from "lucide-react"
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

const PERSONA_ICONS: Record<Persona, React.ReactNode> = {
  Partner: <Heart className="w-5 h-5" />,
  Colleague: <Briefcase className="w-5 h-5" />,
  Friend: <Sparkles className="w-5 h-5" />,
  Parent: <User className="w-5 h-5" />,
  Client: <Target className="w-5 h-5" />,
}

const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  Partner: "Romantic & thoughtful",
  Colleague: "Professional & classy",
  Friend: "Fun & memorable",
  Parent: "Warm & heartfelt",
  Client: "Premium & impressive",
}

const OCCASION_EMOJIS: Record<Occasion, string> = {
  Birthday: "🎂",
  Anniversary: "💕",
  "Thank You": "🙏",
  Corporate: "🏢",
  "Just Because": "✨",
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
      console.error("[GiftFinder] API error:", err)
      setError(err?.message || "Something went wrong. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const resetWizard = () => {
    setStep(1)
    setPersona(null)
    setOccasion(null)
    setBudget(5000)
    setResults(null)
    setError(null)
  }

  const budgetPresets = [1000, 2500, 5000, 10000, 25000]

  return (
    <div className="relative min-h-screen bg-background overflow-hidden py-12 md:py-24">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6 backdrop-blur-sm"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Powered by Gemini AI
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-gradient"
          >
            AI Gift Finder
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Our intelligent recommendation engine finds the perfect gift based on personality, occasion, and your budget.
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-[700px] mx-auto mb-10 md:mb-12 px-4">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-full flex-1 rounded-full"
                initial={false}
                animate={{
                  backgroundColor: step >= i ? "var(--color-primary)" : "var(--color-muted)",
                  boxShadow: step >= i ? "0 0 12px var(--color-primary)" : "none",
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3">
            {["Recipient", "Occasion", "Budget", "Results"].map((label, i) => (
              <span
                key={label}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                  step === i + 1 ? "text-primary" : "text-muted-foreground/50"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[800px] mx-auto mb-6 px-6 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Wizard Steps */}
        <div className="max-w-[800px] mx-auto relative">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Recipient ──────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card/80 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-2xl p-8 md:p-14"
              >
                <div className="text-center mb-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-foreground">
                    Who is the Recipient?
                  </h2>
                  <p className="text-muted-foreground">
                    Every great gift starts with understanding the person.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(["Partner", "Colleague", "Friend", "Parent", "Client"] as Persona[]).map(
                    (p, i) => (
                      <motion.button
                        key={p}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => setPersona(p)}
                        className={`group relative rounded-2xl border-2 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 ${
                          persona === p
                            ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                            : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl transition-colors ${
                            persona === p ? "bg-primary-foreground/20" : "bg-muted"
                          }`}
                        >
                          {PERSONA_ICONS[p]}
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-xs uppercase tracking-widest block">
                            {p}
                          </span>
                          <span
                            className={`text-[10px] mt-1 block ${
                              persona === p ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {PERSONA_DESCRIPTIONS[p]}
                          </span>
                        </div>
                      </motion.button>
                    )
                  )}
                </div>

                <div className="mt-12 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(2)}
                    disabled={!persona}
                    className="bg-foreground text-background px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl"
                  >
                    Choose Occasion <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Occasion ──────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card/80 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-2xl p-8 md:p-14"
              >
                <div className="text-center mb-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 -rotate-3">
                    <Gift className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-foreground">
                    The Occasion?
                  </h2>
                  <p className="text-muted-foreground">
                    Timing is everything in the art of gifting.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    ["Birthday", "Anniversary", "Thank You", "Corporate", "Just Because"] as Occasion[]
                  ).map((o, i) => (
                    <motion.button
                      key={o}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setOccasion(o)}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-4 group ${
                        occasion === o
                          ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                          : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{OCCASION_EMOJIS[o]}</span>
                        <span className="font-bold text-xs uppercase tracking-widest">{o}</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          occasion === o ? "border-primary-foreground/60 bg-primary-foreground/20" : "border-border"
                        }`}
                      >
                        {occasion === o && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-12 flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(3)}
                    disabled={!occasion}
                    className="bg-foreground text-background px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl"
                  >
                    Set Budget <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Budget ────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card/80 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-2xl p-8 md:p-14"
              >
                <div className="text-center mb-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-foreground">
                    Investment Range
                  </h2>
                  <p className="text-muted-foreground">
                    Quality has no price, but planning helps.
                  </p>
                </div>

                <div className="py-8">
                  {/* Budget display */}
                  <div className="text-6xl md:text-7xl font-black text-center mb-8 tracking-tighter tabular-nums text-foreground">
                    ₹{budget.toLocaleString("en-IN")}
                  </div>

                  {/* Quick presets */}
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {budgetPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setBudget(preset)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                          budget === preset
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/50"
                        }`}
                      >
                        ₹{preset.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>

                  {/* Slider */}
                  <div className="relative px-2">
                    <input
                      type="range"
                      min="500"
                      max="25000"
                      step="500"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between mt-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      <span>₹500</span>
                      <span>₹12,500</span>
                      <span>₹25,000</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-between items-center">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-primary to-accent text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:shadow-primary/25 relative overflow-hidden group disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        AI is Analysing...
                      </>
                    ) : (
                      <>
                        Find Perfection <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Results ───────────────────────────── */}
            {step === 4 && results && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 mb-4"
                  >
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                      Curated by Gemini AI
                    </span>
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3">
                    Your Perfect Matches
                  </h2>
                  <p className="text-muted-foreground">
                    Selected for a{" "}
                    <span className="text-foreground font-semibold">{persona}</span> celebrating{" "}
                    <span className="text-foreground font-semibold">{occasion}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {results.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={`/shop/${product.id}`}
                        className="group flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
                      >
                        {/* Product Image */}
                        <div className="w-full md:w-56 aspect-square bg-muted/50 rounded-2xl relative overflow-hidden shrink-0">
                          <Image
                            src={product.images?.[0] || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-border/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                              {product.matchScore}% Match
                            </span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {product.category}
                            </span>
                            {product.tags?.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-bold uppercase tracking-widest text-primary/70 bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/10"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3 group-hover:text-primary transition-colors text-foreground">
                            {product.name}
                          </h3>

                          {/* AI Reason */}
                          <div className="bg-muted/50 rounded-2xl p-4 md:p-5 border border-border/30 mb-6">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                              <Zap className="w-3 h-3" /> AI Insight
                            </span>
                            <p className="text-muted-foreground text-sm leading-relaxed italic">
                              &ldquo;{product.reason}&rdquo;
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/30">
                            <div className="text-2xl md:text-3xl font-black text-foreground">
                              ₹{product.price.toLocaleString("en-IN")}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                              View Product <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {results.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">No matches found</p>
                    <p className="text-muted-foreground/60 text-sm">
                      Try adjusting your budget or choosing different options.
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 text-center"
                >
                  <button
                    onClick={resetWizard}
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group"
                  >
                    <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                    Start New Search
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
