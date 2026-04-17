"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const collections = [
  {
    title: "The Signature Collection",
    subtitle: "Timeless luxury for every occasion",
    image: "/collection_him.png",
    link: "/shop",
    className: "md:col-span-2 md:row-span-2 h-[500px] md:h-auto",
    titleSize: "text-4xl md:text-6xl lg:text-7xl",
  },
  {
    title: "Gifts for Her",
    subtitle: "Elegant & Refined",
    image: "/collection_her.png",
    link: "/shop?category=Gifts for Her",
    className: "md:col-span-1 md:row-span-1 h-[350px] md:h-[450px]",
    titleSize: "text-2xl md:text-4xl",
  },
  {
    title: "Corporate Gifting",
    subtitle: "Impression that lasts",
    image: "/collection_corporate.png",
    link: "/corporate-gifting",
    className: "md:col-span-1 md:row-span-1 h-[350px] md:h-[450px]",
    titleSize: "text-2xl md:text-4xl",
  },
]

export function Collections() {
  return (
    <section className="w-full py-20 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 bg-background">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 uppercase">
              Curated <span className="text-primary italic">Collections</span>
            </h2>
            <p className="text-neutral-500 text-lg">Handpicked essentials for those who appreciate the finer things.</p>
          </div>
          <Link href="/shop" className="group flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative overflow-hidden group rounded-[2.5rem] bg-neutral-900 ${collection.className}`}
            >
              <Image
                src={collection.image || "/placeholder.svg"}
                alt={collection.title}
                fill
                className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 lg:p-14 text-white z-20">
                <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  {collection.subtitle}
                </p>
                <h3 className={`${collection.titleSize} font-extrabold mb-8 uppercase leading-tight tracking-tighter`}>
                  {collection.title}
                </h3>
                <Link
                  href={collection.link}
                  className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1"
                >
                  Explore
                </Link>
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
