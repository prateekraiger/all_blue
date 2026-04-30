import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Gem, Globe } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section — full-bleed image, no border radius */}
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop"
          alt="About ALL BLUE — curated luxury gifts"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="nike-hero-scrim absolute inset-0" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-12 pb-12 md:pb-16">
            <p className="text-white/70 text-[12px] font-medium mb-3 uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Our Story
            </p>
            <h1 className="nike-display text-white text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] max-w-3xl">
              ABOUT ALL BLUE
            </h1>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-6">
              Our Story
            </h2>
            <div className="space-y-5 text-[16px] text-[#707072] leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              <p>
                All Blue was founded on the principle that the objects we surround ourselves with, and the gifts we choose to share, should be deeply meaningful and fundamentally beautiful.
              </p>
              <p>
                We realized that the hardest part of finding the perfect gift wasn&apos;t a lack of options, but a lack of personalization. By integrating advanced AI recommendations with our meticulously curated catalog, we created a seamless experience that feels less like shopping and more like having a personal concierge.
              </p>
              <p>
                Our commitment to minimalist design means stripping away the unnecessary noise to focus on form, function, and emotional resonance.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop"
              alt="Beautiful curated gifts"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#F5F5F5]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
          <div className="mb-12">
            <h2 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-2">
              The All Blue Standard
            </h2>
            <p className="text-[16px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Our guiding principles that ensure every experience is nothing short of exceptional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-3">
            {[
              {
                icon: <Gem className="w-6 h-6" />,
                title: "Curated Excellence",
                description: "We hand-select every item in our collection. If it doesn't meet our rigorous standards for quality and aesthetics, it doesn't make the cut."
              },
              {
                icon: <img src="/logo.png" alt="" className="w-6 h-6 object-contain" />,
                title: "AI-Powered Magic",
                description: "We've built an intelligent engine that understands nuances, enabling us to recommend gifts that spark genuine joy and surprise."
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Global Artisans",
                description: "We partner with independent designers and sustainable creators around the world who share our vision for timeless quality."
              }
            ].map((value) => (
              <div key={value.title} className="bg-white p-8 md:p-10">
                <div className="w-12 h-12 bg-[#F5F5F5] flex items-center justify-center mb-6 text-[#111111]">
                  {value.icon}
                </div>
                <h3 className="text-[16px] font-medium text-[#111111] mb-3" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  {value.title}
                </h3>
                <p className="text-[14px] text-[#707072] leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111111]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24 text-center">
          <h2 className="nike-display text-white text-[32px] md:text-[48px] lg:text-[64px] mb-4">
            READY TO FIND THE PERFECT GIFT?
          </h2>
          <p className="text-[16px] text-[#707072] mb-10 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Explore our collection or try our AI Gift Assistant to discover something extraordinary today.
          </p>
          <Link href="/shop" className="nike-btn-primary-inverted text-[16px] px-10 py-3.5">
            Explore Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
