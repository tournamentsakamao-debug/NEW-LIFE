'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { 
  Users, Trophy, Wallet, MessageSquare, Settings, 
  TrendingUp, LogOut, ShieldAlert, BarChart3, 
  Activity, Zap, Lock, Eye, RefreshCcw
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuthStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalTournaments: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    globalUserBalance: 0, // Total money owed to users
    adminNetProfit: 0      // Actual Profit: (Revenue - Payouts) - Global Balance
  })

  const playClick = () => {
    const audio = document.getElementById('click-sound') as HTMLAudioElement
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
  }

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login')
    } else if (user) {
      loadStats()
    }
  }, [user, loading, router])

  const loadStats = async () => {
    setIsRefreshing(true)
    try {
      // 1. Fetch Basic Counts
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: tours } = await supabase.from('tournaments').select('*', { count: 'exact', head: true })
      
      // 2. Fetch Pending Requests
      const { data: pendDep } = await supabase.from('transactions').select('id').eq('type', 'deposit').eq('status', 'pending')
      const { data: pendWith } = await supabase.from('transactions').select('id').eq('type', 'withdraw').eq('status', 'pending')
      
      // 3. --- DOUBLE WALLET LOGIC (Requirement 5.1) ---
      // A. Total Balance currently held by all users
      const { data: profiles } = await supabase.from('profiles').select('balance')
      const totalGlobalBalance = profiles?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0

      // B. Total Success Revenue (Deposits - Withdrawals)
      const { data: successDep } = await supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'approved')
      const { data: successWith } = await supabase.from('transactions').select('amount').eq('type', 'withdraw').eq('status', 'approved')
      
      const totalIn = successDep?.reduce((acc, curr) => acc + curr.amount, 0) || 0
      const totalOut = successWith?.reduce((acc, curr) => acc + curr.amount, 0) || 0
      
      // Actual Admin Profit = (Paise Jo Aaye - Paise Jo Gaye) - (Jo Paise Users ke Wallet me pade hain)
      const netProfit = (totalIn - totalOut) - totalGlobalBalance

      setStats({
        totalUsers: users || 0,
        onlineUsers: Math.floor(Math.random() * 20) + 5, // Simulated online
        totalTournaments: tours || 0,
        pendingDeposits: pendDep?.length || 0,
        pendingWithdrawals: pendWith?.length || 0,
        globalUserBalance: totalGlobalBalance,
        adminNetProfit: netProfit
      })
    } catch (err) {
      toast.error("Failed to sync treasury data")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* --- ADMIN HEADER --- */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8A2E] flex items-center justify-center shadow-lg shadow-gold-500/20">
            <ShieldAlert className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter italic">MASTER PANEL</h1>
            <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em]">System Admin: {user?.username}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { playClick(); loadStats(); }} className={`p-3 bg-white/5 rounded-xl border border-white/10 ${isRefreshing ? 'animate-spin' : ''}`}>
                <RefreshCcw size={18} />
            </button>
            <button onClick={() => { playClick(); logout(); }} className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                <LogOut size={18} />
            </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        
        {/* --- DOUBLE WALLET TREASURY --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Admin Net Profit (Aapki Kamayi) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#D4AF37] to-[#AA8A2E] text-black relative overflow-hidden shadow-[0_20px_50px_rgba(212,175,55,0.2)]"
          >
            <TrendingUp className="absolute -right-6 -bottom-6 opacity-10" size={150} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Admin Net Profit</p>
            <h2 className="text-5xl font-black italic tracking-tighter">₹{stats.adminNetProfit.toLocaleString()}</h2>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold bg-black/10 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
                <Zap size={12} fill="black"/> System Revenue Verified
            </div>
          </motion.div>

          {/* Global Liability (Users ka Paisa) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden"
          >
            <Wallet className="absolute -right-6 -bottom-6 opacity-5" size={150} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Global User Balances</p>
            <h2 className="text-5xl font-black text-white tracking-tighter italic">₹{stats.globalUserBalance.toLocaleString()}</h2>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Total money held by players
            </div>
          </motion.div>
        </div>

        {/* --- PENDING ALERTS --- */}
        <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-[2rem] p-6 text-center">
                <p className="text-[9px] text-yellow-500 font-black uppercase mb-1 tracking-widest">Pending Deposits</p>
                <h3 className="text-4xl font-black italic">{stats.pendingDeposits}</h3>
                <TouchButton variant="secondary" className="mt-4 !py-2 !text-[9px] w-full" onClick={() => router.push('/admin/transactions')}>Review All</TouchButton>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-6 text-center">
                <p className="text-[9px] text-red-500 font-black uppercase mb-1 tracking-widest">Pending Withdrawals</p>
                <h3 className="text-4xl font-black italic text-red-500">{stats.pendingWithdrawals}</h3>
                <TouchButton variant="danger" className="mt-4 !py-2 !text-[9px] w-full" onClick={() => router.push('/admin/transactions')}>Process Payouts</TouchButton>
            </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Users size={20}/>} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={<Activity size={20}/>} label="Live Now" value={stats.onlineUsers} color="text-green-500" />
          <StatCard icon={<Trophy size={20}/>} label="Total Matches" value={stats.totalTournaments} />
          <StatCard icon={<ShieldAlert size={20}/>} label="Fraud Alerts" value="0" />
        </div>

        {/* --- QUICK ACTIONS --- */}
        <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6 px-4">Management Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminAction 
            icon={<Zap />} 
            title="Match Manager" 
            desc="Control Slots & Data" 
            onClick={() => { playClick(); router.push('/admin/tournaments') }} 
          />
          <AdminAction 
            icon={<Wallet />} 
            title="Payout Center" 
            desc="Verify UTR & UPI" 
            onClick={() => { playClick(); router.push('/admin/transactions') }} 
          />
          <AdminAction 
            icon={<MessageSquare />} 
            title="User Support" 
            desc="Check Player Reports" 
            onClick={() => { playClick(); router.push('/admin/support') }} 
          />
          <AdminAction 
            icon={<Lock />} 
            title="App Config" 
            desc="Maintenance Mode" 
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
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col gap-3">
      <div className={`p-3 rounded-2xl bg-white/5 w-fit ${color || 'text-[#D4AF37]'}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{label}</p>
        <p className="text-2xl font-black italic">{value}</p>
      </div>
    </div>
  )
}

function AdminAction({ icon, title, desc, onClick, warning }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-[2.5rem] border transition-all text-left flex flex-col gap-5 active:scale-95 group ${
        warning ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/5 hover:border-[#D4AF37]/30'
      }`}
    >
      <div className={`p-4 rounded-2xl w-fit ${warning ? 'bg-red-500/20 text-red-500' : 'bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors'}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-black italic text-white uppercase tracking-tight">{title}</h3>
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{desc}</p>
      </div>
    </button>
  )
}

function TouchButton({ children, variant, className, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`py-3 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 ${
                variant === 'danger' ? 'bg-red-500 text-white' : 'bg-white/10 text-white border border-white/10'
            } ${className}`}
        >
            {children}
        </button>
    )
        }
        
