import Image from "next/image"
import { Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="max-w-[1920px] mx-auto py-12 md:py-20 lg:py-24 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Side: Contact Form & Info */}
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase mb-6">Contact Us</h1>
          <p className="text-neutral-500 mb-10 text-lg leading-relaxed">
            Whether you have a question about our bespoke gifting services, need assistance with an order, or simply want to say hello, our luxury concierge team is here for you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-foreground">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Call Us</h3>
              <p className="text-neutral-500 text-sm">1-800-ALL-BLUE</p>
              <p className="text-neutral-500 text-sm">Mon-Fri, 9am - 6pm EST</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-foreground">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Email</h3>
              <p className="text-neutral-500 text-sm">concierge@allbluegifts.com</p>
              <p className="text-neutral-500 text-sm">24/7 Support</p>
            </div>
          </div>

          <form className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-neutral-800">First Name</label>
                <input type="text" id="name" className="border-b border-neutral-300 py-3 bg-transparent rounded-none focus:outline-none focus:border-neutral-900 transition-colors" placeholder="Your name" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-neutral-800">Email Address</label>
                <input type="email" id="email" className="border-b border-neutral-300 py-3 bg-transparent rounded-none focus:outline-none focus:border-neutral-900 transition-colors" placeholder="Your email" />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <label htmlFor="message" className="text-xs font-semibold uppercase tracking-widest text-neutral-800">How can we help?</label>
              <textarea id="message" rows={4} className="border-b border-neutral-300 py-3 bg-transparent rounded-none focus:outline-none focus:border-neutral-900 transition-colors resize-y" placeholder="Tell us about your inquiry..."></textarea>
            </div>
            <button type="button" className="bg-foreground text-background px-8 py-5 font-bold text-sm uppercase tracking-widest hover:bg-neutral-800 hover:-translate-y-0.5 transition-all w-full md:w-fit mt-6">
              Send Message
            </button>
          </form>
        </div>

        {/* Right Side: Image */}
        <div className="relative h-[500px] md:h-[600px] lg:h-[800px] w-full hidden md:block">
          <Image
            src="/contact_image.png"
            alt="Customer Concierge Desk"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}
