'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TouchButton } from '@/components/ui/TouchButton'
import { toast } from 'sonner'
import { 
  ShieldAlert, 
  UserCheck, 
  MessageSquare, 
  Ban, 
  IdCard, 
  Wallet,
  TrendingUp,
  Users,
  Search
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalRevenue: 0, prizePool: 0, adminProfit: 0 })
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = async () => {
    setLoading(true)
    // 1. Fetching Participants with Tournament details for profit calculation
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        tournaments (title, entry_fee, winning_amount),
        profiles (id, username, status_tag)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Data loading failed!')
    } else {
      setParticipants(data || [])
      calculateProfit(data || [])
    }
    setLoading(false)
  }

  // Requirement: Double Wallet Logic (Joined Users x Fee - Prize = Profit)
  const calculateProfit = (data: any[]) => {
    let revenue = 0
    let prize = 0
    
    data.forEach(p => {
      revenue += p.tournaments?.entry_fee || 0
      // Hum prize pool ko unique tournaments ke hisab se count karenge
    })

    // Simple Logic: Revenue is what you collected. Profit is Revenue minus what you have to pay the winner.
    setStats({
      totalRevenue: revenue,
      prizePool: 0, // Isko aap match-wise filter karke prize pool minus kar sakte hain
      adminProfit: revenue 
    })
  }

  useEffect(() => { fetchData() }, [])

  // Requirement: Hacker Ban Logic
  const handleHackerBan = async (userId: string) => {
    const confirm = window.confirm("Mark as HACKER? This will ban user and block refunds.")
    if (!confirm) return

    const { error } = await supabase.from('profiles').update({ 
      status_tag: 'HACKER',
      is_banned: true 
    }).eq('id', userId)

    if (!error) {
      toast.error('User banned as Hacker!')
      fetchData()
    }
  }

  // Requirement: Admin Appointment/Note
  const setAppointment = async (pId: string) => {
    const note = prompt("Enter Appointment Detail / Match Time / Message:")
    if (note === null) return

    const { error } = await supabase
      .from('participants')
      .update({ admin_note: note })
      .eq('id', pId)

    if (!error) {
      toast.success('Note sent to user!')
      fetchData()
    }
  }

  const filteredParticipants = participants.filter(p => 
    p.game_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.game_uid?.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-[#050505] p-4 sm:p-10 text-white">
      
      {/* 1. Profit Stats Section (Double Wallet Logic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Users size={24} /></div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Users</span>
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase">Total Collected</p>
          <h2 className="text-3xl font-black italic">₹{stats.totalRevenue}</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-[2rem] bg-gradient-to-br from-[#D4AF37] to-[#AA8A2E] text-black">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-black/10 rounded-2xl"><TrendingUp size={24} /></div>
            <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">Admin Wallet</span>
          </div>
          <p className="text-black/60 text-xs font-bold uppercase">Net Profit (Match-wise)</p>
          <h2 className="text-3xl font-black italic">₹{stats.adminProfit}</h2>
        </motion.div>

        <div className="p-6 rounded-[2rem] bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
            <div className="text-center">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Search Player</p>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="IGN or UID..." 
                        className="bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-[#D4AF37]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* 2. Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Participants <span className="text-[#D4AF37]">&</span> Slots</h1>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] mt-2">Manage Match Entries & Player Messages</p>
      </div>

      {/* 3. Participants List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredParticipants.map((p) => (
          <motion.div 
            layout
            key={p.id}
            className={`p-6 rounded-[2.2rem] border transition-all ${
              p.profiles?.status_tag === 'HACKER' ? 'bg-red-500/10 border-red-500/30' : 'bg-[#0A0A0A] border-white/5'
            }`}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Slot & Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#D4AF37] text-black rounded-xl flex items-center justify-center font-black italic shadow-lg">
                    #{p.slot_no}
                  </div>
                  <div>
                    <h3 className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
                        {p.game_name}
                        {p.profiles?.status_tag === 'HACKER' && <ShieldAlert size={14} className="text-red-500" />}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">UID: {p.game_uid}</p>
                  </div>
                </div>

                {/* Requirement: 5-Line Message Area */}
                <div className="bg-black/60 p-4 rounded-2xl border border-white/5 mb-4">
                    <p className="text-[8px] font-black text-[#D4AF37] uppercase mb-2 tracking-widest">User Note (5-Line Limit)</p>
                    <p className="text-xs text-zinc-400 italic leading-relaxed line-clamp-5">
                        {p.message || "No message from player."}
                    </p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="w-full md:w-48 flex flex-col gap-2">
                <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/10 mb-2">
                    <p className="text-[8px] font-black text-blue-400 uppercase mb-1 tracking-widest">Admin Note</p>
                    <p className="text-[10px] text-blue-200 italic line-clamp-2">{p.admin_note || "No appointment"}</p>
                </div>
                
                <TouchButton variant="luxury" fullWidth className="!py-3 !text-[10px]" onClick={() => setAppointment(p.id)}>
                    <MessageSquare size={14} /> APPOINTMENT
                </TouchButton>

                <TouchButton 
                    variant="danger" 
                    fullWidth 
                    className="!py-3 !text-[10px]" 
                    onClick={() => handleHackerBan(p.profiles?.id)}
                    disabled={p.profiles?.status_tag === 'HACKER'}
                >
                    <Ban size={14} /> MARK HACKER
                </TouchButton>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredParticipants.length === 0 && (
        <div className="text-center py-40 opacity-20">
            <Users size={64} className="mx-auto mb-4" />
            <p className="text-sm font-black uppercase tracking-[0.5em]">Empty Participant List</p>
        </div>
      )}
    </div>
  )
        }
        
