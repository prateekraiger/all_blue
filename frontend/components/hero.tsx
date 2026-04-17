"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="w-full relative overflow-hidden bg-background pt-10 pb-20 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32">
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

      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 xl:gap-20 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-10">
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
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold leading-[0.9] mb-5 md:mb-7 lg:mb-8 xl:mb-9 tracking-tighter"
          >
            The Art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Perfect</span> Gifting
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg lg:text-xl xl:text-xl text-neutral-500 mb-8 md:mb-10 lg:mb-12 max-w-md lg:max-w-lg xl:max-w-xl leading-relaxed mx-auto md:mx-0"
          >
            Curated elegance for every occasion. Experience the next generation of personalized luxury.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              href="/shop"
              className="group relative inline-flex items-center justify-center overflow-hidden bg-foreground text-background px-10 md:px-12 py-5 md:py-6 font-bold text-sm lg:text-base uppercase tracking-widest shadow-2xl transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1 block md:inline-block w-full md:w-auto"
            >
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex-1 md:flex-[1.1] lg:flex-[1.2] xl:flex-[1.5] relative w-full"
        >
          <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl">
            <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <Image
              src="/hero_gift.png"
              alt="Hero luxury gifts collection"
              width={1200}
              height={1000}
              className="w-full h-[450px] md:h-[550px] lg:h-[650px] xl:h-[750px] 2xl:h-[850px] object-cover scale-105 group-hover:scale-100 group-hover:grayscale-0 grayscale transition-all duration-[1.5s] ease-out"
              priority
            />
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          </div>
          
          {/* Floating detail badge */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 md:-left-12 bg-white/80 backdrop-blur-xl p-4 md:p-6 shadow-xl border border-white/50 rounded-2xl z-20 hidden sm:block"
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
        </motion.div>
      </div>
    </section>
  )
}
