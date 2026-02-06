'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Transaction } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { TouchButton } from '@/components/ui/TouchButton'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function AdminTransactionsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [correctedAmount, setCorrectedAmount] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    } else if (user) {
      loadTransactions()
    }
  }, [user, authLoading, router])

  const loadTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      setTransactions(data)
    }
  }

  const handleApprove = async (txn: Transaction, isDeposit: boolean) => {
    setLoading(true)
    try {
      const finalAmount = correctedAmount ? parseFloat(correctedAmount) : txn.amount

      // Update transaction status
      const { error: txnError } = await supabase
        .from('transactions')
        .update({ status: 'completed', amount: finalAmount })
        .eq('id', txn.id)

      if (txnError) throw txnError

      // Update user wallet
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', txn.user_id)
        .single()

      if (!userProfile) throw new Error('User not found')

      const newBalance = isDeposit
        ? userProfile.wallet_balance + finalAmount
        : userProfile.wallet_balance - finalAmount

      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', txn.user_id)

      if (walletError) throw walletError

      // Update admin wallet for withdrawals
      if (!isDeposit && user) {
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', user.id)
          .single()

        if (adminProfile) {
          await supabase
            .from('profiles')
            .update({ wallet_balance: adminProfile.wallet_balance - finalAmount })
            .eq('id', user.id)
        }
      }

      toast.success(`${isDeposit ? 'Deposit' : 'Withdrawal'} approved successfully!`)
      setShowApprovalModal(false)
      setSelectedTxn(null)
      setCorrectedAmount('')
      loadTransactions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (txn: Transaction) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', txn.id)

      if (error) throw error

      toast.success('Transaction rejected')
      setShowApprovalModal(false)
      setSelectedTxn(null)
      setRejectionReason('')
      loadTransactions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject transaction')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  const pendingTransactions = transactions.filter(t => t.status === 'pending')
  const completedTransactions = transactions.filter(t => t.status !== 'pending')

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Header */}
      <header className="bg-luxury-gray border-b border-luxury-lightGray sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-luxury-lightGray rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Transaction Requests</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Pending Transactions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Pending Requests ({pendingTransactions.length})
          </h2>
          {pendingTransactions.length === 0 ? (
            <Card>
              <p className="text-gray-400 text-center py-8">No pending requests</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((txn) => (
                <Card key={txn.id} className="bg-yellow-600/5 border-yellow-600/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-bold text-white capitalize">
                          {txn.type} Request
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        User: {(txn as any).profiles?.username || 'Unknown'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Amount</p>
                          <p className="text-luxury-gold font-bold text-xl">₹{txn.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Requested</p>
                          <p className="text-white">{format(new Date(txn.created_at), 'MMM dd, HH:mm')}</p>
                        </div>
                      </div>
                      {txn.utr && (
                        <div className="bg-luxury-lightGray p-3 rounded-lg mb-3">
                          <p className="text-xs text-gray-400">UTR / Transaction ID</p>
                          <p className="text-white font-mono">{txn.utr}</p>
                        </div>
                      )}
                      {txn.game_uid && (
                        <div className="bg-luxury-lightGray p-3 rounded-lg mb-3">
                          <p className="text-xs text-gray-400">Game UID</p>
                          <p className="text-white">{txn.game_uid}</p>
                        </div>
                      )}
                      {txn.admin_message && (
                        <div className="bg-luxury-lightGray p-3 rounded-lg mb-3">
                          <p className="text-xs text-gray-400">Message from User</p>
                          <p className="text-white text-sm">{txn.admin_message}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <TouchButton
                        variant="luxury"
                        onClick={() => {
                          setSelectedTxn(txn)
                          setShowApprovalModal(true)
                        }}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Review
                      </TouchButton>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Transactions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Transaction History
          </h2>
          {completedTransactions.length === 0 ? (
            <Card>
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedTransactions.map((txn) => (
                <Card key={txn.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        txn.status === 'completed' ? 'bg-green-600/20' : 'bg-red-600/20'
                      }`}>
                        {txn.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">
                          {txn.type} - {(txn as any).profiles?.username}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(txn.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        txn.status === 'completed' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ₹{txn.amount}
                      </p>
                      <p className={`text-xs ${
                        txn.status === 'completed' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {txn.status}
                      </p>
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
        </div>
      </main>

      {/* Approval Modal */}
      {selectedTxn && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedTxn(null)
            setCorrectedAmount('')
            setRejectionReason('')
          }}
          title={`Review ${selectedTxn.type} Request`}
        >
          <div className="space-y-4">
            <div className="bg-luxury-lightGray p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">User</span>
                  <span className="text-white font-bold">
                    {(selectedTxn as any).profiles?.username}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Requested Amount</span>
                  <span className="text-luxury-gold font-bold">₹{selectedTxn.amount}</span>
                </div>
                {selectedTxn.utr && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">UTR</span>
                    <span className="text-white font-mono">{selectedTxn.utr}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedTxn.type === 'deposit' && (
              <Input
                label="Corrected Amount (if different)"
                type="number"
                placeholder={`Leave empty to use ₹${selectedTxn.amount}`}
                value={correctedAmount}
                onChange={(e) => setCorrectedAmount(e.target.value)}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rejection Reason (if rejecting)
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg bg-luxury-lightGray border border-luxury-lightGray text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="Enter reason for rejection..."
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <TouchButton
                variant="danger"
                className="flex-1"
                onClick={() => handleReject(selectedTxn)}
                disabled={loading}
              >
                Reject
              </TouchButton>
              <TouchButton
                variant="luxury"
                className="flex-1"
                onClick={() => handleApprove(selectedTxn, selectedTxn.type === 'deposit')}
                disabled={loading}
              >
                Approve
              </TouchButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
        }
