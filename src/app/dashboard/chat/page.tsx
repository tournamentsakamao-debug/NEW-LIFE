'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Send, ShieldCheck, Lock, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function ChatPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  
  // Simulation states (Inhe useChat hook se connect karein)
  const [messages, setMessages] = useState<any[]>([])
  const [chatEnabled, setChatEnabled] = useState(false) // Requirement 3.3: Admin toggle
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sound Logic (Requirement 13)
  const playClick = () => {
    const audio = document.getElementById('click-sound') as HTMLAudioElement
    if (audio) { audio.currentTime = 0; audio.play() }
  }

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || !chatEnabled) return
    playClick()
    
    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      created_at: new Date().toISOString()
    }

    setMessages([...messages, newMessage])
    setMessage('')
    // Real Supabase sendMessage logic here
  }

  if (authLoading) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col max-w-2xl mx-auto border-x border-white/5">
      {/* --- LUXURY HEADER --- */}
      <header className="p-4 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { playClick(); router.back(); }} 
            className="p-2 bg-white/5 rounded-full touch-scale"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-luxury-gold to-yellow-600 p-[1px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img src="/branding/logo.png" className="w-6 h-6 object-contain" alt="Admin" />
                </div>
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${chatEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">Support Admin</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                {chatEnabled ? 'Online' : 'Currently Busy'}
              </p>
            </div>
          </div>
        </div>
        <button className="text-gray-500 p-2"><MoreVertical size={20} /></button>
      </header>

      {/* --- CHAT AREA --- */}
      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Encryption Note (Requirement 3.2) */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
            <Lock size={10} className="text-luxury-gold" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">End-to-end encrypted</span>
          </div>
        </div>

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] relative ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-[20px] text-sm shadow-xl ${
                    msg.sender === 'user'
                      ? 'bg-luxury-gold text-black rounded-tr-none font-medium'
                      : 'bg-[#1a1a1a] text-white rounded-tl-none border border-white/5'
                  }`}
                >
                  {msg.content}
                </div>
                <p className="text-[9px] text-gray-600 mt-1.5 px-1 uppercase font-bold tracking-tighter">
                  {format(new Date(msg.created_at), 'hh:mm a')}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      {/* --- DISABLED STATE OVERLAY (Requirement 3.4) --- */}
      <AnimatePresence>
        {!chatEnabled && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-3"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="text-red-500 shrink-0" size={20} />
              <p className="text-xs text-red-400 font-medium leading-relaxed">
                Admin is busy, you are not able to chat now.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-black border-t border-white/5 pb-8">
        <div className={`flex items-center gap-3 bg-[#111] border p-1.5 rounded-[24px] transition-all ${chatEnabled ? 'border-white/10 focus-within:border-luxury-gold/50' : 'border-white/5 opacity-50'}`}>
          <input
            type="text"
            placeholder={chatEnabled ? "Message admin..." : "Chat is disabled"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={!chatEnabled || loading}
            className="flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-gray-600"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!chatEnabled || !message.trim()}
            className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center text-black disabled:grayscale"
          >
            <Send size={18} fill="black" />
          </motion.button>
        </div>
      </div>
    </div>
  )
                        }

