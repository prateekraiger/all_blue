import Link from "next/link";
import { ArrowRight, Sparkles, Gem, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-900/80 z-0"></div>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-6 drop-shadow-sm">
            About <span className="text-indigo-400">All Blue</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Redefining the art of gifting through a blend of impeccable craftsmanship, timeless design, and cutting-edge artificial intelligence.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 sm:py-28 max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight uppercase mb-6 text-slate-900">Our Story</h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                All Blue was founded on the principle that the objects we surround ourselves with, and the gifts we choose to share, should be deeply meaningful and fundamentally beautiful.
              </p>
              <p>
                We realized that the hardest part of finding the perfect gift wasn't a lack of options, but a lack of personalization. By integrating advanced AI recommendations with our meticulously curated catalog, we created a seamless experience that feels less like shopping and more like having a personal concierge.
              </p>
              <p>
                Our commitment to minimalist design means stripping away the unnecessary noise to focus on form, function, and emotional resonance.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop" 
                alt="Beautiful curated gifts" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-60 z-0"></div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-20 sm:py-28 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight uppercase mb-4 text-slate-900">The All Blue Standard</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Our guiding principles that ensure every experience is nothing short of exceptional.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Gem className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Curated Excellence</h3>
              <p className="text-slate-600 leading-relaxed">
                We hand-select every item in our collection. If it doesn't meet our rigorous standards for quality and aesthetics, it doesn't make the cut.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">AI-Powered Magic</h3>
              <p className="text-slate-600 leading-relaxed">
                We've built an intelligent engine that understands nuances, enabling us to recommend gifts that spark genuine joy and surprise.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Global Artisans</h3>
              <p className="text-slate-600 leading-relaxed">
                We partner with independent designers and sustainable creators around the world who share our vision for timeless quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase mb-6 text-slate-900">
          Ready to find the perfect gift?
        </h2>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
          Explore our collection or try our AI Gift Assistant to discover something extraordinary today.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold transition-all hover:shadow-xl hover:shadow-slate-900/20 active:scale-95"
        >
          Explore Collection
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  )
}
