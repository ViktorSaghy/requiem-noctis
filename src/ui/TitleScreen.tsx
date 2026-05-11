import { useEffect, useState } from 'react';
import { loadGame } from '../engine';

interface Props {
  onNewGame: () => void;
  onContinue: () => void;
}

export function TitleScreen({ onNewGame, onContinue }: Props) {
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
        <p className="title-eyebrow">A Chronicle of Darkness</p>
        <h1 className="title-heading">Requiem<br />Noctis</h1>
        <p className="title-sub">Vienna, 1938 — the night the city changed</p>
        <div className="title-actions">
          <button className="btn btn-primary btn-lg btn-full" onClick={onNewGame}>
            New Chronicle
          </button>
          {hasSave && (
            <button className="btn btn-gold btn-full" onClick={onContinue}>
              Continue
            </button>
          )}
        </div>
        <p className="title-credit">Vampire: The Masquerade 5th Edition</p>
      </div>
    </div>
  );
}
