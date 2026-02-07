'use client'

import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  variant?: 'default' | 'luxury' | 'glass'
  noPadding?: boolean
}

export function Card({ 
  children, 
  className = '', 
  onClick, 
  hover = false,
  variant = 'default',
  noPadding = false
}: CardProps) {
  
  const variants = {
    // Standard Dark Card
    default: 'bg-[#121212] border-white/5 shadow-2xl',
    
    // Gold Tinted Border (For Featured Tournaments)
    luxury: 'bg-[#121212] border-luxury-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]',
    
    // Translucent Blur (For Overlays/Stats)
    glass: 'bg-white/5 backdrop-blur-xl border-white/10'
  }

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[2rem] border
        ${variants[variant]}
        ${noPadding ? 'p-0' : 'p-6'}
        ${hover && onClick ? 'hover:border-luxury-gold/50 cursor-pointer transition-colors duration-300' : ''}
        ${className}
      `}
    >
      {/* Luxury Detail: Top-left subtle shine */}
      {variant === 'luxury' && (
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-luxury-gold/10 blur-[50px] pointer-events-none" />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

