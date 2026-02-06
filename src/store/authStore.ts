import { create } from 'zustand'
import { Profile } from '@/lib/supabase'

interface AuthState {
  user: Profile | null
  setUser: (user: Profile | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('userId')
    set({ user: null })
    window.location.href = '/login'
  },
}))
