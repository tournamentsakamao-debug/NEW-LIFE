import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Requirement 1.3: Definitive Tournament Interface
export interface Tournament {
  id: string
  name: string
  game_name: string
  game_mode: 'solo' | 'duo' | 'squad'
  map_name: string
  version: string
  slots_total: number
  slots_joined: number
  join_fee: number
  prize_money: number
  tournament_date: string
  tournament_time: string
  status: 'upcoming' | 'live' | 'finished' | 'canceled'
  is_luxury: boolean
  rules?: string
  banner_url?: string
}

interface TournamentState {
  tournaments: Tournament[]
  isLoading: boolean
  // Actions
  setTournaments: (tournaments: Tournament[]) => void
  addTournament: (tournament: Tournament) => void
  updateTournament: (id: string, updates: Partial<Tournament>) => void
  deleteTournament: (id: string) => void
  setLoading: (status: boolean) => void
  // Helper: Get tournament by ID
  getTournamentById: (id: string) => Tournament | undefined
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournaments: [],
      isLoading: false,

      setTournaments: (tournaments) => set({ tournaments, isLoading: false }),

      addTournament: (tournament) => set((state) => ({
        tournaments: [tournament, ...state.tournaments]
      })),

      updateTournament: (id, updates) => set((state) => ({
        tournaments: state.tournaments.map((t) => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),

      deleteTournament: (id) => set((state) => ({
        tournaments: state.tournaments.filter((t) => t.id !== id)
      })),

      setLoading: (status) => set({ isLoading: status }),

      getTournamentById: (id) => get().tournaments.find((t) => t.id === id),
    }),
    {
      name: 'luxury-tournament-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

