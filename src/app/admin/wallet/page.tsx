'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import WalletManagement from '@/components/admin/WalletManagement';
import { supabase } from '@/lib/supabase';

export default function AdminWalletPage() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Wallet Management</h1>
        </div>

        {/* Wallet Management Component */}
        <WalletManagement />
      </div>
    </div>
  );
}
