import { supabase } from './supabase';

// 1. Existing function for banning check
export const checkUserStatus = async (userId: string) => {
  const { data, error } = await supabase
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

// 2. Missing AdminGuard component (Jo error aa raha tha)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Yahan apna Admin Email daal do
      if (user && user.email === 'tournamentsakamao@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push('/'); // Agar admin nahi hai toh home pe bhej do
      }
    };
    checkAdmin();
  }, [router]);

  if (isAdmin === null) return <div>Loading Admin Panel...</div>;
  return isAdmin ? <>{children}</> : null;
};
