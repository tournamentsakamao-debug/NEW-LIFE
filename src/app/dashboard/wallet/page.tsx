'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useWalletStore } from '@/store/walletStore' // Requirement 1.10: Real-time update
import { ArrowLeft, Plus, Minus, Clock, CheckCircle, XCircle, Copy, AlertTriangle, Zap, ShieldCheck } from 'lucide-react'
import { format, differenceInSeconds } from 'date-fns'
import { toast } from 'sonner'

export default function WalletPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  // Global state se balance aur transactions lenge
  const { balance, transactions, lastDeposit, lastWithdraw, addRequest } = useWalletStore()

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [utr, setUtr] = useState('')
  const [userUpi, setUserUpi] = useState('')
  const [loading, setLoading] = useState(false)

  // Requirement 2.4: Timers state
  const [depTimer, setDepTimer] = useState(0)
  const [withTimer, setWithTimer] = useState(0)

  // Sound Logic (Requirement 13)
  const playClick = () => {
    const audio = document.getElementById('click-sound') as HTMLAudioElement
    if (audio) { audio.currentTime = 0; audio.play() }
  }

  // Requirement 2.4: Live Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastDeposit) {
        const sec = 24 * 3600 - differenceInSeconds(new Date(), new Date(lastDeposit))
        setDepTimer(sec > 0 ? sec : 0)
      }
      if (lastWithdraw) {
        const sec = 5 * 3600 - differenceInSeconds(new Date(), new Date(lastWithdraw))
        setWithTimer(sec > 0 ? sec : 0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lastDeposit, lastWithdraw])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  const copyUpi = () => {
    playClick()
    navigator.clipboard.writeText("9876543210@ybl")
    toast.success('Admin UPI Copied!')
  }

  // --- ACTIONS ---
  const handleDeposit = async () => {
    playClick()
    if (depTimer > 0) return toast.error(`Wait ${formatTime(depTimer)} for next request`)
    if (!amount || parseFloat(amount) < 10) return toast.error('Minimum deposit ₹10')
    if (utr.length < 12) return toast.error('Enter valid 12-digit UTR')

    setLoading(true)
    // Supabase logic yahan aayega
    setTimeout(() => {
      addRequest({ type: 'deposit', amount: parseFloat(amount), utr, status: 'pending', date: new Date() })
      setLoading(false)
      setShowDepositModal(false)
      toast.success('Request sent to Admin!')
    }, 1500)
  }

  if (authLoading) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-10">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-30">
        <button onClick={() => { playClick(); router.back(); }} className="p-2 bg-white/5 rounded-full touch-scale">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gold-gradient uppercase">Vault & Wallet</h1>
      </div>

      <main className="p-6">
        {/* Luxury Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-[#D4AF37] to-[#8B6E12] text-black shadow-[0_20px_50px_rgba(212,175,55,0.3)] mb-8"
        >
          <div className="flex justify-between items-start mb-4">
            <ShieldCheck size={32} />
            <Zap size={24} fill="black" />
          </div>
          <p className="text-xs uppercase tracking-widest font-bold opacity-70">Total Liquid Funds</p>
          <h2 className="text-5xl font-black tracking-tighter mt-1">₹{balance.toLocaleString()}</h2>
          
          <div className="flex gap-3 mt-8">
            <button 
              onClick={() => { playClick(); setShowDepositModal(true); }}
              className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Add Money
            </button>
            <button 
              onClick={() => { playClick(); setShowWithdrawModal(true); }}
              className="flex-1 bg-white/20 backdrop-blur-md text-black py-4 rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              Withdraw
            </button>
          </div>
        </motion.div>

        {/* Requirements 2.4: Active Lock Timers */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          {depTimer > 0 && (
            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
              <Clock className="text-yellow-500 animate-pulse" size={18} />
              <div>
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest leading-none">Deposit Cooldown</p>
                <p className="text-sm font-mono text-white mt-1">{formatTime(depTimer)} remaining</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction List (Requirement 7) */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Activity Log</h3>
        </div>

        <div className="space-y-3">
          {transactions.map((txn: any) => (
            <motion.div 
              key={txn.id}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${txn.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {txn.type === 'deposit' ? <Plus size={20}/> : <Minus size={20}/>}
                </div>
                <div>
                  <p className="text-sm font-bold capitalize">{txn.type}</p>
                  <p className="text-[10px] text-gray-500">{format(new Date(txn.date), 'dd MMM, hh:mm a')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${txn.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                  {txn.type === 'deposit' ? '+' : '-'}₹{txn.amount}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    txn.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                    txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Deposit Modal (Requirement 1.11 / 2.3) */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDepositModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-[#0f0f0f] border-t border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8"
            >
              <h2 className="text-2xl font-black text-gold-gradient mb-6 uppercase tracking-tighter">Add Funds</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest">Step 1: Pay to Admin UPI</p>
                  <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-luxury-gold/20">
                    <span className="font-mono text-sm text-luxury-gold">9876543210@ybl</span>
                    <button onClick={copyUpi} className="p-2 bg-luxury-gold/10 rounded-lg text-luxury-gold"><Copy size={16}/></button>
                  </div>
                  <div className="mt-4 flex flex-col items-center">
                    <div className="p-3 bg-white rounded-2xl mb-2">
                       <img src="/branding/qr.jpg" alt="QR" className="w-32 h-32" />
                    </div>
                    <p className="text-[10px] text-gray-500">Scan QR and Pay via Any App</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input 
                    type="number" placeholder="Enter Amount" 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-luxury-gold text-white"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                  />
                  <input 
                    type="text" placeholder="12-Digit UTR Number" 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-luxury-gold text-white"
                    value={utr} onChange={(e) => setUtr(e.target.value)}
                  />
                  <button 
                    disabled={loading || depTimer > 0}
                    onClick={handleDeposit}
                    className="btn-luxury w-full py-5 rounded-2xl text-black font-black uppercase tracking-[0.2em] disabled:opacity-50"
                  >
                    {depTimer > 0 ? `Wait ${formatTime(depTimer)}` : 'Confirm Payment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
        }
