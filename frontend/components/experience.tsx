"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import Image from "next/image"

export function ExperienceSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  // 3D Card effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <section ref={containerRef} className="relative w-full py-24 md:py-32 overflow-hidden bg-[#FAFAFA] text-[#111111]">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gray-200/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gray-300/30 blur-[120px]" />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div style={{ opacity }} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left Text Content */}
          <div className="flex flex-col justify-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight mb-6">
                The Art of <br />
                <span className="italic text-[#111111]/80">Gifting</span>
              </h2>
              <p className="font-sans text-gray-600 text-lg md:text-xl leading-relaxed max-w-xl">
                We believe that every gift tells a story. Our curated selection combines artisanal craftsmanship with modern luxury, ensuring that your gesture resonates long after the moment has passed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex items-center gap-6 pt-4"
            >
              <button className="px-8 py-4 bg-[#111111] text-white font-sans font-medium tracking-wide uppercase text-sm hover:bg-black transition-colors shadow-lg shadow-black/5">
                Discover Our Story
              </button>
            </motion.div>
          </div>

          {/* Right Image/3D Element */}
          <motion.div
            style={{ y: y1 }}
            className="relative h-[600px] w-full hidden md:block perspective-[1200px]"
          >
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="w-full h-full relative flex items-center justify-center cursor-crosshair"
            >
              {/* Main Image Layer */}
              <motion.div
                style={{ translateZ: 50 }}
                className="absolute inset-0 bg-gray-100 shadow-2xl overflow-hidden rounded-sm border border-black/5"
              >
                <Image
                  src="https://i.pinimg.com/736x/ee/8f/eb/ee8febee411ab13382c172e63bec3169.jpg"
                  alt="Luxury Gift Selection"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
