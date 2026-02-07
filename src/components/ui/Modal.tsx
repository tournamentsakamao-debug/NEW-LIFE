'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  
  // Requirement 13: Sound Feedback (Modal Open sound)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const audio = new Audio('/sounds/modal-open.mp3')
      audio.volume = 0.2
      audio.play().catch(() => {}) // Ignore if browser blocks auto-play
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const maxWidths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop with Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative bg-[#0F0F0F] rounded-[2.5rem] ${maxWidths[size]} w-full max-h-[85vh] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]`}
          >
            {/* Header logic */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-b from-white/5 to-transparent">
              {title ? (
                <h2 className="text-xl font-black uppercase tracking-tighter text-gold-gradient italic">
                  {title}
                </h2>
              ) : <div />}
              
              <button
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90"
              >
                <X className="w-5 h-5 text-luxury-gold" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Optional Glow Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-50" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
