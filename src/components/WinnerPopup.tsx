'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TouchButton } from './ui/TouchButton'

interface WinnerPopupProps {
  isOpen: boolean
  winnerName: string
  amount: number
  tournamentName: string
  onClose: () => void
}

export function WinnerPopup({ isOpen, winnerName, amount, tournamentName, onClose }: WinnerPopupProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // 1. Play Win Sound
      const winSound = document.getElementById('win-sound') as HTMLAudioElement
      if (winSound) {
        winSound.currentTime = 0
        winSound.play().catch(() => console.log("Sound blocked"))
      }
      
      // Delay content for impact
      setTimeout(() => setShowContent(true), 300)
    } else {
      setShowContent(false)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Dark Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Winner Card */}
          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-sm bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-[#D4AF37]/30 rounded-[2.5rem] p-8 text-center overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)]"
          >
            {/* Animated Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#D4AF37] blur-[100px] opacity-20" />

            {showContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 space-y-6"
              >
                {/* Trophy Icon */}
                <motion.div 
                  animate={{ 
                    rotateY: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="flex justify-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-t from-[#AA8A2E] to-[#F2D479] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                    <span className="text-5xl">🏆</span>
                  </div>
                </motion.div>

                {/* Congratulations Text */}
                <div className="space-y-2">
                  <h2 className="text-[#D4AF37] font-black uppercase tracking-tighter text-3xl">Victory!</h2>
                  <p className="text-zinc-400 text-sm font-medium italic">"{tournamentName}"</p>
                </div>

                {/* Winner Info Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6">
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Champion</p>
                  <h3 className="text-white text-xl font-black">{winnerName}</h3>
                </div>

                {/* Prize Amount */}
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Added to Wallet</p>
                  <div className="text-4xl font-black text-white flex items-center justify-center gap-2">
                    <span className="text-[#D4AF37]">₹</span>
                    {amount}
                  </div>
                </div>

                {/* Action Button */}
                <TouchButton 
                  variant="luxury" 
                  fullWidth 
                  onClick={onClose}
                  className="py-5"
                >
                  Claim Reward
                </TouchButton>
              </motion.div>
            )}

            {/* Confetti Particles (CSS Simulation) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {/* Aap yahan canvas-confetti bhi use kar sakte hain */}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
            }

