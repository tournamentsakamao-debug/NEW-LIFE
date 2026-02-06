"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminGuard } from '../../lib/authGuard';

export default function AdminTransactions() {
  // FIXED: Added <any[]> to prevent 'never[]' error (Image 988)
  const [requests, setRequests] = useState<any[]>([]);

  // Page load hote hi data fetch karne ke liye
  useEffect(() => {
    fetchRequests();
  }, []);

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
      
      // 2. Adjust User Balance using RPC
      await supabase.rpc('increment_balance', { 
        u_id: userId, 
        amt: type === 'deposit' ? amount : -amount 
      });
    } else {
      await supabase.from('transactions').update({ status: 'rejected' }).eq('id', id);
    }
    fetchRequests();
  };

  return (
    <AdminGuard>
      <div className="p-4 bg-black min-h-screen">
        <h1 className="text-2xl font-black text-yellow-500 mb-6 italic uppercase tracking-tighter">
          Pending Requests
        </h1>
        
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No pending requests found.</p>
        ) : (
          requests.map((req: any) => (
            <div key={req.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  {req.type} Request
                </span>
                <span className="text-white font-bold tracking-tighter italic text-lg">
                  ₹{req.amount}
                </span>
              </div>
              <p className="text-sm font-medium mb-4 text-gray-300">
                User: <span className="text-yellow-500">@{req.profiles?.username || 'Unknown'}</span>
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleApproval(req.id, req.user_id, req.amount, req.type, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black py-2.5 rounded-xl transition-all"
                > APPROVE </button>
                <button 
                  onClick={() => handleApproval(req.id, req.user_id, req.amount, req.type, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black py-2.5 rounded-xl transition-all"
                > REJECT </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminGuard>
  );
}

