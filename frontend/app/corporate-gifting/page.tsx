import Image from "next/image"
import Link from "next/link"
import { Briefcase, Gem, Clock } from "lucide-react"

export default function CorporateGiftingPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full flex items-center justify-center">
        <Image
          src="/corporate_gifting.png"
          alt="Corporate Gifting Displays"
          fill
          className="object-cover brightness-[0.6] grayscale hover:grayscale-0 transition-all duration-700"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight uppercase text-white mb-6">
            Corporate Gifting
          </h1>
          <p className="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto font-medium">
            Elevate your corporate relationships with bespoke premium gifting solutions tailored for your elite clients and teams.
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-[1920px] mx-auto py-16 md:py-24 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
              <Gem className="w-8 h-8 text-neutral-800" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest">Premium Curation</h3>
            <p className="text-neutral-500 leading-relaxed">
              We source only the finest globally recognized luxury items, ensuring your brand is associated with unparalleled quality.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
              <Briefcase className="w-8 h-8 text-neutral-800" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest">Branded Elegance</h3>
            <p className="text-neutral-500 leading-relaxed">
              Subtle, elegant branding on premium packaging that highlights your company without detracting from the gift.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-neutral-800" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest">White-Glove Delivery</h3>
            <p className="text-neutral-500 leading-relaxed">
              From conception to unboxing, our dedicated concierge team manages every detail of logistics and handling.
            </p>
          </div>
        </div>

        <div className="bg-neutral-50 p-8 md:p-16 lg:p-24 flex flex-col items-center text-center max-w-4xl mx-auto border border-neutral-200">
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-6">Partner With Us</h2>
          <p className="text-neutral-500 text-lg mb-10 max-w-2xl leading-relaxed">
            Ready to show appreciation to your VIP clients and top performers? Let our concierge team design a custom gifting program for your organization.
          </p>
          <Link
            href="/contact"
            className="bg-foreground text-background px-10 py-5 font-bold text-sm uppercase tracking-widest hover:bg-neutral-800 hover:-translate-y-0.5 transition-all"
          >
            Contact Concierge
          </Link>
        </div>
      </section>
    </div>
  )
}
