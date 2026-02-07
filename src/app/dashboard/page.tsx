'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { TournamentList } from '@/components/tournament/TournamentList'
import { Wallet, MessageSquare, Trophy, LogOut, Bell, Crown, Zap } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuthStore()
  // Balance real-time store se aayega
  const balance = 500 // Temporary simulation, use useWallet logic later

  // Sound Logic (Requirement 13)
  const playClick = () => {
    const audio = document.getElementById('click-sound') as HTMLAudioElement
    if (audio) { audio.currentTime = 0; audio.play() }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24">
      {/* --- TOP APP BAR --- */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full border border-luxury-gold/50 p-1"
          >
            <img src="/branding/logo.png" className="w-full h-full object-contain" alt="Logo" />
          </motion.div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gold-gradient leading-none">ADMIN'S</h1>
            <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">Tournament</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => { playClick(); toast.info("No new notifications") }} className="relative">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
          </button>
          <button onClick={() => { playClick(); logout(); }} className="text-gray-400">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="px-5 pt-6">
        {/* --- LUXURY WALLET CARD (Requirement 1.10) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playClick(); router.push('/dashboard/wallet') }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 p-6 mb-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Crown size={80} className="text-luxury-gold" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs text-gray-400 uppercase tracking-widest">Active Balance</p>
            </div>
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-black text-white">₹{balance.toLocaleString()}</h2>
              <p className="text-luxury-gold text-sm font-bold mb-1.5">INR</p>
            </div>
            
            <div className="mt-6 flex gap-3">
              <div className="px-4 py-2 bg-luxury-gold rounded-full text-black text-xs font-bold flex items-center gap-2">
                <Zap size={14} fill="black" /> DEPOSIT
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white text-xs font-bold">
                WITHDRAW
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- TOURNAMENT SECTION (Requirement 1.3) --- */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Trophy size={18} className="text-luxury-gold" />
            Live Arenas
          </h3>
          <span className="text-xs text-luxury-gold font-medium">View All</span>
        </div>

        {/* Tournament List with Luxury Styles */}
        <div className="space-y-4">
           <TournamentList />
        </div>
      </main>

      {/* --- REAL APP BOTTOM NAVIGATION (Requirement 11) --- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-black/80 backdrop-blur-2xl border-t border-white/5">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <NavButton 
            icon={<Trophy size={24} />} 
            label="Home" 
            active 
            onClick={() => { playClick(); router.push('/dashboard') }} 
          />
          <NavButton 
            icon={<Wallet size={24} />} 
            label="Wallet" 
            onClick={() => { playClick(); router.push('/dashboard/wallet') }} 
          />
          <div className="relative -top-8">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { playClick(); router.push('/dashboard/chat') }}
              className="w-14 h-14 bg-luxury-gold rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center text-black"
            >
              <MessageSquare size={28} fill="black" />
            </motion.button>
          </div>
          <NavButton 
            icon={<Zap size={24} />} 
            label="My Games" 
            onClick={() => { playClick(); }} 
          />
          <NavButton 
            icon={<Crown size={24} />} 
            label="Profile" 
            onClick={() => { playClick(); }} 
          />
        </div>
      </nav>
    </div>
  )
}

function NavButton({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-luxury-gold' : 'text-gray-500 hover:text-white'}`}
    >
      <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-tighter">{label}</span>
    </button>
  )
          }
