import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTournamentStore } from '@/store/tournamentStore'

export function useTournament() {
  const { tournaments, setTournaments, updateTournament } = useTournamentStore()
  const [loading, setLoading] = useState(false)

  // 1. Memoized Load function for efficiency
  const loadTournaments = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('status', { ascending: true }) // Upcoming first
        .order('tournament_date', { ascending: true })

      if (error) throw error
      if (data) setTournaments(data)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [setTournaments])

  // 2. Advanced Real-time Subscription
  useEffect(() => {
    loadTournaments()

    const channel = supabase
      .channel('live-tournament-feed')
      .on('postgres_changes', {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'tournaments'
      }, (payload) => {
        // Luxury Tip: Pura fetch karne ke bajaye sirf changed item update karein
        if (payload.eventType === 'UPDATE') {
          updateTournament(payload.new.id, payload.new)
        } else {
          loadTournaments() // Re-fetch for new or deleted items
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadTournaments, updateTournament])

  // 3. Status Filter Helper
  const getTournamentsByStatus = (status: 'upcoming' | 'live' | 'finished') => {
    return tournaments.filter(t => t.status === status)
  }

  return {
    tournaments,
    upcomingMatches: getTournamentsByStatus('upcoming'),
    liveMatches: getTournamentsByStatus('live'),
    loading,
    refreshTournaments: loadTournaments
  }
}
