import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Settings2, Check, Sparkles } from 'lucide-react';
import { useSound } from '../../hooks/useSound.ts';
import { SoundProfile } from '../../lib/soundService.ts';

interface SoundControlProps {
  compact?: boolean;
}

const SOUND_PROFILES: { id: SoundProfile; name: string; icon: string; desc: string }[] = [
  { id: 'mechanical', name: 'Mechanical', icon: '⌨️', desc: 'Tactile switch click' },
  { id: 'soft', name: 'Soft Tap', icon: '💻', desc: 'Subtle laptop chiclet' },
  { id: 'bubble', name: 'Bubble Pop', icon: '🫧', desc: 'Soft organic droplet' },
  { id: 'typewriter', name: 'Typewriter', icon: '📜', desc: 'Vintage mechanical thud' },
];

export const SoundControl: React.FC<SoundControlProps> = ({ compact = false }) => {
  const {
    soundEnabled,
    soundVolume,
    soundProfile,
    toggleSound,
    setVolume,
    setProfile,
    playCorrectKey,
  } = useSound();

  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleTestSound = (profile: SoundProfile) => {
    setProfile(profile);
    playCorrectKey(false);
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Quick Sound Toggle & Menu Opener Button */}
      <div className="flex items-center rounded-lg bg-[#0D0F14] border border-[#2A3447] p-0.5 shadow-sm">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSound();
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#161B27]'
          }`}
          title={soundEnabled ? 'Click to Mute typing audio feedback' : 'Click to Enable typing audio feedback'}
          aria-label={soundEnabled ? 'Mute typing sound' : 'Enable typing sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[#8892A4]" />
          )}
          {!compact && (
            <span className="text-[11px] font-mono">
              {soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </span>
          )}
        </button>

        {/* Settings gear to open options popover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className={`p-1 rounded-md text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#1E2535] transition-colors cursor-pointer ${
            menuOpen ? 'text-cyan-400 bg-[#1E2535]' : ''
          }`}
          title="Sound settings (Volume & Sound Profile)"
          aria-label="Sound settings"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popover Menu */}
      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#161B27] border border-[#2A3447] p-3.5 shadow-2xl z-50 text-xs space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#2A3447] pb-2">
            <span className="font-bold text-[#E8EBF0] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Tactile Sound Feedback
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">
              {soundEnabled ? `${Math.round(soundVolume * 100)}%` : 'MUTED'}
            </span>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[#8892A4] text-xs">Play Sound on Keypress</span>
            <button
              type="button"
              onClick={toggleSound}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-cyan-500' : 'bg-[#2A3447]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                  soundEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-[#8892A4]">
              <span>Volume</span>
              <span>{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={soundVolume}
              disabled={!soundEnabled}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#0D0F14] rounded-lg"
            />
          </div>

          {/* Sound Profiles */}
          <div className="space-y-1 pt-1 border-t border-[#2A3447]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8892A4] block mb-1">
              Sound Style
            </span>
            <div className="space-y-1">
              {SOUND_PROFILES.map((p) => {
                const isSelected = soundProfile === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleTestSound(p.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                        : 'hover:bg-[#1E2535] text-[#8892A4] hover:text-[#E8EBF0]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{p.icon}</span>
                      <div>
                        <div className="font-semibold text-xs leading-none">{p.name}</div>
                        <div className="text-[10px] text-[#64748B] mt-0.5">{p.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
