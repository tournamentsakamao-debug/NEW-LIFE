import { useState, useEffect } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { hashPassword, verifyPassword } from '@/lib/authGuard'
import { isAdminUsername } from '@/lib/permissions'

export function useAuth() {
  const { user, setUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      localStorage.removeItem('userId')
      setLoading(false)
      return
    }

    if (data.is_banned) {
      localStorage.removeItem('userId')
      alert('Account banned. Access denied.')
      setLoading(false)
      return
    }

    setUser(data)
    setLoading(false)
  }

  async function login(username: string, password: string) {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !profiles) {
        throw new Error('Invalid username or password')
      }

      const isValid = await verifyPassword(password, profiles.password_hash)
      if (!isValid) {
        throw new Error('Invalid username or password')
      }

      if (profiles.is_banned) {
        throw new Error('Account banned. Access denied.')
      }

      localStorage.setItem('userId', profiles.id)
      setUser(profiles)
      return { success: true, user: profiles }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async function signup(username: string, password: string) {
    try {
      // Check if username already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existing) {
        throw new Error('Username already taken')
      }

      const passwordHash = await hashPassword(password)
      const role = isAdminUsername(username) ? 'admin' : 'user'

      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          username,
          password_hash: passwordHash,
          role,
          wallet_balance: 0,
          is_banned: false
        }])
        .select()
        .single()

      if (error) throw error

      localStorage.setItem('userId', data.id)
      setUser(data)
      return { success: true, user: data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }
}
