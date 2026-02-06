"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CreateTournament() {
  const [formData, setFormData] = useState({
    title: '',
    fee: 0,
    prize: 0,
    is_luxury: false,
    password: '',
  });

  const handleSubmit = async () => {
    const { error } = await supabase.from('tournaments').insert([{
      ...formData,
      status: 'open',
      slots_joined: 0
    }]);
    if (!error) alert("Tournament Live!");
  };

  return (
    <div className="p-6 bg-black text-white">
      <h2 className="text-xl font-black italic mb-6">CREATE NEW EVENT</h2>
      <input 
        placeholder="Tournament Title" 
        className="w-full bg-gray-900 p-4 rounded-xl mb-4 border border-gray-800 focus:border-yellow-500 outline-none"
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input type="number" placeholder="Join Fee" className="bg-gray-900 p-4 rounded-xl border border-gray-800"
          onChange={(e) => setFormData({...formData, fee: Number(e.target.value)})} />
        <input type="number" placeholder="Prize Pool" className="bg-gray-900 p-4 rounded-xl border border-gray-800"
          onChange={(e) => setFormData({...formData, prize: Number(e.target.value)})} />
      </div>

      <label className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800 cursor-pointer mb-6">
        <input type="checkbox" className="accent-yellow-500 w-5 h-5" 
          onChange={(e) => setFormData({...formData, is_luxury: e.target.checked})} />
        <span className="font-bold text-sm uppercase">Luxury Tournament (Badge)</span>
      </label>

      <button onClick={handleSubmit} className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-[0_5px_15px_rgba(234,179,8,0.4)]">
        LAUNCH TOURNAMENT
      </button>
    </div>
  );
}

