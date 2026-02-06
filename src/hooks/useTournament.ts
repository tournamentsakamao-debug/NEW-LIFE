import { useState, useEffect } from 'react'
import { supabase, Tournament } from '@/lib/supabase'
import { useTournamentStore } from '@/store/tournamentStore'

export function useTournament() {
  const { tournaments, setTournaments } = useTournamentStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTournaments()
    subscribeToTournaments()
  }, [])

  async function loadTournaments() {
    setLoading(true)
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('tournament_date', { ascending: true })

    if (data) {
      setTournaments(data)
    }
    setLoading(false)
  }

  function subscribeToTournaments() {
    const channel = supabase
      .channel('tournament-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournaments'
      }, (payload) => {
        loadTournaments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function getTournamentById(id: string) {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single()

    return data
  }

  return {
    tournaments,
    loading,
    getTournamentById,
    refreshTournaments: loadTournaments
  }
}
