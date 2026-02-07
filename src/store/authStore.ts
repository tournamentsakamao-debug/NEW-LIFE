import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserProfile {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  wallet_balance: number
  avatar_url?: string
  is_banned?: boolean
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  isAdmin: boolean
  // Actions
  setUser: (user: UserProfile | null) => void
  setLoading: (status: boolean) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      // Computed property style
      isAdmin: false,

      setUser: (user) => set({ 
        user, 
        loading: false, 
        isAdmin: user?.role === 'admin' 
      }),

      setLoading: (status) => set({ loading: status }),

      // Profile update (like balance change) bina full re-login ke
      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
        isAdmin: (updates.role || state.user?.role) === 'admin'
      })),

      logout: () => {
        set({ user: null, isAdmin: false, loading: false })
        // Clear storage (Handled by persist automatically but for extra safety)
        localStorage.clear()
        window.location.href = '/login'
      },
    }),
    {
      name: 'luxury-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Sirf user data save karein, loading state nahi
      partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin }),
    }
  )
)
