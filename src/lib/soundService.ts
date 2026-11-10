/**
 * High-performance, zero-latency Web Audio API sound synthesizer
 * for tactile keyboard feedback during typing sessions.
 */

export type SoundProfile = 'mechanical' | 'soft' | 'bubble' | 'typewriter';

interface SoundSettings {
  enabled: boolean;
  volume: number; // 0 to 1
  profile: SoundProfile;
}

const STORAGE_KEY = 'typemaster_sound_settings';

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.35,
  profile: 'mechanical',
};

class SoundService {
  private ctx: AudioContext | null = null;
  private settings: SoundSettings = DEFAULT_SETTINGS;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  public getSettings(): SoundSettings {
    return { ...this.settings };
  }

  public isEnabled(): boolean {
    return this.settings.enabled;
  }

  public setEnabled(enabled: boolean) {
    this.settings.enabled = enabled;
    this.saveSettings();
  }

  public toggle(): boolean {
    this.settings.enabled = !this.settings.enabled;
    this.saveSettings();
    if (this.settings.enabled) {
      this.playCorrectKey();
    }
    return this.settings.enabled;
  }

  public setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  public setProfile(profile: SoundProfile) {
    this.settings.profile = profile;
    this.saveSettings();
    if (this.settings.enabled) {
      this.playCorrectKey();
    }
  }

  /**
   * Lazy-initializes AudioContext upon user gesture
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.ctx) {
      this.ctx = new AudioContextClass();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Pre-generates pinkish noise for mechanical switch transients
   */
  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
    const bufferSize = ctx.sampleRate * 0.05; // 50ms of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    this.noiseBuffer = buffer;
    return buffer;
  }

  /**
   * Plays subtle, tactile sound for a correct keypress
   */
  public playCorrectKey(isSpace = false) {
    if (!this.settings.enabled || this.settings.volume <= 0) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterVol = this.settings.volume;

      switch (this.settings.profile) {
        case 'mechanical':
          this.synthesizeMechanical(ctx, now, masterVol, isSpace);
          break;
        case 'soft':
          this.synthesizeSoft(ctx, now, masterVol, isSpace);
          break;
        case 'bubble':
          this.synthesizeBubble(ctx, now, masterVol, isSpace);
          break;
        case 'typewriter':
          this.synthesizeTypewriter(ctx, now, masterVol, isSpace);
          break;
      }
    } catch {
      // Ignore audio synthesis errors silently
    }
  }

  /**
   * Subtle mechanical switch with crisp tactile snap
   */
  private synthesizeMechanical(ctx: AudioContext, now: number, masterVol: number, isSpace: boolean) {
    const pitchMod = (Math.random() - 0.5) * 80;
    const baseFreq = isSpace ? 320 : 540 + pitchMod;

    // Transient noise click
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isSpace ? 1400 : 2200 + pitchMod * 2, now);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(masterVol * 0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + (isSpace ? 0.024 : 0.016));

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.03);

    // Resonant body tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.025);

    oscGain.gain.setValueAtTime(masterVol * 0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + (isSpace ? 0.035 : 0.025));

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Modern chiclet / soft laptop key tap
   */
  private synthesizeSoft(ctx: AudioContext, now: number, masterVol: number, isSpace: boolean) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freq = isSpace ? 280 : 420 + (Math.random() - 0.5) * 40;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.018);

    gain.gain.setValueAtTime(masterVol * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isSpace ? 0.025 : 0.018));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Soft organic droplet / bubble pop
   */
  private synthesizeBubble(ctx: AudioContext, now: number, masterVol: number, isSpace: boolean) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startFreq = isSpace ? 350 : 600 + Math.random() * 150;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.6, now + 0.02);

    gain.gain.setValueAtTime(masterVol * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Heavy mechanical typewriter strike
   */
  private synthesizeTypewriter(ctx: AudioContext, now: number, masterVol: number, isSpace: boolean) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    const freq = isSpace ? 180 : 320 + (Math.random() - 0.5) * 60;
    osc.frequency.setValueAtTime(freq, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);

    gain.gain.setValueAtTime(masterVol * 0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isSpace ? 0.04 : 0.028));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }
}

export const soundService = new SoundService();
