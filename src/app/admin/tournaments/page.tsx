'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTournament } from '@/hooks/useTournament'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { TouchButton } from '@/components/ui/TouchButton'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Crown,
  Calendar,
  Users,
  Trophy
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminTournamentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { tournaments, refreshTournaments } = useTournament()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTournament, setEditingTournament] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    game_name: '',
    game_mode: 'solo',
    slots_total: 10,
    join_fee: 0,
    prize_money: 0,
    tournament_date: '',
    tournament_time: '',
    rules: '',
    password: '',
    is_luxury: false,
    banner_main: '',
    banner_detail: ''
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingTournament) {
        // Update
        const { error } = await supabase
          .from('tournaments')
          .update({
            ...formData,
            slots_total: parseInt(formData.slots_total.toString())
          })
          .eq('id', editingTournament.id)

        if (error) throw error
        toast.success('Tournament updated successfully!')
      } else {
        // Create
        const { error } = await supabase
          .from('tournaments')
          .insert([{
            ...formData,
            slots_total: parseInt(formData.slots_total.toString()),
            slots_joined: 0,
            status: 'upcoming'
          }])

        if (error) throw error
        toast.success('Tournament created successfully!')
      }

      setShowCreateModal(false)
      setEditingTournament(null)
      resetForm()
      refreshTournaments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tournament')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Tournament deleted successfully!')
      refreshTournaments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tournament')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tournament: any) => {
    setEditingTournament(tournament)
    setFormData({
      name: tournament.name,
      game_name: tournament.game_name,
      game_mode: tournament.game_mode,
      slots_total: tournament.slots_total,
      join_fee: tournament.join_fee,
      prize_money: tournament.prize_money,
      tournament_date: tournament.tournament_date,
      tournament_time: tournament.tournament_time,
      rules: tournament.rules || '',
      password: tournament.password || '',
      is_luxury: tournament.is_luxury,
      banner_main: tournament.banner_main || '',
      banner_detail: tournament.banner_detail || ''
    })
    setShowCreateModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      game_name: '',
      game_mode: 'solo',
      slots_total: 10,
      join_fee: 0,
      prize_money: 0,
      tournament_date: '',
      tournament_time: '',
      rules: '',
      password: '',
      is_luxury: false,
      banner_main: '',
      banner_detail: ''
    })
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-luxury-lightGray rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">Manage Tournaments</h1>
            </div>
            <TouchButton
              variant="luxury"
              onClick={() => {
                resetForm()
                setEditingTournament(null)
                setShowCreateModal(true)
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Tournament
            </TouchButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Tournament List */}
        {tournaments.length === 0 ? (
          <Card>
            <p className="text-gray-400 text-center py-8">No tournaments yet. Create your first one!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:border-luxury-gold/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                      {tournament.is_luxury && (
                        <Crown className="w-5 h-5 text-luxury-gold" />
                      )}
                    </div>
                    <p className="text-gray-400 mb-3">{tournament.game_name} • {tournament.game_mode.toUpperCase()}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Slots</p>
                        <p className="text-white font-bold">{tournament.slots_joined}/{tournament.slots_total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Entry Fee</p>
                        <p className="text-luxury-gold font-bold">₹{tournament.join_fee}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Prize</p>
                        <p className="text-luxury-gold font-bold">₹{tournament.prize_money}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Status</p>
                        <p className={`font-bold ${
                          tournament.status === 'upcoming' ? 'text-blue-400' :
                          tournament.status === 'live' ? 'text-green-400' :
                          tournament.status === 'finished' ? 'text-gray-400' :
                          'text-red-400'
                        }`}>
                          {tournament.status.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(tournament.tournament_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <span>•</span>
                      <span>{tournament.tournament_time}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <TouchButton
                      variant="secondary"
                      onClick={() => handleEdit(tournament)}
                    >
                      <Edit className="w-5 h-5" />
                    </TouchButton>
                    <TouchButton
                      variant="danger"
                      onClick={() => handleDelete(tournament.id)}
                      disabled={tournament.slots_joined > 0}
                    >
                      <Trash2 className="w-5 h-5" />
                    </TouchButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingTournament(null)
        }}
        title={editingTournament ? 'Edit Tournament' : 'Create Tournament'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tournament Name *"
            placeholder="e.g., BGMI Solo Championship"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Game Name *"
            placeholder="e.g., BGMI, Free Fire, COD Mobile"
            value={formData.game_name}
            onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Game Mode *
            </label>
            <select
              value={formData.game_mode}
              onChange={(e) => setFormData({ ...formData, game_mode: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-luxury-lightGray border border-luxury-lightGray text-white focus:outline-none focus:border-luxury-gold transition-colors"
              required
            >
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Slots *"
              type="number"
              min="2"
              placeholder="10"
              value={formData.slots_total}
              onChange={(e) => setFormData({ ...formData, slots_total: parseInt(e.target.value) || 0 })}
              required
            />

            <Input
              label="Entry Fee (₹) *"
              type="number"
              min="0"
              placeholder="0 for FREE"
              value={formData.join_fee}
              onChange={(e) => setFormData({ ...formData, join_fee: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <Input
            label="Prize Money (₹) *"
            type="number"
            min="0"
            placeholder="0 for Practice"
            value={formData.prize_money}
            onChange={(e) => setFormData({ ...formData, prize_money: parseFloat(e.target.value) || 0 })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tournament Date *"
              type="date"
              value={formData.tournament_date}
              onChange={(e) => setFormData({ ...formData, tournament_date: e.target.value })}
              required
            />

            <Input
              label="Tournament Time *"
              type="time"
              value={formData.tournament_time}
              onChange={(e) => setFormData({ ...formData, tournament_time: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tournament Rules
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-lg bg-luxury-lightGray border border-luxury-lightGray text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition-colors"
              placeholder="Enter tournament rules..."
              rows={5}
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            />
          </div>

          <Input
            label="Tournament Password (Optional)"
            type="text"
            placeholder="Leave empty for public tournament"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <Input
            label="Main Banner URL (Optional)"
            type="url"
            placeholder="https://example.com/banner.jpg"
            value={formData.banner_main}
            onChange={(e) => setFormData({ ...formData, banner_main: e.target.value })}
          />

          <Input
            label="Detail Banner URL (Optional)"
            type="url"
            placeholder="https://example.com/banner-detail.jpg"
            value={formData.banner_detail}
            onChange={(e) => setFormData({ ...formData, banner_detail: e.target.value })}
          />

          <div className="flex items-center gap-3 p-4 bg-luxury-lightGray rounded-lg">
            <input
              type="checkbox"
              id="is_luxury"
              checked={formData.is_luxury}
              onChange={(e) => setFormData({ ...formData, is_luxury: e.target.checked })}
              className="w-5 h-5 rounded border-luxury-gold text-luxury-gold focus:ring-luxury-gold"
            />
            <label htmlFor="is_luxury" className="text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-luxury-gold" />
              Mark as Luxury Tournament
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <TouchButton
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowCreateModal(false)
                setEditingTournament(null)
              }}
            >
              Cancel
            </TouchButton>
            <TouchButton
              type="submit"
              variant="luxury"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingTournament ? 'Update' : 'Create'}
            </TouchButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
