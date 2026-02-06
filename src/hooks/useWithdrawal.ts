import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const useWithdrawal = (userId: string) => {
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const checkStatus = async () => {
    const { data } = await supabase.rpc('can_user_withdraw', { u_id: userId });
    setCanWithdraw(data);
    
    // Timer logic would go here to calculate hours/mins left
  };

  useEffect(() => { if (userId) checkStatus(); }, [userId]);

  return { canWithdraw, timeLeft };
};

