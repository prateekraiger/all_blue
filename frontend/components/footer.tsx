import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-[1920px] mx-auto pb-12 md:pb-16 lg:pb-20 xl:pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-10 lg:gap-12 xl:gap-16 2xl:gap-20 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="text-xl md:text-2xl lg:text-3xl xl:text-3xl font-extrabold mb-4 md:mb-5 lg:mb-6 uppercase tracking-tight">
            ALL BLUE
          </div>
          <p className="text-neutral-500 text-sm md:text-base lg:text-base xl:text-lg max-w-sm lg:max-w-md xl:max-w-lg leading-relaxed">
            Curating beautiful, functional pieces for your space. Quality craftsmanship meets timeless design.
          </p>
        </div>

        <div>
          <h4 className="text-sm md:text-base lg:text-base font-extrabold uppercase mb-4 md:mb-6 tracking-widest">
            Shop
          </h4>
          <ul className="list-none space-y-3">
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Furniture
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Lighting
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Decor
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm md:text-base lg:text-base font-extrabold uppercase mb-4 md:mb-6 tracking-widest">
            About
          </h4>
          <ul className="list-none space-y-3">
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Sustainability
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Careers
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Press
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm md:text-base lg:text-base font-extrabold uppercase mb-4 md:mb-6 tracking-widest">
            Support
          </h4>
          <ul className="list-none space-y-3">
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="#" className="no-underline text-neutral-500 text-sm hover:text-foreground transition-colors">
                Returns
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-full border-t border-neutral-100 pt-8 md:pt-10 lg:pt-12 xl:pt-12 mt-8 md:mt-10 lg:mt-12 xl:mt-12 text-xs md:text-sm text-neutral-400 text-center">
          © {new Date().getFullYear()} ALL BLUE. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
