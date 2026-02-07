'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TouchButton } from '@/components/ui/TouchButton'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { 
  Trophy, 
  Calendar, 
  Users, 
  Lock, 
  Image as ImageIcon, 
  IndianRupee,
  ChevronLeft
} from 'lucide-react'

export default function NewTournamentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  
  // Form States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    entry_fee: '',
    winning_amount: '',
    total_slots: '48',
    match_time: '',
    passcode: ''
  })
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  // Requirement: Direct File Upload Logic
  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('banners')
      .upload(fileName, file)

    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let bannerUrl = ''
      if (bannerFile) {
        bannerUrl = await handleFileUpload(bannerFile)
      }

      const { error } = await supabase.from('tournaments').insert([{
        ...formData,
        entry_fee: parseFloat(formData.entry_fee),
        winning_amount: parseFloat(formData.winning_amount),
        total_slots: parseInt(formData.total_slots),
        is_private: isPrivate,
        banner_url: bannerUrl,
        status: 'upcoming'
      }])

      if (error) throw error
      toast.success('Tournament Created Successfully!')
      router.push('/admin/tournaments')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] p-4 sm:p-10 text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10 flex items-center gap-4">
        <TouchButton variant="secondary" className="!p-3" onClick={() => router.back()}>
          <ChevronLeft size={20} />
        </TouchButton>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Create Tournament</h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Setup match rules and prize pool</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: General Info */}
        <div className="space-y-6">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-[#D4AF37]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Basic Details</p>
            </div>
            
            <input 
              required type="text" placeholder="Tournament Title (e.g. Pro Scrims)"
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#D4AF37] transition-all"
              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
            />

            <textarea 
              rows={4} placeholder="Description & Rules..."
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee size={18} className="text-green-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Finance & Slots</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <input 
                required type="number" placeholder="Entry Fee"
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500"
                value={formData.entry_fee} onChange={(e) => setFormData({...formData, entry_fee: e.target.value})}
              />
              <input 
                required type="number" placeholder="Winning Prize"
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500"
                value={formData.winning_amount} onChange={(e) => setFormData({...formData, winning_amount: e.target.value})}
              />
            </div>
            <input 
              required type="number" placeholder="Total Slots (e.g. 48)"
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#D4AF37]"
              value={formData.total_slots} onChange={(e) => setFormData({...formData, total_slots: e.target.value})}
            />
          </div>
        </div>

        {/* Right Side: Media & Security */}
        <div className="space-y-6">
          {/* Requirement: Direct Image Upload Area */}
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon size={18} className="text-blue-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tournament Banner</p>
            </div>
            
            <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-[#D4AF37]/50 transition-all cursor-pointer overflow-hidden">
              {bannerFile ? (
                <div className="text-center">
                  <p className="text-xs font-bold text-[#D4AF37]">{bannerFile.name}</p>
                  <p className="text-[8px] text-zinc-500 mt-1">Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-40 group-hover:opacity-100 transition-all">
                  <Plus size={32} />
                  <p className="text-[10px] font-black uppercase mt-2">Upload Image</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-red-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Privacy Settings</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-12 h-6 rounded-full transition-all relative ${isPrivate ? 'bg-red-500' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPrivate ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {isPrivate && (
              <input 
                required type="text" placeholder="Set Passcode"
                className="w-full bg-red-500/5 border border-red-500/20 p-4 rounded-2xl outline-none focus:border-red-500 text-red-500 font-bold"
                value={formData.passcode} onChange={(e) => setFormData({...formData, passcode: e.target.value})}
              />
            )}

            <div className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-orange-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Schedule</p>
              </div>
              <input 
                required type="datetime-local"
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 text-sm"
                value={formData.match_time} onChange={(e) => setFormData({...formData, match_time: e.target.value})}
              />
            </div>
          </div>

          <TouchButton variant="luxury" fullWidth loading={loading} className="py-6">
            Lauch Tournament
          </TouchButton>
        </div>
      </form>
    </div>
  )
}

function Plus({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              }

