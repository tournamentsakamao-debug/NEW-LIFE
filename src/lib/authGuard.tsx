import { supabase } from './supabase';
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

// 2. Admin Guard (Sahi Syntax ke saath)
export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
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
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking Admin Access...</p>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
};
