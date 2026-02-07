/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 1. Isse TypeScript ke errors build nahi rokenge
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. Isse ESLint ke errors build nahi rokenge
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: ['pcgzjgfzcyucvwhrldbq.supabase.co'],
    unoptimized: true,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
