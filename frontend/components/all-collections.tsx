"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const collections = [
  {
    title: "Jewelry",
    subtitle: "Timeless Elegance",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop",
    link: "/shop?category=Jewelry",
    className: "md:col-span-2 md:row-span-2 h-[400px] md:h-[624px]",
    titleSize: "text-[32px] md:text-[48px] lg:text-[64px]",
  },
  {
    title: "Watches",
    subtitle: "Precision & Style",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Watches",
    className: "md:col-span-1 md:row-span-1 h-[300px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
  {
    title: "Fashion",
    subtitle: "Modern Luxury",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Fashion",
    className: "md:col-span-1 md:row-span-1 h-[300px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
  {
    title: "Beauty",
    subtitle: "Radiant Glow",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Beauty",
    className: "md:col-span-1 md:row-span-1 h-[300px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
  {
    title: "Fragrance",
    subtitle: "Signature Scents",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Fragrance",
    className: "md:col-span-2 md:row-span-1 h-[300px]",
    titleSize: "text-[28px] md:text-[40px]",
  },
  {
    title: "Accessories",
    subtitle: "The Perfect Details",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Accessories",
    className: "md:col-span-1 md:row-span-2 h-[400px] md:h-[624px]",
    titleSize: "text-[28px] md:text-[40px]",
  },
  {
    title: "Home Decor",
    subtitle: "Elevate Your Space",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Home Decor",
    className: "md:col-span-1 md:row-span-1 h-[300px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
  {
    title: "Spa",
    subtitle: "Relax & Rejuvenate",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Spa",
    className: "md:col-span-1 md:row-span-1 h-[300px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
  {
    title: "Drinkware",
    subtitle: "Artisan Crafted",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop",
    link: "/shop?category=Drinkware",
    className: "md:col-span-2 md:row-span-1 h-[300px]",
    titleSize: "text-[24px] md:text-[32px]",
  },
  {
    title: "Stationery",
    subtitle: "Inspire Creativity",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1200&auto=format&fit=crop",
    link: "/shop?category=Stationery",
    className: "md:col-span-3 md:row-span-1 h-[300px] md:h-[400px]",
    titleSize: "text-[28px] md:text-[40px]",
  },
]

export function AllCollections() {
  return (
    <section className="w-full pt-24 pb-16 px-4 sm:px-6 lg:px-12 bg-[#FAFAFA]">
      <div className="max-w-[1920px] mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16 flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          <h1 className="nike-display text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] mb-6 tracking-tight leading-[0.9]">
            THE<br/>COLLECTIONS
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#707072] font-normal leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Discover our meticulously curated categories. From timeless jewelry to artisan homeware, find the perfect gift for every occasion, designed to transcend the ordinary.
          </p>
        </motion.div>

        {/* Collections Grid - Complex asymmetrical layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 grid-flow-row-dense">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`relative overflow-hidden group bg-white ${collection.className}`}
            >
              <Link href={collection.link} className="block w-full h-full relative cursor-none">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                
                {/* Refined gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-[#111111]/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 flex flex-col items-start z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <p className="text-[12px] md:text-[14px] font-medium uppercase tracking-[0.15em] text-white/80 mb-3" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {collection.subtitle}
                  </p>
                  <h3 className={`nike-display ${collection.titleSize} text-white mb-6 leading-[0.95]`}>
                    {collection.title}
                  </h3>
                  
                  {/* Explore Link with animated underline */}
                  <div className="relative overflow-hidden">
                    <span className="text-[14px] text-white uppercase tracking-wider font-medium" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      Explore
                    </span>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white transform -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
