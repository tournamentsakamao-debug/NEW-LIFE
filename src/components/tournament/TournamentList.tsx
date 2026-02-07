'use client'

import { useState } from 'react'
import { useTournament } from '@/hooks/useTournament'
import { TournamentCard } from './TournamentCard'
import { TournamentDetail } from './TournamentDetail'
import { Tournament } from '@/lib/supabase'
import { Search, Trophy, PlayCircle, Calendar } from 'lucide-react'
import SkeletonCard from '@/components/ui/Skeleton.tsx' // Ensure this path is correct
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
      {/* Header with Search and Tabs */}
      <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md pt-2 pb-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-[#D4AF37] text-black shadow-[0_10px_20px_rgba(212,175,55,0.2)]' 
                  : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          // Loading Skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredTournaments.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full text-center py-32 border border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02]"
                >
                  <Trophy className="mx-auto text-zinc-800 mb-4" size={48} />
                  <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">No {activeTab} matches found.</p>
                </motion.div>
              ) : (
                filteredTournaments.map(tournament => (
                  <motion.div
                    key={tournament.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
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
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTournament && (
          <TournamentDetail
            tournament={selectedTournament}
            isOpen={!!selectedTournament}
            onClose={() => setSelectedTournament(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
