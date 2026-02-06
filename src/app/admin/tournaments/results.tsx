"use client";
import { supabase } from '@/lib/supabase';

export default function PayoutManager({ tournamentId, prizeMoney }: any) {
  const distributePrize = async (winnerUserId: string) => {
    const confirmWin = confirm(`Confirm Payout of ₹${prizeMoney} to this user?`);
    if (!confirmWin) return;

    // Call the SQL function we created in Step 1
    const { error } = await supabase.rpc('distribute_tournament_prize', {
      t_id: tournamentId,
      winner_u_id: winnerUserId,
      prize_amt: prizeMoney
    });

    if (error) alert("Payout Failed: " + error.message);
    else alert("Winner Paid & Tournament Finished!");
  };

  return (
    <div className="p-4 bg-gray-900 rounded-2xl border border-yellow-500/30">
      <h4 className="text-sm font-bold text-yellow-500 mb-3">SELECT WINNER & PAYOUT</h4>
      {/* List of joined players would be mapped here */}
      <div className="flex justify-between items-center p-3 bg-black rounded-xl">
        <span className="text-sm">Player_01 (UID: 827361)</span>
        <button 
          onClick={() => distributePrize('user-uuid-here')}
          className="bg-yellow-500 text-black px-4 py-1 rounded-lg font-black text-[10px]"
        > PAY NOW </button>
      </div>
    </div>
  );
}

