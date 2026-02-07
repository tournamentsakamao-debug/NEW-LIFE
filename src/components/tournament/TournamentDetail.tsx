'use client'

import { useState, useEffect } from 'react'
import { Tournament, supabase } from '@/lib/supabase'
import { Modal } from '@/components/ui/Modal'
import { TouchButton } from '@/components/ui/TouchButton'
import { Input } from '@/components/ui/Input'
import { useWallet } from '@/hooks/useWallet'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Users, Map as MapIcon, ShieldCheck, Lock, Gamepad2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface TournamentDetailProps {
  tournament: Tournament
  isOpen: boolean
  onClose: () => void
}

export function TournamentDetail({ tournament, isOpen, onClose }: TournamentDetailProps) {
  const { user } = useAuth()
  const { balance, joinTournament } = useWallet()
  const [gameUid, setGameUid] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [occupiedSlots, setOccupiedSlots] = useState<number[]>([])
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Requirement 1.7: Fetch already joined slots
  useEffect(() => {
    if (isOpen) {
      fetchOccupiedSlots()
    }
  }, [isOpen, tournament.id])

  async function fetchOccupiedSlots() {
    const { data } = await supabase
      .from('participants')
      .select('slot_number')
      .eq('tournament_id', tournament.id)
    
    if (data) setOccupiedSlots(data.map(p => p.slot_number))
  }

  const handleJoin = async () => {
    if (!selectedSlot) return toast.error('Please select a slot first')
    if (!gameUid.trim()) return toast.error('Enter your Game UID')
    
    setLoading(true)
    const result = await joinTournament(tournament.id, tournament.join_fee, gameUid, selectedSlot)
    setLoading(false)

    if (result.success) {
      onClose()
      setSelectedSlot(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tournament Briefing">
      <div className="space-y-6 pb-10">
        {/* Banner with Map Overlay */}
        <div className="relative h-52 rounded-[2rem] overflow-hidden border border-white/10">
          <img src={tournament.banner_detail || tournament.banner_main} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-luxury-gold text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {tournament.game_mode}
              </span>
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest italic">
                {tournament.map_name}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter italic">
              {tournament.name}
            </h2>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Prize Pool', val: `₹${tournament.prize_money}`, icon: Trophy },
            { label: 'Entry Fee', val: `₹${tournament.join_fee}`, icon: ShieldCheck },
            { label: 'Version', val: tournament.version || '3.1', icon: Gamepad2 },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-2xl text-center">
              <item.icon className="w-4 h-4 text-luxury-gold mx-auto mb-1" />
              <p className="text-[10px] text-gray-500 font-bold uppercase">{item.label}</p>
              <p className="text-sm font-black text-white">{item.val}</p>
            </div>
          ))}
        </div>

        {/* Requirement 1.7: Luxury Slot Selection Grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Select Your Slot</h3>
            <span className="text-[10px] text-luxury-gold font-bold">{tournament.slots_total - occupiedSlots.length} Slots Available</span>
          </div>
          
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 bg-white/5 p-4 rounded-[2rem] border border-white/5 max-h-60 overflow-y-auto no-scrollbar">
            {Array.from({ length: tournament.slots_total }).map((_, i) => {
              const slotNum = i + 1
              const isOccupied = occupiedSlots.includes(slotNum)
              const isSelected = selectedSlot === slotNum

              return (
                <button
                  key={i}
                  disabled={isOccupied}
                  onClick={() => setSelectedSlot(slotNum)}
                  className={`h-10 rounded-lg text-[10px] font-black transition-all border
                    ${isOccupied ? 'bg-zinc-900 border-zinc-800 text-zinc-700 cursor-not-allowed' : 
                      isSelected ? 'bg-luxury-gold border-luxury-gold text-black scale-110 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 
                      'bg-white/5 border-white/5 text-gray-400 hover:border-luxury-gold/50'}`}
                >
                  {slotNum}
                </button>
              )
            })}
          </div>
        </div>

        {/* Form Details */}
        <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <Input 
            label="Game UID (In-Game ID)" 
            placeholder="Ex: 512344556" 
            value={gameUid} 
            onChange={e => setGameUid(e.target.value)}
          />
          
          {tournament.password && (
            <Input 
              type="password"
              label="Secret Match Password" 
              placeholder="Enter Access Key" 
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          )}

          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase">Wallet Balance</p>
              <p className="text-white font-black">₹{balance}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-black uppercase">Cost to Join</p>
              <p className="text-luxury-gold font-black">₹{tournament.join_fee}</p>
            </div>
          </div>

          <TouchButton 
            variant="luxury" 
            fullWidth 
            disabled={loading || !selectedSlot || balance < tournament.join_fee}
            onClick={handleJoin}
          >
            {balance < tournament.join_fee ? 'Insufficient Balance' : 
             !selectedSlot ? 'Select a Slot' : `Confirm Slot ${selectedSlot}`}
          </TouchButton>
        </div>
      </div>
    </Modal>
  )
                  }
