"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Box, Camera, ChevronLeft, ChevronRight, Info, Move, X, ZoomIn, ZoomOut } from "lucide-react"
import type { ARPreviewData } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

interface ARPreviewProps {
  data: ARPreviewData
  onClose: () => void
}

export function ARPreview({ data, onClose }: ARPreviewProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [mode, setMode] = useState<"gallery" | "camera">("gallery")
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // AR overlay state
  const [overlayScale, setOverlayScale] = useState(0.5)
  const [overlayPos, setOverlayPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 })

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const images = data.images.length > 0
    ? data.images
    : ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop"]

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIndex((i) => (i + 1) % images.length)

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch (err: any) {
      console.error("Camera error:", err)
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permission and try again."
          : err.name === "NotFoundError"
            ? "No camera found on this device."
            : "Could not start camera. Try the gallery mode instead."
      )
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }, [])

  useEffect(() => {
    if (mode === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [mode, startCamera, stopCamera])

  // Touch / pointer drag for repositioning product overlay
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, posX: overlayPos.x, posY: overlayPos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setOverlayPos({ x: dragStart.current.posX + dx, y: dragStart.current.posY + dy })
  }

  const handlePointerUp = () => {
    setDragging(false)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label="AR Product Preview">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-black/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Box className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">{data.name}</h2>
            <p className="text-white/50 text-xs">
              {mode === "camera" ? "AR Camera View" : "Image Gallery"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <button
            onClick={() => setMode(mode === "gallery" ? "camera" : "gallery")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            {mode === "gallery" ? "Try AR" : "Gallery"}
          </button>
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
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/60 border-b border-white/10 px-4 py-3 shrink-0 overflow-hidden z-10"
          >
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">How to use</p>
            <ol className="space-y-1">
              {data.instructions.map((instruction, i) => (
                <li key={i} className="text-white/60 text-xs flex gap-2">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main viewer */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">

        {/* ─── CAMERA MODE ─── */}
        {mode === "camera" && (
          <>
            {/* Video feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Scanning overlay */}
            {cameraReady && (
              <>
                {/* Corner markers */}
                <div className="absolute inset-8 pointer-events-none z-10">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/60 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/60 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/60 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/60 rounded-br-lg" />
                </div>

                {/* Product overlay */}
                <div
                  className="absolute z-20 touch-none select-none"
                  style={{
                    transform: `translate(${overlayPos.x}px, ${overlayPos.y}px) scale(${overlayScale})`,
                    cursor: dragging ? "grabbing" : "grab",
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  <div className="relative w-48 h-48 md:w-64 md:h-64 drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                    <Image
                      src={images[activeIndex]}
                      alt={data.name}
                      fill
                      className="object-contain"
                      unoptimized
                      draggable={false}
                    />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full">
                    <Move className="w-3 h-3 text-white/60" />
                    <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest">Drag to move</span>
                  </div>
                </div>

                {/* Scale controls */}
                <div className="absolute bottom-6 right-4 z-30 flex flex-col gap-2">
                  <button
                    onClick={() => setOverlayScale(s => Math.min(2, s + 0.15))}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white p-2.5 rounded-full transition-colors"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setOverlayScale(s => Math.max(0.15, s - 0.15))}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white p-2.5 rounded-full transition-colors"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                </div>

                {/* Image switcher (if multiple) */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">
                    <button onClick={prev} className="text-white/70 hover:text-white transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-white text-xs font-bold">{activeIndex + 1} / {images.length}</span>
                    <button onClick={next} className="text-white/70 hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Camera loading */}
            {!cameraReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/60 text-sm font-medium">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Camera error */}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-white text-sm font-medium mb-2">{cameraError}</p>
                  <button
                    onClick={() => setMode("gallery")}
                    className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
                  >
                    Switch to Gallery
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── GALLERY MODE ─── */}
        {mode === "gallery" && (
          <>
            <div
              className="relative w-[85vw] max-w-lg h-[60vh] flex items-center justify-center"
            >
              <Image
                src={images[activeIndex]}
                alt={`${data.name} — view ${activeIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

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
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0 bg-black/80 backdrop-blur-xl z-20">
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
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className={`${mode === "camera" && cameraReady ? "bg-green-500/20 border-green-500/30" : "bg-primary/20 border-primary/30"} border rounded-full px-4 py-1.5 flex items-center gap-2`}>
            <Box className={`w-3.5 h-3.5 ${mode === "camera" && cameraReady ? "text-green-400" : "text-primary"}`} />
            <span className={`text-xs font-semibold uppercase tracking-widest ${mode === "camera" && cameraReady ? "text-green-400" : "text-primary"}`}>
              {mode === "camera" && cameraReady ? "AR Active" : "AR Ready"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
