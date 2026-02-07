'use client';

import { useRouter } from 'next/navigation';
import { Users, Trophy, Calendar, Clock, Lock, Crown } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getTimeRemaining } from '@/lib/utils';
import Card from '@/components/ui/Card';
import type { Tournament } from '@/lib/supabase';
import Image from 'next/image';

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const router = useRouter();

  const getStatusColor = () => {
    switch (tournament.status) {
      case 'live':
        return 'bg-red-500 animate-pulse';
      case 'upcoming':
        return 'bg-blue-500';
      case 'finished':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLabel = () => {
    if (tournament.join_fee === 0) return { text: 'FREE', color: 'bg-green-500' };
    if (tournament.prize_money === 0) return { text: 'eSports Practice', color: 'bg-blue-500' };
    if (tournament.is_password_protected) return { text: 'Encrypted Private eSports', color: 'bg-purple-500' };
    return null;
  };

  const label = getLabel();

  return (
    <Card
      clickable
      luxury={tournament.is_luxury}
      onClick={() => router.push(`/tournament/${tournament.id}`)}
      className="relative overflow-hidden"
    >
      {/* Luxury Badge */}
      {tournament.is_luxury && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full">
            <Crown className="w-4 h-4 text-gray-900" />
            <span className="text-xs font-bold text-gray-900">LUXURY</span>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`${getStatusColor()} px-3 py-1 rounded-full`}>
          <span className="text-xs font-bold text-white uppercase">
            {tournament.status}
          </span>
        </div>
      </div>

      {/* Banner Image */}
      {tournament.banner_main && (
        <div className="relative h-48 -mx-6 -mt-6 mb-4">
          <Image
            src={tournament.banner_main}
            alt={tournament.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {/* Title & Game */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{tournament.title}</h3>
          <p className="text-sm text-gray-400">{tournament.game_name} • {tournament.game_mode}</p>
        </div>

        {/* Label */}
        {label && (
          <div className={`${label.color} px-3 py-1 rounded-lg inline-block`}>
            <span className="text-xs font-bold text-white">{label.text}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Slots */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Slots</p>
              <p className="font-bold text-white">
                {tournament.slots_joined}/{tournament.slots_total}
              </p>
            </div>
          </div>

          {/* Entry Fee */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400">Entry</p>
              <p className="font-bold text-white">
                {tournament.join_fee === 0 ? 'FREE' : formatCurrency(tournament.join_fee)}
              </p>
            </div>
          </div>

          {/* Prize */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
            <Trophy className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Prize</p>
              <p className="font-bold text-white">
                {formatCurrency(tournament.prize_money)}
              </p>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
            <Clock className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Starts In</p>
              <p className="font-bold text-white">
                {getTimeRemaining(tournament.tournament_date, tournament.tournament_time)}
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(tournament.tournament_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatTime(tournament.tournament_time)}</span>
          </div>
        </div>

        {/* Password Protected Indicator */}
        {tournament.is_password_protected && (
          <div className="flex items-center gap-2 text-purple-400 text-sm">
            <Lock className="w-4 h-4" />
            <span>Password Protected</span>
          </div>
        )}
      </div>
    </Card>
  );
                                  }
