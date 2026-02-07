'use client'

import { Tournament } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Crown, Users, Trophy, Map as MapIcon, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'

interface TournamentCardProps {
  tournament: Tournament
  onClick: () => void
}

export function TournamentCard({ tournament, onClick }: TournamentCardProps) {
  const isFree = tournament.join_fee === 0
  const isFull = tournament.slots_joined >= tournament.slots_total
  const fillPercentage = (tournament.slots_joined / tournament.slots_total) * 100

  return (
    <Card variant={tournament.is_luxury ? 'luxury' : 'default'} hover onClick={onClick} noPadding className="group">
      {/* 1. Image Header with Badge Overlays */}
      <div className="relative h-44 w-full overflow-hidden">
        {tournament.banner_main ? (
          <img 
            src={tournament.banner_main} 
            alt={tournament.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-luxury-gold/20" />
          </div>
        )}
        
        {/* Requirement 1.1: Live Pulse Badge */}
        {tournament.status === 'live' && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-md animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Live Now</span>
          </div>
        )}

        {/* Luxury Badge */}
        {tournament.is_luxury && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-luxury-gold/30 p-1.5 rounded-lg">
            <Crown className="w-4 h-4 text-luxury-gold" />
          </div>
        )}

        {/* Bottom Image Overlay: Game Mode & Map */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.2em]">
              {tournament.game_name}
            </span>
            <h3 className="text-lg font-black text-white uppercase leading-tight italic tracking-tighter">
              {tournament.name}
            </h3>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md flex items-center gap-1">
            <MapIcon className="w-3 h-3 text-gray-300" />
            <span className="text-[9px] font-bold text-gray-200 uppercase">{tournament.map_name || 'TBD'}</span>
          </div>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="p-5 space-y-4">
        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <p className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">Prize Pool</p>
            <p className="text-sm font-black text-white italic">₹{tournament.prize_money}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <p className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">Mode</p>
            <p className="text-sm font-black text-white italic uppercase">{tournament.game_mode}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <p className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">Entry</p>
            <p className={`text-sm font-black italic ${isFree ? 'text-green-500' : 'text-luxury-gold'}`}>
              {isFree ? 'FREE' : `₹${tournament.join_fee}`}
            </p>
          </div>
        </div>

        {/* Requirement 1.7: Visual Slot Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{tournament.slots_joined}/{tournament.slots_total} Joined</span>
            </div>
            <span className={isFull ? 'text-red-500' : ''}>{isFull ? 'Sold Out' : `${tournament.slots_total - tournament.slots_joined} Left`}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-luxury-gold'}`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer: Date & Veriied Check */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
           <div className="flex items-center gap-1.5">
             <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
             <span className="text-[10px] text-gray-500 font-bold uppercase">Official Match</span>
           </div>
           <p className="text-[10px] text-gray-300 font-black">
             {format(new Date(tournament.tournament_date), 'dd MMM')} • {tournament.tournament_time}
           </p>
        </div>
      </div>
    </Card>
  )
          }
