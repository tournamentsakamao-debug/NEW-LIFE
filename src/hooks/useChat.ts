import { useState, useEffect, useCallback } from 'react'
import { supabase, Chat, SystemSettings } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export function useChat(targetUserId?: string) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Chat[]>([])
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(false)

  // 1. Load System Settings (Real-time check for chat availability)
  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from('system_settings').select('*').single()
    if (data) setSettings(data)
  }, [])

  // 2. Load Messages with specific logic for Admin/User
  const loadMessages = useCallback(async () => {
    if (!user) return
    
    // Agar targetUserId hai (Admin side), toh us specific user ke chats fetch karo
    // Agar nahi hai (User side), toh current user ke chats fetch karo
    const chatOwnerId = targetUserId || user.id

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', chatOwnerId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Chat load error:', error)
    } else if (data) {
      setMessages(data)
    }
  }, [user, targetUserId])

  // 3. Real-time Subscription with "Optimistic" Feel
  useEffect(() => {
    if (!user) return

    loadMessages()
    loadSettings()

    const channel = supabase
      .channel(`chat-room-${targetUserId || user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chats',
        filter: `user_id=eq.${targetUserId || user.id}`
      }, (payload) => {
        // Naya message aane par puri list load karne ke bajaye append karein
        setMessages((prev) => [...prev, payload.new as Chat])
        
        // Agar sound enabled hai toh pop sound bajayein (Requirement 13)
        if (settings?.sound_enabled) {
          const audio = new Audio('/sounds/message.mp3')
          audio.play().catch(() => {})
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, targetUserId, loadMessages, loadSettings, settings?.sound_enabled])

  // 4. Send Message Logic
  async function sendMessage(content: string) {
    if (!user) return { success: false }

    // Check if chat is allowed
    if (!settings?.chat_enabled && user.role !== 'admin') {
      toast.error('Admin has temporarily disabled live support.')
      return { success: false }
    }

    try {
      const { error } = await supabase
        .from('chats')
        .insert([{
          user_id: targetUserId || user.id,
          content,
          sender: user.role === 'admin' ? 'admin' : 'user',
          is_read: false
        }])

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      toast.error(error.message)
      return { success: false }
    }
  }

  return {
    messages,
    settings,
    loading,
    sendMessage,
    chatEnabled: settings?.chat_enabled || false,
    isAdmin: user?.role === 'admin'
  }
  }
