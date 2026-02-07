'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Wallet, MessageCircle, LogOut, Bell, Settings } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TournamentCard from '@/components/tournament/TournamentCard';
import WalletBalance from '@/components/wallet/WalletBalance';
import { supabase, type Tournament, type Profile } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchTournaments();
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

      // Check if banned
      if (profile.is_banned) {
        toast.error(`Account banned: ${profile.banned_reason}`);
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setUser(profile);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'live'])
        .order('tournament_date', { ascending: true })
        .order('tournament_time', { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
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
    <div className="min-h-screen p-4 pb-24">
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
              <h1 className="text-2xl font-bold text-white">Welcome, {user?.username}!</h1>
              <p className="text-sm text-gray-400">Ready to compete?</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Wallet Balance */}
        {user && <WalletBalance userId={user.id} />}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card clickable onClick={() => router.push('/dashboard/wallet')}>
            <div className="text-center">
              <Wallet className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Wallet</p>
            </div>
          </Card>

          <Card clickable onClick={() => router.push('/dashboard/chat')}>
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Chat</p>
            </div>
          </Card>

          <Card clickable onClick={() => router.push('/dashboard/notifications')}>
            <div className="text-center">
              <Bell className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Notifications</p>
            </div>
          </Card>

          <Card clickable onClick={() => router.push('/dashboard/settings')}>
            <div className="text-center">
              <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Settings</p>
            </div>
          </Card>
        </div>

        {/* Tournaments */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Available Tournaments
          </h2>

          {tournaments.length === 0 ? (
            <Card className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No tournaments available at the moment</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
              }
