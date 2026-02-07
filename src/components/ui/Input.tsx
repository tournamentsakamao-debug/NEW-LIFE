'use client'

import { InputHTMLAttributes, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        {/* Requirement 12: Icon logic with luxury-gold color on focus */}
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-luxury-gold z-10">
            {icon}
          </span>
        )}

        <input
          className={`
            w-full px-5 py-4 rounded-2xl
            bg-white/5 border border-white/10
            text-white placeholder-gray-600
            focus:outline-none focus:border-luxury-gold/50 
            focus:bg-white/[0.08]
            focus:ring-4 focus:ring-luxury-gold/5
            transition-all duration-300
            text-sm font-medium
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-500/50 bg-red-500/5' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Luxury Detail: Bottom subtle glow on focus */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-luxury-gold transition-all duration-500 group-focus-within:w-1/2 opacity-50" />
      </div>

      {/* Requirement 12: Smooth Error Animation */}
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[11px] font-bold text-red-500 ml-1 flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

