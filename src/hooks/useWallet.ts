import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useWalletStore } from '@/store/walletStore'
import { toast } from 'sonner'

export function useWallet() {
  const { user } = useAuthStore()
  const { balance, setBalance, updateBalance } = useWalletStore()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadWalletData()
      
      // Requirement 2.1: Real-time Transaction Subscription
      const channel = supabase
        .channel(`wallet-${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        }, () => {
          loadWalletData()
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [user])

  async function loadWalletData() {
    if (!user) return

    // 1. Fetch Latest Profile Balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()

    if (profile) setBalance(profile.wallet_balance)

    // 2. Fetch Transaction History with Status
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (txns) setTransactions(txns)
  }

  // Requirement 2.2: Modified to support Screenshot Upload
  async function requestDeposit(amount: number, utr: string, screenshotFile?: File) {
    if (!user) return { success: false, error: 'Auth Required' }
    
    try {
      setLoading(true)

      // Time Limit Check
      const { data: lastDeposit } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastDeposit) {
        const diff = (Date.now() - new Date(lastDeposit.created_at).getTime()) / (1000 * 60 * 60)
        if (diff < 24) throw new Error(`Next request available in ${Math.ceil(24 - diff)} hours`)
      }

      let screenshotUrl = ''
      // Requirement 2.2: Upload proof to Supabase Storage
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, screenshotFile)
        
        if (uploadError) throw uploadError
        screenshotUrl = data.path
      }

      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount,
          type: 'deposit',
          status: 'pending',
          utr,
          screenshot_url: screenshotUrl // Updated column
        }])

      if (error) throw error
      toast.success('Deposit request sent for verification')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  async function requestWithdrawal(amount: number, upiId: string) {
    if (!user) return { success: false, error: 'Auth Required' }
    if (balance < amount) {
      toast.error('Insufficient Luxury Balance')
      return { success: false }
    }

    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount,
          type: 'withdraw',
          status: 'pending',
          user_upi_id: upiId
        }])

      if (error) throw error
      toast.success('Withdrawal request initiated')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  // Requirement 1.7: Slot-based joining logic
  async function joinTournament(t_id: string, fee: number, g_uid: string, slot: number) {
    if (!user) return { success: false }
    
    try {
      setLoading(true)
      // RPC call handles atomicity (Balance deduct + Slot book)
      const { data, error } = await supabase.rpc('join_tournament_secure', {
        target_t_id: t_id,
        target_u_id: user.id,
        entry_fee: fee,
        player_g_uid: g_uid,
        selected_slot: slot
      })

      if (error) throw error
      
      updateBalance(-fee)
      toast.success('Welcome to the Tournament!')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return {
    balance,
    transactions,
    loading,
    requestDeposit,
    requestWithdrawal,
    joinTournament,
    refreshWallet: loadWalletData
  }
}
