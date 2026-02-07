'use client'

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
  const [adminUpi, setAdminUpi] = useState('') // New state for Admin UPI

  // Helper for sounds
  const playSound = (type: 'click' | 'success') => {
    const audio = new Audio(type === 'click' ? '/sounds/click.mp3' : '/sounds/win.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {})
  }

  useEffect(() => {
    if (user) {
      loadWalletData()
      fetchAdminSettings() // Fetch Admin UPI on load
      
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

  // Admin Settings Fetching logic
  async function fetchAdminSettings() {
    const { data } = await supabase.from('system_settings').select('upi_id').single()
    if (data) setAdminUpi(data.upi_id)
  }

  async function loadWalletData() {
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()

    if (profile) setBalance(profile.wallet_balance)

    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (txns) setTransactions(txns)
  }

  async function requestDeposit(amount: number, utr: string, screenshotFile?: File) {
    if (!user) return { success: false }
    playSound('click')
    
    try {
      setLoading(true)
      // Deposit Cooldown Check (24 Hours)
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
        if (diff < 24) throw new Error(`Wait ${Math.ceil(24 - diff)} hours for next request`)
      }

      let screenshotUrl = ''
      if (screenshotFile) {
        const fileName = `${user.id}-${Date.now()}`
        const { error: uploadError, data } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, screenshotFile)
        
        if (uploadError) throw uploadError
        screenshotUrl = data.path
      }

      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id, amount, type: 'deposit', status: 'pending', utr, screenshot_url: screenshotUrl
      }])

      if (error) throw error
      playSound('success')
      toast.success('Deposit request sent!')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  async function joinTournament(t_id: string, fee: number, g_uid: string, slot: number) {
    if (!user) return { success: false }
    playSound('click')
    
    try {
      setLoading(true)
      // RPC handles the secure transaction
      const { error } = await supabase.rpc('join_tournament_secure', {
        target_t_id: t_id,
        target_u_id: user.id,
        entry_fee: fee,
        player_g_uid: g_uid,
        selected_slot: slot
      })

      if (error) throw error
      
      updateBalance(-fee)
      playSound('success')
      toast.success('Joined Successfully!')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message || 'Balance insufficient or slot taken')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return {
    balance,
    adminUpi, // Now exposed for UI
    transactions,
    loading,
    requestDeposit,
    joinTournament,
    refreshWallet: loadWalletData
  }
    }
      
