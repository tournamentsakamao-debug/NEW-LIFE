'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useWallet } from '@/hooks/useWallet'
import { TouchButton } from '@/components/ui/TouchButton'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ArrowLeft, Plus, Minus, Clock, CheckCircle, XCircle, Copy } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase' // Make sure this import exists

export default function WalletPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { balance, transactions, requestDeposit, requestWithdrawal, loading } = useWallet()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [utr, setUtr] = useState('')
  const [userUpi, setUserUpi] = useState('') // User's UPI for withdrawal
  const [adminSettings, setAdminSettings] = useState({ upi: '', qr: '' }) // Admin settings

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    fetchAdminSettings()
  }, [user, authLoading, router])

  // Admin ki UPI ID fetch karne ke liye
  const fetchAdminSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('admin_upi_id, admin_qr_url')
      .single()
    if (data) {
      setAdminSettings({ upi: data.admin_upi_id, qr: data.admin_qr_url })
    }
  }

  const copyUpi = () => {
    navigator.clipboard.writeText(adminSettings.upi)
    toast.success('UPI ID Copied!')
  }

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!utr.trim()) {
      toast.error('Please enter UTR number')
      return
    }

    const result = await requestDeposit(parseFloat(amount), utr)
    if (result.success) {
      toast.success('Deposit request submitted!')
      setShowDepositModal(false)
      setAmount('')
      setUtr('')
    } else {
      toast.error(result.error || 'Failed to submit deposit request')
    }
  }

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!userUpi.trim()) {
      toast.error('Please enter your UPI ID for withdrawal')
      return
    }

    // Pass userUpi to the hook function
    const result = await requestWithdrawal(parseFloat(amount), userUpi)
    if (result.success) {
      toast.success('Withdrawal request submitted!')
      setShowWithdrawModal(false)
      setAmount('')
      setUserUpi('')
    } else {
      toast.error(result.error || 'Failed to submit withdrawal request')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      {/* Header */}
      <header className="bg-luxury-gray border-b border-luxury-lightGray sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-luxury-lightGray rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Wallet</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-luxury-gold/10 to-luxury-darkGold/10 border-luxury-gold/30">
          <div className="text-center">
            <p className="text-gray-400 mb-2">Available Balance</p>
            <h2 className="text-5xl font-bold text-luxury-gold mb-6">₹{balance}</h2>
            <div className="grid grid-cols-2 gap-4">
              <TouchButton variant="luxury" onClick={() => setShowDepositModal(true)}>
                <Plus className="w-5 h-5 mr-2" /> Add Money
              </TouchButton>
              <TouchButton
                variant="secondary"
                onClick={() => setShowWithdrawModal(true)}
                disabled={balance <= 0}
              >
                <Minus className="w-5 h-5 mr-2" /> Withdraw
              </TouchButton>
            </div>
          </div>
        </Card>

        {/* Transaction History Section (Keeping your original logic) */}
        <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <Card><p className="text-gray-400 text-center py-8">No transactions yet</p></Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <Card key={txn.id} className="hover:border-luxury-gold/50">
                {/* Transaction details... (keeping same as your code) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      txn.type === 'deposit' ? 'bg-green-600/20' :
                      txn.type === 'withdraw' ? 'bg-red-600/20' :
                      txn.type === 'win' ? 'bg-luxury-gold/20' : 'bg-blue-600/20'
                    }`}>
                      {txn.type === 'deposit' && <Plus className="w-5 h-5 text-green-400" />}
                      {txn.type === 'withdraw' && <Minus className="w-5 h-5 text-red-400" />}
                      {txn.type === 'win' && <CheckCircle className="w-5 h-5 text-luxury-gold" />}
                      {txn.type === 'join' && <Clock className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-white font-medium capitalize">{txn.type}</p>
                      <p className="text-xs text-gray-400">{format(new Date(txn.created_at), 'MMM dd, HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${txn.type === 'deposit' || txn.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                      {txn.type === 'deposit' || txn.type === 'win' ? '+' : '-'}₹{txn.amount}
                    </p>
                    <span className="text-xs text-yellow-400">{txn.status}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Deposit Modal (With Admin UPI Display) */}
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Add Money">
        <div className="space-y-4">
          <div className="bg-luxury-lightGray p-4 rounded-lg border border-luxury-gold/20">
            <p className="text-luxury-gold font-bold mb-2">Admin UPI Details:</p>
            <div className="flex items-center justify-between bg-black/40 p-3 rounded border border-white/10 mb-3">
              <span className="text-white font-mono text-sm">{adminSettings.upi || 'Loading...'}</span>
              <button onClick={copyUpi} className="text-luxury-gold hover:text-white"><Copy className="w-4 h-4"/></button>
            </div>
            {adminSettings.qr && (
              <div className="flex justify-center mb-2">
                <img src={adminSettings.qr} alt="QR Code" className="w-32 h-32 rounded-lg border-2 border-white" />
              </div>
            )}
            <p className="text-[10px] text-gray-500 text-center uppercase">Scan QR or Copy UPI to Pay</p>
          </div>

          <Input type="number" label="Amount (₹)" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="UTR / Transaction ID" placeholder="Enter 12 digit UTR" value={utr} onChange={(e) => setUtr(e.target.value)} />

          <TouchButton variant="luxury" className="w-full" onClick={handleDeposit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </TouchButton>
        </div>
      </Modal>

      {/* Withdraw Modal (With User UPI Input) */}
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="Withdraw Money">
        <div className="space-y-4">
          <div className="bg-luxury-lightGray p-4 rounded-lg flex justify-between">
            <span className="text-gray-400">Balance</span>
            <span className="text-white font-bold">₹{balance}</span>
          </div>

          <Input type="number" label="Withdrawal Amount (₹)" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          
          <Input label="Your UPI ID" placeholder="username@bank" value={userUpi} onChange={(e) => setUserUpi(e.target.value)} />

          <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
            <p className="text-[11px] text-red-400">⚠️ Ensure UPI ID is correct. Admin is not responsible for wrong transfers.</p>
          </div>

          <TouchButton variant="luxury" className="w-full" onClick={handleWithdraw} disabled={loading}>
            {loading ? 'Submitting...' : 'Confirm Withdrawal'}
          </TouchButton>
        </div>
      </Modal>
    </div>
  )
}
  
