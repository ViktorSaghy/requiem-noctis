export interface AppSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  devMode: boolean;
}

const KEY = 'requiem_noctis_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  masterVolume: 0.8,
  musicVolume: 1.0,
  sfxVolume: 1.0,
  devMode: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
