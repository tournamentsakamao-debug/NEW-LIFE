'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useWallet } from '@/hooks/useWallet'
import { TournamentList } from '@/components/tournament/TournamentList'
import { TouchButton } from '@/components/ui/TouchButton'
import { Card } from '@/components/ui/Card'
import { Wallet, MessageSquare, Trophy, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const { balance } = useWallet()
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Header */}
      <header className="bg-luxury-gray border-b border-luxury-lightGray sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold to-luxury-darkGold rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-luxury-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin's Tournament</h1>
                <p className="text-xs text-gray-400">Welcome, {user.username}</p>
              </div>
            </div>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-luxury-lightGray rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="mt-4 space-y-2 border-t border-luxury-lightGray pt-4">
              <TouchButton
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/dashboard/wallet')
                  setShowMenu(false)
                }}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Wallet
              </TouchButton>
              <TouchButton
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/dashboard/chat')
                  setShowMenu(false)
                }}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Chat with Admin
              </TouchButton>
              <TouchButton
                variant="danger"
                className="w-full justify-start"
                onClick={logout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </TouchButton>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Wallet Card */}
        <Card className="mb-6 bg-gradient-to-br from-luxury-gold/10 to-luxury-darkGold/10 border-luxury-gold/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
              <h2 className="text-4xl font-bold text-luxury-gold">₹{balance}</h2>
            </div>
            <TouchButton
              variant="luxury"
              onClick={() => router.push('/dashboard/wallet')}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Manage Wallet
            </TouchButton>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <Trophy className="w-8 h-8 text-luxury-gold mb-2" />
            <p className="text-gray-400 text-sm">Total Wins</p>
            <p className="text-2xl font-bold text-white">0</p>
          </Card>
          <Card>
            <MessageSquare className="w-8 h-8 text-luxury-gold mb-2" />
            <p className="text-gray-400 text-sm">Messages</p>
            <p className="text-2xl font-bold text-white">0</p>
          </Card>
        </div>

        {/* Tournaments Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Available Tournaments</h2>
          <TournamentList />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-luxury-gray border-t border-luxury-lightGray">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex flex-col items-center gap-1 text-luxury-gold"
            >
              <Trophy className="w-6 h-6" />
              <span className="text-xs">Tournaments</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/wallet')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <Wallet className="w-6 h-6" />
              <span className="text-xs">Wallet</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/chat')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs">Chat</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Padding for Nav */}
      <div className="h-20"></div>
    </div>
  )
}
