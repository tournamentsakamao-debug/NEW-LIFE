import { create } from 'zustand'
import { Tournament } from '@/lib/supabase'

interface TournamentState {
  tournaments: Tournament[]
  setTournaments: (tournaments: Tournament[]) => void
  addTournament: (tournament: Tournament) => void
  updateTournament: (id: string, updates: Partial<Tournament>) => void
  deleteTournament: (id: string) => void
}

export const useTournamentStore = create<TournamentState>((set) => ({
  tournaments: [],
  setTournaments: (tournaments) => set({ tournaments }),
  addTournament: (tournament) => set((state) => ({
    tournaments: [...state.tournaments, tournament]
  })),
  updateTournament: (id, updates) => set((state) => ({
    tournaments: state.tournaments.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTournament: (id) => set((state) => ({
    tournaments: state.tournaments.filter(t => t.id !== id)
  })),
}))
