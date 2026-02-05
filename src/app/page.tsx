"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAudio } from '@/context/AudioContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { playTap, playTouchEffect } = useAudio();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    playTap();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/dashboard');
    } else {
      // Signup Logic with Unique Username Check
      const { data: existingUser } = await supabase.from('profiles').select('username').eq('username', username).single();
      if (existingUser) {
        alert("Username already taken!");
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) alert(authError.message);
      else if (authData.user) {
        await supabase.from('profiles').insert([
          { id: authData.user.id, username, email, is_admin: email === 'tournamentsakamao@gmail.com' }
        ]);
        alert("Registration Successful! Please Login.");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-black to-secondary">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">TOURNAMENT SA KAMAO</h1>
        
        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <input
              type="text"
              placeholder="Unique Username"
              className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-primary outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-primary outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-primary outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={playTouchEffect}
            className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-yellow-500 transition-all uppercase tracking-widest"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-6 text-zinc-400">
          {isLogin ? "New player?" : "Already a member?"}
          <span 
            className="text-primary ml-2 cursor-pointer font-bold underline"
            onClick={() => { playTap(); setIsLogin(!isLogin); }}
          >
            {isLogin ? "Create Account" : "Login Now"}
          </span>
        </p>
      </motion.div>
    </div>
  );
}

