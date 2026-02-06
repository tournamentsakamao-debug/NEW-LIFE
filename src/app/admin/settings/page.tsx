'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase, SystemSettings } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { TouchButton } from '@/components/ui/TouchButton'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Settings as SettingsIcon, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    id: '1',
    maintenance_mode: false,
    chat_enabled: true,
    appointment_only_chat: false,
    sound_enabled: true,
    background_music_enabled: false,
    app_logo: ''
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    } else if (user) {
      loadSettings()
    }
  }, [user, authLoading, router])

  const loadSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('*')
      .single()

    if (data) {
      setSettings(data)
    } else {
      // Create default settings
      const { data: newSettings } = await supabase
        .from('system_settings')
        .insert([{
          maintenance_mode: false,
          chat_enabled: true,
          appointment_only_chat: false,
          sound_enabled: true,
          background_music_enabled: false
        }])
        .select()
        .single()

      if (newSettings) {
        setSettings(newSettings)
      }
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('system_settings')
        .update(settings)
        .eq('id', settings.id)

      if (error) throw error

      toast.success('Settings saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
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
            <h1 className="text-2xl font-bold text-white">System Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {/* Maintenance Mode */}
          <Card>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-luxury-gold" />
              Maintenance Mode
            </h3>
            <div className="flex items-center justify-between p-4 bg-luxury-lightGray rounded-lg">
              <div>
                <p className="text-white font-medium">Enable Maintenance Mode</p>
                <p className="text-gray-400 text-sm">Temporarily disable the entire app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-luxury-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
              </label>
            </div>
            {settings.maintenance_mode && (
              <div className="mt-3 p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
                <p className="text-red-400 text-sm">⚠️ App is currently in maintenance mode. Users cannot access the platform.</p>
              </div>
            )}
          </Card>

          {/* Chat Settings */}
          <Card>
            <h3 className="text-white font-bold mb-4">Chat Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-luxury-lightGray rounded-lg">
                <div>
                  <p className="text-white font-medium">Enable Chat</p>
                  <p className="text-gray-400 text-sm">Allow users to chat with admin</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.chat_enabled}
                    onChange={(e) => setSettings({ ...settings, chat_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-luxury-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-luxury-lightGray rounded-lg">
                <div>
                  <p className="text-white font-medium">Appointment Only</p>
                  <p className="text-gray-400 text-sm">Only selected users can chat</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.appointment_only_chat}
                    onChange={(e) => setSettings({ ...settings, appointment_only_chat: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-luxury-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* App Customization */}
          <Card>
            <h3 className="text-white font-bold mb-4">App Customization</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-luxury-lightGray rounded-lg">
                <div>
                  <p className="text-white font-medium">Touch Sound</p>
                  <p className="text-gray-400 text-sm">Enable click sound effects</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sound_enabled}
                    onChange={(e) => setSettings({ ...settings, sound_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-luxury-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-luxury-lightGray rounded-lg">
                <div>
                  <p className="text-white font-medium">Background Music</p>
                  <p className="text-gray-400 text-sm">Play background music in app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.background_music_enabled}
                    onChange={(e) => setSettings({ ...settings, background_music_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-luxury-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                </label>
              </div>

              <Input
                label="App Logo URL (Optional)"
                type="url"
                placeholder="https://example.com/logo.png"
                value={settings.app_logo || ''}
                onChange={(e) => setSettings({ ...settings, app_logo: e.target.value })}
              />
            </div>
          </Card>

          {/* Save Button */}
          <TouchButton
            variant="luxury"
            className="w-full"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </TouchButton>
        </div>
      </main>
    </div>
  )
      }
