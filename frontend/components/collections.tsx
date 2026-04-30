"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const collections = [
  {
    title: "The Signature Collection",
    subtitle: "Timeless luxury for every occasion",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop",
    link: "/shop",
    className: "md:col-span-2 md:row-span-2 h-[400px] md:h-auto",
    titleSize: "text-[32px] md:text-[48px] lg:text-[64px]",
  },
  {
    title: "Gifts for Her",
    subtitle: "Elegant & Refined",
    image: "https://images.unsplash.com/photo-1512496015851-a1fbcf69b6b6?q=80&w=1000&auto=format&fit=crop",
    link: "/shop?category=Gifts for Her",
    className: "md:col-span-1 md:row-span-1 h-[300px] md:h-[400px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
  {
    title: "Corporate Gifting",
    subtitle: "Impression that lasts",
    image: "https://images.unsplash.com/photo-1558459654-c430be5b0a44?q=80&w=1000&auto=format&fit=crop",
    link: "/corporate-gifting",
    className: "md:col-span-1 md:row-span-1 h-[300px] md:h-[400px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
]

export function Collections() {
  return (
    <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-white">
      <div className="max-w-[1920px] mx-auto">
        {/* Section Header */}
        <div className="mb-8 md:mb-10">
          <h2 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-2">
            Curated Collections
          </h2>
          <p className="text-[16px] text-[#707072] font-normal" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Handpicked essentials for those who appreciate the finer things.
          </p>
        </div>

        {/* Category Cards — full-bleed photography, no border radius */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-3">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden group ${collection.className}`}
            >
              <Link href={collection.link} className="block w-full h-full">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Dark gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Text overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 lg:p-10 text-white z-10">
                  <p className="text-[12px] font-medium uppercase tracking-wider mb-2 opacity-70" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {collection.subtitle}
                  </p>
                  <h3 className={`nike-display ${collection.titleSize} text-white mb-4`}>
                    {collection.title}
                  </h3>
                  <span
                    className="nike-btn-primary-inverted text-[14px] px-6 py-2.5"
                  >
                    Shop Now
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
