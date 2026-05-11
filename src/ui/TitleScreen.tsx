import { useEffect, useState } from 'react';
import { loadGame } from '../engine';
import { useT } from '../engine/i18n';

interface Props {
  onNewGame: () => void;
  onContinue: () => void;
}

export function TitleScreen({ onNewGame, onContinue }: Props) {
  const t = useT();
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    loadGame('auto').then(s => setHasSave(!!s));
  }, []);

  return (
    <div className="title-screen">
      <div
        className="title-bg"
        style={{ backgroundImage: 'url(/backgrounds/background-splash-horizontal.jpeg)' }}
      />
      <div className="title-content">
        <p className="title-eyebrow">{t('title.eyebrow')}</p>
        <h1 className="title-heading">Requiem<br />Noctis</h1>
        <p className="title-sub">{t('title.subtitle')}</p>
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
