'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Chat } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { TouchButton } from '@/components/ui/TouchButton'
import { ArrowLeft, Send, MessageSquare, User } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface UserWithLastMessage {
  user_id: string
  username: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function AdminChatsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [userChats, setUserChats] = useState<UserWithLastMessage[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Chat[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    } else if (user) {
      loadUserChats()
      subscribeToChats()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (selectedUserId) {
      loadUserMessages(selectedUserId)
      markMessagesAsRead(selectedUserId)
    }
  }, [selectedUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const subscribeToChats = () => {
    const channel = supabase
      .channel('admin-chats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats'
      }, () => {
        loadUserChats()
        if (selectedUserId) {
          loadUserMessages(selectedUserId)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const loadUserChats = async () => {
    // Get all users who have chatted
    const { data: allChats } = await supabase
      .from('chats')
      .select(`
        user_id,
        content,
        created_at,
        sender,
        is_read,
        profiles:user_id (username)
      `)
      .order('created_at', { ascending: false })

    if (!allChats) return

    // Group by user
    const userMap = new Map<string, UserWithLastMessage>()

    allChats.forEach((chat: any) => {
      if (!userMap.has(chat.user_id)) {
        userMap.set(chat.user_id, {
          user_id: chat.user_id,
          username: chat.profiles?.username || 'Unknown User',
          lastMessage: chat.content,
          lastMessageTime: chat.created_at,
          unreadCount: 0
        })
      }

      // Count unread messages from user
      if (chat.sender === 'user' && !chat.is_read) {
        const userData = userMap.get(chat.user_id)!
        userData.unreadCount++
      }
    })

    setUserChats(Array.from(userMap.values()))
  }

  const loadUserMessages = async (userId: string) => {
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
    }
  }

  const markMessagesAsRead = async (userId: string) => {
    await supabase
      .from('chats')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('sender', 'user')
      .eq('is_read', false)

    loadUserChats()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('chats')
        .insert([{
          user_id: selectedUserId,
          content: newMessage,
          sender: 'admin',
          is_read: false
        }])

      if (error) throw error

      setNewMessage('')
      loadUserMessages(selectedUserId)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-luxury-black flex flex-col">
      {/* Header */}
      <header className="bg-luxury-gray border-b border-luxury-lightGray">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-luxury-lightGray rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">User Messages</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* User List Sidebar */}
        <div className="w-80 bg-luxury-gray border-r border-luxury-lightGray overflow-y-auto">
          <div className="p-4">
            <h2 className="text-white font-bold mb-4">Conversations</h2>
            {userChats.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {userChats.map((userChat) => (
                  <button
                    key={userChat.user_id}
                    onClick={() => setSelectedUserId(userChat.user_id)}
                    className={`w-full p-4 rounded-lg text-left transition-colors ${
                      selectedUserId === userChat.user_id
                        ? 'bg-luxury-lightGray border-luxury-gold border'
                        : 'hover:bg-luxury-lightGray/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-luxury-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-bold truncate">{userChat.username}</p>
                          {userChat.unreadCount > 0 && (
                            <span className="bg-luxury-gold text-luxury-black text-xs font-bold px-2 py-1 rounded-full">
                              {userChat.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">{userChat.lastMessage}</p>
                        <p className="text-gray-500 text-xs">
                          {format(new Date(userChat.lastMessageTime), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-2xl ${
                        msg.sender === 'admin'
                          ? 'bg-luxury-gold text-luxury-black rounded-br-none'
                          : 'bg-luxury-lightGray text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-xs mt-2 ${msg.sender === 'admin' ? 'text-luxury-black/60' : 'text-gray-500'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="bg-luxury-gray border-t border-luxury-lightGray p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-luxury-lightGray border border-luxury-lightGray rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition-colors"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="p-3 bg-luxury-gold hover:bg-luxury-darkGold disabled:opacity-50 rounded-full transition-colors"
                  >
                    <Send className="w-6 h-6 text-luxury-black" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
          }
