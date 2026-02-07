import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- INTERFACES ---

export interface Profile {
  id: string
  username: string
  password_hash: string
  role: 'user' | 'admin'
  wallet_balance: number
  is_banned: boolean
  banned_at?: string
  avatar_url?: string // Added for Luxury Profile feel
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  game_name: string
  game_mode: 'solo' | 'duo' | 'squad'
  map_name: string // Requirement 1.3: Map detail (Erangel, Miramar, etc.)
  version: string  // Requirement 1.3: Game version (3.1, 3.2, etc.)
  slots_total: number
  slots_joined: number
  join_fee: number
  prize_money: number
  tournament_date: string
  tournament_time: string
  rules: string
  banner_main: string
  banner_detail: string
  password?: string
  is_luxury: boolean
  status: 'upcoming' | 'live' | 'finished' | 'cancelled'
  room_id?: string // Requirement 1.7: Shared before match starts
  room_pass?: string // Requirement 1.7: Shared before match starts
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'deposit' | 'withdraw' | 'join' | 'win' | 'refund'
  status: 'pending' | 'completed' | 'rejected'
  game_uid?: string
  admin_message?: string
  rejection_reason?: string
  utr?: string
  screenshot_url?: string // Requirement 2.2: Payment verification
  created_at: string
}

export interface Chat {
  id: string
  user_id: string
  content: string
  sender: 'user' | 'admin'
  is_read: boolean
  created_at: string
}

export interface SystemSettings {
  id: string
  maintenance_mode: boolean
  chat_enabled: boolean
  appointment_only_chat: boolean
  sound_enabled: boolean
  background_music_enabled: boolean
  app_logo?: string
  upi_id?: string // Requirement 2.2: Admin's payment ID
  qr_url?: string // Requirement 2.2: Admin's payment QR
}

// Requirement 1.8: New interface for participants tracking
export interface Participant {
  id: string
  tournament_id: string
  user_id: string
  game_uid: string
  game_name: string
  slot_number: number
  status: 'joined' | 'eliminated' | 'winner'
  kills: number
  created_at: string
}

