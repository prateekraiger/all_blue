"use client"

import Image from "next/image"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    setSending(true)
    // Simulate sending
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.")
      setFormData({ name: "", email: "", message: "" })
      setSending(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left — Contact Form & Info */}
          <div className="max-w-xl">
            <p className="text-[12px] font-medium text-[#707072] mb-3 uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Get In Touch
            </p>
            <h1 className="nike-display text-[48px] md:text-[64px] lg:text-[80px] text-[#111111] mb-6">
              CONTACT US
            </h1>
            <p className="text-[16px] text-[#707072] mb-10 leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Whether you have a question about our bespoke gifting services, need assistance with an order, or simply want to say hello, our concierge team is here for you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-[#F5F5F5] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#111111]" />
                </div>
                <h3 className="text-[14px] font-medium text-[#111111] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Call Us</h3>
                <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>1-800-ALL-BLUE</p>
                <p className="text-[12px] text-[#CACACB]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Mon-Fri, 9am - 6pm EST</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-[#F5F5F5] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#111111]" />
                </div>
                <h3 className="text-[14px] font-medium text-[#111111] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Email</h3>
                <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>concierge@allbluegifts.com</p>
                <p className="text-[12px] text-[#CACACB]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>24/7 Support</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-[12px] font-medium text-[#707072] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="nike-input"
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[12px] font-medium text-[#707072] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="nike-input"
                    placeholder="Your email"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-[12px] font-medium text-[#707072] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>How can we help?</label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="nike-input resize-y"
                  placeholder="Tell us about your inquiry..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="nike-btn-primary text-[16px] px-8 py-3.5 w-full sm:w-auto mt-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right — Image, no border radius */}
          <div className="relative h-[500px] md:h-[600px] lg:h-[800px] w-full hidden md:block overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop"
              alt="Customer Concierge"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
