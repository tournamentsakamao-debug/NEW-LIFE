'use client'

import { useState } from 'react'
import { useTournament } from '@/hooks/useTournament'
import { TournamentCard } from './TournamentCard'
import { TournamentDetail } from './TournamentDetail'
import { Tournament } from '@/lib/supabase'
import { Search, Trophy, PlayCircle, Calendar } from 'lucide-react'
import SkeletonCard from '@/components/ui/SkeletonCard'
import { motion, AnimatePresence } from 'framer-motion'

export function TournamentList() {
  const { tournaments, loading } = useTournament()
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'finished'>('upcoming')

  // Requirement 1.1: Multi-status filtering
  const filteredTournaments = tournaments.filter(t => 
    t.status === activeTab && (
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.game_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'live', label: 'Live', icon: PlayCircle },
    { id: 'finished', label: 'Results', icon: Trophy },
  ] as const

  return (
    <div className="space-y-6 pb-20">
      {/* Requirement 12: Luxury Search & Tabs Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md pt-2 pb-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-luxury-gold transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold/50 transition-all"
          />
        </div>

        {/* Custom Luxury Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-luxury-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requirement 1.1: Tournament Grid with Animations */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredTournaments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]"
              >
                <p className="text-gray-500 font-bold">No {activeTab} matches found.</p>
              </motion.div>
            ) : (
              filteredTournaments.map(tournament => (
                <motion.div
                  key={tournament.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <TournamentCard
                    tournament={tournament}
                    onClick={() => setSelectedTournament(tournament)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
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
