"use client";
import { Home, Wallet, MessageSquare, User, ShieldCheck } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useAuthStore();

  const navItems = [
    { icon: Home, path: '/dashboard', label: 'Home' },
    { icon: Wallet, path: '/dashboard/wallet', label: 'Wallet' },
    { icon: MessageSquare, path: '/dashboard/chat', label: 'Chat' },
    { icon: User, path: '/dashboard/profile', label: 'Profile' },
  ];

  if (isAdmin) {
    navItems.push({ icon: ShieldCheck, path: '/admin', label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-800 px-6 py-3 flex justify-between items-center z-50 max-w-md mx-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <button 
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-yellow-500 scale-110' : 'text-gray-500'}`}
          >
            <Icon size={20} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[10px] font-bold uppercase">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

