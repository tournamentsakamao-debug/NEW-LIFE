import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WalletState {
  balance: number
  isLoading: boolean
  // Actions
  setBalance: (amount: number) => void
  addFunds: (amount: number) => void
  deductFunds: (amount: number) => boolean // Returns false if insufficient balance
  setLoading: (status: boolean) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      isLoading: false,

      setBalance: (amount) => set({ balance: amount, isLoading: false }),

      // Requirement: Smooth increment for deposits
      addFunds: (amount) => {
        set((state) => ({ balance: state.balance + amount }))
      },

      // Requirement: Security check for tournament entry/withdrawals
      deductFunds: (amount) => {
        const currentBalance = get().balance
        if (currentBalance < amount) {
          return false // Insufficient funds
        }
        set({ balance: currentBalance - amount })
        return true
      },

      setLoading: (status) => set({ isLoading: status }),
    }),
    {
      name: 'luxury-wallet-storage', // Local storage mein save rahega
      storage: createJSONStorage(() => localStorage),
    }
  )
)
    
