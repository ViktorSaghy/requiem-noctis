import { Audio } from '../audio';
import type { AppSettings } from '../engine/settings';
import { saveSettings } from '../engine/settings';

interface Props {
  settings: AppSettings;
  onChange: (s: AppSettings) => void;
  onBack: () => void;
  onCredits: () => void;
}

export function SettingsPanel({ settings, onChange, onBack, onCredits }: Props) {
  function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch };
    onChange(next);
    saveSettings(next);
    if ('masterVolume' in patch) Audio.setMasterVolume(next.masterVolume);
    if ('musicEnabled' in patch) Audio.setMusicEnabled(next.musicEnabled);
    if ('musicVolume' in patch) Audio.setMusicVolume(next.musicVolume);
    if ('sfxEnabled' in patch) Audio.setSfxEnabled(next.sfxEnabled);
    if ('sfxVolume' in patch) Audio.setSfxVolume(next.sfxVolume);
  }

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <div className="settings-title">Settings</div>
      </div>

      <div className="settings-body">
        <div className="settings-section">
          <div className="settings-section-label">Audio</div>

          <div className="settings-row">
            <span className="settings-row-label">Music</span>
            <button
              className={`toggle-btn ${settings.musicEnabled ? 'on' : 'off'}`}
              onClick={() => update({ musicEnabled: !settings.musicEnabled })}
            >
              {settings.musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Sound Effects</span>
            <button
              className={`toggle-btn ${settings.sfxEnabled ? 'on' : 'off'}`}
              onClick={() => update({ sfxEnabled: !settings.sfxEnabled })}
            >
              {settings.sfxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">Volume</div>

          <div className="settings-row settings-row-slider">
            <span className="settings-row-label">Master</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.masterVolume}
              onChange={e => update({ masterVolume: Number(e.target.value) })}
              className="vol-slider"
            />
            <span className="vol-value">{Math.round(settings.masterVolume * 100)}%</span>
          </div>

          <div className="settings-row settings-row-slider">
            <span className="settings-row-label">Music</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.musicVolume}
              onChange={e => update({ musicVolume: Number(e.target.value) })}
              className="vol-slider"
            />
            <span className="vol-value">{Math.round(settings.musicVolume * 100)}%</span>
          </div>

          <div className="settings-row settings-row-slider">
            <span className="settings-row-label">Effects</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.sfxVolume}
              onChange={e => update({ sfxVolume: Number(e.target.value) })}
              className="vol-slider"
            />
            <span className="vol-value">{Math.round(settings.sfxVolume * 100)}%</span>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">Developer</div>
          <div className="settings-row">
            <span className="settings-row-label">Dev Mode</span>
            <button
              className={`toggle-btn ${settings.devMode ? 'on' : 'off'}`}
              onClick={() => update({ devMode: !settings.devMode })}
            >
              {settings.devMode ? 'ON' : 'OFF'}
            </button>
          </div>
          {settings.devMode && (
            <p className="settings-dev-note">
              Scene IDs and active flags are visible in the Story tab.
            </p>
          )}
        </div>

        <div className="settings-section">
          <button className="btn btn-primary btn-full" onClick={onCredits}>
            Credits
          </button>
        </div>
      </div>
    </div>
  );
}
