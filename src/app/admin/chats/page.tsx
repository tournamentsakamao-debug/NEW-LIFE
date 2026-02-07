'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Send, MessageSquare, User, CheckCheck, 
  Search, MoreVertical, ShieldCheck, Zap 
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function AdminChatsPage() {
  const router = useRouter()
  const { user: admin, loading: authLoading } = useAuthStore()
  const [userChats, setUserChats] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sound Logic
  const playPop = () => {
    const audio = document.getElementById('pop-sound') as HTMLAudioElement
    if (audio) { audio.currentTime = 0; audio.play() }
  }

  useEffect(() => {
    if (!authLoading && (!admin || !admin.isAdmin)) {
      router.push('/login')
    } else if (admin) {
      loadUserChats()
      const channel = supabase.channel('admin-chats')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, () => {
          loadUserChats()
          if (selectedUserId) loadUserMessages(selectedUserId)
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [admin, authLoading, selectedUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadUserChats = async () => {
    const { data: allChats } = await supabase
      .from('chats')
      .select('user_id, content, created_at, sender, is_read, profiles(username)')
      .order('created_at', { ascending: false })

    if (!allChats) return
    const userMap = new Map()
    allChats.forEach((chat: any) => {
      if (!userMap.has(chat.user_id)) {
        userMap.set(chat.user_id, {
          user_id: chat.user_id,
          username: chat.profiles?.username || 'Gamer',
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
    const { data } = await supabase.from('chats').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return
    setLoading(true)
    try {
      const { error } = await supabase.from('chats').insert([{
        user_id: selectedUserId,
        content: newMessage,
        sender: 'admin'
      }])
      if (error) throw error
      setNewMessage('')
      playPop()
      loadUserMessages(selectedUserId)
    } catch (err: any) {
      toast.error("Failed to send")
    } finally {
      setLoading(false)
    }
  }

  const filteredChats = userChats.filter(c => c.username.toLowerCase().includes(searchTerm.toLowerCase()))

  if (authLoading) return <div className="min-h-screen bg-black" />

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
      {/* --- MOBILE/TAB HEADER --- */}
      <header className="bg-black/60 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-lg font-black uppercase tracking-tighter text-gold-gradient leading-none">Command Center</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Support & Live Assistance</p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* --- LEFT SIDEBAR (CONVERSATIONS) --- */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                placeholder="Find a player..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-luxury-gold transition-all"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredChats.map((chat) => (
              <button
                key={chat.user_id}
                onClick={() => { setSelectedUserId(chat.user_id); playPop(); }}
                className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${selectedUserId === chat.user_id ? 'bg-luxury-gold text-black' : 'hover:bg-white/5'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedUserId === chat.user_id ? 'bg-black text-luxury-gold' : 'bg-luxury-gold/10 text-luxury-gold'}`}>
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`font-black uppercase tracking-tighter truncate ${selectedUserId === chat.user_id ? 'text-black' : 'text-white'}`}>{chat.username}</span>
                    <span className={`text-[8px] font-bold ${selectedUserId === chat.user_id ? 'text-black/60' : 'text-gray-500'}`}>{format(new Date(chat.lastMessageTime), 'HH:mm')}</span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${selectedUserId === chat.user_id ? 'text-black/80 font-medium' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && selectedUserId !== chat.user_id && (
                  <div className="w-5 h-5 bg-luxury-gold text-black text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">{chat.unreadCount}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* --- RIGHT CHAT AREA --- */}
        <div className={`flex-1 flex flex-col bg-[#080808] ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 text-gray-400"><ArrowLeft size={20}/></button>
                  <div className="w-10 h-10 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold"><User size={20}/></div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest">{userChats.find(c => c.user_id === selectedUserId)?.username}</h2>
                    <div className="flex items-center gap-1 text-[8px] text-green-500 font-bold uppercase tracking-tighter"><div className="w-1 h-1 bg-green-500 rounded-full animate-ping" /> Live Session</div>
                  </div>
                </div>
                <MoreVertical size={20} className="text-gray-600" />
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-[1.8rem] shadow-2xl ${
                      msg.sender === 'admin' 
                        ? 'bg-gradient-to-br from-luxury-gold to-luxury-darkGold text-black rounded-br-none font-medium' 
                        : 'bg-white/5 border border-white/5 text-white rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-2 text-[8px] font-black uppercase tracking-widest ${msg.sender === 'admin' ? 'text-black/50' : 'text-gray-600'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                        {msg.sender === 'admin' && <CheckCheck size={10} />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto relative flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-[2rem] py-4 px-6 text-sm outline-none focus:border-luxury-gold/50 transition-all placeholder:text-gray-600"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="w-12 h-12 bg-luxury-gold rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.2)] disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-700 mb-6 border border-white/5">
                <MessageSquare size={48} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-500">Awaiting Signal</h2>
              <p className="text-xs text-gray-600 mt-2 max-w-[200px] font-medium uppercase tracking-widest leading-loose">Select a player from the transmission list to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
        }
                                                                                                      
