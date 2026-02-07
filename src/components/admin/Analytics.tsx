'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, DollarSign, TrendingUp, Trophy, Activity } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeTournaments: 0,
    completedTournaments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total Users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      // Active Tournaments
      const { count: activeTournaments } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['upcoming', 'live']);

      // Completed Tournaments
      const { count: completedTournaments } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finished');

      // Total Transactions
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Total Revenue (from admin wallet)
      const { data: wallet } = await supabase
        .from('admin_wallet')
        .select('personal_balance')
        .single();

      setStats({
        totalUsers: totalUsers || 0,
        onlineUsers: 0, // Will implement with presence
        totalTransactions: totalTransactions || 0,
        totalRevenue: wallet?.personal_balance || 0,
        activeTournaments: activeTournaments || 0,
        completedTournaments: completedTournaments || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className={`bg-gradient-to-br ${color}`}>
      <div className="flex items-center gap-4">
        <div className="p-4 bg-white/20 rounded-2xl">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-sm text-white/80">{label}</p>
          {loading ? (
            <div className="h-8 w-24 bg-white/20 animate-pulse rounded mt-1" />
          ) : (
            <h3 className="text-3xl font-bold text-white">{value}</h3>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        icon={Users}
        label="Total Users"
        value={stats.totalUsers}
        color="from-blue-500/20 to-blue-600/20"
      />
      <StatCard
        icon={UserCheck}
        label="Online Users"
        value={stats.onlineUsers}
        color="from-green-500/20 to-green-600/20"
      />
      <StatCard
        icon={Trophy}
        label="Active Tournaments"
        value={stats.activeTournaments}
        color="from-purple-500/20 to-purple-600/20"
      />
      <StatCard
        icon={Activity}
        label="Completed Tournaments"
        value={stats.completedTournaments}
        color="from-yellow-500/20 to-yellow-600/20"
      />
      <StatCard
        icon={DollarSign}
        label="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        color="from-red-500/20 to-red-600/20"
      />
      <StatCard
        icon={TrendingUp}
        label="Total Transactions"
        value={stats.totalTransactions}
        color="from-pink-500/20 to-pink-600/20"
      />
    </div>
  );
        }
