'use client';

import { useState } from 'react';
import { supabase, type Transaction } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useSound } from './useSound';

export function useWallet(userId: string) {
  const [loading, setLoading] = useState(false);
  const { playClick } = useSound();

  const getBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.wallet_balance || 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  };

  const getTransactions = async (): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  };

  const canAddMoney = async () => {
    try {
      const { data, error } = await supabase
        .rpc('can_user_add_money', { u_id: userId });

      if (error) throw error;
      
      const nextAllowedTime = new Date(data);
      const now = new Date();
      
      return {
        canRequest: now >= nextAllowedTime,
        nextAllowedTime: nextAllowedTime.toISOString(),
      };
    } catch (error) {
      console.error('Error checking add money eligibility:', error);
      return { canRequest: true, nextAllowedTime: new Date().toISOString() };
    }
  };

  const canWithdraw = async () => {
    try {
      const { data, error } = await supabase
        .rpc('can_user_withdraw', { u_id: userId });

      if (error) throw error;
      
      const nextAllowedTime = new Date(data);
      const now = new Date();
      
      return {
        canRequest: now >= nextAllowedTime,
        nextAllowedTime: nextAllowedTime.toISOString(),
      };
    } catch (error) {
      console.error('Error checking withdrawal eligibility:', error);
      return { canRequest: true, nextAllowedTime: new Date().toISOString() };
    }
  };

  const requestAddMoney = async (amount: number, utrNumber: string) => {
    try {
      playClick();
      setLoading(true);

      const eligibility = await canAddMoney();
      if (!eligibility.canRequest) {
        toast.error('You can request add money after 5 hours from last request');
        return false;
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'add_money',
          status: 'pending',
          utr_number: utrNumber,
          can_request_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      toast.success('Add money request submitted! Please wait for admin approval.');
      return true;
    } catch (error) {
      console.error('Error requesting add money:', error);
      toast.error('Failed to submit request');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestWithdrawal = async (amount: number, upiId: string) => {
    try {
      playClick();
      setLoading(true);

      const eligibility = await canWithdraw();
      if (!eligibility.canRequest) {
        toast.error('You can request withdrawal after 24 hours from last request');
        return false;
      }

      const balance = await getBalance();
      if (balance < amount) {
        toast.error('Insufficient balance');
        return false;
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'withdraw',
          status: 'pending',
          upi_id: upiId,
          can_request_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      toast.success('Withdrawal request submitted! Please wait for admin approval.');
      return true;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      toast.error('Failed to submit request');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getBalance,
    getTransactions,
    canAddMoney,
    canWithdraw,
    requestAddMoney,
    requestWithdrawal,
  };
          }
