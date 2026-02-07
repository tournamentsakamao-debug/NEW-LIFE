'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ChatBox from '@/components/chat/ChatBox';
import { supabase, type Profile } from '@/lib/supabase';

export default function AdminChatPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchUsers();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch users who have sent messages
      const { data: chatUsers, error } = await supabase
        .from('chats')
        .select('user_id, profiles(id, username, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique users
      const uniqueUsers = Array.from(
        new Map(chatUsers?.map((c: any) => [c.profiles.id, c.profiles])).values()
      ) as Profile[];

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            User Chats
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <Card className="lg:col-span-1">
            <h2 className="text-lg font-bold mb-4">Recent Chats</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No messages yet</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-red-500/20 border border-red-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-full">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Box */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <ChatBox userId={selectedUser.id} isAdmin={true} />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Select a user to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
                    }
