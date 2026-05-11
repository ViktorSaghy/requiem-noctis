// AudioContext must be resumed inside a user-gesture handler on first call.

export type Mood = 'title' | 'exploration' | 'tension' | 'combat' | 'ending';

// Frequency constants used by SFX only
const N = {
  E2:  82.41,
  A3: 220.00,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
  A4: 440.00,
  E5: 659.25,
} as const;

// Pre-computed soft-knee distortion curve (k=100) — bestialFailure SFX
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

const DEV = import.meta.env.DEV;

function audioLog(msg: string, ...extra: unknown[]): void {
  if (DEV) console.log(`[Audio] ${msg}`, ...extra);
}

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

  // Monotonically incremented on every setMood/stopAll call.
  // Any async continuation that sees a stale gen bails out immediately,
  // which is how we prevent ghost oscillator loops and stale crossfades.
  private moodGen = 0;

  private musicUrls: Record<Mood, string> = {
    title:       '/audio/velvet-hunger.mp3',
    exploration: '/audio/crimson-cathedral-loop.mp3',
    tension:     '/audio/black-chapel-veil.mp3',
    combat:      '/audio/blackwater-alley-duel.mp3',
    ending:      '/audio/velvet-hunger.mp3',
  };

  private _masterVol = 0.8;
  private _musicVol = 1.0;
  private _sfxVol = 1.0;
  private _musicEnabled = true;
  private _sfxEnabled = true;

  // ── AudioContext lifecycle ────────────────────────────────────────────────

  private async getCtx(): Promise<AudioContext> {
    if (!this.ctx) {
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._masterVol;
      this.masterGain.connect(this.ctx.destination);

      // Music chain: bgGain (animated per mood) → bgControlGain (user vol) → masterGain
      this.bgGain = this.ctx.createGain();
      this.bgGain.gain.value = 0;
      this.bgControlGain = this.ctx.createGain();
      this.bgControlGain.gain.value = this._musicEnabled ? this._musicVol : 0;
      this.bgGain.connect(this.bgControlGain);
      this.bgControlGain.connect(this.masterGain);

      // SFX chain: sfxGain → sfxControlGain (user vol) → masterGain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1.0;
      this.sfxControlGain = this.ctx.createGain();
      this.sfxControlGain.gain.value = this._sfxEnabled ? this._sfxVol : 0;
      this.sfxGain.connect(this.sfxControlGain);
      this.sfxControlGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  // ── Source management ────────────────────────────────────────────────────

  private stopMusicLoop(): void {
    if (this.bgSource) {
      try { this.bgSource.stop(); } catch { /* already ended */ }
      this.bgSource.disconnect();
      this.bgSource = null;
      audioLog('bgSource stopped and disconnected');
    }
    if (this.nextBgSource) {
      try { this.nextBgSource.stop(); } catch { /* already ended */ }
      this.nextBgSource.disconnect();
      this.nextBgSource = null;
    }
    if (this.fadeGain) { this.fadeGain.disconnect(); this.fadeGain = null; }
    if (this.nextFadeGain) { this.nextFadeGain.disconnect(); this.nextFadeGain = null; }
    this.currentMusicUrl = null;
    this.nextMusicUrl = null;
  }

  // Hard stop: kills all playing sources and pending crossfades immediately.
  // Call before starting a new game so no remnants from the previous session bleed through.
  stopAll(): void {
    const prevGen = this.moodGen;
    this.moodGen++;                 // invalidates any queued setMood timeouts
    this.stopMusicLoop();
    if (this.bgGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.bgGain.gain.cancelScheduledValues(now);
      this.bgGain.gain.setValueAtTime(0, now);
    }
    audioLog(`stopAll (gen ${prevGen} → ${this.moodGen})`);
  }

  private async crossfadeToMusic(url: string, gen: number): Promise<void> {
    const buffer = this.musicBuffers.get(url);
    if (!buffer) return;
    if (this.currentMusicUrl === url) return;     // already playing
    if (gen !== this.moodGen) {
      audioLog(`crossfade aborted — gen stale (${gen} vs ${this.moodGen})`);
      return;
    }

    const ctx = await this.getCtx();

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

    audioLog(`crossfade start → ${url}`);

    const now = ctx.currentTime;

    // Fade out current source (if any)
    if (this.fadeGain) {
      this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now);
      this.fadeGain.gain.linearRampToValueAtTime(0, now + 1.5);
    }

    // Fade in next source
    nextGain.gain.setValueAtTime(0, now);
    nextGain.gain.linearRampToValueAtTime(1, now + 1.5);

    // Clean up old source after fade completes
    setTimeout(() => {
      if (this.bgSource && this.bgSource !== this.nextBgSource) {
        try { this.bgSource.stop(); } catch { /* ignore */ }
        this.bgSource.disconnect();
        audioLog(`crossfade cleanup — old source for ${this.currentMusicUrl} disposed`);
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
      audioLog(`crossfade complete — now playing ${this.currentMusicUrl}`);
    }, 3000);
  }

  private async loadMusic(url: string): Promise<void> {
    if (this.musicBuffers.has(url)) return;
    if (this.musicLoading.has(url)) return this.musicLoading.get(url)!;

    audioLog(`loading ${url}…`);
    const loading = fetch(url)
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const ctx = await this.getCtx();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        this.musicBuffers.set(url, buffer);
        this.musicLoading.delete(url);
        audioLog(`loaded ${url}`);
      })
      .catch(err => {
        console.warn('[Audio] failed to load', url, err);
        this.musicLoading.delete(url);
      });

    this.musicLoading.set(url, loading);
    return loading;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  // Must be called inside a user-gesture handler (button click, tap).
  // On iOS the AudioContext stays suspended until a gesture; this resumes it
  // and pre-caches all music so tracks start instantly when setMood is called.
  async unlock(): Promise<boolean> {
    const ctx = await this.getCtx();
    for (const url of Object.values(this.musicUrls)) {
      void this.loadMusic(url);
    }
    audioLog(`unlocked (state=${ctx.state}), pre-loading all tracks`);
    return ctx.state === 'running';
  }

  applySettings(s: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    musicEnabled: boolean;
    sfxEnabled: boolean;
  }): void {
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
    audioLog(`music ${enabled ? 'enabled' : 'muted'}`);
  }

  setSfxVolume(v: number): void {
    this._sfxVol = Math.max(0, Math.min(1, v));
    if (this.sfxControlGain) this.sfxControlGain.gain.value = this._sfxEnabled ? this._sfxVol : 0;
  }

  setSfxEnabled(enabled: boolean): void {
    this._sfxEnabled = enabled;
    if (this.sfxControlGain) this.sfxControlGain.gain.value = enabled ? this._sfxVol : 0;
    audioLog(`sfx ${enabled ? 'enabled' : 'muted'}`);
  }

  // ── Mood system ───────────────────────────────────────────────────────────

  setMood(mood: Mood): void {
    void this.getCtx().then(ctx => {
      const gen = ++this.moodGen;
      const bg = this.bgGain!;
      const now = ctx.currentTime;

      audioLog(`setMood('${mood}') gen=${gen}`);

      // Brief dip to zero before crossfading in (prevents abrupt track switch)
      bg.gain.cancelScheduledValues(now);
      bg.gain.setValueAtTime(bg.gain.value, now);
      bg.gain.linearRampToValueAtTime(0, now + 0.4);

      const target =
        mood === 'combat' ? 0.50 :
        mood === 'ending' ? 0.20 :
        mood === 'title'  ? 0.40 : 0.35;

      setTimeout(async () => {
        if (gen !== this.moodGen) return;    // a newer setMood won the race

        const t = ctx.currentTime;
        bg.gain.setValueAtTime(0, t);
        bg.gain.linearRampToValueAtTime(target, t + 0.5);

        const musicUrl = this.musicUrls[mood];
        if (this.musicBuffers.has(musicUrl)) {
          await this.crossfadeToMusic(musicUrl, gen);
        } else {
          // Track not cached yet. Load silently; start playing once ready.
          // No procedural oscillator fallback — we wait for the real file.
          audioLog(`${musicUrl} not cached yet, waiting for load…`);
          void this.loadMusic(musicUrl).then(async () => {
            if (gen === this.moodGen) {
              audioLog(`late-start ${musicUrl} (gen=${gen})`);
              await this.crossfadeToMusic(musicUrl, gen);
            } else {
              audioLog(`late-load discarded — gen stale (${gen} vs ${this.moodGen})`);
            }
          });
        }
      }, 450);
    });
  }

  async stopMood(): Promise<void> {
    const ctx = await this.getCtx();
    this.moodGen++;
    this.stopMusicLoop();
    const now = ctx.currentTime;
    const bg = this.bgGain!;
    bg.gain.cancelScheduledValues(now);
    bg.gain.setValueAtTime(bg.gain.value, now);
    bg.gain.linearRampToValueAtTime(0, now + 0.8);
    audioLog('stopMood');
  }

  // ── SFX ──────────────────────────────────────────────────────────────────

  private async scheduleNote(
    type: OscillatorType,
    freq: number,
    start: number,
    duration: number,
    peak: number,
    dest: AudioNode,
  ): Promise<void> {
    const ctx = await this.getCtx();
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

  private async noiseBuffer(duration: number): Promise<AudioBuffer> {
    const ctx = await this.getCtx();
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private async playNoise(
    start: number,
    duration: number,
    peak: number,
    filterFreq: number,
    dest: AudioNode,
  ): Promise<void> {
    const ctx = await this.getCtx();
    const src = ctx.createBufferSource();
    src.buffer = await this.noiseBuffer(duration);
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

  async diceRoll(): Promise<void> {
    const ctx = await this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    await this.playNoise(now, 0.35, 0.4, 1500, dest);
    for (let i = 0; i < 5; i++) {
      const t = now + 0.04 + i * 0.055 + Math.random() * 0.015;
      await this.scheduleNote('sine', 700 + Math.random() * 500, t, 0.03, 0.35, dest);
    }
  }

  async success(): Promise<void> {
    const ctx = await this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    for (const [i, freq] of [N.E4, N.G4, N.A4, N.E5].entries()) {
      await this.scheduleNote('sine', freq, now + i * 0.10, 0.15, 0.45, dest);
    }
  }

  async failure(): Promise<void> {
    const ctx = await this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    for (const [i, freq] of [N.A4, 311.13, 261.63, N.A3].entries()) {
      await this.scheduleNote('sine', freq, now + i * 0.13, 0.22, 0.35, dest);
    }
  }

  async bestialFailure(): Promise<void> {
    const ctx = await this.getCtx();
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

  async buttonTap(): Promise<void> {
    const ctx = await this.getCtx();
    await this.scheduleNote('sine', 1000, ctx.currentTime, 0.04, 0.2, this.sfxGain!);
  }

  async sceneTransition(): Promise<void> {
    const ctx = await this.getCtx();
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
    await this.playNoise(now, 1.0, 0.2, 3000, dest);
  }

  async heartbeat(): Promise<void> {
    const ctx = await this.getCtx();
    const dest = this.sfxGain!;
    const now = ctx.currentTime;
    await this.scheduleNote('sine', 60, now,        0.09, 0.7, dest);
    await this.scheduleNote('sine', 80, now,        0.07, 0.3, dest);
    await this.scheduleNote('sine', 55, now + 0.12, 0.08, 0.5, dest);
    await this.scheduleNote('sine', 70, now + 0.12, 0.06, 0.2, dest);
  }

  async doorCreak(): Promise<void> {
    const ctx = await this.getCtx();
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
    await this.playNoise(now, dur, 0.08, 600, dest);
  }
}

export const Audio = new AudioEngineClass();
