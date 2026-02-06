import { supabase } from '../../lib/supabase';

export const useTournament = () => {
  const joinTournament = async (t_id: string, u_id: string, fee: number, g_uid: string, msg: string) => {
    const { data, error } = await supabase.rpc('join_tournament_final', {
      t_id,
      u_id,
      fee,
      g_uid,
      admin_msg: msg
    });

    if (error) {
      console.error("Join Error:", error.message);
      throw error;
    }
    return data;
  };

  return { joinTournament };
};

