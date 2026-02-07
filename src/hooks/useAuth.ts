import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { hashPassword, verifyPassword } from '@/lib/authGuard'
import { isAdminEmail } from '@/lib/permissions'
import { toast } from 'sonner'

export function useAuth() {
  const { user, setUser, logout: storeLogout } = useAuthStore()
  const [loading, setLoading] = useState(true)

  // 1. Sync User Session & Real-time Ban Check
  const checkUser = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) throw new Error('Session expired')

      // Requirement 3.1: Immediate Logout if Banned
      if (data.is_banned) {
        handleLogout('Your account has been suspended.')
        return
      }

      setUser(data)
    } catch (err: any) {
      localStorage.removeItem('userId')
    } finally {
      setLoading(false)
    }
  }, [setUser])

  useEffect(() => {
    checkUser()

    // 2. Requirement 2.1: Real-time Profile Listener (Balance/Ban sync)
    const userId = localStorage.getItem('userId')
    if (userId) {
      const channel = supabase
        .channel(`public:profiles:id=eq.${userId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
          if (payload.new.is_banned) {
            handleLogout('Security Alert: Account Banned')
          } else {
            setUser(payload.new as any) // Auto-sync balance & profile
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [checkUser, setUser])

  const handleLogout = (message?: string) => {
    if (message) toast.error(message)
    storeLogout()
  }

  // 3. Login Logic with Hashing
  async function login(username: string, password: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !profile) throw new Error('Invalid credentials')

      const isValid = await verifyPassword(password, profile.password_hash)
      if (!isValid) throw new Error('Invalid credentials')

      if (profile.is_banned) throw new Error('Access Denied: Banned')

      localStorage.setItem('userId', profile.id)
      setUser(profile)
      toast.success(`Welcome back, ${profile.username}!`)
      return { success: true }
    } catch (error: any) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // 4. Signup with Auto-Role Assignment
  async function signup(username: string, email: string, password: string) {
    try {
      const passwordHash = await hashPassword(password)
      
      // Permission logic check
      const role = isAdminEmail(email) ? 'admin' : 'user'

      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          username,
          email, // Added for admin verification
          password_hash: passwordHash,
          role,
          wallet_balance: 0
        }])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') throw new Error('Username/Email already exists')
        throw error
      }

      localStorage.setItem('userId', data.id)
      setUser(data)
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    login,
    signup,
    logout: handleLogout,
    isAdmin: user?.role === 'admin'
  }
          }
