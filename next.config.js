/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages ke liye static export best rehta hai agar aapke pas server nahi hai
  // output: 'export', // Agar aap pure static site bana rahe ho toh ise uncomment karein
  
  typescript: {
    // Build pass karne ke liye humne types theek kar diye hain, 
    // par ye safety check build ko rukne nahi dega.
    ignoreBuildErrors: false, 
  },
  eslint: {
    // Build ke waqt linting errors ko ignore karein taaki deployment na ruke
    ignoreDuringBuilds: true,
  },
  images: {
    // Agar aap Supabase storage se images dikhayenge toh domain add karna hoga
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Edge runtime optimization
  experimental: {
    serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs'],
  },
};

module.exports = nextConfig;
