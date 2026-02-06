"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    // User friendly username to email conversion for Supabase
    const fakeEmail = `${username.toLowerCase()}@admins-tournament.com`;

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });
      if (error) alert("Invalid Credentials!");
      else router.push('/dashboard');
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: fakeEmail,
        password: password,
        options: { data: { username: username } }
      });
      if (error) alert(error.message);
      else alert("Account Created! You can now Login.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic text-white tracking-tighter mb-2">
            ADMIN'S <span className="text-yellow-500 text-shadow-glow">TOURNAMENT</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em]">The Elite eSports Arena</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input 
              type="text" placeholder="UNIQUE USERNAME" 
              className="w-full bg-gray-900/50 border border-gray-800 p-5 rounded-2xl outline-none focus:border-yellow-500 transition-all text-white font-bold"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
            <input 
              type="password" placeholder="PASSWORD" 
              className="w-full bg-gray-900/50 border border-gray-800 p-5 rounded-2xl outline-none focus:border-yellow-500 transition-all text-white font-bold"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-yellow-500 text-black font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(234,179,8,0.3)] uppercase tracking-widest mt-4"
          >
            {loading ? "PROCESSING..." : isLogin ? "ENTER ARENA" : "JOIN ELITE"}
          </motion.button>

          <p className="text-center text-gray-500 text-xs mt-6">
            {isLogin ? "New to the arena?" : "Already a member?"} 
            <span 
              onClick={() => setIsLogin(!isLogin)}
              className="text-yellow-500 font-bold ml-2 cursor-pointer"
            >
              {isLogin ? "CREATE ACCOUNT" : "LOGIN NOW"}
            </span>
          </p>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] text-gray-700 font-medium">SECURED BY ADMIN'S TOURNAMENT V1.0</p>
      </div>
    </div>
  );
}
