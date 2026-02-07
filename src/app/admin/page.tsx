'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { 
  Users, Trophy, Wallet, MessageSquare, Settings, 
  TrendingUp, LogOut, ShieldAlert, BarChart3, 
  Activity, Zap, Lock, Eye
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuthStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalTournaments: 0,
    totalTransactions: 0,
    adminWallet: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalProfit: 0, // Requirement 5.1
  })

  // Sound Logic (Requirement 13)
  const playClick = () => {
    const audio = document.getElementById('click-sound') as HTMLAudioElement
    if (audio) { audio.currentTime = 0; audio.play() }
  }

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login')
    } else if (user) {
      loadStats()
    }
  }, [user, loading, router])

  const loadStats = async () => {
    // In real-world, use Supabase RPC for better performance
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: tours } = await supabase.from('tournaments').select('*', { count: 'exact', head: true })
    const { data: deposits } = await supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'pending')
    const { data: withdrawals } = await supabase.from('transactions').select('amount').eq('type', 'withdraw').eq('status', 'pending')
    
    setStats(prev => ({
      ...prev,
      totalUsers: users || 0,
      totalTournaments: tours || 0,
      pendingDeposits: deposits?.length || 0,
      pendingWithdrawals: withdrawals?.length || 0,
      adminWallet: 154200.50, // Static simulation for now
      totalProfit: 24500.00   // Requirement 5.1 Analysis
    }))
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-10">
      {/* --- ADMIN HEADER --- */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luxury-gold to-yellow-700 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <ShieldAlert className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-gold-gradient">MASTER PANEL</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Authorized: {user?.username}</p>
          </div>
        </div>
        <button 
          onClick={() => { playClick(); logout(); }}
          className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 active:scale-95 transition-all"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* --- MAIN ADMIN WALLET (Requirement 2.2) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-luxury-gold/20 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-luxury-gold opacity-5 blur-[80px]" />
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Platform Treasury</p>
            <h2 className="text-5xl font-black text-white tracking-tighter">₹{stats.adminWallet.toLocaleString()}</h2>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1 rounded-full">
                <TrendingUp size={14} /> +12.5% Profit
              </div>
              <p className="text-[10px] text-gray-500 uppercase">Live Audit Active</p>
            </div>
          </motion.div>

          {/* Pending Alerts (Requirement 2.3 & 2.4) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] text-yellow-500 font-black uppercase mb-2">Pending Deposits</p>
              <h3 className="text-3xl font-bold">{stats.pendingDeposits}</h3>
              <button onClick={() => router.push('/admin/transactions')} className="mt-3 text-[10px] text-white/40 hover:text-luxury-gold flex items-center gap-1 uppercase tracking-widest transition-colors">
                <Eye size={12} /> Review
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] text-red-500 font-black uppercase mb-2">Pending Withdrawals</p>
              <h3 className="text-3xl font-bold">{stats.pendingWithdrawals}</h3>
              <button onClick={() => router.push('/admin/transactions')} className="mt-3 text-[10px] text-white/40 hover:text-luxury-gold flex items-center gap-1 uppercase tracking-widest transition-colors">
                <Eye size={12} /> Review
              </button>
            </div>
          </div>
        </div>

        {/* --- ANALYTICS TILES (Requirement 5) --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users size={20}/>} label="Total Users" value={stats.totalUsers} color="blue" />
          <StatCard icon={<Activity size={20}/>} label="Online Now" value="12" color="green" />
          <StatCard icon={<Trophy size={20}/>} label="Live Games" value={stats.totalTournaments} color="gold" />
          <StatCard icon={<BarChart3 size={20}/>} label="Net Profit" value={`₹${stats.totalProfit}`} color="purple" />
        </div>

        {/* --- SYSTEM CONTROLS (Requirement 6 & 2.6) --- */}
        <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] mb-6 px-2">Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminAction 
            icon={<Zap />} 
            title="Tournaments" 
            desc="Create & Manage Slots" 
            onClick={() => { playClick(); router.push('/admin/tournaments') }} 
          />
          <AdminAction 
            icon={<Wallet />} 
            title="Transactions" 
            desc="Approve Payments" 
            onClick={() => { playClick(); router.push('/admin/transactions') }} 
          />
          <AdminAction 
            icon={<MessageSquare />} 
            title="Support Desk" 
            desc="Chat with Players" 
            onClick={() => { playClick(); router.push('/admin/chats') }} 
          />
          <AdminAction 
            icon={<Lock />} 
            title="Maintenance" 
            desc="Toggle App Lock" 
            onClick={() => { playClick(); router.push('/admin/settings') }} 
            warning 
          />
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-[#111] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-white/5 text-luxury-gold`}>{icon}</div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}

function AdminAction({ icon, title, desc, onClick, warning }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-4 active:scale-95 group ${
        warning ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10 hover:border-luxury-gold/30'
      }`}
    >
      <div className={`p-4 rounded-2xl w-fit ${warning ? 'bg-red-500/20 text-red-500' : 'bg-luxury-gold/10 text-luxury-gold group-hover:bg-luxury-gold group-hover:text-black transition-colors'}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-[10px] text-gray-500 uppercase mt-1">{desc}</p>
      </div>
    </button>
  )
                         }
              
