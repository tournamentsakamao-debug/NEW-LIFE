import { useState, useEffect } from 'react'
import { supabase, Chat, SystemSettings } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useChat() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Chat[]>([])
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadMessages()
      loadSettings()
      subscribeToMessages()
    }
  }, [user])

  async function loadSettings() {
    const { data } = await supabase
      .from('system_settings')
      .select('*')
      .single()

    if (data) {
      setSettings(data)
    }
  }

  async function loadMessages() {
    if (!user) return

    const query = user.role === 'admin'
      ? supabase.from('chats').select('*').order('created_at', { ascending: true })
      : supabase.from('chats').select('*').eq('user_id', user.id).order('created_at', { ascending: true })

    const { data } = await query

    if (data) {
      setMessages(data)
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel('chat-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats'
      }, (payload) => {
        loadMessages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function sendMessage(content: string, recipientId?: string) {
    if (!user) return { success: false, error: 'Not authenticated' }

    if (!settings?.chat_enabled && user.role !== 'admin') {
      return { success: false, error: 'Chat is currently disabled' }
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('chats')
        .insert([{
          user_id: recipientId || user.id,
          content,
          sender: user.role,
          is_read: false
        }])

      if (error) throw error

      await loadMessages()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(messageId: string) {
    await supabase
      .from('chats')
      .update({ is_read: true })
      .eq('id', messageId)

    await loadMessages()
  }

  return {
    messages,
    settings,
    loading,
    sendMessage,
    markAsRead,
    chatEnabled: settings?.chat_enabled || false,
    appointmentOnly: settings?.appointment_only_chat || false
  }
    }
