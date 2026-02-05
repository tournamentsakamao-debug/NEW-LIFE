"use client";
import { useAuth } from "@/context/AuthContext";
import { useAudio } from "@/context/AudioContext";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Wallet, User, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { profile } = useAuth();
  const { playTap } = useAudio();
  const router = useRouter();
  const pathname = usePathname();

  // Page 1 aur Dashboard par back button nahi dikhega
  const showBack = pathname !== "/" && pathname !== "/dashboard";

  return (
    <nav className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => { playTap(); router.back(); }} className="p-2 bg-zinc-800 rounded-full">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-lg font-bold text-primary tracking-tighter">TOURNAMENT SA KAMAO</h1>
      </div>

      <div className="flex items-center gap-4">
        {profile?.is_admin && (
          <button 
            onClick={() => { playTap(); router.push('/admin/analytics'); }}
            className="p-2 bg-red-600 text-white rounded-lg flex items-center gap-1 text-xs font-bold"
          >
            <ShieldCheck size={16} /> ADMIN
          </button>
        )}
        <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-full border border-zinc-700">
          <Wallet size={16} className="text-primary" />
          <span className="text-sm font-bold">₹{profile?.wallet_balance || 0}</span>
        </div>
        <button onClick={() => { playTap(); router.push('/settings'); }}>
          <User size={24} className="text-zinc-400" />
        </button>
      </div>
    </nav>
  );
}

