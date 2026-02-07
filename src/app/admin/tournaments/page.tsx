'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Plus, Edit, Trash2, Crown, Calendar, 
  Users, Trophy, Map as MapIcon, ShieldCheck, Zap, X
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminTournamentsPage() {
  const router = useRouter()
  const { user: admin, loading: authLoading } = useAuthStore()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Requirement 1.3: Expanded Form Data
  const [formData, setFormData] = useState({
    name: '',
    game_name: 'BGMI',
    game_mode: 'solo',
    map_name: 'Erangel', // Added
    version: '3.1',     // Added
    slots_total: 100,
    join_fee: 0,
    prize_money: 0,
    tournament_date: '',
    tournament_time: '',
    rules: '',
    is_luxury: false,
    banner_url: ''
  })

  useEffect(() => {
    if (!authLoading && (!admin || !admin.isAdmin)) {
      router.push('/login')
    } else {
      loadTournaments()
    }
  }, [admin, authLoading])

  const loadTournaments = async () => {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTournaments(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        slots_total: Number(formData.slots_total),
        join_fee: Number(formData.join_fee),
        prize_money: Number(formData.prize_money),
        status: 'upcoming'
      }

      const { error } = editingId 
        ? await supabase.from('tournaments').update(payload).eq('id', editingId)
        : await supabase.from('tournaments').insert([payload])

      if (error) throw error
      
      toast.success(editingId ? 'Updated!' : 'Created!')
      setShowCreateModal(false)
      setEditingId(null)
      loadTournaments()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tournament? All joins will be lost.')) return
    const { error } = await supabase.from('tournaments').delete().eq('id', id)
    if (!error) {
      toast.success('Deleted')
      loadTournaments()
    }
  }

  if (authLoading) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* --- LUXURY HEADER --- */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={20}/></button>
            <h1 className="text-xl font-black text-gold-gradient uppercase tracking-tighter">Event Manager</h1>
          </div>
          <button 
            onClick={() => { setEditingId(null); setShowCreateModal(true); }}
            className="flex items-center gap-2 bg-luxury-gold text-black px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(212,175,55,0.2)] active:scale-95 transition-all"
          >
            <Plus size={16} /> New Match
          </button>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {tournaments.map((t) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={t.id}
                className={`group relative overflow-hidden rounded-[2.5rem] border p-6 transition-all ${t.is_luxury ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-luxury-gold/30' : 'bg-[#111] border-white/5 hover:border-white/10'}`}
              >
                {t.is_luxury && <div className="absolute top-0 right-0 p-4"><Crown className="text-luxury-gold" size={20} /></div>}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold bg-luxury-gold/10 px-2 py-0.5 rounded-md">{t.game_name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.map_name} • {t.game_mode}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <Stat label="Prize" value={`₹${t.prize_money}`} color="text-green-500" />
                  <Stat label="Entry" value={`₹${t.join_fee}`} color="text-luxury-gold" />
                  <Stat label="Slots" value={`${t.slots_joined}/${t.slots_total}`} color="text-white" />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-2">
                    <Calendar size={12} /> {format(new Date(t.tournament_date), 'dd MMM')} @ {t.tournament_time}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(t.id); setFormData(t); setShowCreateModal(true); }} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- CREATE/EDIT DRAWER --- */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="relative w-full max-w-xl h-full bg-[#0f0f0f] border-l border-white/10 p-8 overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Match' : 'New Match'}</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <AdminInput label="Match Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Pro Scrims Vol.1" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Game" value={formData.game_name} onChange={v => setFormData({...formData, game_name: v})} />
                    <AdminInput label="Map" value={formData.map_name} onChange={v => setFormData({...formData, map_name: v})} placeholder="Erangel" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <AdminSelect label="Mode" value={formData.game_mode} options={['solo', 'duo', 'squad']} onChange={v => setFormData({...formData, game_mode: v})} />
                    <AdminInput label="Game Version" value={formData.version} onChange={v => setFormData({...formData, version: v})} placeholder="3.1" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <AdminInput label="Slots" type="number" value={formData.slots_total} onChange={v => setFormData({...formData, slots_total: v})} />
                    <AdminInput label="Entry (₹)" type="number" value={formData.join_fee} onChange={v => setFormData({...formData, join_fee: v})} />
                    <AdminInput label="Prize (₹)" type="number" value={formData.prize_money} onChange={v => setFormData({...formData, prize_money: v})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput label="Date" type="date" value={formData.tournament_date} onChange={v => setFormData({...formData, tournament_date: v})} />
                    <AdminInput label="Time" type="time" value={formData.tournament_time} onChange={v => setFormData({...formData, tournament_time: v})} />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Rules & Info</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-2 outline-none focus:border-luxury-gold h-32 text-sm"
                      value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})}
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, is_luxury: !formData.is_luxury})}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all ${formData.is_luxury ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold' : 'bg-white/5 border-white/10 text-gray-500'}`}
                  >
                    <Crown size={18} /> <span className="text-xs font-black uppercase tracking-widest">Luxury Match</span>
                  </button>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full py-5 bg-luxury-gold text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-gold-500/20 active:scale-95 transition-all"
                >
                  {loading ? 'Processing...' : (editingId ? 'Update Tournament' : 'Publish Tournament')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Custom Sub-components for Admin UI
function Stat({ label, value, color }: any) {
  return (
    <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
      <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}

function AdminInput({ label, value, onChange, type = 'text', placeholder }: any) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} placeholder={placeholder} value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 mt-1 outline-none focus:border-luxury-gold text-sm transition-all"
      />
    </div>
  )
}

function AdminSelect({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      <select 
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 mt-1 outline-none focus:border-luxury-gold text-sm appearance-none"
      >
        {options.map((o: any) => <option key={o} value={o} className="bg-black">{o.toUpperCase()}</option>)}
      </select>
    </div>
  )
}

