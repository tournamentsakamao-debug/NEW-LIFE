import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database Types
export type Profile = {
  id: string;
  username: string;
  role: 'user' | 'admin';
  email?: string;
  wallet_balance: number;
  is_banned: boolean;
  banned_at?: string;
  banned_reason?: string;
  is_hacker: boolean;
  chat_enabled: boolean;
  has_chat_appointment: boolean;
  upi_id?: string;
  created_at: string;
  updated_at: string;
};

export type Tournament = {
  id: string;
  title: string;
  game_name: string;
  game_mode: 'Solo' | 'Duo' | 'Squad';
  slots_total: number;
  slots_joined: number;
  join_fee: number;
  prize_money: number;
  tournament_date: string;
  tournament_time: string;
  rules?: string;
  banner_main?: string;
  banner_detail?: string;
  is_password_protected: boolean;
  tournament_password?: string;
  is_luxury: boolean;
  game_id?: string;
  game_password?: string;
  status: 'upcoming' | 'live' | 'finished' | 'cancelled';
  winner_id?: string;
  auto_cancel_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TournamentParticipant = {
  id: string;
  tournament_id: string;
  user_id: string;
  game_name: string;
  game_uid: string;
  user_message?: string;
  slot_number: number;
  joined_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'add_money' | 'withdraw' | 'join' | 'win' | 'refund' | 'penalty';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  utr_number?: string;
  admin_message?: string;
  rejection_reason?: string;
  upi_id?: string;
  can_request_at?: string;
  created_at: string;
  updated_at: string;
};

export type Chat = {
  id: string;
  user_id: string;
  sender: 'user' | 'admin';
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
};

export type SystemSettings = {
  id: string;
  maintenance_mode: boolean;
  chat_enabled: boolean;
  sound_enabled: boolean;
  bg_music_enabled: boolean;
  app_logo?: string;
  updated_at: string;
};

export type AdminWallet = {
  id: string;
  global_balance: number;
  personal_balance: number;
  upi_id?: string;
  updated_at: string;
};
