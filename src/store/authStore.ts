import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: any | null;
  isAdmin: boolean;
  isLoading: boolean;
  setUser: (user: any) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isLoading: true,
  setUser: (user) => {
    const adminEmail = "tournamentsakamao@gmail.com";
    set({ 
      user, 
      isAdmin: user?.email === adminEmail, 
      isLoading: false 
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAdmin: false, isLoading: false });
  },
}));

