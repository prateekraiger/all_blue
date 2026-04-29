/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.photojaanic.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'www.allblue.gift',
      },
      {
        protocol: 'https',
        hostname: 'www.fnp.com',
      },
      {
        protocol: 'https',
        hostname: 'www.ekshoppingmart.in',
      },
      {
        protocol: 'https',
        hostname: 'www.yourprint.in',
      },
      {
        protocol: 'https',
        hostname: 'www.giftify.in',
      },
      {
        protocol: 'https',
        hostname: 'www.woodenstreet.com',
      },
      {
        protocol: 'https',
        hostname: 'www.confettigifts.in',
      },
      {
        protocol: 'https',
        hostname: 'www.igp.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bigsmall.in',
      },
      {
        protocol: 'https',
        hostname: 'www.boxupgifting.com',
      },
      {
        protocol: 'https',
        hostname: 'www.pebel.in',
      },
    ],
  },
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
      }
    ]
  },
}

export default nextConfig
