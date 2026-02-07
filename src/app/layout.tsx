'use client'
import { useEffect, useRef } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'
import { usePathname, useRouter } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const syncSystemState = async () => {
      // 1. Fetch Admin Settings (Sound, Maintenance, UPI)
      const { data: settings } = await supabase
        .from('system_settings')
        .select('bg_music_on, maintenance_mode')
        .single()

      // 2. Maintenance Logic (Bypass for Admin)
      if (settings?.maintenance_mode) {
        const isAdminPath = pathname.startsWith('/admin')
        const isLoginPage = pathname === '/login' || pathname === '/admin/login'
        
        // Agar maintenance on hai aur user admin nahi hai, toh maintenance page par bhejo
        if (!isAdminPath && !isLoginPage && pathname !== '/maintenance') {
          router.push('/maintenance')
        }
      }

      // 3. Background Music Logic (Admin Controlled)
      if (settings?.bg_music_on && bgMusicRef.current) {
        const playMusic = () => {
          bgMusicRef.current?.play().catch(() => {})
          window.removeEventListener('click', playMusic)
        }
        window.addEventListener('click', playMusic)
      } else if (!settings?.bg_music_on && bgMusicRef.current) {
        bgMusicRef.current.pause()
      }
    }

    syncSystemState()
  }, [pathname, router])

  return (
    <html lang="en" className="dark">
      <head>
        <title>eSports Luxury Pro</title>
        {/* Requirement: Favicon from public/branding */}
        <link rel="icon" href="/branding/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body className={`${inter.className} bg-[#050505] text-white min-h-screen selection:bg-[#D4AF37] selection:text-black`}>
        
        {/* Global Sound Assets */}
        <audio ref={bgMusicRef} id="bg-music" src="/sounds/bg.mp3" loop />
        <audio id="click-sound" src="/sounds/click.mp3" preload="auto" />
        <audio id="win-sound" src="/sounds/win.mp3" preload="auto" />

        {/* Dynamic Content */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Notifications (Toast) */}
        <Toaster 
          position="top-center" 
          richColors 
          theme="dark" 
          toastOptions={{
            style: { background: '#0A0A0A', border: '1px solid #ffffff10' }
          }}
        />
        
        {/* Professional Vignette Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
      </body>
    </html>
  )
}

