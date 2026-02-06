"use client";
import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { messages, sendMessage } = useChat(user?.id);
  const [input, setInput] = useState("");
  const [isChatEnabled, setIsChatEnabled] = useState(true);

  useEffect(() => {
    // Check if admin has disabled chat
    supabase.from('system_settings').select('chat_enabled').single()
      .then(({ data }) => setIsChatEnabled(data?.chat_enabled ?? true));
  }, []);

  const handleSend = () => {
    if (!input.trim() || !isChatEnabled) return;
    sendMessage(input, 'user');
    setInput("");
  };

  return (
    <div className="flex flex-col h-[90vh] bg-black text-white p-4">
      <header className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-black">A</div>
        <div>
          <h2 className="font-bold">Admin Support</h2>
          <p className="text-[10px] text-green-500 uppercase font-bold tracking-tighter">Online</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.sender === 'user' ? 'bg-yellow-500 text-black rounded-tr-none' : 'bg-gray-900 text-white rounded-tl-none border border-gray-800'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      {!isChatEnabled ? (
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-xl text-center">
          <p className="text-red-500 text-xs font-bold uppercase italic">Admin is busy, you are not able to chat now</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <input 
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..." 
            className="flex-1 bg-gray-900 p-4 rounded-2xl outline-none focus:ring-1 ring-yellow-500 transition-all text-sm"
          />
          <button onClick={handleSend} className="bg-yellow-500 text-black p-4 rounded-2xl font-black">SEND</button>
        </div>
      )}
    </div>
  );
}

