'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TouchButton } from '@/components/ui/TouchButton'
import { toast } from 'sonner'
import { 
  ShieldAlert, 
  MessageSquare, 
  Ban, 
  Contact, // FIXED: IdCard ki jagah Contact use kiya
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
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        tournaments (name, entry_fee, prize_pool),
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

  const calculateProfit = (data: any[]) => {
    let revenue = 0
    data.forEach(p => {
      revenue += p.tournaments?.entry_fee || 0
    })

    setStats({
      totalRevenue: revenue,
      prizePool: 0,
      adminProfit: revenue 
    })
  }

  useEffect(() => { fetchData() }, [])

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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#D4AF37] font-black italic">LOADING ROSTER...</div>

  return (
    <div className="min-h-screen bg-[#050505] p-4 sm:p-10 text-white">
      
      {/* 1. Profit Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Users size={24} /></div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Revenue</span>
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase">Total Collected</p>
          <h2 className="text-3xl font-black italic">₹{stats.totalRevenue}</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-[2rem] bg-gradient-to-br from-[#D4AF37] to-[#AA8A2E] text-black shadow-xl shadow-[#D4AF37]/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-black/10 rounded-2xl"><TrendingUp size={24} /></div>
            <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">Admin Profit</span>
          </div>
          <p className="text-black/60 text-xs font-bold uppercase">Net Profit</p>
          <h2 className="text-3xl font-black italic">₹{stats.adminProfit}</h2>
        </motion.div>

        <div className="p-6 rounded-[2rem] bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
            <div className="text-center w-full">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Search Records</p>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="IGN or UID..." 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs outline-none focus:border-[#D4AF37] transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* 2. Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <Contact size={32} className="text-[#D4AF37]" />
          Participants
        </h1>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] mt-2">Manage Player Entries & Security</p>
      </div>

      {/* 3. Participants List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredParticipants.map((p) => (
          <motion.div 
            layout
            key={p.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-[2.2rem] border transition-all ${
              p.profiles?.status_tag === 'HACKER' ? 'bg-red-500/10 border-red-500/30' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#D4AF37] text-black rounded-2xl flex items-center justify-center font-black italic shadow-lg shadow-[#D4AF37]/20">
                    {p.slot_no}
                  </div>
                  <div>
                    <h3 className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
                        {p.game_name}
                        {p.profiles?.status_tag === 'HACKER' && <ShieldAlert size={14} className="text-red-500 animate-pulse" />}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">UID: {p.game_uid}</p>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-2xl border border-white/5 mb-4">
                    <p className="text-[8px] font-black text-[#D4AF37] uppercase mb-2 tracking-widest">Player Message (5-Line Limit)</p>
                    <p className="text-xs text-zinc-400 italic leading-relaxed line-clamp-5">
                        {p.user_message || "No message provided."}
                    </p>
                </div>
              </div>

              <div className="w-full md:w-52 flex flex-col gap-2">
                <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/10 mb-2">
                    <p className="text-[8px] font-black text-blue-400 uppercase mb-1 tracking-widest">Match Appointment</p>
                    <p className="text-[10px] text-blue-200 italic line-clamp-2">{p.admin_note || "No note set"}</p>
                </div>
                
                <TouchButton variant="luxury" fullWidth className="!py-3 !text-[10px] font-black" onClick={() => setAppointment(p.id)}>
                    <MessageSquare size={14} /> SEND NOTE
                </TouchButton>

                <TouchButton 
                    variant="danger" 
                    fullWidth 
                    className="!py-3 !text-[10px] font-black" 
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
            <p className="text-sm font-black uppercase tracking-[0.5em]">No Participants Found</p>
        </div>
      )}
    </div>
  )
}
