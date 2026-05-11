import { Audio } from '../audio';
import type { AppSettings } from '../engine/settings';
import { saveSettings } from '../engine/settings';
import { useT } from '../engine/i18n';

interface Props {
  settings: AppSettings;
  onChange: (s: AppSettings) => void;
  onBack: () => void;
  onCredits: () => void;
}

export function SettingsPanel({ settings, onChange, onBack, onCredits }: Props) {
  const t = useT();

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
        <button className="btn btn-ghost btn-sm" onClick={onBack}>{t('back')}</button>
        <div className="settings-title">{t('settings.title')}</div>
      </div>

      <div className="settings-body">
        <div className="settings-section">
          <div className="settings-section-label">{t('settings.language')}</div>
          <div className="settings-row">
            <button
              className={`toggle-btn ${settings.language === 'en' ? 'on' : 'off'}`}
              onClick={() => update({ language: 'en' })}
            >
              English
            </button>
            <button
              className={`toggle-btn ${settings.language === 'hu' ? 'on' : 'off'}`}
              onClick={() => update({ language: 'hu' })}
            >
              Magyar
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">{t('settings.audio')}</div>

          <div className="settings-row">
            <span className="settings-row-label">{t('settings.music')}</span>
            <button
              className={`toggle-btn ${settings.musicEnabled ? 'on' : 'off'}`}
              onClick={() => update({ musicEnabled: !settings.musicEnabled })}
            >
              {settings.musicEnabled ? t('on') : t('off')}
            </button>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">{t('settings.sfx')}</span>
            <button
              className={`toggle-btn ${settings.sfxEnabled ? 'on' : 'off'}`}
              onClick={() => update({ sfxEnabled: !settings.sfxEnabled })}
            >
              {settings.sfxEnabled ? t('on') : t('off')}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">{t('settings.volume')}</div>

          <div className="settings-row settings-row-slider">
            <span className="settings-row-label">{t('settings.master')}</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.masterVolume}
              onChange={e => update({ masterVolume: Number(e.target.value) })}
              className="vol-slider"
            />
            <span className="vol-value">{Math.round(settings.masterVolume * 100)}%</span>
          </div>

          <div className="settings-row settings-row-slider">
            <span className="settings-row-label">{t('settings.music')}</span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.musicVolume}
              onChange={e => update({ musicVolume: Number(e.target.value) })}
              className="vol-slider"
            />
            <span className="vol-value">{Math.round(settings.musicVolume * 100)}%</span>
          </div>

          <div className="settings-row settings-row-slider">
            <span className="settings-row-label">{t('settings.effects')}</span>
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
          <div className="settings-section-label">{t('settings.developer')}</div>
          <div className="settings-row">
            <span className="settings-row-label">{t('settings.devMode')}</span>
            <button
              className={`toggle-btn ${settings.devMode ? 'on' : 'off'}`}
              onClick={() => update({ devMode: !settings.devMode })}
            >
              {settings.devMode ? t('on') : t('off')}
            </button>
          </div>
          {settings.devMode && (
            <p className="settings-dev-note">
              {t('settings.devNote')}
            </p>
          )}
        </div>

        <div className="settings-section">
          <button className="btn btn-primary btn-full" onClick={onCredits}>
            {t('settings.credits')}
          </button>
        </div>
      </div>
    </div>
  );
}
