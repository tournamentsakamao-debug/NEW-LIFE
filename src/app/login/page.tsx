'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    checkMaintenanceMode();
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('maintenance_mode')
        .single();

      setMaintenanceMode(data?.maintenance_mode || false);
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      // Get user profile to check role and get email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, email, role, is_banned, banned_reason')
        .eq('username', username)
        .single();

      if (profileError || !profile) {
        toast.error('Invalid username or password');
        return;
      }

      // Check if banned
      if (profile.is_banned) {
        toast.error(`Account banned: ${profile.banned_reason}`);
        return;
      }

      // Check maintenance mode (only admin can login)
      if (maintenanceMode && profile.role !== 'admin') {
        toast.error('App is under maintenance. Please try again later.');
        return;
      }

      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email!,
        password: password,
      });

      if (authError) {
        toast.error('Invalid username or password');
        return;
      }

      toast.success('Login successful!');

      // Redirect based on role
      if (profile.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image
              src="/branding/logo.png"
              alt="Admin's Tournament"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin's Tournament</h1>
          <p className="text-gray-400">Professional eSports Platform</p>
        </div>

        {/* Maintenance Alert */}
        {maintenanceMode && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold">Maintenance Mode</p>
              <p className="text-sm text-yellow-400/80">Only admins can login during maintenance</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Login to continue</p>
            </div>

            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              <User className="w-5 h-5 mr-2" />
              Login
            </Button>

            <div className="text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-red-400 hover:text-red-300 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
            }
