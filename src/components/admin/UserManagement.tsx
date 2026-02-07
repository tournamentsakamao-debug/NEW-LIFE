'use client';

import { useEffect, useState } from 'react';
import { Search, Ban, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { supabase, type Profile } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [isHacker, setIsHacker] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) {
      toast.error('Please provide a ban reason');
      return;
    }

    try {
      const { error } = await supabase.rpc('ban_user_permanently', {
        u_id: selectedUser.id,
        reason: banReason,
        is_hacker: isHacker,
      });

      if (error) throw error;

      toast.success('User banned successfully');
      setShowBanModal(false);
      setBanReason('');
      setIsHacker(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false, banned_at: null, banned_reason: null, is_hacker: false })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User unbanned successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Failed to unban user');
    }
  };

  const handleToggleChat = async (userId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ chat_enabled: !enabled })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Chat ${!enabled ? 'enabled' : 'disabled'} for user`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling chat:', error);
      toast.error('Failed to update chat status');
    }
  };

  const handleToggleAppointment = async (userId: string, hasAppointment: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_chat_appointment: !hasAppointment })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Chat appointment ${!hasAppointment ? 'granted' : 'removed'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400">No users found</p>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className={user.is_banned ? 'border-2 border-red-500' : ''}>
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{user.username}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-sm text-gray-400">
                      Joined: {formatDate(user.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      {formatCurrency(user.wallet_balance)}
                    </p>
                    <p className="text-sm text-gray-400">Wallet Balance</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {user.is_banned && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                      BANNED: {user.banned_reason}
                    </span>
                  )}
                  {user.is_hacker && (
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                      HACKER
                    </span>
                  )}
                  {!user.chat_enabled && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                      CHAT DISABLED
                    </span>
                  )}
                  {user.has_chat_appointment && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      CHAT APPOINTMENT
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {user.is_banned ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleUnbanUser(user.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Unban User
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowBanModal(true);
                      }}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Ban User
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggleChat(user.id, user.chat_enabled)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {user.chat_enabled ? 'Disable Chat' : 'Enable Chat'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggleAppointment(user.id, user.has_chat_appointment)}
                  >
                    {user.has_chat_appointment ? 'Remove' : 'Grant'} Appointment
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Ban Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setSelectedUser(null);
          setBanReason('');
          setIsHacker(false);
        }}
        title="Ban User"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to ban <strong>{selectedUser?.username}</strong>?
          </p>

          <Input
            label="Ban Reason *"
            placeholder="Enter reason for ban"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />

          <div className="flex items-center gap-3 p-4 bg-orange-500/20 rounded-xl">
            <input
              type="checkbox"
              id="is-hacker"
              checked={isHacker}
              onChange={(e) => setIsHacker(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600"
            />
            <label htmlFor="is-hacker" className="text-orange-400 cursor-pointer">
              Mark as Hacker (Wallet balance will be transferred to admin)
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowBanModal(false);
                setSelectedUser(null);
                setBanReason('');
                setIsHacker(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleBanUser}
              disabled={!banReason}
            >
              Confirm Ban
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
      }
