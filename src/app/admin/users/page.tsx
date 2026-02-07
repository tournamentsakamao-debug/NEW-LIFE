'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Profile } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { TouchButton } from '@/components/ui/TouchButton'
import { ArrowLeft, Ban, CheckCircle, User } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    } else if (user) {
      loadUsers()
    }
  }, [user, authLoading, router])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setUsers(data)
    }
  }

  const handleBanUser = async (userId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? 'unban' : 'ban'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: !currentBanStatus,
          banned_at: currentBanStatus ? null : new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      toast.success(`User ${action}ned successfully!`)
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} user`)
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
    <div className="min-h-screen bg-luxury-black">
      {/* Header */}
      <header className="bg-luxury-gray border-b border-luxury-lightGray sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-luxury-lightGray rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-gray-400">Total Users: {users.length}</p>
        </div>

        {users.length === 0 ? (
          <Card>
            <p className="text-gray-400 text-center py-8">No users found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map((userProfile) => (
              <Card key={userProfile.id} className={userProfile.is_banned ? 'border-red-600/30' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      userProfile.role === 'admin' ? 'bg-luxury-gold/20' :
                      userProfile.is_banned ? 'bg-red-600/20' : 'bg-blue-600/20'
                    }`}>
                      <User className={`w-6 h-6 ${
                        userProfile.role === 'admin' ? 'text-luxury-gold' :
                        userProfile.is_banned ? 'text-red-400' : 'text-blue-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold">{userProfile.username}</h3>
                        {userProfile.role === 'admin' && (
                          <span className="px-2 py-1 bg-luxury-gold/20 text-luxury-gold text-xs font-bold rounded">
                            ADMIN
                          </span>
                        )}
                        {userProfile.is_banned && (
                          <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded">
                            BANNED
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Joined: {format(new Date(userProfile.created_at), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Wallet: ₹{userProfile.wallet_balance}
                      </p>
                      {userProfile.banned_at && (
                        <p className="text-red-400 text-sm">
                          Banned: {format(new Date(userProfile.banned_at), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>

                  {userProfile.role !== 'admin' && (
                    <TouchButton
                      variant={userProfile.is_banned ? 'luxury' : 'danger'}
                      onClick={() => handleBanUser(userProfile.id, userProfile.is_banned)}
                      disabled={loading}
                    >
                      {userProfile.is_banned ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Unban
                        </>
                      ) : (
                        <>
                          <Ban className="w-5 h-5 mr-2" />
                          Ban
                        </>
                      )}
                    </TouchButton>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
      }
