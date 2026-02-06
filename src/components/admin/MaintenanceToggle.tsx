"use client";
import { supabase } from '@/lib/supabase';

export default function MaintenanceToggle({ currentState }: { currentState: boolean }) {
  const toggleMode = async () => {
    const { error } = await supabase
      .from('system_settings')
      .update({ maintenance_mode: !currentState })
      .eq('id', 1);
      
    if (!error) window.location.reload();
  };

  return (
    <button 
      onClick={toggleMode}
      className={`w-full p-4 rounded-2xl font-black tracking-tighter ${currentState ? 'bg-red-600' : 'bg-gray-800 text-red-500 border border-red-500'}`}
    >
      {currentState ? "DEACTIVATE MAINTENANCE" : "ACTIVATE MAINTENANCE MODE"}
    </button>
  );
}

