"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const collections = [
  {
    title: "Home Decor",
    subtitle: "Elevate Your Space",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    link: "/shop?category=Home Decor",
    className: "md:col-span-2 md:row-span-2 min-h-[400px] md:h-auto",
    titleSize: "text-[32px] md:text-[48px] lg:text-[64px]",
  },
  {
    title: "Spa & Wellness",
    subtitle: "Relax & Rejuvenate",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
    link: "/shop?category=Spa",
    className: "md:col-span-1 md:row-span-1 min-h-[300px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
  {
    title: "Stationary",
    subtitle: "Artisan Crafted",
    image:
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Stationary",
    className: "md:col-span-1 md:row-span-1 min-h-[300px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
];

export function Collections() {
  return (
    <section className="w-full relative py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-white overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-12 md:mb-16 text-center md:text-left">
          <h2 className="nike-display text-[40px] md:text-[56px] text-[#111111] mb-4 tracking-tight">
            Curated Collections
          </h2>
          <p
            className="text-[18px] md:text-[20px] text-[#707072] font-normal max-w-2xl"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Handpicked essentials for those who appreciate the finer things.
            Explore our thoughtfully designed categories.
          </p>
        </div>

        {/* Bento Grid — Optimized to remove empty space */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-2 md:gap-4 h-auto md:h-[800px]">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative overflow-hidden group shadow-sm ${collection.className}`}
            >
              <Link href={collection.link} className="block w-full h-full">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Refined gradient scrim */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                {/* Text overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 text-white z-10 transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                  <p
                    className="text-[12px] font-bold uppercase tracking-[0.2em] mb-3 opacity-80"
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    {collection.subtitle}
                  </p>
                  <h3
                    className={`nike-display ${collection.titleSize} text-white mb-6 leading-[0.9] tracking-tighter`}
                  >
                    {collection.title}
                  </h3>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="nike-btn-primary-inverted text-[13px] px-8 py-3.5 uppercase tracking-widest font-bold">
                      Explore
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
