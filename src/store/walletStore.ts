import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

interface WalletState {
  balance: number;
  isLoading: boolean;
  fetchBalance: (userId: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  isLoading: false,
  fetchBalance: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      set({ balance: data.wallet_balance, isLoading: false });
    }
  },
}));
