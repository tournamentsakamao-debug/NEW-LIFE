'use client'
import { useEffect, useRef } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // 1. Check if Admin enabled BG Music & Maintenance Mode
    const syncSettings = async () => {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('bg_music_on, maintenance_mode')
        .single()

      if (settings?.bg_music_on && bgMusicRef.current) {
        // Browser requires interaction to play audio
        const playMusic = () => {
          bgMusicRef.current?.play().catch(() => {})
          window.removeEventListener('click', playMusic)
        }
        window.addEventListener('click', playMusic)
      }
    }
    syncSettings()
  }, [])

  return (
    <html lang="en" className="dark">
      <head>
        {/* Favicon from branding */}
        <link rel="icon" href="/branding/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-[#050505] text-white min-h-screen`}>
        
        {/* Audio Elements with correct paths */}
        <audio ref={bgMusicRef} id="bg-music" src="/sounds/bg.mp3" loop />
        <audio id="click-sound" src="/sounds/click.mp3" preload="auto" />
        <audio id="win-sound" src="/sounds/win.mp3" preload="auto" />

        <div className="relative z-10">{children}</div>

        <Toaster position="top-center" richColors theme="dark" />
        
        {/* Global App Vignette */}
        <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
      </body>
    </html>
  )
}
