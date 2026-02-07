'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Check, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { supabase, type Transaction, type AdminWallet } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WalletManagement() {
  const [adminWallet, setAdminWallet] = useState<AdminWallet | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [correctedAmount, setCorrectedAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch admin wallet
      const { data: wallet, error: walletError } = await supabase
        .from('admin_wallet')
        .select('*')
        .single();

      if (walletError) throw walletError;
      setAdminWallet(wallet);

      // Fetch pending transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*, profiles(username)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (transError) throw transError;
      setPendingTransactions(transactions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTransaction) return;

    try {
      const amount = correctedAmount 
        ? parseFloat(correctedAmount) 
        : selectedTransaction.amount;

      if (selectedTransaction.type === 'add_money') {
        // Approve add money
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            wallet_balance: supabase.raw(`wallet_balance + ${amount}`) 
          })
          .eq('id', selectedTransaction.user_id);

        if (updateError) throw updateError;

        // Update global wallet
        const { error: walletError } = await supabase
          .from('admin_wallet')
          .update({ 
            global_balance: supabase.raw(`global_balance + ${amount}`) 
          })
          .eq('id', adminWallet?.id);

        if (walletError) throw walletError;
      } else if (selectedTransaction.type === 'withdraw') {
        // Approve withdrawal
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            wallet_balance: supabase.raw(`wallet_balance - ${amount}`) 
          })
          .eq('id', selectedTransaction.user_id);

        if (updateError) throw updateError;

        // Update global wallet
        const { error: walletError } = await supabase
          .from('admin_wallet')
          .update({ 
            global_balance: supabase.raw(`global_balance - ${amount}`) 
          })
          .eq('id', adminWallet?.id);

        if (walletError) throw walletError;
      }

      // Update transaction status
      const { error: transError } = await supabase
        .from('transactions')
        .update({ 
          status: 'approved',
          amount: amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTransaction.id);

      if (transError) throw transError;

      // Send notification
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedTransaction.user_id,
          title: 'Transaction Approved',
          message: `Your ${selectedTransaction.type.replace('_', ' ')} request of ${formatCurrency(amount)} has been approved.`,
          type: 'success',
        });

      toast.success('Transaction approved successfully');
      setShowApproveModal(false);
      setSelectedTransaction(null);
      setCorrectedAmount('');
      fetchData();
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      // Update transaction status
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTransaction.id);

      if (error) throw error;

      // Send notification
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedTransaction.user_id,
          title: 'Transaction Rejected',
          message: `Your ${selectedTransaction.type.replace('_', ' ')} request has been rejected. Reason: ${rejectionReason}`,
          type: 'error',
        });

      toast.success('Transaction rejected');
      setShowRejectModal(false);
      setSelectedTransaction(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/80">Global Wallet</p>
              <h3 className="text-3xl font-bold text-white">
                {formatCurrency(adminWallet?.global_balance || 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/80">Personal Wallet</p>
              <h3 className="text-3xl font-bold text-white">
                {formatCurrency(adminWallet?.personal_balance || 0)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Transactions */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
        {pendingTransactions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {pendingTransactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white">{transaction.profiles.username}</h3>
                    <p className="text-sm text-gray-400">
                      {transaction.type === 'add_money' ? 'Add Money Request' : 'Withdrawal Request'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>

                {transaction.utr_number && (
                  <p className="text-sm text-gray-400 mb-2">
                    UTR: <span className="font-mono text-white">{transaction.utr_number}</span>
                  </p>
                )}

                {transaction.upi_id && (
                  <p className="text-sm text-gray-400 mb-2">
                    UPI ID: <span className="font-mono text-white">{transaction.upi_id}</span>
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowApproveModal(true);
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowRejectModal(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedTransaction(null);
          setCorrectedAmount('');
        }}
        title="Approve Request"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Original Amount: <strong>{formatCurrency(selectedTransaction?.amount || 0)}</strong>
          </p>

          <Input
            label="Corrected Amount (Optional)"
            type="number"
            placeholder="Enter corrected amount if different"
            value={correctedAmount}
            onChange={(e) => setCorrectedAmount(e.target.value)}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedTransaction(null);
                setCorrectedAmount('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onClick={handleApprove}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedTransaction(null);
          setRejectionReason('');
        }}
        title="Reject Request"
      >
        <div className="space-y-4">
          <Input
            label="Rejection Reason *"
            placeholder="Enter reason for rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedTransaction(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleReject}
              disabled={!rejectionReason}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
            }
