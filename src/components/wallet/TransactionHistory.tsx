'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp, TrendingDown, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { supabase, type Transaction } from '@/lib/supabase';

interface TransactionHistoryProps {
  userId: string;
}

export default function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();

    // Subscribe to new transactions
    const subscription = supabase
      .channel('transactions_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setTransactions((prev) => [payload.new as Transaction, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setTransactions((prev) =>
            prev.map((t) => (t.id === payload.new.id ? (payload.new as Transaction) : t))
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'add_money':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'withdraw':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'join':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'win':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-purple-400" />;
      case 'penalty':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      completed: 'bg-blue-500/20 text-blue-400',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-16 bg-white/5 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-400">No transactions yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="hover:bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                {getIcon(transaction.type)}
              </div>
              <div>
                <p className="font-semibold text-white capitalize">
                  {transaction.type.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-400">
                  {formatDate(transaction.created_at)}
                </p>
                {transaction.rejection_reason && (
                  <p className="text-xs text-red-400 mt-1">
                    {transaction.rejection_reason}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${
                ['add_money', 'win', 'refund'].includes(transaction.type)
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {['add_money', 'win', 'refund'].includes(transaction.type) ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              {getStatusBadge(transaction.status)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
                                                         }
