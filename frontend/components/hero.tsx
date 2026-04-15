import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="w-full">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center py-10 md:py-16 lg:py-20 xl:py-24 2xl:py-32 gap-8 md:gap-12 lg:gap-16 xl:gap-20 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex-1 text-center md:text-left">
          <span className="text-xs lg:text-sm xl:text-sm font-semibold uppercase tracking-[0.2em] mb-3 md:mb-5 lg:mb-6 block">
            New Collection
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold leading-none mb-5 md:mb-7 lg:mb-8 xl:mb-9 tracking-tight">
            All Blue Design
          </h1>
          <p className="text-base md:text-lg lg:text-xl xl:text-xl text-neutral-500 mb-8 md:mb-10 lg:mb-12 max-w-md lg:max-w-lg xl:max-w-xl leading-relaxed mx-auto md:mx-0">
            Discover our latest collection of minimalist furniture and home decor.
          </p>
          <Link
            href="#"
            className="inline-block bg-foreground text-background px-8 md:px-10 lg:px-12 xl:px-14 py-4 md:py-4 lg:py-5 xl:py-6 font-semibold text-sm lg:text-base uppercase tracking-widest hover:bg-neutral-700 hover:-translate-y-0.5 transition-all"
          >
            Shop Now
          </Link>
        </div>

        <div className="flex-1 md:flex-[1.1] lg:flex-[1.2] xl:flex-[1.2] relative w-full">
          <Image
            src="/modern-minimalist-chair.jpg"
            alt="Hero furniture"
            width={900}
            height={800}
            className="w-full h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] 2xl:h-[800px] object-cover grayscale hover:grayscale-0 transition-all duration-500"
          />
        </div>
      </div>
    </section>
  )
}
