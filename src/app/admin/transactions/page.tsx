"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminGuard } from '@/lib/authGuard';

export default function AdminTransactions() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(`*, profiles(username, wallet_balance)`)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setRequests(data || []);
  };

  const handleApproval = async (id: string, userId: string, amount: number, type: string, action: 'approved' | 'rejected') => {
    if (action === 'approved') {
      // 1. Update Transaction Status
      await supabase.from('transactions').update({ status: 'completed' }).eq('id', id);
      // 2. Adjust User Balance
      const math = type === 'deposit' ? 'wallet_balance + ' : 'wallet_balance - ';
      await supabase.rpc('increment_balance', { u_id: userId, amt: amount });
    } else {
      await supabase.from('transactions').update({ status: 'rejected' }).eq('id', id);
    }
    fetchRequests();
  };

  return (
    <AdminGuard>
      <div className="p-4 bg-black min-h-screen">
        <h1 className="text-2xl font-black text-yellow-500 mb-6 italic uppercase">Pending Requests</h1>
        
        {requests.map((req: any) => (
          <div key={req.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-xs uppercase tracking-widest">{req.type} Request</span>
              <span className="text-white font-bold tracking-tighter italic">₹{req.amount}</span>
            </div>
            <p className="text-sm font-medium mb-4">User: @{req.profiles.username}</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleApproval(req.id, req.user_id, req.amount, req.type, 'approved')}
                className="bg-green-600 text-[10px] font-bold py-2 rounded-lg"
              > APPROVE </button>
              <button 
                onClick={() => handleApproval(req.id, req.user_id, req.amount, req.type, 'rejected')}
                className="bg-red-600 text-[10px] font-bold py-2 rounded-lg"
              > REJECT </button>
            </div>
          </div>
        ))}
      </div>
    </AdminGuard>
  );
}

