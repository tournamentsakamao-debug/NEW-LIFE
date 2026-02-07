'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings as SettingsIcon, Volume2, VolumeX, Music, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase, type SystemSettings } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    checkAuth();
    fetchSettings();
    fetchAdminUpiId();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const fetchAdminUpiId = async () => {
    try {
      const { data } = await supabase
        .from('admin_wallet')
        .select('upi_id')
        .single();

      setUpiId(data?.upi_id || '');
    } catch (error) {
      console.error('Error fetching admin UPI:', error);
    }
  };

  const updateSetting = async (key: keyof SystemSettings, value: any) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('system_settings')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('id', settings!.id);

      if (error) throw error;

      setSettings({ ...settings!, [key]: value });
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const updateAdminUpiId = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('admin_wallet')
        .update({ upi_id: upiId })
        .eq('id', (await supabase.from('admin_wallet').select('id').single()).data?.id);

      if (error) throw error;

      toast.success('Admin UPI ID updated successfully');
    } catch (error) {
      console.error('Error updating UPI ID:', error);
      toast.error('Failed to update UPI ID');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            System Settings
          </h1>
        </div>

        {/* Maintenance Mode */}
        <Card className="border-2 border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Maintenance Mode</h3>
                <p className="text-sm text-gray-400">
                  When enabled, only admins can login. Blocks all user access.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {settings.maintenance_mode ? 'ON' : 'OFF'}
              </span>
              <button
                onClick={() => updateSetting('maintenance_mode', !settings.maintenance_mode)}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.maintenance_mode ? 'bg-yellow-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.maintenance_mode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Chat Settings */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Chat Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-semibold text-white">Global Chat</p>
                <p className="text-sm text-gray-400">Enable/disable chat for all users</p>
              </div>
              <button
                onClick={() => updateSetting('chat_enabled', !settings.chat_enabled)}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.chat_enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.chat_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Sound Settings */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Sound Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Click Sounds</p>
                  <p className="text-sm text-gray-400">Button tap sound effects</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('sound_enabled', !settings.sound_enabled)}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.sound_enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.sound_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">Background Music</p>
                  <p className="text-sm text-gray-400">App background music loop</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('bg_music_enabled', !settings.bg_music_enabled)}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.bg_music_enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.bg_music_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <Input
              label="Admin UPI ID"
              placeholder="admin@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <Button
              variant="success"
              onClick={updateAdminUpiId}
              loading={saving}
              disabled={!upiId}
            >
              Update UPI ID
            </Button>
          </div>
        </Card>

        {/* App Branding */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">App Branding</h3>
          <div className="space-y-4">
            <Input
              label="App Logo URL"
              placeholder="https://example.com/logo.png"
              value={settings.app_logo || ''}
              onChange={(e) => updateSetting('app_logo', e.target.value)}
            />
            <p className="text-sm text-gray-400">
              Current logo is stored in <code className="bg-white/10 px-2 py-1 rounded">/public/branding/logo.png</code>
            </p>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/20 border border-blue-500/50">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> Changes to sound and maintenance mode take effect immediately for all users.
            Users may need to refresh their browser to see some changes.
          </p>
        </Card>
      </div>
    </div>
