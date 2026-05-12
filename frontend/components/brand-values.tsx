"use client"

import { ShieldCheck, Truck, Clock, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const values = [
  {
    icon: ShieldCheck,
    title: "Secure Luxury",
    description: "Every transaction is encrypted and verified for your peace of mind."
  },
  {
    icon: Truck,
    title: "Global Concierge",
    description: "White-glove delivery to over 150 countries with real-time tracking."
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our dedicated specialists are available around the clock for any request."
  },
  {
    icon: Sparkles,
    title: "AI Curated",
    description: "Intelligent gifting suggestions tailored to your unique preferences."
  }
]

export function BrandValues() {
  return (
    <section className="w-full bg-white" style={{ borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-start space-y-4 group"
            >
              <div className="w-12 h-12 bg-[#F5F5F5] flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors duration-300">
                <value.icon className="w-6 h-6" />
              </div>
              <h3 className="nike-heading text-[18px] md:text-[20px] text-[#111111]">
                {value.title}
              </h3>
              <p className="text-[14px] text-[#707072] leading-relaxed font-normal" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
