export default function ContactPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-16 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <h1 className="text-3xl font-extrabold tracking-tight uppercase mb-8">Contact Us</h1>
      <div className="max-w-xl">
        <p className="text-neutral-500 mb-8 leading-relaxed">
          Have a question or want to get in touch? We'd love to hear from you. Fill out the form below and our team will get back to you shortly.
        </p>
        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold uppercase tracking-widest text-neutral-800">Name</label>
            <input type="text" id="name" className="border border-neutral-200 px-4 py-3 rounded-none focus:outline-none focus:border-neutral-900 transition-colors" placeholder="Your name" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold uppercase tracking-widest text-neutral-800">Email</label>
            <input type="email" id="email" className="border border-neutral-200 px-4 py-3 rounded-none focus:outline-none focus:border-neutral-900 transition-colors" placeholder="Your email address" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-semibold uppercase tracking-widest text-neutral-800">Message</label>
            <textarea id="message" rows={6} className="border border-neutral-200 px-4 py-3 rounded-none focus:outline-none focus:border-neutral-900 transition-colors resize-y" placeholder="How can we help?"></textarea>
          </div>
          <button type="button" className="bg-foreground text-background px-8 py-4 font-semibold text-sm uppercase tracking-widest hover:bg-neutral-700 hover:-translate-y-0.5 transition-all w-fit mt-2">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
