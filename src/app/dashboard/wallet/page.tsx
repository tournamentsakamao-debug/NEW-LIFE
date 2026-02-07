'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useWalletStore } from '@/store/walletStore'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Landmark, Wallet } from 'lucide-react'
import { format, differenceInSeconds } from 'date-fns'
import { toast } from 'sonner'
import { TouchButton } from '@/components/ui/TouchButton'

export default function WalletPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false) // FIX: For Prerender issue
  const { user } = useAuthStore()
  const { balance, transactions, lastDeposit, lastWithdraw } = useWalletStore()

  const [modalType, setModalType] = useState<'none' | 'deposit' | 'withdraw'>('none')
  const [adminUpi, setAdminUpi] = useState('loading...')
  const [amount, setAmount] = useState('')
  const [utr, setUtr] = useState('')
  const [userUpi, setUserUpi] = useState('') 
  const [loading, setLoading] = useState(false)

  const [depTimer, setDepTimer] = useState(0)
  const [withTimer, setWithTimer] = useState(0)

  // FIX: Build crash rokne ke liye
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('system_settings').select('upi_id').single()
      if (data?.upi_id) setAdminUpi(data.upi_id)
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      if (lastDeposit) {
        const sec = (5 * 3600) - differenceInSeconds(now, new Date(lastDeposit))
        setDepTimer(sec > 0 ? sec : 0)
      }
      if (lastWithdraw) {
        const sec = (24 * 3600) - differenceInSeconds(now, new Date(lastWithdraw))
        setWithTimer(sec > 0 ? sec : 0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lastDeposit, lastWithdraw])

  if (!mounted) return null // FIX: Build ke waqt blank render karega taaki crash na ho

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}s`
  }

  const handleDeposit = async () => {
    if (loading || depTimer > 0) return
    if (!amount || parseFloat(amount) < 10) return toast.error('Min ₹10')
    if (utr.length < 10) return toast.error('Enter valid UTR')

    setLoading(true)
    const { error } = await supabase.from('transactions').insert([{
      user_id: user?.id,
      amount: parseFloat(amount),
      utr: utr,
      type: 'deposit',
      status: 'pending'
    }])

    if (!error) {
      toast.success('Request sent!')
      setModalType('none')
      setAmount(''); setUtr('')
    }
    setLoading(false)
  }

  const handleWithdraw = async () => {
    if (loading || withTimer > 0) return
    if (!amount || parseFloat(amount) < 100) return toast.error('Min ₹100')
    if (!userUpi.includes('@')) return toast.error('Enter valid UPI ID')

    setLoading(true)
    const { error } = await supabase.from('transactions').insert([{
      user_id: user?.id,
      amount: parseFloat(amount),
      user_upi: userUpi,
      type: 'withdraw',
      status: 'pending'
    }])

    if (!error) {
      toast.success('Withdrawal request sent!')
      setModalType('none'); setAmount('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/50 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <TouchButton variant="ghost" className="!p-2" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </TouchButton>
          <img src="/branding/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-sm font-black italic tracking-widest uppercase">My Vault</h1>
        </div>
      </div>

      <main className="p-6">
        <motion.div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#D4AF37] to-[#AA8A2E] text-black shadow-2xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Balance</p>
            <h2 className="text-5xl font-black italic">₹{balance?.toLocaleString() || 0}</h2>
            <div className="flex gap-3 mt-10">
              <TouchButton variant="secondary" className="flex-1 !bg-black !text-white" onClick={() => setModalType('deposit')}>Deposit</TouchButton>
              <TouchButton variant="outline" className="flex-1 !border-black !text-black" onClick={() => setModalType('withdraw')}>Withdraw</TouchButton>
            </div>
          </div>
        </motion.div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 px-2">Transactions</h3>
        <div className="space-y-3">
          {/* SAFE CHECK: ?. aur optional render */}
          {transactions && transactions.length > 0 ? (
            transactions.map((txn: any) => (
              <div key={txn.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${txn.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {txn.type === 'deposit' ? <Plus size={18}/> : <Landmark size={18}/>}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-white italic">{txn.type}</p>
                    <p className="text-[9px] text-zinc-500 font-bold">{txn.created_at ? format(new Date(txn.created_at), 'dd MMM, p') : 'Processing'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${txn.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>₹{txn.amount}</p>
                  <span className="text-[8px] font-black uppercase opacity-60">{txn.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 opacity-20">
              <Wallet className="mx-auto mb-2" />
              <p className="text-[10px] uppercase font-black tracking-widest">No history yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Modals... (Aapka pura purana modal code yahan rahega) */}
      <AnimatePresence>
        {modalType !== 'none' && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalType('none')} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-[#0a0a0a] rounded-t-[3rem] p-8 border-t border-white/10">
               {/* Modal Content remains same as yours */}
               <h2 className="text-2xl font-black italic uppercase mb-6">{modalType} Funds</h2>
               {/* ... (rest of your inputs) */}
               {modalType === 'deposit' ? (
                 <div className="space-y-4">
                    <div className="text-center bg-white/5 p-6 rounded-3xl">
                       <img src="/branding/qr.jpg" className="w-40 h-40 mx-auto rounded-xl mb-4" alt="QR" />
                       <p className="text-[10px] font-bold text-yellow-500 uppercase">{adminUpi}</p>
                    </div>
                    <input type="number" placeholder="Amount" className="w-full bg-white/5 p-5 rounded-2xl" value={amount} onChange={(e)=>setAmount(e.target.value)} />
                    <input type="text" placeholder="UTR Number" className="w-full bg-white/5 p-5 rounded-2xl" value={utr} onChange={(e)=>setUtr(e.target.value)} />
                    <TouchButton variant="luxury" fullWidth loading={loading} disabled={depTimer > 0} onClick={handleDeposit}>
                      {depTimer > 0 ? formatTime(depTimer) : 'Submit Deposit'}
                    </TouchButton>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <input type="text" placeholder="Your UPI ID" className="w-full bg-white/5 p-5 rounded-2xl" value={userUpi} onChange={(e)=>setUserUpi(e.target.value)} />
                    <input type="number" placeholder="Amount" className="w-full bg-white/5 p-5 rounded-2xl" value={amount} onChange={(e)=>setAmount(e.target.value)} />
                    <TouchButton variant="danger" fullWidth loading={loading} disabled={withTimer > 0} onClick={handleWithdraw}>
                      {withTimer > 0 ? formatTime(withTimer) : 'Confirm Withdrawal'}
                    </TouchButton>
                 </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
                                            }
                
