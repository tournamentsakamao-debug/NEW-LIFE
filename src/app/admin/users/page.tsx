'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Ban, CheckCircle, User, ShieldAlert, 
  Search, Filter, Wallet, MoreVertical, Trash2 
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user: admin, loading: authLoading } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // Sound Logic (Requirement 13)
  const playClick = () => {
    const audio = document.getElementById('click-sound') as HTMLAudioElement
    if (audio) { audio.currentTime = 0; audio.play() }
  }

  useEffect(() => {
    if (!authLoading && (!admin || !admin.isAdmin)) {
      router.push('/login')
    } else if (admin) {
      loadUsers()
    }
  }, [admin, authLoading, router])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setUsers(data)
  }

  // Requirement 6: Secure Ban Logic
  const handleBanUser = async (userId: string, isBanned: boolean) => {
    playClick()
    const action = isBanned ? 'UNBAN' : 'BAN'
    
    // Custom Luxury Alert instead of window.confirm
    if (!window.confirm(`SECURITY ALERT: Confirm ${action} for this user?`)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: !isBanned,
          banned_at: !isBanned ? new Date().toISOString() : null
        })
        .eq('id', userId)

      if (error) throw error

      toast.success(`User ${action} successful.`, {
        description: !isBanned ? "User will be kicked out on next sync." : "Access restored."
      })
      loadUsers()
    } catch (error: any) {
      toast.error("Operation Failed")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { playClick(); router.back(); }} className="p-2 bg-white/5 rounded-full touch-scale">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-gold-gradient uppercase tracking-tighter">User Database</h1>
          </div>
          <div className="px-3 py-1 bg-luxury-gold/10 border border-luxury-gold/20 rounded-full">
            <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest">{users.length} Total</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* --- SEARCH BAR --- */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by username..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-luxury-gold/50 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- USERS LIST --- */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredUsers.map((u) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={u.id}
                className={`p-5 rounded-[2rem] border transition-all ${
                  u.is_banned ? 'bg-red-500/5 border-red-500/20' : 'bg-[#111] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${u.is_banned ? 'bg-red-500/20 text-red-500' : 'bg-luxury-gold/10 text-luxury-gold'}`}>
                      <User size={24} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{u.username}</h3>
                        {u.role === 'admin' && <ShieldAlert size={14} className="text-luxury-gold" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          <Wallet size={10} className="text-luxury-gold" /> ₹{u.wallet_balance.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-600 font-medium">
                          Joined {format(new Date(u.created_at), 'MMM yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {u.role !== 'admin' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleBanUser(u.id, u.is_banned)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          u.is_banned 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20 active:scale-90'
                        }`}
                      >
                        {u.is_banned ? 'Restore' : 'Ban User'}
                      </button>
                    </div>
                  )}
                </div>

                {u.is_banned && (
                  <div className="mt-4 pt-4 border-t border-red-500/10 flex items-center gap-2 text-red-400">
                    <ShieldAlert size={12} />
                    <p className="text-[10px] font-bold uppercase tracking-tighter">
                      Permanently Restricted since {format(new Date(u.banned_at), 'dd MMM HH:mm')}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
            }
