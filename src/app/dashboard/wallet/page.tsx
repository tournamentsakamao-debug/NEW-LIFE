'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useWallet } from '@/hooks/useWallet'
import { TouchButton } from '@/components/ui/TouchButton'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ArrowLeft, Plus, Minus, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function WalletPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { balance, transactions, requestDeposit, requestWithdrawal, loading } = useWallet()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [utr, setUtr] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

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
      toast.success('Deposit request submitted! Waiting for admin approval.')
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

    const result = await requestWithdrawal(parseFloat(amount))
    if (result.success) {
      toast.success('Withdrawal request submitted! Waiting for admin approval.')
      setShowWithdrawModal(false)
      setAmount('')
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
              <TouchButton
                variant="luxury"
                onClick={() => setShowDepositModal(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Money
              </TouchButton>
              <TouchButton
                variant="secondary"
                onClick={() => setShowWithdrawModal(true)}
                disabled={balance <= 0}
              >
                <Minus className="w-5 h-5 mr-2" />
                Withdraw
              </TouchButton>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <Card>
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <Card key={txn.id} className="hover:border-luxury-gold/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      txn.type === 'deposit' ? 'bg-green-600/20' :
                      txn.type === 'withdraw' ? 'bg-red-600/20' :
                      txn.type === 'win' ? 'bg-luxury-gold/20' :
                      'bg-blue-600/20'
                    }`}>
                      {txn.type === 'deposit' && <Plus className="w-5 h-5 text-green-400" />}
                      {txn.type === 'withdraw' && <Minus className="w-5 h-5 text-red-400" />}
                      {txn.type === 'win' && <CheckCircle className="w-5 h-5 text-luxury-gold" />}
                      {txn.type === 'join' && <Clock className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-white font-medium capitalize">{txn.type}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(txn.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      txn.type === 'deposit' || txn.type === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {txn.type === 'deposit' || txn.type === 'win' ? '+' : '-'}₹{txn.amount}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {txn.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {txn.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                      {txn.status === 'rejected' && <XCircle className="w-4 h-4 text-red-400" />}
                      <span className={`text-xs ${
                        txn.status === 'completed' ? 'text-green-400' :
                        txn.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </div>
                {txn.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-600/10 rounded-lg border border-red-600/20">
                    <p className="text-xs text-red-400">Reason: {txn.rejection_reason}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Add Money"
      >
        <div className="space-y-4">
          <div className="bg-luxury-lightGray p-4 rounded-lg">
            <p className="text-white font-bold mb-2">Payment Instructions:</p>
            <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
              <li>Pay via UPI to admin's account</li>
              <li>Copy the UTR/Transaction ID</li>
              <li>Enter amount and UTR below</li>
              <li>Wait for admin approval (usually within 1 hour)</li>
            </ol>
          </div>

          <Input
            type="number"
            label="Amount (₹)"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="UTR / Transaction ID"
            placeholder="Enter UTR number"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
          />

          <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
            <p className="text-xs text-yellow-400">
              ⚠️ You can request deposit only once every 24 hours
            </p>
          </div>

          <TouchButton
            variant="luxury"
            className="w-full"
            onClick={handleDeposit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </TouchButton>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Money"
      >
        <div className="space-y-4">
          <div className="bg-luxury-lightGray p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Available Balance</span>
              <span className="text-white font-bold">₹{balance}</span>
            </div>
          </div>

          <Input
            type="number"
            label="Withdrawal Amount (₹)"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={balance}
          />

          <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
            <p className="text-xs text-yellow-400">
              ⚠️ You can request withdrawal only once every 5 hours
            </p>
          </div>

          <TouchButton
            variant="luxury"
            className="w-full"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
          </TouchButton>
        </div>
      </Modal>
    </div>
  )
          }
