import { useState, useEffect } from 'react'
import { supabase, Transaction } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useWalletStore } from '@/store/walletStore'

export function useWallet() {
  const { user } = useAuthStore()
  const { balance, setBalance, updateBalance } = useWalletStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadWalletData()
    }
  }, [user])

  async function loadWalletData() {
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()

    if (profile) {
      setBalance(profile.wallet_balance)
    }

    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (txns) {
      setTransactions(txns)
    }
  }

  async function requestDeposit(amount: number, utr: string) {
    if (!user) return { success: false, error: 'Not authenticated' }
    try {
      setLoading(true)
      
      // Check 24 hour rule
      const { data: lastDeposit } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() // changed to maybeSingle to avoid errors if no data

      if (lastDeposit) {
        const hoursSince = (Date.now() - new Date(lastDeposit.created_at).getTime()) / (1000 * 60 * 60)
        if (hoursSince < 24) {
          throw new Error(`Please wait ${Math.ceil(24 - hoursSince)} hours before next deposit request`)
        }
      }

      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount,
          type: 'deposit',
          status: 'pending',
          utr
        }])

      if (error) throw error
      await loadWalletData()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // UPDATED: Now accepts upiId
  async function requestWithdrawal(amount: number, upiId: string) {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      setLoading(true)

      if (balance < amount) {
        throw new Error('Insufficient balance')
      }

      // Check 5 hour rule
      const { data: lastWithdraw } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('type', 'withdraw')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastWithdraw) {
        const hoursSince = (Date.now() - new Date(lastWithdraw.created_at).getTime()) / (1000 * 60 * 60)
        if (hoursSince < 5) {
          throw new Error(`Please wait ${Math.ceil(5 - hoursSince)} hours before next withdrawal`)
        }
      }

      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount,
          type: 'withdraw',
          status: 'pending',
          user_upi_id: upiId // <--- Data ab yahan se save hoga
        }])

      if (error) throw error

      await loadWalletData()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  async function joinTournament(tournamentId: string, fee: number, gameUid: string, message?: string) {
    if (!user) return { success: false, error: 'Not authenticated' }
    try {
      setLoading(true)
      const { error } = await supabase.rpc('join_tournament_final', {
        t_id: tournamentId,
        u_id: user.id,
        fee,
        g_uid: gameUid,
        admin_msg: message || ''
      })
      if (error) throw error
      updateBalance(-fee)
      await loadWalletData()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
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
    
