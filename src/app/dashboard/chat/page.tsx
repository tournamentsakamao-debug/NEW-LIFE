'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { TouchButton } from '@/components/ui/TouchButton'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Send } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function ChatPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { messages, chatEnabled, sendMessage, loading } = useChat()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim()) return

    const result = await sendMessage(message)
    if (result.success) {
      setMessage('')
    } else {
      toast.error(result.error || 'Failed to send message')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-luxury-black flex flex-col">
      {/* Header */}
      <header className="bg-luxury-gray border-b border-luxury-lightGray">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-luxury-lightGray rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Chat with Admin</h1>
              <p className="text-xs text-gray-400">
                {chatEnabled ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {!chatEnabled && (
          <Card className="bg-yellow-600/10 border-yellow-600/20">
            <p className="text-yellow-400 text-sm text-center">
              Admin is busy, you are not able to chat now
            </p>
          </Card>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-luxury-gold text-luxury-black rounded-br-none'
                  : 'bg-luxury-lightGray text-white rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-luxury-black/60' : 'text-gray-500'}`}>
                {format(new Date(msg.created_at), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="bg-luxury-gray border-t border-luxury-lightGray p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder={chatEnabled ? "Type a message..." : "Chat disabled"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={!chatEnabled || loading}
              className="flex-1 px-4 py-3 bg-luxury-lightGray border border-luxury-lightGray rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!chatEnabled || loading || !message.trim()}
              className="p-3 bg-luxury-gold hover:bg-luxury-darkGold disabled:opacity-50 rounded-full transition-colors"
            >
              <Send className="w-6 h-6 text-luxury-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
              }
