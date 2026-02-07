import { create } from 'zustand';
import type { Tournament } from '@/lib/supabase';

interface TournamentState {
  tournaments: Tournament[];
  setTournaments: (tournaments: Tournament[]) => void;
  addTournament: (tournament: Tournament) => void;
  updateTournament: (id: string, tournament: Partial<Tournament>) => void;
  removeTournament: (id: string) => void;
}

export const useTournamentStore = create<TournamentState>((set) => ({
  tournaments: [],
  setTournaments: (tournaments) => set({ tournaments }),
  addTournament: (tournament) =>
    set((state) => ({ tournaments: [...state.tournaments, tournament] })),
  updateTournament: (id, tournament) =>
    set((state) => ({
      tournaments: state.tournaments.map((t) =>
        t.id === id ? { ...t, ...tournament } : t
      ),
    })),
  removeTournament: (id) =>
    set((state) => ({
      tournaments: state.tournaments.filter((t) => t.id !== id),
    })),
}));
