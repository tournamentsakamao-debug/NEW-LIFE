"use client";
import { supabase } from '@/lib/supabase'; // FIXED: Relative path ki jagah alias use kiya
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 1. Check User Status
export const checkUserStatus = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('id', userId)
    .single();

  if (data?.is_banned) {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/?error=banned';
    }
    return false;
  }
  return true;
};

// 2. Admin Guard
export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Email check for admin access
      if (user && user.email === 'tournamentsakamao@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push('/');
      }
    };
    checkAdmin();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-yellow-500 font-bold uppercase tracking-widest italic">
        <p>Verifying Admin Access...</p>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
};
