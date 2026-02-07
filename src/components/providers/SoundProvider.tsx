'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

const SoundContext = createContext<any>(null)

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>(null)
  const bgAudio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // 1. Load System Settings (Maintenance, Music, Logo)
    const fetchSettings = async () => {
      const { data } = await supabase.from('system_settings').select('*').eq('id', '1').single()
      setSettings(data)
      
      if (data?.bg_music_enabled) {
        bgAudio.current = new Audio('/sounds/bg.mp3')
        bgAudio.current.loop = true
        bgAudio.current.volume = 0.3
        bgAudio.current.play().catch(() => console.log("User interaction required for audio"))
      }
    }
    fetchSettings()
  }, [])

  // 2. Requirement: Har Tap par Click Sound
  const playClick = () => {
    const clickSnd = new Audio('/sounds/click.mp3')
    clickSnd.play().catch(() => {})
  }

  // 3. Requirement: Winner Popup Sound
  const playWin = () => {
    const winSnd = new Audio('/sounds/win.mp3')
    winSnd.play().catch(() => {})
  }

  return (
    <SoundContext.Provider value={{ playClick, playWin, settings }}>
      {children}
      {/* Click sound trigger for all buttons globally */}
      <style jsx global>{`
        button, a { cursor: pointer; }
      `}</style>
    </SoundContext.Provider>
  )
}

export const useAppSystem = () => useContext(SoundContext)

