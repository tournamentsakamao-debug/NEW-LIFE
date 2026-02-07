'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore' // Zustand use karenge persistence ke liye
import { motion } from 'framer-motion' // Luxury animations

export default function Home() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuthStore()

  useEffect(() => {
    // Background Music pre-load logic (Requirement 14)
    const bgMusic = new Audio('/sounds/bg.mp3')
    bgMusic.loop = true
    bgMusic.volume = 0.2

    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          // Requirement 7: Admin credentials check logic handled in useAuth hook
          if (isAdmin) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          router.push('/login')
        }
      }, 1500) // 1.5s delay for luxury splash feel

      return () => clearTimeout(timer)
    }
  }, [user, isAdmin, loading, router])

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
      {/* Luxury Splash Screen (Requirement 11 & 15) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        {/* Logo Container */}
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 bg-gold-500 blur-2xl opacity-20 animate-pulse"></div>
          <img 
            src="/branding/logo.png" 
            alt="Admin's Tournament" 
            className="w-full h-full object-contain relative z-10"
          />
        </div>

        {/* Premium Loader (Requirement 10) */}
        <div className="flex flex-col items-center">
          <h1 className="text-luxury-gold font-bold text-xl tracking-[0.2em] mb-4">
            ADMIN'S TOURNAMENT
          </h1>
          <div className="w-48 h-[2px] bg-gray-800 relative overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-luxury-gold to-transparent"
            />
          </div>
        </div>
      </motion.div>

      {/* Touch Sound Trigger (Requirement 13) */}
      <audio id="click-sound" src="/sounds/click.mp3" preload="auto"></audio>
    </main>
  )
}
