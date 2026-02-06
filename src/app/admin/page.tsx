'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { TouchButton } from '@/components/ui/TouchButton'
import { 
  Users, 
  Trophy, 
  Wallet, 
  MessageSquare, 
  Settings,
  TrendingUp,
  LogOut
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalTournaments: 0,
    totalTransactions: 0,
    adminWallet: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    } else if (user) {
      loadStats()
    }
  }, [user, loading, router])

  const loadStats = async () => {
    // Total Users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Total Tournaments
    const { count: totalTournaments } = await supabase
      .from('tournaments')
      .select('*', { count: 'exact', head: true })

    // Total Transactions
    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    // Pending Deposits
    const { count: pendingDeposits } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'deposit')
      .eq('status', 'pending')

    // Pending Withdrawals
    const { count: pendingWithdrawals } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'withdraw')
      .eq('status', 'pending')

    // Admin Wallet
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user?.id)
      .single()

    setStats({
      totalUsers: totalUsers || 0,
      onlineUsers: 0, // Implement real-time tracking if needed
      totalTournaments: totalTournaments || 0,
      totalTransactions: totalTransactions || 0,
      adminWallet: adminProfile?.wallet_balance || 0,
      pendingDeposits: pendingDeposits || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Header */}
      <header className="bg-luxury-gray border-b border-luxury-lightGray">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, {user.username}</p>
            </div>
            <TouchButton variant="danger" onClick={logout}>
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </TouchButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Admin Wallet */}
        <Card className="mb-6 bg-gradient-to-br from-luxury-gold/10 to-luxury-darkGold/10 border-luxury-gold/30">
          <div className="text-center">
            <p className="text-gray-400 mb-2">Admin Wallet</p>
            <h2 className="text-5xl font-bold text-luxury-gold mb-4">₹{stats.adminWallet}</h2>
            <div className="flex items-center justify-center gap-2 text-green-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Total Balance</span>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <Users className="w-8 h-8 text-luxury-gold mb-2" />
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          </Card>
          <Card>
            <Trophy className="w-8 h-8 text-luxury-gold mb-2" />
            <p className="text-gray-400 text-sm">Tournaments</p>
            <p className="text-2xl font-bold text-white">{stats.totalTournaments}</p>
          </Card>
          <Card>
            <Wallet className="w-8 h-8 text-luxury-gold mb-2" />
            <p className="text-gray-400 text-sm">Transactions</p>
            <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
          </Card>
          <Card>
            <MessageSquare className="w-8 h-8 text-luxury-gold mb-2" />
            <p className="text-gray-400 text-sm">Messages</p>
            <p className="text-2xl font-bold text-white">0</p>
          </Card>
        </div>

        {/* Pending Actions */}
        {(stats.pendingDeposits > 0 || stats.pendingWithdrawals > 0) && (
          <Card className="mb-6 bg-yellow-600/10 border-yellow-600/20">
            <h3 className="text-white font-bold mb-3">⚠️ Pending Actions</h3>
            <div className="space-y-2">
              {stats.pendingDeposits > 0 && (
                <p className="text-yellow-400 text-sm">
                  {stats.pendingDeposits} deposit request(s) waiting for approval
                </p>
              )}
              {stats.pendingWithdrawals > 0 && (
                <p className="text-yellow-400 text-sm">
                  {stats.pendingWithdrawals} withdrawal request(s) waiting for approval
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TouchButton
            variant="luxury"
            className="justify-start h-auto py-6"
            onClick={() => router.push('/admin/tournaments')}
          >
            <Trophy className="w-6 h-6 mr-3" />
            <div className="text-left">
              <p className="font-bold">Manage Tournaments</p>
              <p className="text-xs opacity-80">Create, edit, or delete tournaments</p>
            </div>
          </TouchButton>

          <TouchButton
            variant="luxury"
            className="justify-start h-auto py-6"
            onClick={() => router.push('/admin/transactions')}
          >
            <Wallet className="w-6 h-6 mr-3" />
            <div className="text-left">
              <p className="font-bold">Transaction Requests</p>
              <p className="text-xs opacity-80">Approve deposits & withdrawals</p>
            </div>
          </TouchButton>

          <TouchButton
            variant="luxury"
            className="justify-start h-auto py-6"
            onClick={() => router.push('/admin/chats')}
          >
            <MessageSquare className="w-6 h-6 mr-3" />
            <div className="text-left">
              <p className="font-bold">User Messages</p>
              <p className="text-xs opacity-80">View and reply to user chats</p>
            </div>
          </TouchButton>

          <TouchButton
            variant="luxury"
            className="justify-start h-auto py-6"
            onClick={() => router.push('/admin/settings')}
          >
            <Settings className="w-6 h-6 mr-3" />
            <div className="text-left">
              <p className="font-bold">System Settings</p>
              <p className="text-xs opacity-80">App configuration & maintenance</p>
            </div>
          </TouchButton>
        </div>
      </main>
    </div>
  )
          }
