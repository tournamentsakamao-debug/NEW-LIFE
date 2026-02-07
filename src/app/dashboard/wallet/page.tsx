'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ArrowDownToLine, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import WalletBalance from '@/components/wallet/WalletBalance';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import { supabase, type Profile } from '@/lib/supabase';
import { getTimeUntilNextRequest, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function WalletPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [canAddMoney, setCanAddMoney] = useState(true);
  const [canWithdraw, setCanWithdraw] = useState(true);
  const [nextAddMoneyTime, setNextAddMoneyTime] = useState('');
  const [nextWithdrawTime, setNextWithdrawTime] = useState('');
  const [adminUpiId, setAdminUpiId] = useState('');

  useEffect(() => {
    checkAuth();
    fetchAdminUpiId();
    const interval = setInterval(() => {
      if (user) {
        checkEligibility();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setUser(profile);
      checkEligibility();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    }
  };

  const fetchAdminUpiId = async () => {
    try {
      const { data } = await supabase
        .from('admin_wallet')
        .select('upi_id')
        .single();

      setAdminUpiId(data?.upi_id || 'admin@upi');
    } catch (error) {
      console.error('Error fetching admin UPI:', error);
    }
  };

  const checkEligibility = async () => {
    if (!user) return;

    try {
      // Check add money eligibility (5 hours)
      const { data: addMoneyData } = await supabase
        .rpc('can_user_add_money', { u_id: user.id });

      const addMoneyTime = new Date(addMoneyData);
      const nowAddMoney = new Date();
      setCanAddMoney(nowAddMoney >= addMoneyTime);
      setNextAddMoneyTime(addMoneyTime.toISOString());

      // Check withdrawal eligibility (24 hours)
      const { data: withdrawData } = await supabase
        .rpc('can_user_withdraw', { u_id: user.id });

      const withdrawTime = new Date(withdrawData);
      const nowWithdraw = new Date();
      setCanWithdraw(nowWithdraw >= withdrawTime);
      setNextWithdrawTime(withdrawTime.toISOString());
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || !utrNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user!.id,
          amount: amountNum,
          type: 'add_money',
          status: 'pending',
          utr_number: utrNumber,
          can_request_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      toast.success('Add money request submitted! Please wait for admin approval.');
      setShowAddMoneyModal(false);
      setAmount('');
      setUtrNumber('');
      checkEligibility();
    } catch (error: any) {
      console.error('Add money error:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !upiId) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum > user!.wallet_balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user!.id,
          amount: amountNum,
          type: 'withdraw',
          status: 'pending',
          upi_id: upiId,
          can_request_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      toast.success('Withdrawal request submitted! Please wait for admin approval.');
      setShowWithdrawModal(false);
      setAmount('');
      setUpiId('');
      checkEligibility();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Wallet</h1>
        </div>

        {/* Wallet Balance */}
        <WalletBalance userId={user.id} />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="success"
            size="lg"
            onClick={() => setShowAddMoneyModal(true)}
            disabled={!canAddMoney}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Money
            {!canAddMoney && (
              <div className="text-xs mt-1">
                {getTimeUntilNextRequest(nextAddMoneyTime, 5)}
              </div>
            )}
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowWithdrawModal(true)}
            disabled={!canWithdraw || user.wallet_balance <= 0}
          >
            <ArrowDownToLine className="w-5 h-5 mr-2" />
            Withdraw
            {!canWithdraw && (
              <div className="text-xs mt-1">
                {getTimeUntilNextRequest(nextWithdrawTime, 24)}
              </div>
            )}
          </Button>
        </div>

        {/* Timer Info */}
        <Card className="bg-blue-500/20 border border-blue-500/50">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-semibold mb-1">Transaction Limits:</p>
              <p>• Add Money: Once every 5 hours</p>
              <p>• Withdrawal: Once every 24 hours</p>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <div>
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          <TransactionHistory userId={user.id} />
        </div>

        {/* Add Money Modal */}
        <Modal
          isOpen={showAddMoneyModal}
          onClose={() => {
            setShowAddMoneyModal(false);
            setAmount('');
            setUtrNumber('');
          }}
          title="Add Money"
        >
          <div className="space-y-4">
            {/* QR Code */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Scan QR Code to Pay</p>
              <div className="relative w-48 h-48 mx-auto bg-white p-2 rounded-xl">
                <Image
                  src="/branding/qr.jpg"
                  alt="Payment QR Code"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                UPI ID: <span className="font-mono text-white">{adminUpiId}</span>
              </p>
            </div>

            <Input
              label="Amount *"
              type="number"
              placeholder="Enter amount to add"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Input
              label="UTR Number *"
              type="text"
              placeholder="Enter transaction UTR number"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
            />

            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
              <p className="text-yellow-400 text-sm">
                Please complete the payment and enter the UTR number above. Your request will be reviewed by admin.
              </p>
            </div>

            <Button
              variant="success"
              size="lg"
              className="w-full"
              onClick={handleAddMoney}
              loading={loading}
              disabled={!amount || !utrNumber}
            >
              Submit Request
            </Button>
          </div>
        </Modal>

        {/* Withdraw Modal */}
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => {
            setShowWithdrawModal(false);
            setAmount('');
            setUpiId('');
          }}
          title="Withdraw Money"
        >
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(user.wallet_balance)}
              </p>
            </div>

            <Input
              label="Amount *"
              type="number"
              placeholder="Enter amount to withdraw"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={user.wallet_balance}
            />

            <Input
              label="Your UPI ID *"
              type="text"
              placeholder="Enter your UPI ID (e.g., username@paytm)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />

            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
              <p className="text-yellow-400 text-sm">
                Withdrawal requests are processed within 24 hours. Money will be transferred to your UPI ID.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleWithdraw}
              loading={loading}
              disabled={!amount || !upiId}
            >
              Submit Withdrawal Request
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
        }
