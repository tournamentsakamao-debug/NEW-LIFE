"use client";
import { motion } from 'framer-motion';

interface TournamentProps {
  data: {
    id: string;
    title: string;
    game_name: string;
    fee: number;
    prize: number;
    slots_total: number;
    slots_joined: number;
    banner_url: string;
    is_private: boolean;
    is_luxury: boolean;
  };
}

export default function TournamentCard({ data }: TournamentProps) {
  return (
    <motion.div 
      whileTap={{ scale: 0.96 }}
      className={`relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border ${data.is_luxury ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-gray-800'}`}
    >
      {/* Banner */}
      <img src={data.banner_url} alt="banner" className="h-40 w-full object-cover opacity-80" />
      
      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        {data.fee === 0 && <span className="bg-green-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">FREE</span>}
        {data.prize === 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">eSports Practice</span>}
        {data.is_private && <span className="bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">Encrypted Private</span>}
        {data.is_luxury && <span className="bg-yellow-500 text-black text-[10px] px-2 py-1 rounded-full font-black">LUXURY</span>}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black text-white uppercase italic">{data.title}</h3>
          <p className="text-yellow-500 font-bold">₹{data.prize}</p>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>{data.game_name} • Solo</span>
          <span>{data.slots_joined}/{data.slots_total} Slots</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-1.5 mt-3 rounded-full overflow-hidden">
          <div 
            className="bg-yellow-500 h-full transition-all duration-500" 
            style={{ width: `${(data.slots_joined / data.slots_total) * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

