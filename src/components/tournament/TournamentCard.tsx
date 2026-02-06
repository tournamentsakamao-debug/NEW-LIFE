'use client'

import { Tournament } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Crown, Users, Trophy, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface TournamentCardProps {
  tournament: Tournament
  onClick: () => void
}

export function TournamentCard({ tournament, onClick }: TournamentCardProps) {
  const isFree = tournament.join_fee === 0
  const isPractice = tournament.prize_money === 0
  const isPrivate = !!tournament.password
  const isFull = tournament.slots_joined >= tournament.slots_total

  return (
    <Card hover onClick={onClick} className="relative overflow-hidden">
      {/* Luxury Badge */}
      {tournament.is_luxury && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-luxury-gold to-luxury-darkGold px-3 py-1 rounded-full flex items-center gap-1">
            <Crown className="w-4 h-4 text-luxury-black" />
            <span className="text-xs font-bold text-luxury-black">LUXURY</span>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="w-full h-40 bg-gradient-to-br from-luxury-gold/20 to-luxury-darkGold/20 rounded-lg mb-4 overflow-hidden">
        {tournament.banner_main ? (
          <img 
            src={tournament.banner_main} 
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="w-16 h-16 text-luxury-gold/50" />
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-2 mb-3">
        {isFree && (
          <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs font-bold rounded-full">
            FREE
          </span>
        )}
        {isPractice && (
          <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-bold rounded-full">
            eSports Practice
          </span>
        )}
        {isPrivate && (
          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-full">
            🔒 Encrypted Private eSports
          </span>
        )}
        {isFull && (
          <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-full">
            FULL
          </span>
        )}
      </div>

      {/* Tournament Info */}
      <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
      <p className="text-gray-400 text-sm mb-4">{tournament.game_name} • {tournament.game_mode.toUpperCase()}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-luxury-gold" />
          <div>
            <p className="text-xs text-gray-400">Slots</p>
            <p className="text-white font-bold">{tournament.slots_joined}/{tournament.slots_total}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-luxury-gold" />
          <div>
            <p className="text-xs text-gray-400">Prize</p>
            <p className="text-white font-bold">₹{tournament.prize_money}</p>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(tournament.tournament_date), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{tournament.tournament_time}</span>
        </div>
      </div>

      {/* Join Fee */}
      {!isFree && (
        <div className="mt-4 pt-4 border-t border-luxury-lightGray">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Entry Fee</span>
            <span className="text-luxury-gold font-bold text-lg">₹{tournament.join_fee}</span>
          </div>
        </div>
      )}
    </Card>
  )
      }
