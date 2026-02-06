import { supabase } from './supabase'

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password)
  return inputHash === hash
}

export async function getCurrentUser() {
  const userId = localStorage.getItem('userId')
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data
}

export async function checkAuth() {
  const user = await getCurrentUser()
  if (!user) {
    window.location.href = '/login'
    return null
  }
  
  if (user.is_banned) {
    localStorage.removeItem('userId')
    alert('Your account has been permanently banned.')
    window.location.href = '/login'
    return null
  }
  
  return user
}

export async function checkAdminAuth() {
  const user = await checkAuth()
  if (!user || user.role !== 'admin') {
    window.location.href = '/dashboard'
    return null
  }
  return user
}
