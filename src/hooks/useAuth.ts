'use client';

import { useEffect, useState } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSound } from './useSound';

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { playClick } = useSound();

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/login');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Check if banned
      if (data.is_banned) {
        toast.error('Your account has been banned: ' + data.banned_reason);
        await signOut();
        return;
      }

      setUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      playClick();
      setLoading(true);

      // Check maintenance mode
      const { data: settings } = await supabase
        .from('system_settings')
        .select('maintenance_mode')
        .single();

      if (settings?.maintenance_mode) {
        // Only allow admin login during maintenance
        const { data: adminCheck } = await supabase
          .from('profiles')
          .select('role')
          .eq('username', username)
          .single();

        if (adminCheck?.role !== 'admin') {
          toast.error('App is under maintenance. Please try again later.');
          return false;
        }
      }

      // First, get the user's email from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, password_hash')
        .eq('username', username)
        .single();

      if (profileError || !profile?.email) {
        toast.error('Invalid username or password');
        return false;
      }

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: password,
      });

      if (error) {
        toast.error('Invalid username or password');
        return false;
      }

      await fetchUserProfile(data.user.id);
      toast.success('Logged in successfully!');
      
      // Redirect based on role
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, password: string, email: string) => {
    try {
      playClick();
      setLoading(true);

      // Check if username exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        toast.error('Username already taken');
        return false;
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (!data.user) {
        toast.error('Failed to create account');
        return false;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username,
          email: email,
          role: 'user',
          wallet_balance: 0,
        });

      if (profileError) {
        toast.error('Failed to create profile');
        return false;
      }

      toast.success('Account created! Please log in.');
      router.push('/login');
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to sign up');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      playClick();
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser: () => user && fetchUserProfile(user.id),
  };
                    }
