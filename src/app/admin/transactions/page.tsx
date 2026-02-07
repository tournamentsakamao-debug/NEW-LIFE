'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, Copy, 
  ExternalLink, Filter, Search, AlertCircle, TrendingUp 
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function AdminTransactionsPage() {
  const router = useRouter()
  const { user: admin, loading: authLoading } = useAuthStore()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending')
  
  // Modal states
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null)
  const [correctedAmount, setCorrectedAmount] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!authLoading && (!admin || !admin.isAdmin)) {
      router.push('/login')
    } else if (admin) {
      loadTransactions()
    }
  }, [admin, authLoading, router])

  const loadTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(username, wallet_balance)')
      .order('created_at', { ascending: false })
    if (data) setTransactions(data)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const processTransaction = async (status: 'completed' | 'rejected') => {
    if (!selectedTxn) return
    if (status === 'rejected' && !rejectionReason.trim()) {
      return toast.error("Please provide a rejection reason")
    }

    setLoading(true)
    const finalAmount = correctedAmount ? parseFloat(correctedAmount) : selectedTxn.amount
    const isDeposit = selectedTxn.type === 'deposit'

    try {
      // 1. Update Transaction
      const { error: txnError } = await supabase
        .from('transactions')
        .update({ 
          status, 
          amount: finalAmount,
          rejection_reason: status === 'rejected' ? rejectionReason : null,
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedTxn.id)

      if (txnError) throw txnError

      // 2. Update User Balance (Only if approved)
      if (status === 'completed') {
        const balanceChange = isDeposit ? finalAmount : -finalAmount
        const { error: balanceError } = await supabase.rpc('increment_wallet', {
          row_id: selectedTxn.user_id,
          amount: balanceChange
        })
        if (balanceError) throw balanceError
      }

      toast.success(`Transaction ${status.toUpperCase()}`)
      setSelectedTxn(null)
      loadTransactions()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={20}/></button>
            <h1 className="text-xl font-black text-gold-gradient uppercase tracking-tighter">Financial Requests</h1>
          </div>
          <div className="flex gap-2">
            {['pending', 'all'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-luxury-gold text-black' : 'bg-white/5 text-gray-500'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4 max-w-5xl mx-auto">
        <div className="space-y-4">
          {transactions.filter(t => filter === 'all' ? true : t.status === 'pending').map((txn) => (
            <motion.div 
              layout
              key={txn.id}
              className={`p-5 rounded-[2rem] border transition-all ${txn.status === 'pending' ? 'bg-[#111] border-luxury-gold/20 shadow-[0_10px_30px_rgba(212,175,55,0.05)]' : 'bg-white/5 border-white/5 opacity-70'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${txn.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    <TrendingUp size={24} className={txn.type === 'withdraw' ? 'rotate-180' : ''} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">₹{txn.amount}</h3>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${txn.type === 'deposit' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                        {txn.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">By: <span className="text-white">@{txn.profiles?.username}</span> • {format(new Date(txn.created_at), 'dd MMM, HH:mm')}</p>
                  </div>
                </div>

                {txn.utr && (
                  <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-gray-400">UTR: {txn.utr}</span>
                    <button onClick={() => copyToClipboard(txn.utr)} className="text-luxury-gold hover:text-white"><Copy size={14}/></button>
                  </div>
                )}

                {txn.status === 'pending' ? (
                  <button 
                    onClick={() => setSelectedTxn(txn)}
                    className="bg-luxury-gold text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    Action
                  </button>
                ) : (
                  <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${txn.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                    {txn.status === 'completed' ? <CheckCircle size={14}/> : <XCircle size={14}/>} {txn.status}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* --- ACTION MODAL --- */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedTxn(null)} />
            <motion.div 
              initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}}
              className="relative w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold" />
              <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Review Transaction</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">User Balance</p>
                    <p className="text-lg font-bold">₹{selectedTxn.profiles?.wallet_balance}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Requested</p>
                    <p className="text-lg font-bold text-luxury-gold">₹{selectedTxn.amount}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Correct Amount (Optional)</label>
                    <input 
                      type="number" placeholder="Enter different amount if needed"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl mt-1 outline-none focus:border-luxury-gold"
                      value={correctedAmount} onChange={e => setCorrectedAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Rejection Reason (Only if rejecting)</label>
                    <textarea 
                      placeholder="Why is this being rejected?"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl mt-1 outline-none focus:border-red-500 min-h-[100px]"
                      value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => processTransaction('rejected')}
                    className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => processTransaction('completed')}
                    className="flex-1 py-4 bg-luxury-gold text-black rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
                  >
                    Approve Payment
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
                    
