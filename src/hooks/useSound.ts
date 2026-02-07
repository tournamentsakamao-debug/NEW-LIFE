'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(true);
  
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const bgMusic = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize sounds
    clickSound.current = new Audio('/sounds/click.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    bgMusic.current = new Audio('/sounds/bg.mp3');
    
    if (bgMusic.current) {
      bgMusic.current.loop = true;
      bgMusic.current.volume = 0.3;
    }

    // Fetch settings from database
    fetchSettings();

    return () => {
      if (bgMusic.current) {
        bgMusic.current.pause();
      }
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('sound_enabled, bg_music_enabled')
        .single();

      if (error) throw error;

      setSoundEnabled(data?.sound_enabled ?? true);
      setBgMusicEnabled(data?.bg_music_enabled ?? true);

      // Start bg music if enabled
      if (data?.bg_music_enabled && bgMusic.current) {
        bgMusic.current.play().catch(() => {
          // Auto-play blocked, will play on user interaction
        });
      }
    } catch (error) {
      console.error('Error fetching sound settings:', error);
    }
  };

  const playClick = () => {
    if (soundEnabled && clickSound.current) {
      clickSound.current.currentTime = 0;
      clickSound.current.play().catch(() => {});
    }
  };

  const playWin = () => {
    if (soundEnabled && winSound.current) {
      winSound.current.currentTime = 0;
      winSound.current.play().catch(() => {});
    }
  };

  const toggleBgMusic = () => {
    if (bgMusic.current) {
      if (bgMusic.current.paused) {
        bgMusic.current.play().catch(() => {});
      } else {
        bgMusic.current.pause();
      }
    }
  };

  return {
    soundEnabled,
    bgMusicEnabled,
    playClick,
    playWin,
    toggleBgMusic,
  };
}
