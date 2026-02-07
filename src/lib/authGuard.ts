import { supabase } from './supabase'

/**
 * ⚠️ Note: SHA-256 for passwords on client-side is better than plain text, 
 * but Supabase Auth (Auth.signUp) automatically handles bcrypt on server-side.
 * It's recommended to use supabase.auth.signInWithPassword instead.
 */

export async function getCurrentUser() {
  // 1. Pehle Supabase Auth Session check karein (Secure Way)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    // Fallback: Agar session nahi hai toh localStorage clear karein
    if (typeof window !== 'undefined') localStorage.removeItem('userId')
    return null
  }

  // 2. Profile fetch karein session user ID se
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error || !data) return null
  
  // Sync localStorage for legacy support if needed
  if (typeof window !== 'undefined') {
    localStorage.setItem('userId', data.id)
  }
  
  return data
}

export async function checkAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }
  
  // Requirement 3.1: Global Ban Logic
  if (user.is_banned) {
    if (typeof window !== 'undefined') {
      await supabase.auth.signOut()
      localStorage.clear()
      window.location.href = '/login?error=banned'
    }
    return null
  }
  
  return user
}

export async function checkAdminAuth() {
  const user = await checkAuth()
  
  // Role-based protection
  if (!user || user.role !== 'admin') {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
    return null
  }
  return user
}

/**
 * Requirement 12: Sound & Vibrations check during auth actions
 */
export const triggerAuthFeedback = (success: boolean) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(success ? 10 : [50, 30, 50])
  }
}
