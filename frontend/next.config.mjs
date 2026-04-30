import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Build Optimizations ──────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header for security

  // ─── Compression ──────────────────────────────────────────────────────────
  compress: true,

  // ─── Experimental Optimizations ──────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
    ],
  },

  // ─── Image Optimization ───────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.photojaanic.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'www.allblue.gift' },
      { protocol: 'https', hostname: 'www.fnp.com' },
      { protocol: 'https', hostname: 'www.ekshoppingmart.in' },
      { protocol: 'https', hostname: 'www.yourprint.in' },
      { protocol: 'https', hostname: 'www.giftify.in' },
      { protocol: 'https', hostname: 'www.woodenstreet.com' },
      { protocol: 'https', hostname: 'www.confettigifts.in' },
      { protocol: 'https', hostname: 'www.igp.com' },
      { protocol: 'https', hostname: 'www.bigsmall.in' },
      { protocol: 'https', hostname: 'www.boxupgifting.com' },
      { protocol: 'https', hostname: 'www.pebel.in' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
    ],
  },

  // ─── Turbopack ───────────────────────────────────────────────────────────
  turbopack: {
    root: resolve(__dirname),
  },

  // ─── Security & Performance Headers ───────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache fonts
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // ─── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/sign-up',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/auth/signup',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/auth/login',
        destination: '/sign-in',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
