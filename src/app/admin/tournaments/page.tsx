'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Plus, Edit, Trash2, Trophy, Clock, 
  Users, Play, Award, XCircle, Calendar 
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Modal from '@/components/ui/Modal';
import { supabase, type Tournament, type TournamentParticipant, type Profile } from '@/lib/supabase';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminTournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<'auto' | 'manual'>('auto');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    game_name: '',
    game_mode: 'Solo' as 'Solo' | 'Duo' | 'Squad',
    slots_total: 50,
    join_fee: 0,
    prize_money: 0,
    tournament_date: '',
    tournament_time: '',
    rules: '',
    banner_main: '',
    banner_detail: '',
    is_password_protected: false,
    tournament_password: '',
    is_luxury: false,
    game_id: '',
    game_password: '',
  });

  useEffect(() => {
    checkAuth();
    fetchTournaments();
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

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to load tournaments');
    }
  };

  const fetchParticipants = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*, profiles(username)')
        .eq('tournament_id', tournamentId)
        .order('slot_number', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    }
  };

  const handleCreateTournament = async () => {
    try {
      if (!formData.title || !formData.game_name || !formData.tournament_date || !formData.tournament_time) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Calculate auto_cancel_at (tournament time + 2 minutes)
      const tournamentDateTime = new Date(`${formData.tournament_date}T${formData.tournament_time}`);
      const autoCancelAt = new Date(tournamentDateTime.getTime() + 2 * 60 * 1000);

      const { error } = await supabase
        .from('tournaments')
        .insert({
          ...formData,
          created_by: session.user.id,
          auto_cancel_at: autoCancelAt.toISOString(),
          status: 'upcoming',
        });

      if (error) throw error;

      toast.success('Tournament created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchTournaments();
    } catch (error: any) {
      console.error('Create tournament error:', error);
      toast.error(error.message || 'Failed to create tournament');
    }
  };

  const handleUpdateTournament = async () => {
    try {
      if (!selectedTournament) return;

      const { error } = await supabase
        .from('tournaments')
        .update(formData)
        .eq('id', selectedTournament.id);

      if (error) throw error;

      // If time/date changed, notify participants
      if (
        formData.tournament_date !== selectedTournament.tournament_date ||
        formData.tournament_time !== selectedTournament.tournament_time
      ) {
        const { data: participants } = await supabase
          .from('tournament_participants')
          .select('user_id')
          .eq('tournament_id', selectedTournament.id);

        if (participants) {
          for (const participant of participants) {
            await supabase
              .from('notifications')
              .insert({
                user_id: participant.user_id,
                title: 'Tournament Time Changed',
                message: `Due to technical error, tournament time/date has been changed. New schedule: ${formatDate(formData.tournament_date)} at ${formatTime(formData.tournament_time)}`,
                type: 'warning',
              });
          }
        }
      }

      toast.success('Tournament updated successfully!');
      setShowEditModal(false);
      setSelectedTournament(null);
      resetForm();
      fetchTournaments();
    } catch (error: any) {
      console.error('Update tournament error:', error);
      toast.error(error.message || 'Failed to update tournament');
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) throw error;

      toast.success('Tournament deleted successfully!');
      fetchTournaments();
    } catch (error: any) {
      console.error('Delete tournament error:', error);
      toast.error(error.message || 'Failed to delete tournament');
    }
  };

  const handleCancelTournament = async (tournament: Tournament) => {
    if (!confirm('Are you sure you want to cancel this tournament? All participants will be refunded.')) return;

    try {
      const { error } = await supabase.rpc('cancel_tournament_refund', {
        t_id: tournament.id,
        reason: 'Cancelled by admin',
      });

      if (error) throw error;

      toast.success('Tournament cancelled and all participants refunded!');
      fetchTournaments();
    } catch (error: any) {
      console.error('Cancel tournament error:', error);
      toast.error(error.message || 'Failed to cancel tournament');
    }
  };

  const handleStartTournament = async (tournamentId: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'live' })
        .eq('id', tournamentId);

      if (error) throw error;

      toast.success('Tournament started!');
      fetchTournaments();
    } catch (error: any) {
      console.error('Start tournament error:', error);
      toast.error(error.message || 'Failed to start tournament');
    }
  };

  const handleDeclareWinner = async () => {
    if (!selectedTournament || !selectedWinner) {
      toast.error('Please select a winner');
      return;
    }

    try {
      const { error } = await supabase.rpc('distribute_tournament_prize', {
        t_id: selectedTournament.id,
        winner_u_id: selectedWinner,
        prize_amt: selectedTournament.prize_money,
        is_auto: payoutMethod === 'auto',
      });

      if (error) throw error;

      toast.success('Winner declared and prize distributed!');
      setShowWinnerModal(false);
      setSelectedTournament(null);
      setSelectedWinner('');
      fetchTournaments();
    } catch (error: any) {
      console.error('Declare winner error:', error);
      toast.error(error.message || 'Failed to declare winner');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      game_name: '',
      game_mode: 'Solo',
      slots_total: 50,
      join_fee: 0,
      prize_money: 0,
      tournament_date: '',
      tournament_time: '',
      rules: '',
      banner_main: '',
      banner_detail: '',
      is_password_protected: false,
      tournament_password: '',
      is_luxury: false,
      game_id: '',
      game_password: '',
    });
  };

  const openEditModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setFormData({
      title: tournament.title,
      game_name: tournament.game_name,
      game_mode: tournament.game_mode,
      slots_total: tournament.slots_total,
      join_fee: tournament.join_fee,
      prize_money: tournament.prize_money,
      tournament_date: tournament.tournament_date,
      tournament_time: tournament.tournament_time,
      rules: tournament.rules || '',
      banner_main: tournament.banner_main || '',
      banner_detail: tournament.banner_detail || '',
      is_password_protected: tournament.is_password_protected,
      tournament_password: tournament.tournament_password || '',
      is_luxury: tournament.is_luxury,
      game_id: tournament.game_id || '',
      game_password: tournament.game_password || '',
    });
    setShowEditModal(true);
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Tournament Management</h1>
          </div>
          <Button variant="success" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Tournament
          </Button>
        </div>

        {/* Tournaments List */}
        <div className="space-y-4">
          {tournaments.length === 0 ? (
            <Card className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No tournaments yet</p>
            </Card>
          ) : (
            tournaments.map((tournament) => (
              <Card key={tournament.id} luxury={tournament.is_luxury}>
                <div className="space-y-4">
                  {/* Tournament Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
                      <p className="text-sm text-gray-400">
                        {tournament.game_name} • {tournament.game_mode}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(tournament.tournament_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(tournament.tournament_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {tournament.slots_joined}/{tournament.slots_total}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        tournament.status === 'live' ? 'bg-red-500' :
                        tournament.status === 'upcoming' ? 'bg-blue-500' :
                        tournament.status === 'finished' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}>
                        {tournament.status.toUpperCase()}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        Entry: {formatCurrency(tournament.join_fee)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Prize: {formatCurrency(tournament.prize_money)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedTournament(tournament);
                        fetchParticipants(tournament.id);
                        setShowParticipantsModal(true);
                      }}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      View Participants ({tournament.slots_joined})
                    </Button>

                    {tournament.status === 'upcoming' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStartTournament(tournament.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(tournament)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </>
                    )}

                    {tournament.status === 'live' && (
                      <Button
                        variant="luxury"
                        size="sm"
                        onClick={() => {
                          setSelectedTournament(tournament);
                          fetchParticipants(tournament.id);
                          setShowWinnerModal(true);
                        }}
                      >
                        <Award className="w-4 h-4 mr-1" />
                        Declare Winner
                      </Button>
                    )}

                    {tournament.status !== 'finished' && tournament.status !== 'cancelled' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelTournament(tournament)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel & Refund
                      </Button>
                    )}

                    {tournament.status === 'upcoming' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTournament(tournament.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Tournament Modal */}
        <Modal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedTournament(null);
            resetForm();
          }}
          title={showCreateModal ? 'Create Tournament' : 'Edit Tournament'}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <Input
              label="Tournament Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Input
              label="Game Name *"
              value={formData.game_name}
              onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Game Mode *</label>
              <select
                className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-white/10 text-white"
                value={formData.game_mode}
                onChange={(e) => setFormData({ ...formData, game_mode: e.target.value as any })}
              >
                <option value="Solo">Solo</option>
                <option value="Duo">Duo</option>
                <option value="Squad">Squad</option>
              </select>
            </div>

            <Input
              label="Total Slots *"
              type="number"
              value={formData.slots_total}
              onChange={(e) => setFormData({ ...formData, slots_total: parseInt(e.target.value) })}
            />

            <Input
              label="Join Fee (₹)"
              type="number"
              value={formData.join_fee}
              onChange={(e) => setFormData({ ...formData, join_fee: parseFloat(e.target.value) })}
            />

            <Input
              label="Prize Money (₹)"
              type="number"
              value={formData.prize_money}
              onChange={(e) => setFormData({ ...formData, prize_money: parseFloat(e.target.value) })}
            />

            <Input
              label="Date *"
              type="date"
              value={formData.tournament_date}
              onChange={(e) => setFormData({ ...formData, tournament_date: e.target.value })}
            />

            <Input
              label="Time *"
              type="time"
              value={formData.tournament_time}
              onChange={(e) => setFormData({ ...formData, tournament_time: e.target.value })}
            />

            <TextArea
              label="Rules"
              rows={4}
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            />

            <Input
              label="Main Banner URL"
              value={formData.banner_main}
              onChange={(e) => setFormData({ ...formData, banner_main: e.target.value })}
            />

            <Input
              label="Detail Banner URL"
              value={formData.banner_detail}
              onChange={(e) => setFormData({ ...formData, banner_detail: e.target.value })}
            />

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <input
                type="checkbox"
                id="password-protected"
                checked={formData.is_password_protected}
                onChange={(e) => setFormData({ ...formData, is_password_protected: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="password-protected" className="text-white cursor-pointer">
                Password Protected
              </label>
            </div>

            {formData.is_password_protected && (
              <Input
                label="Tournament Password"
                value={formData.tournament_password}
                onChange={(e) => setFormData({ ...formData, tournament_password: e.target.value })}
              />
            )}

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <input
                type="checkbox"
                id="luxury"
                checked={formData.is_luxury}
                onChange={(e) => setFormData({ ...formData, is_luxury: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="luxury" className="text-white cursor-pointer">
                Luxury Tournament
              </label>
            </div>

            <Input
              label="Game ID"
              value={formData.game_id}
              onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
            />

            <Input
              label="Game Password"
              value={formData.game_password}
              onChange={(e) => setFormData({ ...formData, game_password: e.target.value })}
            />

            <Button
              variant="success"
              size="lg"
              className="w-full"
              onClick={showCreateModal ? handleCreateTournament : handleUpdateTournament}
            >
              {showCreateModal ? 'Create Tournament' : 'Update Tournament'}
            </Button>
          </div>
        </Modal>

        {/* Participants Modal */}
        <Modal
          isOpen={showParticipantsModal}
          onClose={() => {
            setShowParticipantsModal(false);
            setSelectedTournament(null);
            setParticipants([]);
          }}
          title="Tournament Participants"
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {participants.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No participants yet</p>
            ) : (
              participants.map((participant: any) => (
                <div key={participant.id} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-white">Slot #{participant.slot_number}</p>
                    <p className="text-sm text-gray-400">{participant.profiles.username}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400">
                      Game Name: <span className="text-white">{participant.game_name}</span>
                    </p>
                    <p className="text-gray-400">
                      Game UID: <span className="text-white font-mono">{participant.game_uid}</span>
                    </p>
                    {participant.user_message && (
                      <p className="text-gray-400">
                        Message: <span className="text-white">{participant.user_message}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>

        {/* Winner Selection Modal */}
        <Modal
          isOpen={showWinnerModal}
          onClose={() => {
            setShowWinnerModal(false);
            setSelectedTournament(null);
            setSelectedWinner('');
          }}
          title="Declare Winner"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Winner *</label>
              <select
                className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-white/10 text-white"
                value={selectedWinner}
                onChange={(e) => setSelectedWinner(e.target.value)}
              >
                <option value="">-- Select Winner --</option>
                {participants.map((participant: any) => (
                  <option key={participant.id} value={participant.user_id}>
                    Slot #{participant.slot_number} - {participant.profiles.username} ({participant.game_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Payout Method</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <input
                    type="radio"
                    id="auto-payout"
                    name="payout"
                    checked={payoutMethod === 'auto'}
                    onChange={() => setPayoutMethod('auto')}
                    className="w-5 h-5"
                  />
                  <label htmlFor="auto-payout" className="text-white cursor-pointer flex-1">
                    Automatic Payout (Instant)
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <input
                    type="radio"
                    id="manual-payout"
                    name="payout"
                    checked={payoutMethod === 'manual'}
                    onChange={() => setPayoutMethod('manual')}
                    className="w-5 h-5"
                  />
                  <label htmlFor="manual-payout" className="text-white cursor-pointer flex-1">
                    Manual Payout (Later)
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
              <p className="text-green-400 text-sm">
                Prize Amount: <strong>{formatCurrency(selectedTournament?.prize_money || 0)}</strong>
              </p>
            </div>

            <Button
              variant="luxury"
              size="lg"
              className="w-full"
              onClick={handleDeclareWinner}
              disabled={!selectedWinner}
            >
              <Award className="w-5 h-5 mr-2" />
              Declare Winner & Distribute Prize
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
              }
