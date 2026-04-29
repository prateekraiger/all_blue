"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Magnetic } from "@/components/Magnetic"
import { useRef } from "react"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 5])

  return (
    <section ref={containerRef} className="w-full relative overflow-hidden bg-background pt-10 pb-20 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] bg-primary/5 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[60%] bg-blue-500/5 rounded-full blur-[100px]"
        />
      </div>

      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 xl:gap-20 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-10 overflow-x-hidden">
        <div className="flex-1 text-center md:text-left">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs lg:text-sm xl:text-sm font-semibold uppercase tracking-[0.4em] mb-3 md:mb-5 lg:mb-6 block text-primary/80"
          >
            Spring Summer 2026
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[0.9] mb-5 md:mb-7 lg:mb-8 xl:mb-9 tracking-tighter break-words"
          >
            The Art of <br />
            <span className="text-gradient">Perfect</span> Gifting
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-10 lg:mb-12 max-w-md lg:max-w-lg leading-relaxed mx-auto md:mx-0"
          >
            Curated elegance for every occasion. Experience the next generation of personalized luxury.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <Magnetic>
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-center overflow-hidden bg-primary text-primary-foreground px-6 sm:px-8 md:px-10 lg:px-12 py-4 md:py-5 lg:py-6 font-bold text-sm lg:text-base uppercase tracking-widest shadow-2xl transition-all duration-300 hover:shadow-primary/40 rounded-2xl w-full sm:w-auto min-w-0"
              >
                <span className="relative z-10">Explore Collection</span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/gift-finder"
                className="group relative inline-flex items-center justify-center overflow-hidden bg-background border-2 border-primary/20 text-foreground px-6 sm:px-8 md:px-10 lg:px-12 py-4 md:py-5 lg:py-6 font-bold text-sm lg:text-base uppercase tracking-widest transition-all duration-300 hover:border-primary rounded-2xl w-full sm:w-auto min-w-0"
              >
                <span className="relative z-10 text-gradient">AI Gift Finder</span>
              </Link>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div 
          style={{ y, opacity, scale, rotate }}
          className="flex-1 md:flex-[1.1] lg:flex-[1.2] xl:flex-[1.5] relative w-full"
        >
          <div className="relative aspect-square w-full max-w-[800px] mx-auto">
            {/* Floating Glass Cards */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 z-20 hidden lg:block"
            >
              <div className="glass p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/20">
                <p className="text-primary font-bold text-lg">Next-Gen Gifting</p>
                <p className="text-muted-foreground text-sm">Powered by All Blue AI</p>
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -3, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 z-20 hidden lg:block"
            >
              <div className="glass p-6 rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xl">✨</span>
                  </div>
                  <div>
                    <p className="text-foreground font-bold">Superior Quality</p>
                    <p className="text-muted-foreground text-xs">Curated Selection</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="relative w-full h-full rounded-[4rem] overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent z-10" />
              <Image
                src="/hero_gift.png"
                alt="Hero luxury gifts collection"
                width={1200}
                height={1000}
                priority
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
              />
              {/* Glossy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            </div>
            
            {/* Animated Decorative Rings */}
            <div className="absolute -inset-10 border border-primary/10 rounded-full -z-10 animate-[spin_20s_linear_infinite]" />
            <div className="absolute -inset-20 border border-blue-500/5 rounded-full -z-10 animate-[spin_30s_linear_infinite_reverse]" />

            {/* Floating detail badge */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-10 right-10 bg-white/80 backdrop-blur-xl p-4 md:p-6 shadow-xl border border-white/50 rounded-2xl z-20 hidden sm:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Active Now</p>
                  <p className="text-sm font-extrabold">2.4k Shopping</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
