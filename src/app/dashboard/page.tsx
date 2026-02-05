"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAudio } from "@/context/AudioContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { playTap, playTouchEffect } = useAudio();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase.from("games").select("*").eq("is_active", true);
      if (data) setGames(data);
      setLoading(false);
    };
    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-black pb-20">
      <Navbar />

      {/* Hero Banner Section */}
      <div className="p-4">
        <div className="w-full h-40 bg-gradient-to-r from-accent to-black rounded-2xl flex items-center justify-center border border-zinc-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
            <h2 className="text-2xl font-black italic text-white z-10">BEST TOURNAMENTS AWAIT</h2>
        </div>
      </div>

      {/* Game Selection */}
      <div className="px-4 mt-4">
        <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-4">Choose Your Battle</h3>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-zinc-900 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {games.map((game) => (
              <motion.div
                key={game.id}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={playTouchEffect}
                onClick={() => { playTap(); router.push(`/join/${game.id}`); }}
                className="relative h-56 rounded-xl overflow-hidden border border-zinc-800 group"
              >
                <img 
                  src={game.banner_url || "/assets/images/default-game.jpg"} 
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-black uppercase italic text-lg leading-tight">{game.name}</p>
                  <span className="text-[10px] bg-primary text-black px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (Create) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { playTap(); router.push('/create'); }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-[0_0_20px_rgba(255,215,0,0.5)] flex items-center justify-center text-black z-50"
      >
        <span className="text-3xl font-bold">+</span>
      </motion.button>
    </div>
  );
}
