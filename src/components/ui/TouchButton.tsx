'use client'

import { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'luxury' | 'outline' | 'ghost'
  soundEnabled?: boolean
  hapticEnabled?: boolean
  fullWidth?: boolean
}

export function TouchButton({ 
  children, 
  variant = 'primary', 
  soundEnabled = true,
  hapticEnabled = true,
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  ...props 
}: TouchButtonProps) {

  // Requirement 13: Optimized Click Sound
  const playSound = () => {
    if (soundEnabled && !disabled) {
      const audio = new Audio('/sounds/click.mp3')
      audio.volume = 0.3 // Volume thoda badha diya hai clear sunayi dene ke liye
      
      // Fast click handling: sound ko start se play karega agar button jaldi jaldi dabaya jaye
      audio.currentTime = 0 
      
      audio.play().catch((err) => {
        console.warn("Audio play blocked by browser. User must interact with the page first.", err)
      })
    }
  }

  const triggerHaptic = () => {
    if (hapticEnabled && !disabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12) // Slightly stronger vibration for better feel
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    playSound() // Triggering the sound here
    triggerHaptic()
    onClick?.(e)
  }

  const variants = {
    primary: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20',
    secondary: 'bg-zinc-800 text-zinc-300 border border-white/5',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20',
    luxury: 'bg-gradient-to-br from-[#D4AF37] via-[#F2D479] to-[#AA8A2E] text-black font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(212,175,55,0.3)]',
    outline: 'bg-transparent border-2 border-luxury-gold text-luxury-gold',
    ghost: 'bg-white/5 text-white hover:bg-white/10'
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }} 
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        px-6 py-4 rounded-[1.2rem] 
        text-sm font-bold transition-all
        disabled:opacity-40 disabled:grayscale
        flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Luxury Reflection Effect */}
      {variant === 'luxury' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-30 pointer-events-none" />
      )}
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
