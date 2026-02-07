'use client';

import { useState, useEffect } from 'react';
import { supabase, type Chat } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useSound } from './useSound';

export function useChat(userId: string) {
  const [messages, setMessages] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const { playClick } = useSound();

  useEffect(() => {
    fetchMessages();
    checkChatEnabled();

    // Subscribe to new messages
    const subscription = supabase
      .channel('chat_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Chat]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkChatEnabled = async () => {
    try {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('chat_enabled')
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('chat_enabled, has_chat_appointment')
        .eq('id', userId)
        .single();

      const isEnabled = 
        settings?.chat_enabled && 
        profile?.chat_enabled &&
        (settings?.chat_enabled || profile?.has_chat_appointment);

      setChatEnabled(isEnabled);
    } catch (error) {
      console.error('Error checking chat status:', error);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      playClick();
      
      if (!chatEnabled) {
        toast.error('Admin is busy, you are not able to chat now');
        return false;
      }

      const { error } = await supabase
        .from('chats')
        .insert({
          user_id: userId,
          sender: 'user',
          content: content,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return {
    messages,
    loading,
    chatEnabled,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages,
  };
      }
