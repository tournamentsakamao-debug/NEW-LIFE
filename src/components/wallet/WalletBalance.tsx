'use client';

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

interface WalletBalanceProps {
  userId: string;
}

export default function WalletBalance({ userId }: WalletBalanceProps) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();

    // Subscribe to balance changes
    const subscription = supabase
      .channel('wallet_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload: any) => {
          setBalance(payload.new.wallet_balance);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setBalance(data?.wallet_balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-red-500/20 to-purple-600/20">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-white/10 rounded-2xl">
          <Wallet className="w-8 h-8 text-yellow-400" />
        </div>
        <div>
          <p className="text-sm text-gray-300">Wallet Balance</p>
          {loading ? (
            <div className="h-8 w-32 bg-white/10 animate-pulse rounded mt-1" />
          ) : (
            <h2 className="text-3xl font-bold gradient-text">
              {formatCurrency(balance)}
            </h2>
          )}
        </div>
      </div>
    </Card>
  );
}
