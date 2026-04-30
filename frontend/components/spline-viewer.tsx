"use client";

import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function SplineViewer() {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] bg-[#0A0A0A] overflow-hidden flex items-center justify-center border-t border-white/10">
      <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none">
        {/* We use a generic high-quality abstract Spline URL */}
        <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pointer-events-none">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-white text-[32px] md:text-[56px] font-serif italic mb-6 drop-shadow-2xl"
          style={{ fontFamily: '"Playfair Display", "Times New Roman", Times, serif' }}
        >
          Immersive Luxury
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/80 text-[16px] md:text-[20px] max-w-xl mx-auto font-light tracking-wide"
          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          Explore a new dimension of personalized gifting with our AI-driven spatial experiences. 
          Interact with objects in real-time.
        </motion.p>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/20" />
      <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-white/20" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-white/20" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/20" />
    </section>
  );
}
