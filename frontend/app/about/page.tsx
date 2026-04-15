export default function AboutPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-16 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <h1 className="text-3xl font-extrabold tracking-tight uppercase mb-8">About All Blue</h1>
      <div className="prose prose-neutral max-w-2xl">
        <p className="text-lg text-neutral-500 mb-6 font-medium">
          Curating beautiful, functional pieces for your space. Quality craftsmanship meets timeless design.
        </p>
        <p className="text-neutral-500 leading-relaxed mb-6">
          All Blue was founded on the principle that the objects we surround ourselves with 
          should be both beautiful and useful. Our commitment to minimalist design means stripping 
          away the unnecessary to focus on form, function, and materials.
        </p>
        <p className="text-neutral-500 leading-relaxed">
          We work with artisans and designers globally who share our vision for sustainable, 
          high-quality products that stand the test of time.
        </p>
      </div>
    </div>
  )
}
