"use client";
import './globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '../../lib/supabase';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);

  // Click Sound Logic
  const playClick = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {}); // Browser policy handle
  };

  useEffect(() => {
    // Auth Session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Global Click Listener for App feel
    window.addEventListener('click', playClick);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('click', playClick);
    };
  }, []);

  return (
    <html lang="en">
      <body className="bg-black text-white selection:bg-gold-500">
        <main className="min-h-screen max-w-md mx-auto border-x border-gray-800 shadow-2xl relative overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
