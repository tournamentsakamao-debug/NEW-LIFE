/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pcgzjgfzcyucvwhrldbq.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
