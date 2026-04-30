"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Gift,
  Target,
  User,
  Heart,
  Briefcase,
  Zap,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi, type Product } from "@/lib/api";
import { useEffect } from "react";

type Persona = string;
type Occasion = string;

interface GiftResult extends Product {
  matchScore: number;
  reason: string;
}

const PERSONA_ICONS: Record<string, React.ReactNode> = {
  Partner: <Heart className="w-5 h-5" />,
  Colleague: <Briefcase className="w-5 h-5" />,
  Friend: <Gift className="w-5 h-5" />,
  Parent: <User className="w-5 h-5" />,
  Client: <Target className="w-5 h-5" />,
};

const PERSONA_DESCRIPTIONS: Record<string, string> = {
  Partner: "Romantic & thoughtful",
  Colleague: "Professional & classy",
  Friend: "Fun & memorable",
  Parent: "Warm & heartfelt",
  Client: "Premium & impressive",
};

const OCCASION_EMOJIS: Record<string, string> = {
  Birthday: "🎂",
  Anniversary: "💕",
  "Thank You": "🙏",
  Corporate: "🏢",
  "Just Because": "✨",
};

export default function GiftFinderPage() {
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [budget, setBudget] = useState(5000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GiftResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    personas: string[];
    occasions: string[];
    budgetRange: { min: number; max: number };
  }>({
    personas: ["Partner", "Colleague", "Friend", "Parent", "Client"],
    occasions: [
      "Birthday",
      "Anniversary",
      "Thank You",
      "Corporate",
      "Just Because",
    ],
    budgetRange: { min: 500, max: 25000 },
  });

  useEffect(() => {
    aiApi
      .getGiftFinderMetadata()
      .then((res) => {
        setMetadata(res);
        // Set initial budget to a reasonable midpoint if current budget is out of range
        if (budget < res.budgetRange.min || budget > res.budgetRange.max) {
          setBudget(
            Math.round((res.budgetRange.min + res.budgetRange.max) / 4 / 500) *
              500,
          );
        }
      })
      .catch((err) => {
        console.error("[GiftFinder] Failed to fetch metadata:", err);
      });
  }, []);

  const handleGenerate = async () => {
    if (!persona || !occasion) return;
    setIsGenerating(true);
    setError(null);
    try {
      const response = await aiApi.generateGiftSuggestions({
        persona,
        occasion,
        budget,
      });
      setResults(response.products as GiftResult[]);
      setStep(4);
    } catch (err: any) {
      console.error("[GiftFinder] API error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setPersona(null);
    setOccasion(null);
    setBudget(
      Math.round(
        (metadata.budgetRange.min + metadata.budgetRange.max) / 4 / 500,
      ) * 500,
    );
    setResults(null);
    setError(null);
  };

  const budgetPresets = [
    metadata.budgetRange.min,
    Math.round(
      (metadata.budgetRange.min +
        (metadata.budgetRange.max - metadata.budgetRange.min) * 0.25) /
        500,
    ) * 500,
    Math.round(
      (metadata.budgetRange.min + metadata.budgetRange.max) / 2 / 500,
    ) * 500,
    Math.round(
      (metadata.budgetRange.min +
        (metadata.budgetRange.max - metadata.budgetRange.min) * 0.75) /
        500,
    ) * 500,
    metadata.budgetRange.max,
  ].filter((v, i, a) => a.indexOf(v) === i); // unique values

  return (
    <div className="min-h-screen bg-white py-12 md:py-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          {" "}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="nike-display text-[48px] md:text-[64px] lg:text-[96px] text-[#111111] mb-4"
          >
            AI GIFT FINDER
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[16px] md:text-[18px] text-[#707072] max-w-2xl mx-auto"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Our intelligent recommendation engine finds the perfect gift based
            on personality, occasion, and your budget.
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-[700px] mx-auto mb-10 md:mb-12">
          <div className="h-1 w-full bg-[#E5E5E5] flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-full flex-1"
                initial={false}
                animate={{ backgroundColor: step >= i ? "#111111" : "#E5E5E5" }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3">
            {["Recipient", "Occasion", "Budget", "Results"].map((label, i) => (
              <span
                key={label}
                className={`text-[11px] font-medium uppercase tracking-wider transition-colors ${
                  step === i + 1 ? "text-[#111111]" : "text-[#CACACB]"
                }`}
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[800px] mx-auto mb-6 px-6 py-4 bg-[#D30005]/5 text-[#D30005] text-[14px] text-center"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Wizard Steps */}
        <div className="max-w-[800px] mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Recipient */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="bg-[#FAFAFA] p-8 md:p-12"
              >
                <div className="text-center mb-10">
                  <div className="w-12 h-12 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
                    <User className="w-6 h-6 text-[#111111]" />
                  </div>
                  <h2 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-2">
                    Who is the Recipient?
                  </h2>
                  <p
                    className="text-[14px] text-[#707072]"
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    Every great gift starts with understanding the person.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {metadata.personas.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPersona(p)}
                      className={`p-5 flex flex-col items-center gap-3 transition-all duration-200 ${
                        persona === p
                          ? "bg-[#111111] text-white"
                          : "bg-white text-[#111111] border border-[#CACACB] hover:border-[#111111]"
                      }`}
                    >
                      <div
                        className={`p-2.5 ${persona === p ? "bg-white/10" : "bg-[#F5F5F5]"}`}
                      >
                        {PERSONA_ICONS[p] || <User className="w-5 h-5" />}
                      </div>
                      <div className="text-center">
                        <span
                          className="text-[14px] font-medium block"
                          style={{
                            fontFamily:
                              '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          }}
                        >
                          {p}
                        </span>
                        <span
                          className={`text-[11px] block mt-0.5 ${persona === p ? "text-white/60" : "text-[#707072]"}`}
                          style={{
                            fontFamily:
                              '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          }}
                        >
                          {PERSONA_DESCRIPTIONS[p] || "Unique & Special"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!persona}
                    className="nike-btn-primary text-[14px] px-10 py-3.5"
                  >
                    Choose Occasion <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Occasion */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="bg-[#FAFAFA] p-8 md:p-12"
              >
                <div className="text-center mb-10">
                  <div className="w-12 h-12 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
                    <Gift className="w-6 h-6 text-[#111111]" />
                  </div>
                  <h2 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-2">
                    The Occasion?
                  </h2>
                  <p
                    className="text-[14px] text-[#707072]"
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    Timing is everything in the art of gifting.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {metadata.occasions.map((o) => (
                    <button
                      key={o}
                      onClick={() => setOccasion(o)}
                      className={`p-5 flex items-center justify-between gap-4 transition-all duration-200 ${
                        occasion === o
                          ? "bg-[#111111] text-white"
                          : "bg-white text-[#111111] border border-[#CACACB] hover:border-[#111111]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {OCCASION_EMOJIS[o] || "✨"}
                        </span>
                        <span
                          className="text-[14px] font-medium"
                          style={{
                            fontFamily:
                              '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          }}
                        >
                          {o}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          occasion === o ? "border-white" : "border-[#CACACB]"
                        }`}
                      >
                        {occasion === o && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-[14px] font-medium text-[#707072] hover:text-[#111111] transition-colors"
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!occasion}
                    className="nike-btn-primary text-[14px] px-10 py-3.5"
                  >
                    Set Budget <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Budget */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="bg-[#FAFAFA] p-8 md:p-12"
              >
                <div className="text-center mb-10">
                  <div className="w-12 h-12 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
                    <Target className="w-6 h-6 text-[#111111]" />
                  </div>
                  <h2 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-2">
                    Investment Range
                  </h2>
                  <p
                    className="text-[14px] text-[#707072]"
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    Quality has no price, but planning helps.
                  </p>
                </div>

                <div className="py-8">
                  <div className="nike-display text-[48px] md:text-[64px] text-[#111111] text-center mb-8 tabular-nums">
                    ₹{budget.toLocaleString("en-IN")}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {budgetPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setBudget(preset)}
                        className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 ${
                          budget === preset
                            ? "bg-[#111111] text-white"
                            : "bg-[#F5F5F5] text-[#707072] hover:bg-[#E5E5E5] hover:text-[#111111]"
                        }`}
                        style={{
                          fontFamily:
                            '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        }}
                      >
                        ₹{preset.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>

                  <div className="px-2">
                    <input
                      type="range"
                      min={metadata.budgetRange.min}
                      max={metadata.budgetRange.max}
                      step="500"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-1 bg-[#E5E5E5] appearance-none cursor-pointer accent-[#111111]"
                    />
                    <div
                      className="flex justify-between mt-3 text-[11px] font-medium text-[#CACACB]"
                      style={{
                        fontFamily:
                          '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      }}
                    >
                      <span>
                        ₹{metadata.budgetRange.min.toLocaleString("en-IN")}
                      </span>
                      <span>
                        ₹
                        {Math.round(
                          (metadata.budgetRange.min +
                            metadata.budgetRange.max) /
                            2,
                        ).toLocaleString("en-IN")}
                      </span>
                      <span>
                        ₹{metadata.budgetRange.max.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-between items-center">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 text-[14px] font-medium text-[#707072] hover:text-[#111111] transition-colors"
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="nike-btn-primary text-[14px] px-10 py-3.5"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "linear",
                          }}
                        >
                          <Gift className="w-4 h-4" />
                        </motion.div>
                        AI is Analysing...
                      </>
                    ) : (
                      <>
                        Find Perfection <Gift className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Results */}
            {step === 4 && results && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.2,
                    }}
                    className="inline-flex items-center gap-2 bg-[#007D48]/10 px-4 py-2 rounded-full mb-4"
                  >
                    <Gift className="w-4 h-4 text-[#007D48]" />
                    <span
                      className="text-[12px] font-medium text-[#007D48] uppercase tracking-wider"
                      style={{
                        fontFamily:
                          '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      }}
                    >
                      Curated by Gemini 2.0
                    </span>
                  </motion.div>
                  <h2 className="nike-display text-[32px] md:text-[48px] text-[#111111] mb-3">
                    YOUR PERFECT MATCHES
                  </h2>
                  <p
                    className="text-[14px] text-[#707072]"
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    Selected for a{" "}
                    <span className="text-[#111111] font-medium">
                      {persona}
                    </span>{" "}
                    celebrating{" "}
                    <span className="text-[#111111] font-medium">
                      {occasion}
                    </span>
                    .
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {results.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        href={`/shop/${product.id}`}
                        className="group flex flex-col md:flex-row gap-6 p-6 md:p-8 bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors duration-300 no-underline"
                      >
                        {/* Product Image */}
                        <div className="w-full md:w-48 aspect-square bg-white relative overflow-hidden shrink-0">
                          <Image
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-[#111111] text-white px-3 py-1">
                            <span
                              className="text-[11px] font-medium"
                              style={{
                                fontFamily:
                                  '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              }}
                            >
                              {product.matchScore}% Match
                            </span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span
                              className="text-[12px] font-medium text-[#707072]"
                              style={{
                                fontFamily:
                                  '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              }}
                            >
                              {product.category}
                            </span>
                            {product.tags?.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] font-medium text-[#707072] bg-white px-2 py-0.5"
                                style={{
                                  fontFamily:
                                    '"Helvetica Neue", Helvetica, Arial, sans-serif',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h3 className="nike-heading text-[20px] md:text-[24px] text-[#111111] mb-3 group-hover:underline">
                            {product.name}
                          </h3>

                          {/* AI Reason */}
                          <div className="bg-white p-4 mb-4">
                            <span
                              className="text-[11px] font-medium text-[#111111] mb-1 flex items-center gap-1.5 uppercase"
                              style={{
                                fontFamily:
                                  '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              }}
                            >
                              <Zap className="w-3 h-3" /> AI Insight
                            </span>
                            <p
                              className="text-[14px] text-[#707072] leading-relaxed italic"
                              style={{
                                fontFamily:
                                  '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              }}
                            >
                              &ldquo;{product.reason}&rdquo;
                            </p>
                          </div>

                          <div
                            className="flex items-center justify-between pt-3"
                            style={{ borderTop: "1px solid #E5E5E5" }}
                          >
                            <span
                              className="text-[20px] md:text-[24px] font-medium text-[#111111]"
                              style={{
                                fontFamily:
                                  '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              }}
                            >
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            <span
                              className="text-[14px] font-medium text-[#707072] group-hover:text-[#111111] flex items-center gap-1 transition-colors"
                              style={{
                                fontFamily:
                                  '"Helvetica Neue", Helvetica, Arial, sans-serif',
                              }}
                            >
                              View Product <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {results.length === 0 && (
                  <div className="text-center py-16">
                    <Gift className="w-10 h-10 text-[#CACACB] mx-auto mb-4" />
                    <p
                      className="text-[16px] text-[#707072] mb-2"
                      style={{
                        fontFamily:
                          '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      }}
                    >
                      No matches found
                    </p>
                    <p
                      className="text-[14px] text-[#CACACB]"
                      style={{
                        fontFamily:
                          '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      }}
                    >
                      Try adjusting your budget or choosing different options.
                    </p>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 text-center"
                >
                  <button
                    onClick={resetWizard}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-[#707072] hover:text-[#111111] transition-colors group"
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                    Start New Search
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
