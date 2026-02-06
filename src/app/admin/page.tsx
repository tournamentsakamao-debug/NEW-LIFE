"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminGuard } from '../../lib/authGuard';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, balance: 0, pendingWithdraw: 0, totalJoinFee: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { data: trans } = await supabase.from('transactions').select('amount, type, status');
      
      const pendingW = trans?.filter(t => t.type === 'withdraw' && t.status === 'pending').reduce((a, b) => a + b.amount, 0);
      const profit = trans?.filter(t => t.type === 'join' && t.status === 'completed').reduce((a, b) => a + b.amount, 0);

      setStats({ 
        users: userCount || 0, 
        balance: 0, // System balance logic
        pendingWithdraw: pendingW || 0,
        totalJoinFee: profit || 0 
      });
    };
    fetchStats();
  }, []);

  return (
    <AdminGuard>
      <div className="p-6 bg-black min-h-screen text-white pb-24">
        <h1 className="text-3xl font-black italic text-yellow-500 mb-8 tracking-tighter uppercase">Command Center</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard label="Total Players" value={stats.users} color="border-blue-500" />
          <StatCard label="Total Revenue" value={`₹${stats.totalJoinFee}`} color="border-green-500" />
          <StatCard label="Pending Payouts" value={`₹${stats.pendingWithdraw}`} color="border-red-500" />
          <StatCard label="Active Events" value="12" color="border-yellow-500" />
        </div>

        {/* Profit Analysis Chart Placeholder */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Profit Analysis</h3>
          <div className="h-32 w-full bg-gradient-to-t from-yellow-500/20 to-transparent rounded-xl border-b border-yellow-500/50 flex items-end p-2 justify-between">
            {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} className="w-4 bg-yellow-500 rounded-t-sm" />
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className={`bg-gray-900 border-l-4 ${color} p-4 rounded-xl`}>
      <p className="text-[10px] text-gray-500 uppercase font-bold">{label}</p>
      <p className="text-xl font-black mt-1">{value}</p>
    </div>
  );
}

