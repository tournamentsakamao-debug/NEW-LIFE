'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, Users, Wallet, MessageCircle, Settings as SettingsIcon, 
  LogOut, BarChart3, Plus 
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Analytics from '@/components/admin/Analytics';
import { supabase, type Profile } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Profile | null>(null);
  const [globalBalance, setGlobalBalance] = useState(0);
  const [personalBalance, setPersonalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchWalletBalances();
  }, []);

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

      if (profile.role !== 'admin') {
        toast.error('Access denied. Admins only.');
        router.push('/dashboard');
        return;
      }

      setAdmin(profile);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_wallet')
        .select('global_balance, personal_balance')
        .single();

      if (error) throw error;
      setGlobalBalance(data?.global_balance || 0);
      setPersonalBalance(data?.personal_balance || 0);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src="/branding/logo.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, {admin?.username}!</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Wallet Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl">
                <Wallet className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/80">Global Wallet</p>
                <h3 className="text-3xl font-bold text-white">
                  {formatCurrency(globalBalance)}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl">
                <Wallet className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/80">Personal Wallet (Profit)</p>
                <h3 className="text-3xl font-bold text-white">
                  {formatCurrency(personalBalance)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card clickable onClick={() => router.push('/admin/tournaments')}>
            <div className="text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Tournaments</p>
            </div>
          </Card>

          <Card clickable onClick={() => router.push('/admin/users')}>
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Users</p>
            </div>
          </Card>

          <Card clickable onClick={() => router.push('/admin/wallet')}>
            <div className="text-center">
              <Wallet className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Wallet</p>
            </div>
          </Card>

          <Card clickable onClick={() => router.push('/admin/chat')}>
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Chats</p>
            </div>
          </Card>
        </div>

        {/* Analytics */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-400" />
            Analytics
          </h2>
          <Analytics />
        </div>

        {/* System Settings Quick Link */}
        <Card clickable onClick={() => router.push('/admin/settings')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-semibold text-white">System Settings</p>
                <p className="text-sm text-gray-400">Maintenance mode, chat, sounds, etc.</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Manage
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
                }
