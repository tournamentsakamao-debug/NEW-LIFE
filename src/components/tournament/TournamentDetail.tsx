'use client'

import { useState } from 'react'
import { Tournament } from '@/lib/supabase'
import { Modal } from '@/components/ui/Modal'
import { TouchButton } from '@/components/ui/TouchButton'
import { Input } from '@/components/ui/Input'
import { useWallet } from '@/hooks/useWallet'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Users, Calendar, Clock, Lock, Crown } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface TournamentDetailProps {
  tournament: Tournament
  isOpen: boolean
  onClose: () => void
}

export function TournamentDetail({ tournament, isOpen, onClose }: TournamentDetailProps) {
  const { user } = useAuth()
  const { balance, joinTournament } = useWallet()
  const [gameUid, setGameUid] = useState('')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const isFull = tournament.slots_joined >= tournament.slots_total
  const canJoin = balance >= tournament.join_fee && !isFull

  const handleJoin = async () => {
    if (!gameUid.trim()) {
      toast.error('Please enter your Game UID')
      return
    }

    if (tournament.password && password !== tournament.password) {
      toast.error('Incorrect tournament password')
      return
    }

    setLoading(true)
    const result = await joinTournament(tournament.id, tournament.join_fee, gameUid, message)
    setLoading(false)

    if (result.success) {
      toast.success('Successfully joined tournament!')
      onClose()
      setGameUid('')
      setMessage('')
      setPassword('')
    } else {
      toast.error(result.error || 'Failed to join tournament')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="w-full h-48 bg-gradient-to-br from-luxury-gold/20 to-luxury-darkGold/20 rounded-lg overflow-hidden relative">
          {tournament.banner_detail ? (
            <img 
              src={tournament.banner_detail} 
              alt={tournament.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Trophy className="w-20 h-20 text-luxury-gold/50" />
            </div>
          )}
          {tournament.is_luxury && (
            <div className="absolute top-4 right-4">
              <div className="bg-gradient-to-r from-luxury-gold to-luxury-darkGold px-4 py-2 rounded-full flex items-center gap-2">
                <Crown className="w-5 h-5 text-luxury-black" />
                <span className="text-sm font-bold text-luxury-black">LUXURY TOURNAMENT</span>
              </div>
            </div>
          )}
        </div>

        {/* Tournament Info */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{tournament.name}</h2>
          <p className="text-gray-400 text-lg">{tournament.game_name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-luxury-lightGray p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-luxury-gold" />
              <span className="text-gray-400 text-sm">Players</span>
            </div>
            <p className="text-white font-bold text-2xl">{tournament.slots_joined}/{tournament.slots_total}</p>
          </div>

          <div className="bg-luxury-lightGray p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-luxury-gold" />
              <span className="text-gray-400 text-sm">Prize Pool</span>
            </div>
            <p className="text-luxury-gold font-bold text-2xl">₹{tournament.prize_money}</p>
          </div>

          <div className="bg-luxury-lightGray p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-luxury-gold" />
              <span className="text-gray-400 text-sm">Date</span>
            </div>
            <p className="text-white font-bold">{format(new Date(tournament.tournament_date), 'MMM dd, yyyy')}</p>
          </div>

          <div className="bg-luxury-lightGray p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-luxury-gold" />
              <span className="text-gray-400 text-sm">Time</span>
            </div>
            <p className="text-white font-bold">{tournament.tournament_time}</p>
          </div>
        </div>

        {/* Game Mode */}
        <div className="bg-luxury-lightGray p-4 rounded-lg">
          <h3 className="text-white font-bold mb-2">Game Mode</h3>
          <p className="text-gray-400">{tournament.game_mode.toUpperCase()}</p>
        </div>

        {/* Rules */}
        {tournament.rules && (
          <div className="bg-luxury-lightGray p-4 rounded-lg">
            <h3 className="text-white font-bold mb-2">Tournament Rules</h3>
            <p className="text-gray-400 whitespace-pre-wrap">{tournament.rules}</p>
          </div>
        )}

        {/* Join Form */}
        {user && (
          <div className="space-y-4 border-t border-luxury-lightGray pt-6">
            <Input
              label="Game UID *"
              placeholder="Enter your game UID"
              value={gameUid}
              onChange={(e) => setGameUid(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message for Admin (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg bg-luxury-lightGray border border-luxury-lightGray text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="Any message for the admin (max 5 lines)"
                rows={5}
                maxLength={250}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {tournament.password && (
              <Input
                type="password"
                label="Tournament Password *"
                placeholder="Enter tournament password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
              />
            )}

            {/* Balance & Fee Info */}
            <div className="bg-luxury-lightGray p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Your Balance</span>
                <span className="text-white font-bold">₹{balance}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Entry Fee</span>
                <span className="text-luxury-gold font-bold">₹{tournament.join_fee}</span>
              </div>
              <div className="border-t border-luxury-lightGray my-2"></div>
              <div className="flex justify-between">
                <span className="text-white font-bold">Balance After Join</span>
                <span className={`font-bold ${balance - tournament.join_fee >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{balance - tournament.join_fee}
                </span>
              </div>
            </div>

            {/* Join Button */}
            <TouchButton
              variant="luxury"
              className="w-full text-lg py-4"
              onClick={handleJoin}
              disabled={!canJoin || loading}
            >
              {isFull ? 'Tournament Full' : loading ? 'Joining...' : `Join for ₹${tournament.join_fee}`}
            </TouchButton>

            {!canJoin && !isFull && (
              <p className="text-red-400 text-sm text-center">Insufficient balance. Please add money to your wallet.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
              }
