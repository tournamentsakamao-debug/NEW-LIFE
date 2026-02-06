"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function WalletPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) {
      supabase.from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setHistory(data || []));
    }
  }, [user]);

  return (
    <div className="p-6 pb-24">
      <h2 className="text-xl font-black italic mb-6 tracking-tighter uppercase">Transaction History</h2>
      <div className="space-y-3">
        {history.map((tx: any) => (
          <div key={tx.id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase text-gray-400">{tx.type}</p>
              <p className="text-[10px] text-gray-600">{new Date(tx.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className={`font-black ${tx.type === 'win' || tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.type === 'win' || tx.type === 'deposit' ? '+' : '-'} ₹{tx.amount}
              </p>
              <p className="text-[10px] uppercase text-yellow-600 font-bold">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

