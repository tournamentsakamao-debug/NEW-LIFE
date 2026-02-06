'use client'

import { useState } from 'react'
import { useTournament } from '@/hooks/useTournament'
import { TournamentCard } from './TournamentCard'
import { TournamentDetail } from './TournamentDetail'
import { Tournament } from '@/lib/supabase'
import { Search } from 'lucide-react'

export function TournamentList() {
  const { tournaments, loading } = useTournament()
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTournaments = tournaments.filter(t => 
    t.status === 'upcoming' && (
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.game_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-luxury-lightGray border border-luxury-lightGray rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition-colors"
          />
        </div>
      </div>

      {/* Tournament Grid */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No tournaments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onClick={() => setSelectedTournament(tournament)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTournament && (
        <TournamentDetail
          tournament={selectedTournament}
          isOpen={!!selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  )
}
