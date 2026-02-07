'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useWalletStore } from '@/store/walletStore'
import { supabase } from '@/lib/supabase' // Added for Admin UPI fetch
import { ArrowLeft, Plus, Minus, Clock, Copy, Zap, ShieldCheck, Wallet } from 'lucide-react'
import { format, differenceInSeconds } from 'date-fns'
import { toast } from 'sonner'

export default function WalletPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const { balance, transactions, lastDeposit, lastWithdraw, addRequest } = useWalletStore()

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [adminUpi, setAdminUpi] = useState('loading...') // State for Admin UPI
  const [amount, setAmount] = useState('')
  const [utr, setUtr] = useState('')
  const [loading, setLoading] = useState(false)

  // Timer states
  const [depTimer, setDepTimer] = useState(0)

  // 1. Requirement 13: Correct Sound Logic
  const playClick = () => {
    const audio = new Audio('/sounds/click.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {})
  }

  // 2. Fetch Admin UPI ID from Supabase
  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('system_settings').select('upi_id').single()
      if (data?.upi_id) setAdminUpi(data.upi_id)
    }
    fetchSettings()
  }, [])

  // 3. Requirement 2.4: Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastDeposit) {
        const sec = 24 * 3600 - differenceInSeconds(new Date(), new Date(lastDeposit))
        setDepTimer(sec > 0 ? sec : 0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lastDeposit])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  const copyUpi = () => {
    playClick()
    navigator.clipboard.writeText(adminUpi)
    toast.success('Admin UPI Copied!')
  }

  const handleDeposit = async () => {
    playClick()
    if (depTimer > 0) return toast.error(`Wait ${formatTime(depTimer)} for next request`)
    if (!amount || parseFloat(amount) < 10) return toast.error('Minimum deposit ₹10')
    if (utr.length < 10) return toast.error('Enter a valid UTR number')

    setLoading(true)
    // Supabase Insert Logic for Admin Approval
    const { error } = await supabase.from('transactions').insert([{
      user_id: user?.id,
      amount: parseFloat(amount),
      utr: utr,
      type: 'deposit',
      status: 'pending'
    }])

    if (!error) {
      toast.success('Deposit request sent! Waiting for admin approval.')
      setShowDepositModal(false)
      setAmount('')
      setUtr('')
    } else {
      toast.error('Submission failed. Try again.')
    }
    setLoading(false)
  }

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div></div>

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* Header with Branding Logo */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => { playClick(); router.back(); }} className="p-2 bg-white/5 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <img src="/branding/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-sm font-black tracking-widest uppercase text-white italic">My Vault</h1>
        </div>
        <div className="bg-luxury-gold/10 px-3 py-1 rounded-full border border-luxury-gold/20">
          <span className="text-[10px] font-black text-luxury-gold uppercase">Verified</span>
        </div>
      </div>

      <main className="p-6">
        {/* Luxury Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-[#D4AF37] via-[#F2D479] to-[#AA8A2E] text-black shadow-[0_20px_60px_rgba(212,175,55,0.3)] mb-8 overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-black/10 rounded-2xl">
                <Wallet size={24} />
              </div>
              <ShieldCheck size={24} />
            </div>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60">Total Available Balance</p>
            <h2 className="text-5xl font-black tracking-tighter mt-1 italic">₹{balance.toLocaleString()}</h2>
            
            <div className="flex gap-3 mt-10">
              <button 
                onClick={() => { playClick(); setShowDepositModal(true); }}
                className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-900 transition-all active:scale-95 shadow-2xl"
              >
                Deposit
              </button>
              <button 
                className="flex-1 bg-white/20 backdrop-blur-md text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-black/10 active:scale-95"
              >
                Withdraw
              </button>
            </div>
          </div>
        </motion.div>

        {/* Transaction History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Transaction History</h3>
            <span className="text-[10px] font-bold text-luxury-gold uppercase">Real-time</span>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                <p className="text-xs text-gray-500 font-bold uppercase">No transactions found</p>
              </div>
            ) : (
              transactions.map((txn: any) => (
                <div key={txn.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${txn.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {txn.type === 'deposit' ? <Plus size={18}/> : <Minus size={18}/>}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase italic text-white">{txn.type}</p>
                      <p className="text-[9px] text-gray-500 font-bold">{format(new Date(txn.created_at || txn.date), 'dd MMM, hh:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${txn.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                      {txn.type === 'deposit' ? '+' : '-'} ₹{txn.amount}
                    </p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      txn.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      txn.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Deposit Modal with QR & Admin UPI */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDepositModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-[#0f0f0f] border-t border-white/10 rounded-t-[3rem] p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Deposit Funds</h2>
              
              <div className="space-y-6">
                {/* QR Section */}
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 text-center">
                  <p className="text-[9px] font-black uppercase text-luxury-gold tracking-[0.2em] mb-4">Step 1: Scan & Pay</p>
                  <div className="bg-white p-3 rounded-3xl inline-block shadow-2xl">
                    <img src="/branding/qr.jpg" alt="Payment QR" className="w-44 h-44 object-contain" />
                  </div>
                  
                  {/* UPI ID Copy Box */}
                  <div className="mt-6 flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="text-left">
                      <p className="text-[8px] text-gray-500 uppercase font-black">Official UPI ID</p>
                      <p className="text-xs font-black text-white">{adminUpi}</p>
                    </div>
                    <button onClick={copyUpi} className="p-3 bg-luxury-gold/10 rounded-xl text-luxury-gold active:scale-90 transition-all">
                      <Copy size={16}/>
                    </button>
                  </div>
                </div>

                {/* Form Section */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase text-luxury-gold tracking-[0.2em]">Step 2: Submit Details</p>
                  <input 
                    type="number" placeholder="Amount (₹)" 
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-luxury-gold/50 text-white font-bold"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                  />
                  <input 
                    type="text" placeholder="12-Digit UTR / Transaction ID" 
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-luxury-gold/50 text-white font-bold"
                    value={utr} onChange={(e) => setUtr(e.target.value)}
                  />
                  
                  <button 
                    disabled={loading || depTimer > 0}
                    onClick={handleDeposit}
                    className="w-full bg-gradient-to-r from-luxury-gold to-luxury-darkGold py-5 rounded-2xl text-black font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.2)] disabled:opacity-50"
                  >
                    {depTimer > 0 ? `Cooldown: ${formatTime(depTimer)}` : loading ? 'Processing...' : 'Submit Request'}
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
                    
