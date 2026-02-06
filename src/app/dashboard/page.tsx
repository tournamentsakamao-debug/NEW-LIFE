"use client";
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import TournamentCard from '@/components/tournament/TournamentCard';
import { supabase } from '../../lib/supabase';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const { balance, fetchBalance } = useWalletStore();
  
  // FIXED: Added <any[]> to stop the 'never[]' error (Image 990)
  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchBalance(user.id);
      loadTournaments();
    }
  }, [user]);

  const loadTournaments = async () => {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    // FIXED: Added fallback [] to ensure data is always an array
    if (data) setTournaments(data);
    else setTournaments([]);
  };

  return (
    <div className="pb-24">
      <div className="p-6 bg-gradient-to-b from-yellow-500/10 to-transparent">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-black">{user?.user_metadata?.username || 'Player'}</h1>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-2 px-4 rounded-xl text-right">
            <p className="text-[10px] text-gray-500 uppercase">Balance</p>
            {/* Added a safety check for balance.toFixed */}
            <p className="text-yellow-500 font-bold">₹{(balance || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="bg-yellow-500 text-black font-bold py-3 rounded-xl active:scale-95 transition-all uppercase">ADD MONEY</button>
          <button className="bg-white/10 text-white font-bold py-3 rounded-xl active:scale-95 transition-all uppercase">WITHDRAW</button>
        </div>

        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 italic uppercase">
          <span className="w-1.5 h-6 bg-yellow-500 rounded-full"></span>
          Live Tournaments
        </h2>

        <div className="space-y-4">
          {tournaments.length === 0 ? (
            <p className="text-gray-600 text-sm italic">Searching for tournaments...</p>
          ) : (
            tournaments.map((t: any) => (
              <TournamentCard key={t.id} data={t} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
