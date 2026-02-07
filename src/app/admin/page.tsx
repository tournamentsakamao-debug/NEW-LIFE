'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth' // Updated hook use kar rahe hain
import { supabase } from '@/lib/supabase'
import { 
  Users, Trophy, Wallet, MessageSquare, Settings, 
  TrendingUp, LogOut, ShieldAlert, BarChart3, 
  Activity, Zap, Lock, RefreshCcw, Camera, Bell,
  Eye // <--- FIXED: Eye icon import add kar diya
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin, logout } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sysSettings, setSysSettings] = useState<any>(null)
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalTournaments: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    globalUserBalance: 0,
    adminNetProfit: 0 
  })

  // Sound Logic
  const playClick = () => {
    const audio = new Audio('/sounds/click.mp3') // Direct play to avoid element-id issues
    audio.play().catch(() => {})
  }

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login')
      } else {
        loadStats()
        fetchSystemSettings()
      }
    }
  }, [user, authLoading, isAdmin, router])

  const fetchSystemSettings = async () => {
    const { data } = await supabase.from('system_settings').select('*').eq('id', 1).single()
    if (data) setSysSettings(data)
  }

  const loadStats = async () => {
    setIsRefreshing(true)
    try {
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: tours } = await supabase.from('tournaments').select('*', { count: 'exact', head: true })
      
      const { data: pendDep } = await supabase.from('transactions').select('id').eq('type', 'deposit').eq('status', 'pending')
      const { data: pendWith } = await supabase.from('transactions').select('id').eq('type', 'withdraw').eq('status', 'pending')
      
      // Treasury Calculation
      const { data: finance } = await supabase.from('admin_finance').select('*').single()

      setStats({
        totalUsers: users || 0,
        onlineUsers: Math.floor(Math.random() * 15) + 5,
        totalTournaments: tours || 0,
        pendingDeposits: pendDep?.length || 0,
        pendingWithdrawals: pendWith?.length || 0,
        globalUserBalance: finance?.global_wallet || 0,
        adminNetProfit: finance?.admin_personal_wallet || 0
      })
    } catch (err) {
      console.error("Treasury Sync Error:", err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleToggleMaintenance = async () => {
    playClick()
    const currentStatus = sysSettings?.maintenance_mode
    const { error } = await supabase
      .from('system_settings')
      .update({ maintenance_mode: !currentStatus })
      .eq('id', 1)
    
    if (!error) {
      toast.success(`Maintenance ${!currentStatus ? 'Activated' : 'Deactivated'}`)
      fetchSystemSettings()
    }
  }

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24">
      {/* --- ADMIN HEADER --- */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA8A2E] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
            <ShieldAlert className="text-black" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter italic uppercase">Master Console</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Authority: {user?.username}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { playClick(); loadStats(); }} className={`p-3 bg-white/5 rounded-xl border border-white/10 ${isRefreshing ? 'animate-spin' : ''}`}>
                <RefreshCcw size={20} />
            </button>
            <button onClick={() => { playClick(); logout(); }} className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 active:scale-95">
                <LogOut size={20} />
            </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        
        {/* --- DOUBLE WALLET TREASURY --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#D4AF37] to-[#AA8A2E] text-black relative overflow-hidden shadow-2xl"
          >
            <TrendingUp className="absolute -right-8 -bottom-8 opacity-10" size={180} />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Personal Treasury (Net Profit)</p>
                <h2 className="text-6xl font-black italic tracking-tighter">₹{stats.adminNetProfit.toLocaleString()}</h2>
              </div>
              <Zap size={24} className="opacity-40" />
            </div>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold bg-black/10 w-fit px-4 py-1.5 rounded-full uppercase tracking-widest">
                Verified Platform Revenue
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-8 rounded-[2.5rem] bg-[#111] border border-white/10 relative overflow-hidden"
          >
            <Wallet className="absolute -right-8 -bottom-8 opacity-5" size={180} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total User Liability</p>
            <h2 className="text-6xl font-black text-white tracking-tighter italic">₹{stats.globalUserBalance.toLocaleString()}</h2>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Current Global Liquidity
            </div>
          </motion.div>
        </div>

        {/* --- PENDING ACTIONS ALERTS --- */}
        <div className="grid grid-cols-2 gap-6 mb-12">
            <button onClick={() => { playClick(); router.push('/admin/transactions'); }} className="bg-yellow-500/5 border border-yellow-500/10 hover:border-yellow-500/40 transition-all rounded-[2rem] p-8 text-center group">
                <p className="text-[10px] text-yellow-500 font-black uppercase mb-2 tracking-[0.2em]">Pending Deposits</p>
                <h3 className="text-5xl font-black italic tracking-tighter">{stats.pendingDeposits}</h3>
                <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-black text-white/40 uppercase group-hover:text-yellow-500">
                    Review UTRs <Eye size={12} />
                </div>
            </button>
            <button onClick={() => { playClick(); router.push('/admin/transactions'); }} className="bg-red-500/5 border border-red-500/10 hover:border-red-500/40 transition-all rounded-[2rem] p-8 text-center group">
                <p className="text-[10px] text-red-500 font-black uppercase mb-2 tracking-[0.2em]">Withdrawal Requests</p>
                <h3 className="text-5xl font-black italic text-red-500 tracking-tighter">{stats.pendingWithdrawals}</h3>
                <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-black text-white/40 uppercase group-hover:text-red-500">
                    Process Payouts <Zap size={12} />
                </div>
            </button>
        </div>

        {/* --- SYSTEM OPERATIONS --- */}
        <h2 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-8 px-4 flex items-center gap-3">
            <Settings size={14} /> Operations Control
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminAction 
            icon={<Trophy />} 
            title="Tournament Hub" 
            desc="Slots, Prizes & Rules" 
            onClick={() => { playClick(); router.push('/admin/tournaments') }} 
          />
          <AdminAction 
            icon={<Users />} 
            title="Participants" 
            desc="UIDs & Player Messages" 
            onClick={() => { playClick(); router.push('/admin/participants') }} 
          />
          <AdminAction 
            icon={<Camera />} 
            title="Branding & QR" 
            desc="Update Logo & UPI ID" 
            onClick={() => { playClick(); router.push('/admin/branding') }} 
          />
          <AdminAction 
            icon={<Lock />} 
            title="System Lock" 
            desc={sysSettings?.maintenance_mode ? "MAINTENANCE: ON" : "MAINTENANCE: OFF"} 
            onClick={handleToggleMaintenance} 
            warning={sysSettings?.maintenance_mode}
          />
        </div>
      </main>
    </div>
  )
}

function AdminAction({ icon, title, desc, onClick, warning }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-7 rounded-[2.5rem] border transition-all text-left flex flex-col gap-6 active:scale-95 group ${
        warning ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-white/5 border-white/10 hover:border-[#D4AF37]/40'
      }`}
    >
      <div className={`p-4 rounded-2xl w-fit ${warning ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all'}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-black italic text-white uppercase tracking-tight text-sm">{title}</h3>
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 group-hover:text-zinc-300 transition-colors">{desc}</p>
      </div>
    </button>
  )
  }
            
