import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useChat = (userId: string) => {
  const [messages, setMessages] = useState<any[]>([]);

  // Fetch initial messages
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  // Real-time subscription
  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`chat_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `user_id=eq.${userId}` }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const sendMessage = async (content: string, sender: 'user' | 'admin') => {
    await supabase.from('chats').insert([{ user_id: userId, content, sender }]);
  };

  return { messages, sendMessage };
};

