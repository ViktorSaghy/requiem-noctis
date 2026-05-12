import { useState, useEffect } from 'react';
import { listSaves } from '../engine';
import type { SaveSlot } from '../engine';
import { useT } from '../engine/i18n';
import { Audio } from '../audio';

interface Props {
  onLoadSlot: (slot: string) => Promise<boolean>;
  onRetry: () => void;
  onBackToTitle: () => void;
}

export function DeathScreen({ onLoadSlot, onRetry, onBackToTitle }: Props) {
  const t = useT();
  const [saves, setSaves] = useState<Record<string, SaveSlot>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listSaves().then(setSaves);
    Audio.setMood('ending');
  }, []);

  const SLOTS = [
    { id: 'slot1', label: t('game.menu.slot1') },
    { id: 'slot2', label: t('game.menu.slot2') },
    { id: 'slot3', label: t('game.menu.slot3') },
  ];

  async function handleLoad(slot: string) {
    setBusy(true);
    await onLoadSlot(slot);
    setBusy(false);
  }

  return (
    <div className="ending-screen">
      <div className="ending-type-badge dead_end">{t('death.title')}</div>
      <h1 className="ending-title">{t('combat.defeat')}</h1>
      <p className="ending-text">{t('death.flavor')}</p>

      <div style={{ width: '100%', maxWidth: '320px', margin: '0.5rem 0 1.25rem' }}>
        <div className="menu-section-label">{t('game.menu.saveLoad')}</div>
        {SLOTS.map(({ id, label }) => {
          const save = saves[id];
          return (
            <div key={id} className="save-row">
              <div className="save-info">
                <div className="save-slot-label">{label}</div>
                {save ? (
                  <div className="save-details">
                    <span>{save.label}</span>
                    <span className="save-date">{new Date(save.savedAt).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <div className="save-details save-empty">{t('game.menu.empty')}</div>
                )}
              </div>
              <div className="save-actions">
                {save && (
                  <button className="btn btn-sm btn-gold" disabled={busy} onClick={() => handleLoad(id)}>
                    {t('game.menu.load')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ending-actions">
        <button className="btn btn-primary btn-full" onClick={onRetry}>
          {t('death.retry')}
        </button>
        <button className="btn btn-ghost btn-full" onClick={onBackToTitle}>
          {t('death.backTitle')}
        </button>
      </div>
    </div>
  );
}
