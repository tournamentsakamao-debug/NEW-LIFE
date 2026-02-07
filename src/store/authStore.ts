import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '@/lib/supabase';

interface AuthState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
