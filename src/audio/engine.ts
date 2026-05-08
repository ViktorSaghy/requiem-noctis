// AudioContext must be resumed inside a user-gesture handler on first call.

export type Mood = 'title' | 'exploration' | 'tension' | 'combat' | 'ending';

interface NoteSpec {
  freq: number;
  dur: number;
}

// Frequencies (Hz)
const N = {
  E2:    82.41,
  F2:    87.31,
  A3:   220.00,
  D4:   293.66,
  E4:   329.63,
  G4:   392.00,
  A4:   440.00,
  C5:   523.25,
  E5:   659.25,
  F5:   698.46,
  A5:   880.00,
  C6:  1046.50,
  E6:  1318.51,
  F6:  1396.91,
} as const;

// Masquerade: A C E F E — high triangle oscillator
const MASQUERADE: NoteSpec[] = [
  { freq: N.A5, dur: 0.35 },
  { freq: N.C6, dur: 0.35 },
  { freq: N.E6, dur: 0.35 },
  { freq: N.F6, dur: 0.35 },
  { freq: N.E6, dur: 0.70 },
];

// Beast: E→F semitone grind — low sawtooth
const BEAST: NoteSpec[] = [
  { freq: N.E2, dur: 0.6 },
  { freq: N.F2, dur: 0.6 },
];

// Mortal: pentatonic descent A G E D A — sine
const MORTAL: NoteSpec[] = [
  { freq: N.A4, dur: 0.5 },
  { freq: N.G4, dur: 0.5 },
  { freq: N.E4, dur: 0.5 },
  { freq: N.D4, dur: 0.5 },
  { freq: N.A3, dur: 1.0 },
];

// Pre-computed soft-knee distortion curve (k=100)
const DISTORTION_CURVE = (() => {
  const n = 256;
  const k = 100;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
  }
  return curve;
})();

class AudioEngineClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgGain: GainNode | null = null;
  private bgControlGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private sfxControlGain: GainNode | null = null;
  private musicBuffers: Map<string, AudioBuffer> = new Map();
  private bgSource: AudioBufferSourceNode | null = null;
  private nextBgSource: AudioBufferSourceNode | null = null;
  private fadeGain: GainNode | null = null;
  private nextFadeGain: GainNode | null = null;
  private musicLoading: Map<string, Promise<void>> = new Map();
  private currentMusicUrl: string | null = null;
  private nextMusicUrl: string | null = null;

  private musicUrls: Record<Mood, string> = {
    title: '/audio/velvet-hunger.mp3',
    exploration: '/audio/black-chapel-veil.mp3',
    tension: '/audio/black-chapel-veil.mp3',
    combat: '/audio/blackwater-alley-duel.mp3',
    ending: '/audio/velvet-hunger.mp3',
  };
  private moodGen = 0;
  private tensionPhase = 0;

  private _masterVol = 0.8;
  private _musicVol = 1.0;
  private _sfxVol = 1.0;
  private _musicEnabled = true;
  private _sfxEnabled = true;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._masterVol;
      this.masterGain.connect(this.ctx.destination);

      // Music chain: bgGain (animated by mood) → bgControlGain (user volume) → masterGain
      this.bgGain = this.ctx.createGain();
      this.bgGain.gain.value = 0;
      this.bgControlGain = this.ctx.createGain();
      this.bgControlGain.gain.value = this._musicEnabled ? this._musicVol : 0;
      this.bgGain.connect(this.bgControlGain);
      this.bgControlGain.connect(this.masterGain);

      // SFX chain: sfxGain → sfxControlGain (user volume) → masterGain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1.0;
      this.sfxControlGain = this.ctx.createGain();
      this.sfxControlGain.gain.value = this._sfxEnabled ? this._sfxVol : 0;
      this.sfxGain.connect(this.sfxControlGain);
      this.sfxControlGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private stopMusicLoop(): void {
    if (this.bgSource) {
      try {
        this.bgSource.stop();
      } catch {
        // ignore stop errors if already ended
      }
      this.bgSource.disconnect();
      this.bgSource = null;
    }
    if (this.nextBgSource) {
      try {
        this.nextBgSource.stop();
      } catch {
        // ignore stop errors if already ended
      }
      this.nextBgSource.disconnect();
      this.nextBgSource = null;
    }
    if (this.fadeGain) {
      this.fadeGain.disconnect();
      this.fadeGain = null;
    }
    if (this.nextFadeGain) {
      this.nextFadeGain.disconnect();
      this.nextFadeGain = null;
    }
  }

  private crossfadeToMusic(url: string): void {
    const buffer = this.musicBuffers.get(url);
    if (!buffer || this.currentMusicUrl === url) return;

    const ctx = this.getCtx();

    // Create next source
    const nextSource = ctx.createBufferSource();
    const nextGain = ctx.createGain();

    nextSource.buffer = buffer;
    nextSource.loop = true;
    nextGain.gain.value = 0;

    nextSource.connect(nextGain);
    nextGain.connect(this.bgGain!);

    nextSource.start();
    this.nextBgSource = nextSource;
    this.nextFadeGain = nextGain;
    this.nextMusicUrl = url;

    const now = ctx.currentTime;

    // Fade out current
    if (this.fadeGain) {
      this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now);
      this.fadeGain.gain.linearRampToValueAtTime(0, now + 3.0);
    }

    // Fade in next
    nextGain.gain.setValueAtTime(0, now);
    nextGain.gain.linearRampToValueAtTime(1, now + 3.0);

    // Clean up after fade
    setTimeout(() => {
      if (this.bgSource && this.bgSource !== this.nextBgSource) {
        try {
          this.bgSource.stop();
        } catch {
          // ignore
        }
        this.bgSource.disconnect();
      }
      if (this.fadeGain && this.fadeGain !== this.nextFadeGain) {
        this.fadeGain.disconnect();
      }

      this.bgSource = this.nextBgSource;
      this.fadeGain = this.nextFadeGain;
      this.currentMusicUrl = this.nextMusicUrl;

      this.nextBgSource = null;
      this.nextFadeGain = null;
      this.nextMusicUrl = null;
    }, 3000);
  }

  private async loadMusic(url: string): Promise<void> {
    if (this.musicBuffers.has(url)) return;
    if (this.musicLoading.has(url)) return this.musicLoading.get(url)!;

    const loading = fetch(url)
      .then(async response => {
        if (!response.ok) throw new Error(`Failed to load music: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await this.getCtx().decodeAudioData(arrayBuffer);
        this.musicBuffers.set(url, buffer);
        this.musicLoading.delete(url);
      })
      .catch(err => {
        console.warn('Audio music load failed:', err);
        this.musicLoading.delete(url);
      });

    this.musicLoading.set(url, loading);
    return loading;
  }

  unlock(): void {
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    // Preload all music tracks
    for (const url of Object.values(this.musicUrls)) {
      void this.loadMusic(url);
    }
  }

  applySettings(s: { masterVolume: number; musicVolume: number; sfxVolume: number; musicEnabled: boolean; sfxEnabled: boolean }): void {
    this._masterVol = s.masterVolume;
    this._musicVol = s.musicVolume;
    this._sfxVol = s.sfxVolume;
    this._musicEnabled = s.musicEnabled;
    this._sfxEnabled = s.sfxEnabled;
    if (this.masterGain) this.masterGain.gain.value = this._masterVol;
    if (this.bgControlGain) this.bgControlGain.gain.value = this._musicEnabled ? this._musicVol : 0;
    if (this.sfxControlGain) this.sfxControlGain.gain.value = this._sfxEnabled ? this._sfxVol : 0;
  }

  setMasterVolume(v: number): void {
    this._masterVol = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this._masterVol;
  }

  setMusicVolume(v: number): void {
    this._musicVol = Math.max(0, Math.min(1, v));
    if (this.bgControlGain) this.bgControlGain.gain.value = this._musicEnabled ? this._musicVol : 0;
  }

  setMusicEnabled(enabled: boolean): void {
    this._musicEnabled = enabled;
    if (this.bgControlGain) this.bgControlGain.gain.value = enabled ? this._musicVol : 0;
  }

  setSfxVolume(v: number): void {
    this._sfxVol = Math.max(0, Math.min(1, v));
    if (this.sfxControlGain) this.sfxControlGain.gain.value = this._sfxEnabled ? this._sfxVol : 0;
  }

  setSfxEnabled(enabled: boolean): void {
    this._sfxEnabled = enabled;
    if (this.sfxControlGain) this.sfxControlGain.gain.value = enabled ? this._sfxVol : 0;
  }

  private scheduleNote(
    type: OscillatorType,
    freq: number,
    start: number,
    duration: number,
    peak: number,
    dest: AudioNode,
  ): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    const attack  = Math.min(0.02, duration * 0.10);
    const release = Math.min(0.06, duration * 0.20);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.setValueAtTime(peak, start + duration - release);
    gain.gain.linearRampToValueAtTime(0, start + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(start);
    osc.stop(start + duration);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  private playMotif(
    notes: NoteSpec[],
    type: OscillatorType,
    startTime: number,
    peak: number,
    dest: AudioNode,
  ): number {
    let t = startTime;
    for (const n of notes) {
      this.scheduleNote(type, n.freq, t, n.dur, peak, dest);
      t += n.dur;
    }
    return t - startTime;
  }

  private noiseBuffer(duration: number): AudioBuffer {
    const ctx = this.getCtx();
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private playNoise(
    start: number,
    duration: number,
    peak: number,
    filterFreq: number,
    dest: AudioNode,
  ): void {
    const ctx = this.getCtx();
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start(start);
    src.stop(start + duration);
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  // ── Mood system ───────────────────────────────────────────────────────────

  setMood(mood: Mood): void {
    const ctx = this.getCtx();
    const gen = ++this.moodGen;
    this.tensionPhase = 0;

    const bg = this.bgGain!;
    const now = ctx.currentTime;
    bg.gain.cancelScheduledValues(now);
    bg.gain.setValueAtTime(bg.gain.value, now);
    bg.gain.linearRampToValueAtTime(0, now + 0.4);

    const target =
      mood === 'combat'  ? 0.50 :
      mood === 'ending'  ? 0.20 :
      mood === 'title'   ? 0.40 : 0.35;

    setTimeout(() => {
      if (gen !== this.moodGen) return;
      const t = ctx.currentTime;
      bg.gain.setValueAtTime(0, t);
      bg.gain.linearRampToValueAtTime(target, t + 0.5);

      const musicUrl = this.musicUrls[mood];
      if (this.musicBuffers.has(musicUrl)) {
        this.crossfadeToMusic(musicUrl);
      } else {
        void this.loadMusic(musicUrl).then(() => {
          if (gen === this.moodGen && this.musicBuffers.has(musicUrl)) {
            this.crossfadeToMusic(musicUrl);
          }
        });
        this.loopMood(mood, gen);
      }
    }, 450);
  }

  stopMood(): void {
    const ctx = this.getCtx();
    this.moodGen++;
    this.stopMusicLoop();
    const now = ctx.currentTime;
    const bg = this.bgGain!;
    bg.gain.cancelScheduledValues(now);
    bg.gain.setValueAtTime(bg.gain.value, now);
    bg.gain.linearRampToValueAtTime(0, now + 0.8);
  }

  private loopMood(mood: Mood, gen: number): void {
    if (gen !== this.moodGen) return;

    const ctx = this.getCtx();
    const bg = this.bgGain!;
    const start = ctx.currentTime + 0.05;
    let duration = 0;
    let gap = 0;

    switch (mood) {
      case 'exploration':
        duration = this.playMotif(MORTAL, 'sine', start, 1, bg);
        gap = 2.5;
        break;

      case 'tension':
        if (this.tensionPhase % 2 === 0) {
          duration = this.playMotif(MASQUERADE, 'triangle', start, 1, bg);
        } else {
          duration = this.playMotif(BEAST, 'sawtooth', start, 1, bg);
        }
        this.tensionPhase++;
        gap = 0.6;
        break;

      case 'combat':
        duration = this.playMotif(BEAST, 'sawtooth', start, 1, bg);
        gap = 0.2;
        break;

      case 'ending': {
        const slowMasquerade = MASQUERADE.map(n => ({ freq: n.freq, dur: n.dur * 2.5 }));
        duration = this.playMotif(slowMasquerade, 'triangle', start, 1, bg);
        gap = 4.0;
        break;
      }
    }

    setTimeout(() => this.loopMood(mood, gen), (duration + gap) * 1000);
  }

  // ── SFX ──────────────────────────────────────────────────────────────────

  diceRoll(): void {
    const ctx = this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;

    this.playNoise(now, 0.35, 0.4, 1500, dest);

    for (let i = 0; i < 5; i++) {
      const t = now + 0.04 + i * 0.055 + Math.random() * 0.015;
      this.scheduleNote('sine', 700 + Math.random() * 500, t, 0.03, 0.35, dest);
    }
  }

  success(): void {
    const ctx = this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    [N.E4, N.G4, N.A4, N.E5].forEach((freq, i) => {
      this.scheduleNote('sine', freq, now + i * 0.10, 0.15, 0.45, dest);
    });
  }

  failure(): void {
    const ctx = this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    // Descending diminished: A4 Eb4 C4 A3
    [N.A4, 311.13, 261.63, N.A3].forEach((freq, i) => {
      this.scheduleNote('sine', freq, now + i * 0.13, 0.22, 0.35, dest);
    });
  }

  bestialFailure(): void {
    const ctx = this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    const dur = 1.2;

    const osc = ctx.createOscillator();
    const dist = ctx.createWaveShaper();
    const gain = ctx.createGain();

    dist.curve = DISTORTION_CURVE;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(N.E2, now);
    osc.frequency.linearRampToValueAtTime(N.E2 * 0.65, now + dur);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(dist);
    dist.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
    osc.onended = () => { osc.disconnect(); dist.disconnect(); gain.disconnect(); };
  }

  buttonTap(): void {
    const ctx = this.getCtx();
    this.scheduleNote('sine', 1000, ctx.currentTime, 0.04, 0.2, this.sfxGain!);
  }

  sceneTransition(): void {
    const ctx = this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    const dur = 1.8;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(80, now + dur);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };

    this.playNoise(now, 1.0, 0.2, 3000, dest);
  }

  heartbeat(): void {
    const ctx = this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;

    // lub
    this.scheduleNote('sine', 60, now,        0.09, 0.7, dest);
    this.scheduleNote('sine', 80, now,        0.07, 0.3, dest);
    // dub (120 ms later, slightly softer)
    this.scheduleNote('sine', 55, now + 0.12, 0.08, 0.5, dest);
    this.scheduleNote('sine', 70, now + 0.12, 0.06, 0.2, dest);
  }

  doorCreak(): void {
    const ctx = this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    const dur = 1.8;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(320, now + 0.4);
    osc.frequency.linearRampToValueAtTime(240, now + 0.8);
    osc.frequency.linearRampToValueAtTime(410, now + 1.2);
    osc.frequency.linearRampToValueAtTime(280, now + dur);

    filter.type = 'bandpass';
    filter.frequency.value = 700;
    filter.Q.value = 8;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
    gain.gain.setValueAtTime(0.25, now + 1.5);
    gain.gain.linearRampToValueAtTime(0, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
    osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };

    this.playNoise(now, dur, 0.08, 600, dest);
  }
}

export const Audio = new AudioEngineClass();
