          'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth' // Updated Hook use karein
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Send, MessageSquare, User, CheckCheck, 
  Search, MoreVertical
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function AdminChatsPage() {
  const router = useRouter()
  const { user: admin, loading: authLoading, isAdmin } = useAuth() // Use destructuring properly
  const [userChats, setUserChats] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sound Logic
  const playPop = () => {
    const audio = new Audio('/sounds/pop.mp3') // Direct audio object is better for reliability
    audio.play().catch(() => {}) // Catch browser auto-play block
  }

  // Security & Realtime
  useEffect(() => {
    if (!authLoading) {
      if (!admin || !isAdmin) {
        router.push('/login')
        return
      }
      
      loadUserChats()

      const channel = supabase.channel('admin-global-chats')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chats' 
        }, (payload) => {
          loadUserChats()
          // Agar wahi user chat kar raha hai jo selected hai
          if (selectedUserId && payload.new.user_id === selectedUserId) {
            loadUserMessages(selectedUserId)
            if (payload.new.sender === 'user') playPop()
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [admin, authLoading, isAdmin, selectedUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadUserChats = async () => {
    // Optimized: Latest message per user (PostgreSQL trick)
    const { data: allChats, error } = await supabase
      .from('chats')
      .select('user_id, content, created_at, sender, is_read, profiles(username)')
      .order('created_at', { ascending: false })

    if (error || !allChats) return

    const userMap = new Map()
    allChats.forEach((chat: any) => {
      if (!userMap.has(chat.user_id)) {
        userMap.set(chat.user_id, {
          user_id: chat.user_id,
          username: chat.profiles?.username || 'Unknown Gamer',
          lastMessage: chat.content,
          lastMessageTime: chat.created_at,
          unreadCount: 0
        })
      }
      if (chat.sender === 'user' && !chat.is_read) {
        userMap.get(chat.user_id).unreadCount++
      }
    })
    setUserChats(Array.from(userMap.values()))
  }

  const loadUserMessages = async (userId: string) => {
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    if (data) {
      setMessages(data)
      // Mark as read when admin opens the chat
      await supabase.from('chats').update({ is_read: true }).eq('user_id', userId).eq('sender', 'user')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return
    setLoading(true)
    try {
      const { error } = await supabase.from('chats').insert([{
        user_id: selectedUserId,
        content: newMessage,
        sender: 'admin',
        is_read: false
      }])
      if (error) throw error
      setNewMessage('')
      // Local UI update for instant feel
      loadUserMessages(selectedUserId) 
    } catch (err: any) {
      toast.error("Transmission Failed")
    } finally {
      setLoading(false)
    }
  }

  const filteredChats = userChats.filter(c => c.username.toLowerCase().includes(searchTerm.toLowerCase()))

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-luxury-gold animate-pulse font-black">SECURE ACCESS...</div>

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
      {/* --- HEADER --- */}
      <header className="bg-black/60 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-lg font-black uppercase tracking-tighter bg-gradient-to-b from-[#F3CF7A] via-[#D4AF37] to-[#B8960E] bg-clip-text text-transparent leading-none">Command Center</h1>
          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Live Encrypted Support</p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* --- SIDEBAR --- */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4AF37]" size={16} />
              <input 
                placeholder="Search Player..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs outline-none focus:border-[#D4AF37]/50 transition-all"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.user_id}
                onClick={() => { setSelectedUserId(chat.user_id); loadUserMessages(chat.user_id); }}
                className={`w-full p-4 rounded-3xl text-left transition-all flex items-center gap-4 border ${selectedUserId === chat.user_id ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-white/[0.02] border-transparent hover:border-white/10'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedUserId === chat.user_id ? 'bg-black text-[#D4AF37]' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`font-black uppercase tracking-tighter truncate ${selectedUserId === chat.user_id ? 'text-black' : 'text-zinc-200'}`}>{chat.username}</span>
                    <span className={`text-[8px] font-black ${selectedUserId === chat.user_id ? 'text-black/60' : 'text-zinc-500'}`}>{format(new Date(chat.lastMessageTime), 'HH:mm')}</span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 font-medium ${selectedUserId === chat.user_id ? 'text-black/80' : 'text-zinc-500'}`}>{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && selectedUserId !== chat.user_id && (
                  <div className="w-5 h-5 bg-[#D4AF37] text-black text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-black">{chat.unreadCount}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* --- CHAT AREA --- */}
        <div className={`flex-1 flex flex-col bg-[#080808] ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 text-zinc-400"><ArrowLeft size={20}/></button>
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]"><User size={20}/></div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest">{userChats.find(c => c.user_id === selectedUserId)?.username}</h2>
                    <div className="flex items-center gap-1.5 text-[8px] text-green-500 font-black uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" /> Online Support
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-[2rem] shadow-2xl ${
                      msg.sender === 'admin' 
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8960E] text-black rounded-br-none shadow-[#D4AF37]/10' 
                        : 'bg-zinc-900/50 border border-white/5 text-zinc-100 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-2 text-[8px] font-black uppercase ${msg.sender === 'admin' ? 'text-black/50' : 'text-zinc-500'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                        {msg.sender === 'admin' && <CheckCheck size={10} />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-black/80 backdrop-blur-xl border-t border-white/5">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type encrypted message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-full py-4 px-6 text-sm outline-none focus:border-[#D4AF37]/50 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center text-black shadow-lg shadow-[#D4AF37]/20 active:scale-90 transition-all disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
              <MessageSquare size={80} className="text-zinc-500 mb-4" />
              <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting Transmission</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
                     }
            
