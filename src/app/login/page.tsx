'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore' // Persistence ke liye
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Lock, User, Music, Volume2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  // Note: Yahan hum direct logic likhenge ya aapke useAuth hook ko call karenge
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  // Sound Play Function (Requirement 13)
  const playClick = () => {
    const audio = document.getElementById('click-sound') as HTMLAudioElement
    if (audio) { audio.currentTime = 0; audio.play() }
  }

  const toggleMusic = () => {
    const bgMusic = document.getElementById('bg-music') as HTMLAudioElement
    if (bgMusic) {
      if (isMuted) {
        bgMusic.play().catch(() => toast.error("Interaction needed for music"));
        setIsMuted(false);
      } else {
        bgMusic.pause();
        setIsMuted(true);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()

    if (isSignup && password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    
    // Yahan aapka login/signup logic aayega
    // result = await authAction(username, password)

    // Simulation for UI feel:
    setTimeout(() => {
      setLoading(false)
      // Requirement 7: Admin Check
      if (username === 'tournamentsakamao@gmail.com') {
         toast.success("Welcome Admin");
         router.push('/admin');
      } else {
         toast.success("Logged in successfully");
         router.push('/dashboard');
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
      
      {/* Background Luxury Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-luxury-gold opacity-5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-luxury-gold opacity-5 blur-[120px] rounded-full" />

      {/* Music Toggle (Requirement 14) */}
      <button 
        onClick={toggleMusic}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 text-luxury-gold active:scale-90 transition-all"
      >
        {isMuted ? <Music size={20} /> : <Volume2 size={20} className="animate-pulse" />}
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Requirement 15: Logo */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-block relative p-1 rounded-3xl bg-gradient-to-b from-luxury-gold to-transparent"
          >
            <div className="bg-[#0a0a0a] rounded-[22px] p-4">
              <img src="/branding/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mt-4 tracking-tighter text-gold-gradient">
            ADMIN'S TOURNAMENT
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-[0.3em]">Elite eSports</p>
        </div>

        {/* Login Card */}
        <div className="card-luxury relative overflow-hidden border-t-luxury-gold/30 border-t-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignup ? 'signup' : 'login'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-white mb-6">
                {isSignup ? 'Join the Elite' : 'Welcome Back'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold" size={18} />
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-luxury-gold outline-none transition-all text-white"
                      placeholder="Your unique username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold" size={18} />
                    <input
                      type="password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-luxury-gold outline-none transition-all text-white"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {isSignup && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 focus:border-luxury-gold outline-none transition-all text-white"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-luxury w-full py-4 rounded-xl text-black font-bold uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    isSignup ? 'Create Account' : 'Enter Arena'
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 text-center">
            <button
              onClick={() => { playClick(); setIsSignup(!isSignup); }}
              className="text-gray-400 text-sm hover:text-luxury-gold transition-colors"
            >
              {isSignup ? 'Already a member? Login' : "New player? Create an account"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
                    }
