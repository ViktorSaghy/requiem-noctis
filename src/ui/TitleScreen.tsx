import { useEffect, useState } from 'react';
import { loadGame, loadSavedCharacters, portraitPath } from '../engine';
import type { Character } from '../engine';
import { useT } from '../engine/i18n';

interface Props {
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onSelectCharacter: (char: Character) => void;
}

export function TitleScreen({ onNewGame, onContinue, onSettings, onSelectCharacter }: Props) {
  const t = useT();
  const [hasSave, setHasSave] = useState(false);
  const [savedChars, setSavedChars] = useState<Character[]>([]);

  useEffect(() => {
    loadGame('auto').then(s => setHasSave(!!s));
    loadSavedCharacters().then(chars => {
      const sorted = Object.values(chars).sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
      setSavedChars(sorted.slice(0, 3));
    });
  }, []);

  return (
    <div className="title-screen">
      <div
        className="title-bg"
        style={{ backgroundImage: 'url(/backgrounds/background-splash-horizontal.jpeg)' }}
      />
      <button className="title-settings-btn" onClick={onSettings}>
        {t('title.settings')}
      </button>
      <div className="title-content">
        <p className="title-eyebrow">{t('title.eyebrow')}</p>
        <h1 className="title-heading">Requiem<br />Noctis</h1>
        <p className="title-sub">{t('title.subtitle')}</p>

        {savedChars.length > 0 && (
          <div className="title-roster">
            <div className="title-roster-label">{t('title.yourCharacters')}</div>
            <div className="title-roster-cards">
              {savedChars.map(char => (
                <div
                  key={char.id}
                  className="title-roster-card"
                  onClick={() => onSelectCharacter(char)}
                >
                  <img
                    className="title-roster-portrait"
                    src={portraitPath('modern', char.clan, char.gender)}
                    alt={char.clan}
                    onError={e => {
                      const fallback = portraitPath('modern', char.clan);
                      if (!e.currentTarget.src.endsWith(fallback)) {
                        e.currentTarget.src = fallback;
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                  <div className="title-roster-name">{char.name}</div>
                  <div className="title-roster-clan">{char.clan}</div>
                  {(char.xp ?? 0) > 0 && (
                    <div className="title-roster-xp">{char.xp} {t('xp.unit')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="title-actions">
          <button className="btn btn-primary btn-lg btn-full" onClick={onNewGame}>
            {t('title.newGame')}
          </button>
          {hasSave && (
            <button className="btn btn-gold btn-full" onClick={onContinue}>
              {t('title.continue')}
            </button>
          )}
        </div>
        <p className="title-credit">{t('title.credit')}</p>
      </div>
    </div>
  );
}
