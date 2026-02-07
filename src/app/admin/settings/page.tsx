'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Settings as SettingsIcon, Save, ShieldAlert, 
  MessageSquare, Volume2, Music, Image as ImageIcon, QrCode 
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user: admin, loading: authLoading } = useAuthStore()
  const [loading, setLoading] = useState(false)
  
  const [settings, setSettings] = useState({
    id: '1',
    maintenance_mode: false,
    chat_enabled: true,
    sound_enabled: true,
    music_enabled: false,
    app_logo: '',
    upi_id: '', // Requirement 2.2
    qr_url: ''  // Requirement 2.2
  })

  useEffect(() => {
    if (!authLoading && (!admin || !admin.isAdmin)) {
      router.push('/login')
    } else {
      loadSettings()
    }
  }, [admin, authLoading])

  const loadSettings = async () => {
    const { data } = await supabase.from('system_settings').select('*').single()
    if (data) setSettings(data)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('system_settings')
        .update(settings)
        .eq('id', settings.id)

      if (error) throw error
      toast.success('System parameters updated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-full touch-scale">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gold-gradient uppercase tracking-tighter">System Configuration</h1>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6 pb-20">
        
        {/* --- CRITICAL CONTROLS --- */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">App Status</h2>
          <div className="bg-[#111] border border-white/5 rounded-[2rem] p-2">
            <SettingToggle 
              icon={<ShieldAlert className="text-red-500" />}
              title="Maintenance Mode"
              desc="Lock all users out of the app"
              checked={settings.maintenance_mode}
              onChange={(v) => setSettings({...settings, maintenance_mode: v})}
              danger
            />
            <SettingToggle 
              icon={<MessageSquare className="text-blue-500" />}
              title="Global Chat"
              desc="Enable/Disable support chat"
              checked={settings.chat_enabled}
              onChange={(v) => setSettings({...settings, chat_enabled: v})}
            />
          </div>
        </section>

        {/* --- PAYMENT SETTINGS (Req 2.2) --- */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Payment Gateway (Manual)</h2>
          <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Admin UPI ID</label>
              <div className="relative">
                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold" size={18} />
                <input 
                  type="text"
                  value={settings.upi_id}
                  onChange={(e) => setSettings({...settings, upi_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-luxury-gold text-sm"
                  placeholder="e.g. admin@upi"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">QR Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold" size={18} />
                <input 
                  type="text"
                  value={settings.qr_url}
                  onChange={(e) => setSettings({...settings, qr_url: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-luxury-gold text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- EXPERIENCE --- */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">User Experience</h2>
          <div className="bg-[#111] border border-white/5 rounded-[2rem] p-2">
            <SettingToggle 
              icon={<Volume2 className="text-luxury-gold" />}
              title="UI Sound Effects"
              desc="Click and transition sounds"
              checked={settings.sound_enabled}
              onChange={(v) => setSettings({...settings, sound_enabled: v})}
            />
            <SettingToggle 
              icon={<Music className="text-purple-500" />}
              title="Lobby Music"
              desc="Atmospheric background music"
              checked={settings.music_enabled}
              onChange={(v) => setSettings({...settings, music_enabled: v})}
            />
          </div>
        </section>

        {/* --- SAVE BUTTON --- */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={loading}
          className="w-full py-5 bg-luxury-gold text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-gold-500/20 sticky bottom-6"
        >
          {loading ? 'Propagating Changes...' : 'Save Configuration'}
        </motion.button>

      </main>
    </div>
  )
}

function SettingToggle({ icon, title, desc, checked, onChange, danger }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] rounded-[1.5rem] transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-sm font-bold ${danger && checked ? 'text-red-500' : 'text-white'}`}>{title}</h3>
          <p className="text-[10px] text-gray-500 font-medium">{desc}</p>
        </div>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${checked ? (danger ? 'bg-red-500' : 'bg-luxury-gold') : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )
                  }
            
