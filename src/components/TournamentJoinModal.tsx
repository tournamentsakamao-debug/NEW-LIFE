'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TouchButton } from './ui/TouchButton'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface JoinModalProps {
  isOpen: boolean
  onClose: () => void
  tournament: any
  user: any
}

export function TournamentJoinModal({ isOpen, onClose, tournament, user }: JoinModalProps) {
  const [gameName, setGameName] = useState('')
  const [gameUid, setGameUid] = useState('')
  const [userMsg, setUserMsg] = useState('')
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    // 1. Anti-Glitch & Validation
    if (loading) return
    if (!gameName || !gameUid) return toast.error('Game Name and UID are required')
    
    // Requirement: Passcode Check
    if (tournament.is_private && passcode !== tournament.passcode) {
      return toast.error('Invalid Tournament Passcode!')
    }

    setLoading(true)

    // Requirement: Saving Slot, Game Info & 5-Line Message
    const { error } = await supabase.from('participants').insert([{
      tournament_id: tournament.id,
      user_id: user.id,
      game_name: gameName,
      game_uid: gameUid,
      message: userMsg, // 5 line message option
      slot_no: tournament.joined_count + 1 // Auto slot assignment
    }])

    if (!error) {
      toast.success('Joined Successfully! Check your slot in the list.')
      onClose()
    } else {
      toast.error('Failed to join. Maybe slots are full?')
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden">
            <h2 className="text-xl font-black italic uppercase text-white mb-6">Confirm Entry</h2>

            <div className="space-y-4">
              {/* Requirement: Tournament Pass (If Private) */}
              {tournament.is_private && (
                <input 
                  type="text" placeholder="Tournament Passcode" 
                  className="w-full bg-white/5 border border-red-500/20 p-4 rounded-xl outline-none focus:border-red-500/50 text-red-500"
                  value={passcode} onChange={(e) => setPasscode(e.target.value)}
                />
              )}

              <input 
                type="text" placeholder="In-Game Name (IGN)" 
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-luxury-gold/50"
                value={gameName} onChange={(e) => setGameName(e.target.value)}
              />

              <input 
                type="text" placeholder="Game UID" 
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-luxury-gold/50"
                value={gameUid} onChange={(e) => setGameUid(e.target.value)}
              />

              {/* Requirement: 5 Line Message Box */}
              <textarea 
                rows={5} placeholder="Message for Admin (Optional)" 
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-luxury-gold/50 text-sm"
                value={userMsg} onChange={(e) => setUserMsg(e.target.value)}
              />

              <div className="pt-4">
                <TouchButton variant="luxury" fullWidth loading={loading} onClick={handleJoin}>
                  Pay ₹{tournament.entry_fee} & Join
                </TouchButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

