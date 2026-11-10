import { useState, useEffect, useCallback } from 'react';
import { soundService, SoundProfile } from '../lib/soundService.ts';

export function useSound() {
  const [settings, setSettings] = useState(() => soundService.getSettings());

  useEffect(() => {
    setSettings(soundService.getSettings());
  }, []);

  const toggleSound = useCallback(() => {
    soundService.toggle();
    setSettings(soundService.getSettings());
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundService.setEnabled(enabled);
    setSettings(soundService.getSettings());
  }, []);

  const setVolume = useCallback((volume: number) => {
    soundService.setVolume(volume);
    setSettings(soundService.getSettings());
  }, []);

  const setProfile = useCallback((profile: SoundProfile) => {
    soundService.setProfile(profile);
    setSettings(soundService.getSettings());
  }, []);

  const playCorrectKey = useCallback((isSpace = false) => {
    soundService.playCorrectKey(isSpace);
  }, []);

  return {
    soundEnabled: settings.enabled,
    soundVolume: settings.volume,
    soundProfile: settings.profile,
    toggleSound,
    setSoundEnabled,
    setVolume,
    setProfile,
    playCorrectKey,
  };
}
