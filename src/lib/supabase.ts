import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  username: string
  password_hash: string
  role: 'user' | 'admin'
  wallet_balance: number
  is_banned: boolean
  banned_at?: string
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  game_name: string
  game_mode: 'solo' | 'duo' | 'squad'
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
}
