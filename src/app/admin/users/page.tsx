"use client";
import { supabase } from '@/lib/supabase';

export default function UserManagement() {
  const banUser = async (userId: string) => {
    const confirmBan = confirm("Permanent Ban this user? Wallet balance won't be refunded.");
    if (confirmBan) {
      await supabase.from('profiles').update({ 
        is_banned: true, 
        banned_at: new Date().toISOString() 
      }).eq('id', userId);
      alert("User Banned Permanently!");
    }
  };

  const toggleSystemChat = async (status: boolean) => {
    await supabase.from('system_settings').update({ chat_enabled: status }).eq('id', 1); // Assuming ID 1
    alert(`Chat is now ${status ? 'Enabled' : 'Disabled'}`);
  };

  return (
    <div className="p-6 bg-black text-white">
      <h1 className="text-2xl font-black italic mb-8 uppercase text-yellow-500 tracking-tighter">System Controls</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-10">
        <button onClick={() => toggleSystemChat(true)} className="bg-green-600/20 text-green-500 border border-green-600 font-bold py-3 rounded-xl">ENABLE CHAT</button>
        <button onClick={() => toggleSystemChat(false)} className="bg-red-600/20 text-red-500 border border-red-600 font-bold py-3 rounded-xl">DISABLE CHAT</button>
      </div>

      <h2 className="font-bold mb-4 uppercase text-xs text-gray-500 tracking-widest">User Directory</h2>
      {/* Map through users from profiles table */}
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex justify-between items-center">
        <span>Gamer_99</span>
        <button onClick={() => banUser('some-id')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs">PERMANENT BAN</button>
      </div>
    </div>
  );
}

