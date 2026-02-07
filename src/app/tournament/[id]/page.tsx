'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import TournamentDetail from '@/components/tournament/TournamentDetail';
import { supabase, type Tournament, type Profile } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function TournamentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<Profile | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    if (params.id) {
      fetchTournament(params.id as string);
    }
  }, [params.id]);

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
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    }
  };

  const fetchTournament = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error('Failed to load tournament');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || !tournament) {
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
          <h1 className="text-2xl font-bold">Tournament Details</h1>
        </div>

        {/* Tournament Detail */}
        <TournamentDetail tournament={tournament} userId={user.id} />
      </div>
    </div>
  );
}
