"use client"

import { useState, useRef, useEffect } from "react"
import { Smartphone, X, Camera, Move, RotateCcw, ZoomIn, ArrowLeft, Maximize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Product } from "@/lib/api"

interface ARViewerButtonProps {
  product: Product
}

/**
 * AR Preview Button + Full-Screen AR Modal
 * 
 * Works entirely client-side using the device camera + product image overlay.
 * The user can:
 *   - Tap to place the product in their camera view
 *   - Drag to reposition
 *   - Pinch/slider to resize
 *   - Rotate the product
 *   - Capture a screenshot
 */
export function ARViewerButton({ product }: ARViewerButtonProps) {
  const [showAR, setShowAR] = useState(false)

  const arServerUrl = process.env.NEXT_PUBLIC_AR_SERVER_URL || "http://localhost:4000"
  const imageUrl = product.images?.[0] || ""
  const productName = encodeURIComponent(product.name)
  const imageParam = encodeURIComponent(imageUrl)

  // Build the AR viewer URL 
  const arUrl = `${arServerUrl}/ar/${product.id}?name=${productName}&image=${imageParam}&back=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`

  return (
    <>
      {/* View in AR Button */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowAR(true)}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 hover:from-primary/20 hover:via-primary/10 hover:to-accent/20 border-2 border-primary/20 hover:border-primary/40 text-primary py-4 px-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5 group relative overflow-hidden"
      >
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <Smartphone className="w-5 h-5" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
            />
          </div>
          <span>View in AR</span>
          <Maximize2 className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.button>

      {/* AR Modal (Full-screen iframe or in-app viewer) */}
      <AnimatePresence>
        {showAR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black"
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAR(false)}
              className="fixed top-4 right-4 z-[10000] bg-white/15 backdrop-blur-xl border border-white/20 text-white p-3 rounded-full hover:bg-white/25 transition-all shadow-2xl"
              style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Embedded AR Viewer */}
            <ARViewerInline product={product} onClose={() => setShowAR(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Inline AR Viewer (works without external server) ────────────────────────

interface ARViewerInlineProps {
  product: Product
  onClose: () => void
}

function ARViewerInline({ product, onClose }: ARViewerInlineProps) {
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [isPlaced, setIsPlaced] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [brightness, setBrightness] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showCapture, setShowCapture] = useState(false)
  const [cameraZoom, setCameraZoom] = useState(1)
  const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number; max: number; step: number } | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const arServerUrl = process.env.NEXT_PUBLIC_AR_SERVER_URL || "http://localhost:4000"
  const rawImageUrl = product.images?.[0] || ""
  
  // Use proxy for external images to avoid CORS issues with Canvas capture
  const imageUrl = rawImageUrl.startsWith("http") && !rawImageUrl.includes("localhost")
    ? `${arServerUrl}/proxy?url=${encodeURIComponent(rawImageUrl)}`
    : rawImageUrl;

  // AR scale based on product category
  const getBaseSize = () => {
    const cat = product.category?.toLowerCase() || ""
    if (cat.includes("living") || cat.includes("bedroom")) return 280
    if (cat.includes("lighting")) return 180
    if (cat.includes("decor")) return 160
    return 200
  }

  const baseSize = getBaseSize()

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let isMounted = true
    const video = videoRef.current
    if (!video) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          // Get camera capabilities for zoom
          const track = stream.getVideoTracks()[0]
          try {
            const capabilities = track.getCapabilities() as any
            if (capabilities.zoom) {
              setZoomCapabilities({
                min: capabilities.zoom.min,
                max: capabilities.zoom.max,
                step: capabilities.zoom.step
              })
              setCameraZoom(capabilities.zoom.min)
            }
          } catch (e) {
            console.log("Zoom not supported by this camera")
          }

          const playVideo = async () => {
            if (!videoRef.current || !isMounted) return
            try {
              await videoRef.current.play()
              setCameraReady(true)
            } catch (error: any) {
              // Ignore AbortError - it happens if the request is interrupted by a new load or unmount
              if (error.name !== "AbortError" && isMounted) {
                console.error("Video play error:", error)
              }
            }
          }

          videoRef.current.oncanplay = playVideo
          // Also try playing immediately if already ready
          if (videoRef.current.readyState >= 2) {
            playVideo()
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Camera access error:", err)
          setCameraError(true)
        }
      }
    }

    startCamera()

    return () => {
      isMounted = false
      if (video) {
        video.oncanplay = null
        video.srcObject = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [facingMode])

  const handlePlace = (clientX: number, clientY: number) => {
    if (isPlaced) return
    setIsPlaced(true)
    setPosition({ x: clientX, y: clientY })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-controls]")) return
    if (!isPlaced) {
      handlePlace(e.clientX, e.clientY)
    }
  }

  const handleCanvasTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-controls]")) return
    if (!isPlaced && e.touches.length === 1) {
      handlePlace(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  // Drag handlers for product overlay
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!isPlaced) return
    setIsDragging(true)
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    })
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    setPosition({
      x: clientX - dragOffset.x,
      y: clientY - dragOffset.y,
    })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleReset = () => {
    setIsPlaced(false)
    setPosition({ x: 0, y: 0 })
    setScale(1)
    setRotation(0)
    setOpacity(1)
    setBrightness(1)
    if (zoomCapabilities) {
      applyCameraZoom(zoomCapabilities.min)
    }
  }

  const applyCameraZoom = async (val: number) => {
    setCameraZoom(val)
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0]
      try {
        await track.applyConstraints({
          advanced: [{ zoom: val }] as any
        })
      } catch (e) {
        console.error("Failed to apply zoom:", e)
      }
    }
  }

  const handleRotate = () => {
    setRotation((r) => (r + 45) % 360)
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment")
    setCameraReady(false)
  }

  const handleCapture = async () => {
    setShowCapture(true)
    setTimeout(() => setShowCapture(false), 200)

    try {
      const video = document.getElementById("ar-video-feed") as HTMLVideoElement
      if (!video) return

      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth || 1920
      canvas.height = video.videoHeight || 1080
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Draw mirrored video
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      ctx.restore()

      // Draw product overlay
      const img = document.getElementById("ar-product-img") as HTMLImageElement
      if (img && img.complete && img.naturalWidth > 0) {
        const scaleX = canvas.width / window.innerWidth
        const scaleY = canvas.height / window.innerHeight
        const size = baseSize * scale
        const drawW = size * scaleX
        const drawH = size * scaleY
        const drawX = (position.x - size / 2) * scaleX
        const drawY = (position.y - size / 2) * scaleY

        ctx.save()
        ctx.translate(drawX + drawW / 2, drawY + drawH / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.globalAlpha = opacity
        ctx.filter = `drop-shadow(0px 20px 40px rgba(0,0,0,0.4)) brightness(${brightness})`
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
        ctx.restore()
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `AR_Preview_${product.name.replace(/\s+/g, "_")}_${Date.now()}.jpg`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        },
        "image/jpeg",
        0.92
      )
    } catch {
      // Screenshot failed silently
    }
  }

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center">
          <Camera className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Camera Access Required</h2>
        <p className="text-white/50 text-sm max-w-xs leading-relaxed">
          Please allow camera access in your browser settings to use AR Preview.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { setCameraError(false); setCameraReady(false) }}
            className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm border border-white/20"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onClick={handleCanvasClick}
      onTouchEnd={handleCanvasTouch}
      onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
      onMouseUp={handleDragEnd}
      onTouchMove={(e) => {
        if (e.touches.length === 1 && isDragging) {
          handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
        }
      }}
    >
      {/* Camera Feed */}
      <video
        id="ar-video-feed"
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Loading overlay */}
      {!cameraReady && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center gap-4">
          <div className="text-3xl font-black tracking-tighter text-white">ALL BLUE</div>
          <div className="w-8 h-8 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Initializing AR Preview...</p>
        </div>
      )}

      {/* Capture flash */}
      <AnimatePresence>
        {showCapture && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white z-[200] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Surface indicator (before placement) */}
      {cameraReady && !isPlaced && (
        <>
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 opacity-40 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white rounded-full" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 w-full bg-white rounded-full" />
          </div>

          {/* Surface detection ellipse */}
          <div
            className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 w-48 h-24 border-2 border-dashed rounded-[50%] pointer-events-none z-10 animate-pulse"
            style={{
              borderColor: "rgba(100, 140, 255, 0.5)",
              background: "radial-gradient(ellipse, rgba(100,140,255,0.1), transparent)",
              transform: "translate(-50%, -50%) perspective(500px) rotateX(60deg)",
            }}
          />

          {/* Instruction */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-20 z-20 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 text-center">
              <p className="text-white/90 text-sm font-semibold">Tap anywhere to place product</p>
              <p className="text-white/40 text-xs mt-1">Drag to move &bull; Slider to resize</p>
            </div>
          </div>
        </>
      )}

      {/* Placed product overlay */}
      {isPlaced && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute z-20"
          style={{
            left: position.x - (baseSize * scale) / 2,
            top: position.y - (baseSize * scale) / 2,
            width: baseSize * scale,
            height: baseSize * scale,
            transform: `rotate(${rotation}deg)`,
            opacity: opacity,
            filter: `drop-shadow(0 20px 40px rgba(0,0,0,${0.4 * opacity})) brightness(${brightness})`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            handleDragStart(e.clientX, e.clientY)
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            if (e.touches.length === 1) {
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
            }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id="ar-product-img"
            src={imageUrl}
            alt={product.name}
            onLoad={() => {
              setImageLoading(false)
              setImageError(false)
            }}
            onError={() => {
              setImageLoading(false)
              setImageError(true)
              console.error("Failed to load product image in AR:", imageUrl)
            }}
            className={`w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            crossOrigin="anonymous"
          />

          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl p-4 text-center">
              <X className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-white text-[10px] font-bold uppercase tracking-widest">Image Load Failed</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const currentUrl = imageUrl;
                  // Force reload
                  setImageLoading(true);
                  setImageError(false);
                }}
                className="mt-2 text-[8px] bg-white/20 px-2 py-1 rounded-full text-white"
              >
                RETRY
              </button>
            </div>
          )}

          {/* Shadow on surface */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[80%] h-4 rounded-[50%] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)",
              filter: "blur(4px)",
            }}
          />
        </motion.div>
      )}

      {/* Header */}
      {cameraReady && (
        <div
          data-controls
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-3"
          style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/20 text-white px-4 py-2.5 rounded-full text-xs font-bold tracking-wide hover:bg-white/25 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); toggleCamera() }}
              className="bg-white/15 backdrop-blur-xl border border-white/20 text-white p-2.5 rounded-full hover:bg-white/25 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-blue-300">AR Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      {cameraReady && (
        <div
          data-controls
          className="absolute bottom-0 left-0 right-0 z-50"
          style={{
            paddingBottom: "max(16px, env(safe-area-inset-bottom))",
            background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4), transparent)",
          }}
        >
          <div className="px-4 pt-8 pb-2 space-y-3">
            {/* Product info */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/15 p-3 rounded-2xl">
              <div className="w-12 h-12 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm font-extrabold truncate">{product.name}</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                  {isPlaced ? "Drag to reposition" : "Tap to place in your space"}
                </p>
              </div>
              <span className="text-primary text-sm font-black">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Enhanced Controls Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Scale slider */}
              <div className="flex flex-col gap-1.5 bg-white/8 backdrop-blur-xl border border-white/10 px-3 py-2.5 rounded-2xl">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-white/40">Scale</span>
                  <span className="text-[10px] font-black text-blue-400">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  value={Math.round(scale * 100)}
                  onChange={(e) => setScale(parseInt(e.target.value) / 100)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Rotation slider */}
              <div className="flex flex-col gap-1.5 bg-white/8 backdrop-blur-xl border border-white/10 px-3 py-2.5 rounded-2xl">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-white/40">Rotate</span>
                  <span className="text-[10px] font-black text-blue-400">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Opacity slider */}
              <div className="flex flex-col gap-1.5 bg-white/8 backdrop-blur-xl border border-white/10 px-3 py-2.5 rounded-2xl">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-white/40">Opacity</span>
                  <span className="text-[10px] font-black text-blue-400">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={Math.round(opacity * 100)}
                  onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Camera Zoom slider */}
              {zoomCapabilities && (
                <div className="flex flex-col gap-1.5 bg-white/8 backdrop-blur-xl border border-white/10 px-3 py-2.5 rounded-2xl">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-white/40">Cam Zoom</span>
                    <span className="text-[10px] font-black text-blue-400">{cameraZoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={zoomCapabilities.min}
                    max={zoomCapabilities.max}
                    step={zoomCapabilities.step}
                    value={cameraZoom}
                    onChange={(e) => applyCameraZoom(parseFloat(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5 bg-white/8 backdrop-blur-xl border border-white/10 px-3 py-2.5 rounded-2xl">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-white/40">Light</span>
                  <span className="text-[10px] font-black text-blue-400">{Math.round(brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={Math.round(brightness * 100)}
                  onChange={(e) => setBrightness(parseInt(e.target.value) / 100)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            </div>

            {/* Camera Zoom Control (if supported) */}
            {zoomCapabilities && (
              <div className="bg-white/8 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-4">
                <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-white/40">Camera Zoom</span>
                <input
                  type="range"
                  min={zoomCapabilities.min}
                  max={zoomCapabilities.max}
                  step={zoomCapabilities.step}
                  value={cameraZoom}
                  onChange={(e) => applyCameraZoom(parseFloat(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-1 bg-blue-500/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400"
                />
                <span className="text-[10px] font-black text-blue-400">{cameraZoom.toFixed(1)}x</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleCapture() }}
                className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                Snap Photo
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleReset() }}
                className="flex-1 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-xl border border-white/15 text-white py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-white/20 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
