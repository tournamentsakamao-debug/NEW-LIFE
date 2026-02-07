import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

// Requirement 11: Mobile-friendly viewports (Zoom disable for "App" feel)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Admin's Tournament",
  description: 'Professional eSports Tournament Platform',
  manifest: '/branding/manifest.json', // App feel ke liye PWA support
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`${inter.className} bg-[#050505] text-white min-h-screen selection:bg-luxury-gold selection:text-black`}
      >
        {/* Requirement 13 & 14: Global Sound Elements */}
        {/* Ye elements hidden rahenge but har page se access ho payenge */}
        <audio id="bg-music" src="/sounds/bg.mp3" loop preload="auto" />
        <audio id="click-sound" src="/sounds/click.mp3" preload="auto" />
        <audio id="win-sound" src="/sounds/win.mp3" preload="auto" />

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Requirement 10: Professional Notifications */}
        <Toaster 
          position="top-center" 
          expand={false} 
          richColors 
          theme="dark" 
          closeButton
        />

        {/* Global Luxury Overlay (Vignette effect for App feel) */}
        <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      </body>
    </html>
  )
}
