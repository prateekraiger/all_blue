import Image from "next/image"
import Link from "next/link"
import { Briefcase, Gem, Clock } from "lucide-react"

export default function CorporateGiftingPage() {
  return (
    <div className="w-full bg-white">
      {/* Hero Section — full-bleed image, no border radius */}
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558459654-c430be5b0a44?q=80&w=2000&auto=format&fit=crop"
          alt="Corporate Gifting"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="nike-hero-scrim absolute inset-0" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-12 pb-12 md:pb-16">
            <p className="text-white/70 text-[12px] font-medium mb-3 uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              For Business
            </p>
            <h1 className="nike-display text-white text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] max-w-4xl">
              CORPORATE GIFTING
            </h1>
            <p className="text-white/80 text-[16px] md:text-[18px] mt-4 max-w-xl leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Elevate your corporate relationships with bespoke curated gifting solutions tailored for your elite clients and teams.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-3">
          {[
            {
              icon: <Gem className="w-6 h-6" />,
              title: "Superior Curation",
              description: "We source only the finest globally recognized luxury items, ensuring your brand is associated with unparalleled quality."
            },
            {
              icon: <Briefcase className="w-6 h-6" />,
              title: "Branded Elegance",
              description: "Subtle, elegant branding on bespoke packaging that highlights your company without detracting from the gift."
            },
            {
              icon: <Clock className="w-6 h-6" />,
              title: "White-Glove Delivery",
              description: "From conception to unboxing, our dedicated concierge team manages every detail of logistics and handling."
            }
          ].map((feature) => (
            <div key={feature.title} className="bg-[#F5F5F5] p-8 md:p-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white flex items-center justify-center mb-6 text-[#111111]">
                {feature.icon}
              </div>
              <h3 className="text-[16px] font-medium text-[#111111] mb-3 uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#707072] leading-relaxed max-w-sm" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#111111]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24 text-center">
          <h2 className="nike-display text-white text-[32px] md:text-[48px] lg:text-[64px] mb-4">
            PARTNER WITH US
          </h2>
          <p className="text-[16px] text-[#707072] mb-10 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Ready to show appreciation to your VIP clients and top performers? Let our concierge team design a custom gifting program for your organization.
          </p>
          <Link href="/contact" className="nike-btn-primary-inverted text-[16px] px-10 py-3.5">
            Contact Concierge
          </Link>
        </div>
      </section>
    </div>
  )
}
