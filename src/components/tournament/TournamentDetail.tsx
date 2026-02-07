'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Trophy, Calendar, Clock, Lock, Crown, 
  MapPin, Shield, XCircle, CheckCircle 
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Modal from '@/components/ui/Modal';
import type { Tournament } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface TournamentDetailProps {
  tournament: Tournament;
  userId: string;
}

export default function TournamentDetail({ tournament, userId }: TournamentDetailProps) {
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);

  // Form states
  const [gameName, setGameName] = useState('');
  const [gameUid, setGameUid] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [tournamentPassword, setTournamentPassword] = useState('');

  const handleJoin = async () => {
    try {
      if (!gameName || !gameUid) {
        toast.error('Please fill in game name and UID');
        return;
      }

      if (tournament.is_password_protected && !tournamentPassword) {
        toast.error('Please enter tournament password');
        return;
      }

      setJoining(true);

      // Verify password if needed
      if (tournament.is_password_protected) {
        if (tournamentPassword !== tournament.tournament_password) {
          toast.error('Incorrect tournament password');
          setJoining(false);
          return;
        }
      }

      // Call join function
      const { data, error } = await supabase.rpc('join_tournament_final', {
        t_id: tournament.id,
        u_id: userId,
        fee: tournament.join_fee,
        g_name: gameName,
        g_uid: gameUid,
        u_msg: userMessage || null,
      });

      if (error) throw error;

      toast.success(`Successfully joined! Your slot number is ${data}`);
      setShowJoinModal(false);
      router.refresh();
    } catch (error: any) {
      console.error('Join error:', error);
      toast.error(error.message || 'Failed to join tournament');
    } finally {
      setJoining(false);
    }
  };

  const getStatusBadge = () => {
    const styles = {
      live: 'status-live',
      upcoming: 'status-upcoming',
      finished: 'status-finished',
      cancelled: 'status-cancelled',
    };

    return (
      <div className={`${styles[tournament.status]} px-4 py-2 rounded-full inline-flex items-center gap-2`}>
        {tournament.status === 'live' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
        <span className="text-sm font-bold text-white uppercase">{tournament.status}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card luxury={tournament.is_luxury} className="relative">
        {/* Luxury Badge */}
        {tournament.is_luxury && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full">
              <Crown className="w-5 h-5 text-gray-900" />
              <span className="text-sm font-bold text-gray-900">LUXURY TOURNAMENT</span>
            </div>
          </div>
        )}

        {/* Banner */}
        {tournament.banner_detail && (
          <div className="relative h-64 -mx-6 -mt-6 mb-6 rounded-t-2xl overflow-hidden">
            <Image
              src={tournament.banner_detail}
              alt={tournament.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            <div className="absolute bottom-4 left-6">
              {getStatusBadge()}
            </div>
          </div>
        )}

        {/* Title & Game Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{tournament.title}</h1>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-lg">{tournament.game_name}</span>
              <span>•</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm">{tournament.game_mode}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Slots */}
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Slots</p>
              <p className="text-2xl font-bold text-white">
                {tournament.slots_joined}/{tournament.slots_total}
              </p>
            </div>

            {/* Entry Fee */}
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Entry Fee</p>
              <p className="text-2xl font-bold text-white">
                {tournament.join_fee === 0 ? 'FREE' : formatCurrency(tournament.join_fee)}
              </p>
            </div>

            {/* Prize */}
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Prize Pool</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(tournament.prize_money)}
              </p>
            </div>

            {/* Date & Time */}
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <Calendar className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Date & Time</p>
              <p className="text-lg font-bold text-white">
                {formatDate(tournament.tournament_date)}
              </p>
              <p className="text-sm text-gray-400">{formatTime(tournament.tournament_time)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Game Details Card */}
      {(tournament.game_id || tournament.game_password) && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Game Details</h2>
          <div className="space-y-3">
            {tournament.game_id && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">Game ID</span>
                <span className="font-mono text-white">{tournament.game_id}</span>
              </div>
            )}
            {tournament.game_password && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400">Game Password</span>
                <span className="font-mono text-white">{tournament.game_password}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Rules Card */}
      {tournament.rules && (
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Tournament Rules
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{tournament.rules}</p>
          </div>
        </Card>
      )}

      {/* Join Button */}
      {tournament.status === 'upcoming' && tournament.slots_joined < tournament.slots_total && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => setShowJoinModal(true)}
        >
          Join Tournament - {tournament.join_fee === 0 ? 'FREE' : formatCurrency(tournament.join_fee)}
        </Button>
      )}

      {tournament.slots_joined >= tournament.slots_total && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 font-semibold">Tournament Full</p>
        </div>
      )}

      {/* Join Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Tournament"
      >
        <div className="space-y-4">
          <Input
            label="Game Name *"
            placeholder="Enter your in-game name"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
          />

          <Input
            label="Game UID *"
            placeholder="Enter your game UID"
            value={gameUid}
            onChange={(e) => setGameUid(e.target.value)}
          />

          <TextArea
            label="Message to Admin (Optional)"
            placeholder="Any message for the admin? (Max 5 lines)"
            rows={5}
            maxLength={500}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />

          {tournament.is_password_protected && (
            <Input
              label="Tournament Password *"
              type="password"
              placeholder="Enter tournament password"
              value={tournamentPassword}
              onChange={(e) => setTournamentPassword(e.target.value)}
            />
          )}

          <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
            <p className="text-yellow-400 text-sm">
              Entry fee of {formatCurrency(tournament.join_fee)} will be deducted from your wallet
            </p>
          </div>

          <Button
            variant="success"
            size="lg"
            className="w-full"
            onClick={handleJoin}
            loading={joining}
          >
            Confirm & Join
          </Button>
        </div>
      </Modal>
    </div>
  );
      }
