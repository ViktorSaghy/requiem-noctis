import type { Ending } from '../engine';
import { Audio } from '../audio';
import { useEffect } from 'react';
import { useT } from '../engine/i18n';
import type { TranslationKey } from '../engine/i18n';

interface Props {
  ending: Ending;
  onPlayAgain: () => void;
}

export function EndingScreen({ ending, onPlayAgain }: Props) {
  const t = useT();

  useEffect(() => {
    Audio.setMood('ending');
    return () => void Audio.stopMood();
  }, []);

  const typeKey = `ending.${ending.type}` as TranslationKey;

  return (
    <div className="ending-screen">
      {ending.image && (
        <div className="scene-illustration-wrap ending-illustration">
          <img src={ending.image} alt="" className="scene-illustration" />
        </div>
      )}
      <div className={`ending-type-badge ${ending.type}`}>
        {t(typeKey)}
      </div>
      <h1 className="ending-title">{ending.title}</h1>
      <p className="ending-text">{ending.text}</p>
      <div className="ending-actions">
        <button className="btn btn-primary btn-full" onClick={onPlayAgain}>
          {t('ending.playAgain')}
        </button>
      </div>
    </div>
  );
}
