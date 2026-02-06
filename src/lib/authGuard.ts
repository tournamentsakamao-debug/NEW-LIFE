import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard'); // Non-admins redirected
    }
  }, [isAdmin, isLoading]);

  if (isLoading || !isAdmin) return <div className="h-screen bg-black flex center italic">Verifying Admin...</div>;

  return <>{children}</>;
};

