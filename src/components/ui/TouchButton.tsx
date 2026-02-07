'use client'

import { ButtonHTMLAttributes, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'luxury' | 'outline' | 'ghost'
  soundEnabled?: boolean
  hapticEnabled?: boolean
  fullWidth?: boolean
  loading?: boolean // Anti-Glitch state
}

export function TouchButton({ 
  children, 
  variant = 'primary', 
  soundEnabled = true,
  hapticEnabled = true,
  fullWidth = false,
  loading = false,
  className = '',
  onClick,
  disabled,
  ...props 
}: TouchButtonProps) {
  const [isSoundOn, setIsSoundOn] = useState(true)

  // Admin setting check: Agar admin ne settings se sound off kiya toh nahi bajega
  useEffect(() => {
    const checkSettings = async () => {
      const { data } = await supabase.from('system_settings').select('sound_effects_on').single()
      if (data) setIsSoundOn(data.sound_effects_on)
    }
    checkSettings()
  }, [])

  const playSound = () => {
    if (soundEnabled && isSoundOn && !disabled && !loading) {
      const audio = document.getElementById('click-sound') as HTMLAudioElement
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
    }
  }

  const triggerHaptic = () => {
    if (hapticEnabled && !disabled && !loading && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return // Anti-Glitch check
    playSound()
    triggerHaptic()
    onClick?.(e)
  }

  const variants = {
    primary: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20',
    secondary: 'bg-zinc-800 text-zinc-300 border border-white/5',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20',
    luxury: 'bg-gradient-to-br from-[#D4AF37] via-[#F2D479] to-[#AA8A2E] text-black font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(212,175,55,0.3)]',
    outline: 'border-2 border-[#D4AF37] text-[#D4AF37] bg-transparent',
    ghost: 'bg-white/5 text-white hover:bg-white/10'
  }

  return (
    <motion.button
      whileTap={{ scale: (disabled || loading) ? 1 : 0.95 }} 
      whileHover={{ scale: (disabled || loading) ? 1 : 1.02 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden
        px-6 py-4 rounded-[1.2rem] 
        text-sm font-bold transition-all
        disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Luxury Reflection Overlay */}
      {variant === 'luxury' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-30 pointer-events-none" />
      )}

      {/* Loading State Spinner (Anti-Glitch UI) */}
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </motion.button>
  )
}
