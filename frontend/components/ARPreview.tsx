"use client"

import { useState } from "react"
import Image from "next/image"
import { Box, ChevronLeft, ChevronRight, Info, X, ZoomIn } from "lucide-react"
import type { ARPreviewData } from "@/lib/api"

interface ARPreviewProps {
  data: ARPreviewData
  onClose: () => void
}

export function ARPreview({ data, onClose }: ARPreviewProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const images = data.images.length > 0
    ? data.images
    : ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop"]

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIndex((i) => (i + 1) % images.length)

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col" role="dialog" aria-modal="true" aria-label="AR Product Preview">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Box className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">{data.name}</h2>
            <p className="text-white/50 text-xs">
              {data.arSupported ? "AR Preview Available" : "Image Preview"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Show instructions"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Instructions panel */}
      {showInstructions && (
        <div className="bg-black/60 border-b border-white/10 px-4 py-3 shrink-0">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">How to use</p>
          <ol className="space-y-1">
            {data.instructions.map((instruction, i) => (
              <li key={i} className="text-white/60 text-xs flex gap-2">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Main viewer */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">

        {/* Image */}
        <div
          className={`relative transition-all duration-500 ${zoomed ? "w-full h-full" : "w-[85vw] max-w-lg h-[60vh]"} flex items-center justify-center`}
          onClick={() => setZoomed(!zoomed)}
        >
          <Image
            src={images[activeIndex]}
            alt={`${data.name} — view ${activeIndex + 1}`}
            fill
            className={`object-contain transition-transform duration-500 ${zoomed ? "scale-110" : "scale-100"}`}
            unoptimized
          />
        </div>

        {/* Zoom hint */}
        <button
          onClick={() => setZoomed(!zoomed)}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0">
        <p className="text-white/50 text-xs text-center mb-3">{data.previewMessage}</p>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  i === activeIndex ? "border-primary scale-110" : "border-white/20 opacity-60"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={img} alt={`Thumbnail ${i + 1}`} width={48} height={48} className="w-full h-full object-cover" unoptimized />
              </button>
            ))}
          </div>
        )}

        {/* AR badge */}
        {data.arSupported && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary font-semibold uppercase tracking-widest">AR Ready on Mobile</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
